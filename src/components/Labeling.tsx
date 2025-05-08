import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import PrimaryButton from './PrimaryButton';
import ProgressBar from './ProgressBar';
import CancelButton from './CancelButton';
import FeedbackButton from './FeedbackButton';

import labelingData from '../data/exercises_labeling.json';

type Region = {
  name: string;
  shape: 'polygon';
  points: { x: number; y: number }[];
};

type Label = {
  text: { de: string; en: string };
  targetRegion: string;
};

type LabelingExercise = {
  id: number;
  image: string;
  labels: Label[];
};

type LabelingProps = {
  exerciseId: number;
  beforeProgress: number;
  progressStep: number;
  onContinue: (result: { incorrect: boolean; progressAfter: number }) => void;
  onCancel: () => void;
};

function DraggableLabel({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  return (
    <div
      ref={setNodeRef as (element: HTMLDivElement | null) => void}
      {...listeners}
      {...attributes}
      className="bg-white text-black rounded-xl px-4 py-1 shadow-md cursor-pointer select-none"
      style={{
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
}

function DroppableRegion({
  region,
  isActive,
}: {
  region: Region;
  isActive: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: region.name });

  return (
    <polygon
      ref={setNodeRef as (element: SVGPolygonElement | null) => void}
      points={region.points.map((p) => `${p.x},${p.y}`).join(' ')}
      fill={isActive ? 'white' : 'transparent'}
      opacity={isActive ? 0.2 : 0}
      className="transition-all duration-100 ease-in-out"
    />
  );
}

export default function Labeling({
  exerciseId,
  beforeProgress,
  progressStep,
  onContinue,
  onCancel,
}: LabelingProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'de' | 'en';
  const navigate = useNavigate();

  const [exercise, setExercise] = useState<LabelingExercise | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [viewBox, setViewBox] = useState('0 0 100 100');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverRegion, setHoverRegion] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Record<string, number>>({});
  const [placedLabelRegion, setPlacedLabelRegion] = useState<Record<number, string>>({});
  const [wasEvaluated, setWasEvaluated] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    const found = labelingData.labeling.find((ex) => ex.id === exerciseId);
    if (!found) return;

    setExercise(found);

    const loadRegionsAndViewBox = async () => {
      try {
        const [regionsRes, svgRes] = await Promise.all([
          fetch(`/images/exercises/${found.image}.regions.json`).then((r) => r.json()),
          fetch(`/images/exercises/${found.image}.svg`).then((r) => r.text()),
        ]);

        setRegions(regionsRes);

        const doc = new DOMParser().parseFromString(svgRes, 'image/svg+xml');
        const svgEl = doc.querySelector('svg');
        if (svgEl?.hasAttribute('viewBox')) {
          setViewBox(svgEl.getAttribute('viewBox')!);
        }
      } catch (err) {
        console.error('Failed to load regions or SVG:', err);
      }
    };

    loadRegionsAndViewBox();
  }, [exerciseId]);

  useEffect(() => {
    if (!exercise || wasEvaluated) return;

    if (Object.keys(placements).length === exercise.labels.length) {
      let anyWrong = false;
      for (const [regionName, labelIndex] of Object.entries(placements)) {
        const correctTarget = exercise.labels[labelIndex].targetRegion;
        if (regionName !== correctTarget) {
          anyWrong = true;
          break;
        }
      }
      setWasEvaluated(true);
      setWasCorrect(!anyWrong);
    }
  }, [placements, exercise, wasEvaluated]);

  const handleDrop = (fromId: string, toRegion: string) => {
    const newLabelIndex = parseInt(fromId.replace('tray-', ''));
    const updatedPlacements = { ...placements };
    const updatedReverse = { ...placedLabelRegion };

    const oldLabel = placements[toRegion];
    if (oldLabel !== undefined) {
      delete updatedReverse[oldLabel];
    }

    const oldRegion = placedLabelRegion[newLabelIndex];
    if (oldRegion && updatedPlacements[oldRegion] === newLabelIndex) {
      delete updatedPlacements[oldRegion];
    }

    updatedPlacements[toRegion] = newLabelIndex;
    updatedReverse[newLabelIndex] = toRegion;

    setPlacements(updatedPlacements);
    setPlacedLabelRegion(updatedReverse);
  };

  const handleFeedbackContinue = () => {
    const finalProgress = Math.min(beforeProgress + progressStep, 100);
    onContinue({ incorrect: !wasCorrect, progressAfter: finalProgress });
  };

  if (!exercise) {
    return (
      <div className="text-white text-center space-y-4">
        <div className="text-xl font-bold">{t('shared.labelingNotFound')}</div>
        <PrimaryButton
          variant="white"
          active
          className="w-2/3 mx-auto"
          onClick={() => navigate('/')}
        >
          {t('shared.backToMenu')}
        </PrimaryButton>
      </div>
    );
  }

  const [_, , vw = 100, vh = 100] = viewBox.split(' ').map(Number);
  const viewWidth = vw;
  const viewHeight = vh;

  return (
    <div className="w-full max-w-[480px] mx-auto px-4 pt-4 flex flex-col flex-1">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <ProgressBar currentProgress={beforeProgress} newProgress={beforeProgress} />
        </div>
        <CancelButton className="ml-4" onClick={onCancel} />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(event: any) => setActiveId(event.active.id)}
        onDragOver={(event: any) => {
          const overId = event.over?.id?.toString() || null;
          setHoverRegion(overId);
        }}
        onDragEnd={(event: any) => {
          const fromId = event.active.id;
          const toRegion = event.over?.id;

          if (toRegion && typeof toRegion === 'string') {
            handleDrop(fromId, toRegion);
          }

          setHoverRegion(null);
          setActiveId(null);
        }}
      >
        <div className="space-y-4 w-full">
          <div className="relative w-full aspect-square overflow-hidden">
            <img
              src={`/images/exercises/${exercise.image}.svg`}
              alt="Labeling"
              className="absolute w-full h-full object-contain"
            />
            <svg className="absolute w-full h-full" viewBox={viewBox}>
              {regions.map((region, idx) => (
                <DroppableRegion
                  key={idx}
                  region={region}
                  isActive={region.name === hoverRegion}
                />
              ))}
            </svg>

            {Object.entries(placements).map(([regionName, labelIndex]) => {
              const region = regions.find((r) => r.name === regionName);
              if (!region) return null;

              const center = region.points.reduce(
                (acc, pt) => ({ x: acc.x + pt.x, y: acc.y + pt.y }),
                { x: 0, y: 0 }
              );
              const count = region.points.length;
              const cx = center.x / count;
              const cy = center.y / count;

              const targetRegion = exercise.labels[labelIndex].targetRegion;
              const isCorrect = regionName === targetRegion;

              return (
                <div
                  key={regionName}
                  className={`
                    absolute text-sm font-bold select-none px-3 py-1 rounded
                    transition-all duration-300 ease-in-out
                    ${wasEvaluated
                      ? isCorrect
                        ? 'text-neonCyan shadow-glowCyan'
                        : 'text-neonPink shadow-glowPurple'
                      : 'text-white shadow-glowWhite'}
                  `}
                  style={{
                    left: `${(cx / viewWidth) * 100}%`,
                    top: `${(cy / viewHeight) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {exercise.labels[labelIndex].text[lang]}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {exercise.labels.map((label, idx) =>
              placedLabelRegion[idx] === undefined ? (
                <DraggableLabel key={idx} id={`tray-${idx}`}>
                  {label.text[lang]}
                </DraggableLabel>
              ) : null
            )}
          </div>

          <DragOverlay>
            {activeId && (
              <div className="bg-white text-black rounded-xl px-4 py-1 shadow-md cursor-pointer select-none">
                {exercise.labels[parseInt(activeId.replace('tray-', ''))]?.text[lang]}
              </div>
            )}
          </DragOverlay>

          {wasEvaluated && (
            <FeedbackButton
              correct={wasCorrect}
              evaluation={t(wasCorrect ? 'shared.correct' : 'shared.incorrect')}
              onContinue={handleFeedbackContinue}
            />
          )}
        </div>
      </DndContext>
    </div>
  );
}
