// © 2025 Dr. Jana Katharina Dahlmanns. All Rights Reserved.
// This file is part of the OrganIQ project.
// No reuse, redistribution, or modification is permitted without explicit written permission.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PrimaryButton from './PrimaryButton';
import ProgressBar from './ProgressBar';
import CancelButton from './CancelButton';
import FeedbackButton from './FeedbackButton';
import { useAppSelector } from '../store/hooks';
import labelingData from '../data/exercises_labeling.json';

import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';

// --- Types ---
type LocalizedName = { en: string; de: string };

type LabelingRegion = {
    name: LocalizedName;
    shape: 'polygon';
    points: { x: number; y: number }[];
};

type LabelState = {
    label: string;
    region: string | null;
    position?: { x: number; y: number };
};


type LabelingExerciseProps = {
    exerciseId: number;
    beforeProgress: number;
    progressStep: number;
    onContinue: (result: { incorrect: boolean; progressAfter: number }) => void;
    onCancel: () => void;
};

// --- Helpers ---
function isPointInPolygon(x: number, y: number, points: { x: number; y: number }[]) {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x, yi = points[i].y;
        const xj = points[j].x, yj = points[j].y;
        const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 0.00001) + xi;
        if (intersect) inside = !inside;
    }
    return inside;
}

function polygonCentroid(points: { x: number; y: number }[]) {
    let area = 0, cx = 0, cy = 0;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const p1 = points[j];
        const p2 = points[i];
        const cross = p1.x * p2.y - p2.x * p1.y;
        area += cross;
        cx += (p1.x + p2.x) * cross;
        cy += (p1.y + p2.y) * cross;
    }
    area *= 0.5;
    if (area === 0) {
        const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
        return { x: sum.x / points.length, y: sum.y / points.length };
    }
    return { x: cx / (6 * area), y: cy / (6 * area) };
}

