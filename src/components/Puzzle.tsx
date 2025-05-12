// © 2025 Dr. Jana Katharina Dahlmanns. All Rights Reserved.
// This file is part of the OrganIQ project.
// No reuse, redistribution, or modification is permitted without explicit written permission.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProgressBar from './ProgressBar';
import CancelButton from './CancelButton';
import FeedbackButton from './FeedbackButton';
import puzzleData from '../data/exercises_puzzle.json';

import {
    DndContext,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';

const SNAP_THRESHOLD = 20;

type ShapePoint = {
    x: number;
    y: number;
};

type PuzzleRegion = {
    name: string;
    shape: ShapePoint[];
    targetX: number;
    targetY: number;
    originalPoints: { x: number; y: number }[];
};

type PieceState = {
    [key: string]: {
        x: number;
        y: number;
        locked: boolean;
    };
};

type PuzzleProps = {
    exerciseId: number;
    beforeProgress: number;
    progressStep: number;
    onContinue: (result: { incorrect: boolean; progressAfter: number }) => void;
    onCancel: () => void;
};

export default function Puzzle({ exerciseId, beforeProgress, progressStep, onContinue, onCancel }: PuzzleProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [wasSolved, setWasSolved] = useState(false);
    const [progressAfter, setProgressAfter] = useState(beforeProgress);
    const [regions, setRegions] = useState<PuzzleRegion[]>([]);
    const [viewBox, setViewBox] = useState('0 0 100 100');
    const [imagePath, setImagePath] = useState<string | null>(null);
    const [pieceState, setPieceState] = useState<PieceState>({});

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 100,
                tolerance: 10,
            },
        })
    );
    const [, , vbWidth, vbHeight] = viewBox.split(' ').map(Number);

    useEffect(() => {
        (async () => {
            setWasSolved(false);
            setProgressAfter(beforeProgress);

            const entry = puzzleData.puzzles.find((p) => p.id === exerciseId);
            if (!entry) return navigate('/');

            const basePath = `/images/exercises/${entry.image}`;
            const svgPath = `${basePath}.svg`;
            const regionPath = `${basePath}.regions.json`;

            setImagePath(svgPath);

            try {
                const res = await fetch(regionPath);
                const rawData = await res.json();
                const processed: PuzzleRegion[] = rawData.map((region: any) => {
                    const points = Array.isArray(region.points) ? region.points : [];
                    const anchor = points[0] || { x: 0, y: 0 };
                    const shape = points.map((p: any) => ({ x: p.x - anchor.x, y: p.y - anchor.y }));
                    return {
                        name: region.name,
                        shape,
                        targetX: anchor.x,
                        targetY: anchor.y,
                        originalPoints: points,
                    };
                });
                setRegions(processed);
            } catch (err) {
                console.error('Failed to load puzzle regions:', err);
            }

            try {
                const svgRes = await fetch(svgPath);
                const svgText = await svgRes.text();
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
                const svgElement = svgDoc.querySelector('svg');
                if (svgElement?.hasAttribute('viewBox')) {
                    setViewBox(svgElement.getAttribute('viewBox')!);
                }
            } catch (err) {
                console.error('Failed to parse SVG for viewBox:', err);
            }
        })();
    }, [exerciseId, beforeProgress]);

    useEffect(() => {
        if (regions.length > 0 && Object.keys(pieceState).length === 0) {
            const initialState: PieceState = {};
            regions.forEach((region) => {
                const minX = vbWidth * 0.1;
                const maxX = vbWidth * 0.9;
                const minY = vbHeight * 0.1;
                const maxY = vbHeight * 0.9;
                const randX = Math.random() * (maxX - minX) + minX;
                const randY = Math.random() * (maxY - minY) + minY;
                initialState[region.name] = { x: randX, y: randY, locked: false };
            });
            setPieceState(initialState);
        }
    }, [regions, pieceState]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, delta } = event;
        const id = active.id as string;
        const region = regions.find(r => r.name === id);
        if (!region) return;

        setPieceState(prev => {
            const current = prev[id];
            if (!current || current.locked) return prev;

            const newX = current.x + delta.x;
            const newY = current.y + delta.y;
            const dx = newX - region.targetX;
            const dy = newY - region.targetY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const isSnapped = distance < SNAP_THRESHOLD;

            const updated = {
                ...prev,
                [id]: {
                    x: isSnapped ? region.targetX : newX,
                    y: isSnapped ? region.targetY : newY,
                    locked: isSnapped,
                },
            };

            if (isSnapped && Object.values(updated).every(p => p.locked)) {
                setWasSolved(true);
                setProgressAfter(Math.min(beforeProgress + progressStep, 100));
            }

            return updated;
        });
    };

    const DraggablePiece = ({ region }: { region: PuzzleRegion }) => {
        const piece = pieceState[region.name];
        if (!piece) return null;

        const polygonPoints = region.originalPoints.map(p => `${p.x},${p.y}`).join(' ');
        const translate = `translate(${piece.x - region.targetX}, ${piece.y - region.targetY})`;

        const commonChildren = (
            <>
                <clipPath id={`clip-${region.name}`}><polygon points={polygonPoints} /></clipPath>
                <image
                    href={imagePath!}
                    x={0}
                    y={0}
                    width={vbWidth}
                    height={vbHeight}
                    clipPath={`url(#clip-${region.name})`}
                />
            </>
        );

        if (piece.locked) {
            return <g transform={translate}>{commonChildren}</g>;
        }

        const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: region.name });
        const dragX = transform?.x ?? 0;
        const dragY = transform?.y ?? 0;
        const offset = `translate(${piece.x + dragX - region.targetX}, ${piece.y + dragY - region.targetY})`;

        return (
            <g
                ref={(el) => setNodeRef(el as unknown as HTMLElement)}
                transform={offset}
                className="cursor-pointer group"
                {...listeners}
                {...attributes}
            >
                {commonChildren}
            </g>
        );
    };

    return (
        <div className="w-full max-w-[480px] mx-auto px-4 pt-4 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                    <ProgressBar currentProgress={beforeProgress} newProgress={progressAfter} />
                </div>
                <CancelButton className="ml-4" onClick={onCancel} />
            </div>

            <div className="space-y-6 w-full">
                <h2 className="text-xl font-bold text-center text-white">{t('puzzle.title')}</h2>
                <div className={`relative w-full aspect-square ${wasSolved ? 'bg-darkPurple border-3 border-neonCyan shadow-glowCyan' : 'bg-darkPurple border-3 border-white shadow-glowWhite'} rounded-2xl overflow-hidden`}>
                    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                        <svg className="absolute w-full h-full touch-none" viewBox={viewBox}>
                            {regions
                                .filter(region => pieceState[region.name]?.locked)
                                .map(region => (
                                    <DraggablePiece key={region.name + '-locked'} region={region} />
                                ))}
                            {regions
                                .filter(region => !pieceState[region.name]?.locked)
                                .map(region => (
                                    <DraggablePiece key={region.name + '-unlocked'} region={region} />
                                ))}
                        </svg>
                    </DndContext>
                </div>

                {wasSolved && (
                    <FeedbackButton
                        evaluation={t('puzzle.puzzleComplete')}
                        correct
                        onContinue={() => onContinue({ incorrect: false, progressAfter })}
                    />
                )}
            </div>
        </div>
    );
}