function RegionPolygon({ region }: { region: LabelingRegion }) {
    const { i18n } = useTranslation();
    const lang = i18n.language as keyof LocalizedName;
    const { isOver, setNodeRef } = useDroppable({ id: region.name[lang] });

    return (
        <polygon
            ref={setNodeRef as (node: SVGPolygonElement | null) => void}
            points={region.points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill={isOver ? 'white' : 'transparent'}
            opacity={isOver ? 0.2 : 0}
            className="cursor-pointer transition-all"
        />
    );
}

function DraggableLabel({ id, label }: { id: string; label: string }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
    return (
        <div
            ref={setNodeRef}
            data-id={id}
            {...listeners}
            {...attributes}
            className="bg-white text-darkPurple rounded-2xl px-4 py-1 cursor-pointer select-none text-center"
            style={{
                transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
            }}
        >
            {label}
        </div>
    );
}

export default function LabelingExercise({ exerciseId, beforeProgress, progressStep, onContinue, onCancel }: LabelingExerciseProps) {
    const { t } = useTranslation();
    const exerciseLanguage = useAppSelector((state) => state.settings.exerciseLanguage);
    const lang = exerciseLanguage as keyof LocalizedName;

    const navigate = useNavigate();
    const exercise = labelingData.labelings.find((ex) => ex.id === exerciseId);

    const [regions, setRegions] = useState<LabelingRegion[]>([]);
    const [labels, setLabels] = useState<LabelState[]>([]);
    const [viewBox, setViewBox] = useState<string>('0 0 100 100');
    const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
    const [progressAfter, setProgressAfter] = useState(beforeProgress);
    const [labelResults, setLabelResults] = useState<{ [label: string]: boolean }>({});

    useEffect(() => {
        if (!exercise) return;

        const basePath = `/images/exercises/${exercise.image}`;

        fetch(`${basePath}.regions.json`).then(async (res) => {
            if (!res.ok) return console.error('Regions fetch failed');
            const data: LabelingRegion[] = await res.json();
            setRegions(data);
            setLabels(data.map((r) => ({ label: r.name[lang], region: null })));
        });

        fetch(`${basePath}.svg`).then(async (res) => {
            const svgText = await res.text();
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const svgElement = svgDoc.querySelector('svg');
            if (svgElement?.hasAttribute('viewBox')) {
                setViewBox(svgElement.getAttribute('viewBox')!);
            }
        });
    }, [exercise]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active } = event;
        const labelId = String(active.id);

        const draggableElement = document.querySelector(`[data-id='${labelId}']`);
        if (!draggableElement) return;
        const rect = draggableElement.getBoundingClientRect();
        const dropX = rect.left + rect.width / 2;
        const dropY = rect.top + rect.height / 2;

        const svg = document.querySelector('svg');
        if (!svg) return;
        const point = svg.createSVGPoint();
        point.x = dropX;
        point.y = dropY;
        const svgPoint = point.matrixTransform(svg.getScreenCTM()!.inverse());

        const hitRegion = regions.find((region) =>
            isPointInPolygon(svgPoint.x, svgPoint.y, region.points)
        );
        if (!hitRegion) return;

        const centroid = polygonCentroid(hitRegion.points);
        const regionName = hitRegion.name[lang];

        setLabels((prev) => {
            const updated = prev.map((l) => {
                if (l.label === labelId) return { ...l, region: regionName, position: centroid };
                if (l.region === regionName) return { ...l, region: null, position: undefined };
                return l;
            });

            const trayEmpty = updated.every((l) => l.region !== null);
            if (trayEmpty) setShouldEvaluate(true);

            return updated;
        });
    };
    const [shouldEvaluate, setShouldEvaluate] = useState(false);

    useEffect(() => {
        if (!shouldEvaluate) return;

        // check again: is tray really empty in latest state?
        const trayEmptyNow = labels.every((l) => l.region !== null);
        if (trayEmptyNow) {
            handleEvaluation();
        }

        setShouldEvaluate(false); // always reset flag
    }, [shouldEvaluate, labels]);

    const handleEvaluation = () => {
        const results: { [label: string]: boolean } = {};
        let allCorrect = true;

        for (const l of labels) {
            if (!l.region) continue;
            const correct = l.label === l.region;
            results[l.label] = correct;
            if (!correct) allCorrect = false;
        }

        setLabelResults(results);
        setWasCorrect(allCorrect);
        setProgressAfter(beforeProgress + progressStep);
    };

    if (!exercise) {
        return (
            <div className="text-white text-center space-y-4">
                <div className="text-heading-xl font-bold">{t('shared.hotspotNotFound')}</div>
                <PrimaryButton variant="white" active className="w-2/3 mx-auto" onClick={() => navigate('/')}>{t('shared.backToMenu')}</PrimaryButton>
            </div>
        );
    }

    const imagePath = `/images/exercises/${exercise.image}.svg`;
    const trayLabels = labels.filter((l) => l.region === null);
    const placedLabels = labels.filter((l) => l.region !== null);

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="w-full max-w-[480px] mx-auto px-4 pt-4 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex-1">
                        <ProgressBar currentProgress={beforeProgress} newProgress={progressAfter} />
                    </div>
                    <CancelButton className="ml-4" onClick={onCancel} />
                </div>

                <div className="space-y-6 w-full">
                    <h2 className="text-heading-xl font-bold text-center">{t('shared.labelingInstruction')}</h2>

                    <div className="relative w-full aspect-square overflow-hidden">
                        <img src={imagePath} alt="Labeling" className="absolute w-full h-full object-contain" />
                        <svg className="absolute w-full h-full" viewBox={viewBox}>
                            {regions.map((region) => (
                                <RegionPolygon key={region.name[lang]} region={region} />
                            ))}
                        </svg>
                        {placedLabels.map(({ label, position }) => {
                            if (!position) return null;
                            const [vbX, vbY, vbW, vbH] = viewBox.split(' ').map(Number);
                            const percentX = ((position.x - vbX) / vbW) * 100;
                            const percentY = ((position.y - vbY) / vbH) * 100;
                            const result = labelResults[label];
                            const colorClass = result === undefined ? 'bg-white text-darkPurple' : result ? 'bg-neonCyan text-darkPurple' : 'bg-neonPink text-white';
                            return (
                                <div
                                    key={label}
                                    className={`absolute text-sm ${colorClass} px-2 py-1 rounded-2xl shadow-md pointer-events-none select-none`}
                                    style={{
                                        left: `${percentX}%`,
                                        top: `${percentY}%`,
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                >
                                    {label}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                        {trayLabels.map((l) => (
                            <DraggableLabel key={l.label} id={l.label} label={l.label} />
                        ))}
                    </div>

                    {wasCorrect !== null && (
                        <FeedbackButton
                            evaluation={t(wasCorrect ? 'shared.correct' : 'shared.incorrect')}
                            correct={wasCorrect}
                            onContinue={() => onContinue({ incorrect: !wasCorrect, progressAfter })}
                        />
                    )}
                </div>
            </div>
        </DndContext>
    );
}
