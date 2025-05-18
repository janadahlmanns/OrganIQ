// © 2025 Dr. Jana Katharina Dahlmanns. All Rights Reserved.
// This file is part of the OrganIQ project.
// No reuse, redistribution, or modification is permitted without explicit written permission.

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ProgressBar from './ProgressBar';
import CancelButton from './CancelButton';
import FeedbackButton from './FeedbackButton';
import { useAppSelector } from '../store/hooks';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import questionsData from '../data/exercises_matching.json';

type MatchingExerciseProps = {
    exerciseId: number;
    beforeProgress: number;
    progressStep: number;
    onContinue: (result: { incorrect: boolean; progressAfter: number }) => void;
    onCancel: () => void;
};

function DraggableB({ id }: { id: string }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

    return (
        <div
            ref={setNodeRef}
            data-id={id}
            {...attributes}
            {...listeners}
            className="bg-[rgba(255,255,255,0.2)] text-white rounded-xl px-4 py-2 shadow-md cursor-pointer select-none backdrop-blur-sm"
            style={{
                transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
                touchAction: 'none',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
            }}
        >
            {id}
        </div>
    );
}

function DropZone({
    label,
    attached,
    highlight,
    placeholderSize,
    animatingId,
}: {
    label: string;
    attached?: string | null;
    highlight?: 'cyan' | 'pink' | null;
    placeholderSize?: { width: number; height: number } | null;
    animatingId?: string | null;
}) {
    const { isOver, setNodeRef } = useDroppable({ id: label });

    const highlightClass =
        highlight === 'cyan'
            ? 'bg-neonCyan text-black'
            : highlight === 'pink'
                ? 'bg-neonPink text-white'
                : 'bg-darkPurple text-white border-white';

    const showAttached = attached && attached !== animatingId;

    return (
        <div
            ref={setNodeRef}
            data-drop-id={label}
            className={`border-2 rounded px-6 py-3 text-center bg-darkPurple text-white
            ${highlightClass}
            ${isOver ? 'shadow-glowWhite scale-105' : ''}
            transition-all duration-150 ease-in-out`}
        >
            <div className="font-bold">{label}</div>
            <div className="mt-2 min-h-[40px] flex items-center justify-center">
                {showAttached ? (
                    <div
                        data-drop-target={label}
                        className="bg-[rgba(255,255,255,0.2)] text-white rounded-xl px-4 py-2 shadow-md pointer-events-none select-none backdrop-blur-sm"
                    >
                        {attached}
                    </div>
                ) : (
                    <div
                        data-drop-target={label}
                        style={{
                            width: placeholderSize ? `${placeholderSize.width}px` : '80%',
                            height: placeholderSize ? `${placeholderSize.height}px` : '28px',
                        }}
                        className="border-2 border-white/20 rounded-xl opacity-30"
                    />
                )}
            </div>
        </div>
    );
}

function px(value: number | undefined): string | undefined {
    return typeof value === 'number' && !isNaN(value) ? `${value}px` : undefined;
}

export default function MatchingExercise({ exerciseId, beforeProgress, progressStep, onContinue, onCancel }: MatchingExerciseProps): React.JSX.Element {
    const { t } = useTranslation();
    const exerciseLanguage = useAppSelector((state) => state.settings.exerciseLanguage);
    const matchingData = questionsData.matching_pairs.find(q => q.id === exerciseId);

    const SNAP_DURATION = 300;
    const SNAP_OVERLAP = 80;

    const [bSize, setBSize] = useState<{ width: number; height: number } | null>(null);
    const [animatingSnap, setAnimatingSnap] = useState<null | {
        id: string;
        from: DOMRect;
        to: DOMRect;
        fontSize: string;
        lineHeight: string;
        width: number;
        height: number;
        direction: 'toDock' | 'toTray';
    }>(null);

    const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
    const [progressAfter, setProgressAfter] = useState<number>(beforeProgress);
    const [bQueue, setBQueue] = useState<string[]>([]);
    const [currentB, setCurrentB] = useState<string | null>(null);
    const [assignments, setAssignments] = useState<{ [a: string]: string }>({});
    const [comboCount, setComboCount] = useState(0);
    const [highlighted, setHighlighted] = useState<{ [a: string]: 'cyan' | 'pink' | null }>({});
    const [attachedB, setAttachedB] = useState<{ [a: string]: string }>({});

    const evaluationMode = matchingData?.type;

    useEffect(() => {
        if (matchingData) {
            const bItems = matchingData.pairs.map(p => p.cardB.value[exerciseLanguage]);
            const shuffled = [...bItems].sort(() => Math.random() - 0.5);
            setBQueue(shuffled);
            setCurrentB(shuffled[0]);
        }
    }, [matchingData, exerciseLanguage]);

    const handleSnapAnimation = (
        dragged: string,
        fromEl: Element | null,
        toEl: Element | null,
        direction: 'toDock' | 'toTray',
        onComplete: () => void
    ): boolean => {
        if (!fromEl || !toEl) return false;

        const from = fromEl.getBoundingClientRect();
        const to = toEl.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(fromEl);
        const fontSize = computedStyle.fontSize;
        const lineHeight = computedStyle.lineHeight;
        const width = from.width;
        const height = from.height;

        if (isNaN(from.top) || isNaN(from.left) || isNaN(to.top) || isNaN(to.left)) return false;

        setAnimatingSnap({ id: dragged, from, to, fontSize, lineHeight, width, height, direction });

        setTimeout(() => {
            requestAnimationFrame(() => setAnimatingSnap(null));
            onComplete();
        }, SNAP_DURATION);

        return true;
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || !matchingData) return;

        const dragged = active.id as string;
        const target = over.id as string;

        const correctMap = Object.fromEntries(
            matchingData.pairs.map(p => [p.cardA.value[exerciseLanguage], p.cardB.value[exerciseLanguage]])
        );

        const isCorrect = correctMap[target] === dragged;

        if (evaluationMode === 'repel') {
            if (assignments[target]) return;

            if (isCorrect) {
                const updated = { ...attachedB, [target]: dragged };
                setAssignments(prev => ({ ...prev, [target]: dragged }));
                setHighlighted(prev => ({ ...prev, [target]: 'cyan' }));
                const nextQueue = bQueue.slice(1);
                const success = handleSnapAnimation(
                    dragged,
                    document.querySelector(`[data-id="${dragged}"]`),
                    document.querySelector(`[data-drop-target="${target}"]`),
                    'toDock',
                    () => {
                        setAttachedB(updated);
                        setBQueue(nextQueue);
                        setCurrentB(nextQueue[0] ?? null);
                        setComboCount(prev => prev + 1);
                        setHighlighted(prev => ({ ...prev, [target]: null }));
                        if (nextQueue.length === 0) {
                            setWasCorrect(true);
                            setProgressAfter(Math.min(beforeProgress + progressStep, 100));
                        }
                    }
                );

                if (!success) {
                    setAttachedB(updated);
                    setCurrentB(nextQueue[0] ?? null);
                }
            } else {
                setHighlighted(prev => ({ ...prev, [target]: 'pink' }));
                setTimeout(() => {
                    setHighlighted(prev => ({ ...prev, [target]: null }));
                }, 600);
            }
        }

        if (evaluationMode === 'evaluate') {
            const updated = { ...attachedB };
            const alreadyAttached = Object.entries(attachedB).find(([_, b]) => b === dragged);
            if (alreadyAttached) delete updated[alreadyAttached[0]];

            const oldB = attachedB[target];
            let nextQueue = bQueue.filter(b => b !== dragged);
            if (oldB) nextQueue = [oldB, ...nextQueue];
            updated[target] = dragged;

            const animateOldB = () => {
                if (oldB) {
                    const fromOld = document.querySelector(`[data-drop-target="${target}"]`);
                    const toOld = bRef.current;

                    const snapOldB = () => {
                        const successOld = handleSnapAnimation(
                            oldB,
                            fromOld,
                            toOld,
                            'toTray',
                            () => {
                                setAttachedB(updated);
                                setBQueue(nextQueue);
                                setCurrentB(nextQueue[0] ?? null);

                                const expectedBs = matchingData.pairs.map(p => p.cardB.value[exerciseLanguage]);
                                const placedBs = Object.values(updated);
                                const missingBs = expectedBs.filter(b => !placedBs.includes(b));
                                if (missingBs.length === 0) handleFinalEvaluation(updated);
                            }
                        );

                        if (!successOld) {
                            setAttachedB(updated);
                            setBQueue(nextQueue);
                            setCurrentB(nextQueue[0] ?? null);
                        }
                    };

                    setTimeout(snapOldB, SNAP_DURATION - SNAP_OVERLAP);
                } else {
                    setAttachedB(updated);
                    setBQueue(nextQueue);
                    setCurrentB(nextQueue[0] ?? null);

                    const expectedBs = matchingData.pairs.map(p => p.cardB.value[exerciseLanguage]);
                    const placedBs = Object.values(updated);
                    const missingBs = expectedBs.filter(b => !placedBs.includes(b));
                    if (missingBs.length === 0) handleFinalEvaluation(updated);
                }
            };

            const fromNew = document.querySelector(`[data-id="${dragged}"]`);
            const toNew = document.querySelector(`[data-drop-target="${target}"]`);

            const successNew = handleSnapAnimation(
                dragged,
                fromNew,
                toNew,
                'toDock',
                animateOldB
            );

            if (!successNew) {
                animateOldB();
            }
        }
    };

    const handleFinalEvaluation = (finalAssignments: { [a: string]: string }) => {
        const correctMap = Object.fromEntries(
            matchingData!.pairs.map(p => [p.cardA.value[exerciseLanguage], p.cardB.value[exerciseLanguage]])
        );
        const result = Object.entries(finalAssignments).every(([a, b]) => correctMap[a] === b);
        setWasCorrect(result);
        setProgressAfter(Math.min(beforeProgress + progressStep, 100));
    };

    const bRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (currentB && bRef.current && !bSize) {
            const rect = bRef.current.getBoundingClientRect();
            setBSize({ width: rect.width, height: rect.height });
        }
    }, [currentB, bSize]);

    if (!matchingData) {
        return <div className="text-white p-4 text-center">{t('shared.error_loading_exercise')}</div>;
    }

    return (
        <div className="w-full max-w-[480px] mx-auto px-4 pt-4 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-6">
                <ProgressBar currentProgress={beforeProgress} newProgress={progressAfter} />
                <CancelButton className="ml-4" onClick={onCancel} />
            </div>

            <DndContext onDragEnd={handleDragEnd}>
                <div className="space-y-6 w-full">
                    <h2 className="text-xl font-bold text-center">{matchingData.title[exerciseLanguage]}</h2>

                    <div className="relative min-h-[80px] mb-8">
                        {currentB && currentB !== animatingSnap?.id && (
                            <div className="absolute inset-0 flex justify-center items-center z-50">
                                <div ref={bRef}>
                                    <DraggableB id={currentB} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        {matchingData.pairs.map((pair) => {
                            const label = pair.cardA.value[exerciseLanguage];
                            return (
                                <DropZone
                                    key={label}
                                    label={label}
                                    highlight={highlighted[label] ?? null}
                                    attached={attachedB[label]}
                                    placeholderSize={bSize}
                                    animatingId={animatingSnap?.id ?? null}
                                />
                            );
                        })}
                    </div>

                    {evaluationMode === 'repel' && (
                        <div className="text-center text-cyan-300 font-bold text-lg mt-2">
                            🔥 Combo: {comboCount}
                        </div>
                    )}

                    {wasCorrect !== null && (
                        <FeedbackButton
                            evaluation={wasCorrect ? t('shared.correct') : t('shared.incorrect')}
                            correct={wasCorrect}
                            onContinue={() => onContinue({ incorrect: !wasCorrect, progressAfter })}
                        />
                    )}
                </div>
            </DndContext>

            {animatingSnap?.from && animatingSnap?.to && (
                <motion.div
                    style={{
                        top: px(animatingSnap.from.top),
                        left: px(animatingSnap.from.left),
                        width: animatingSnap.width,
                        height: animatingSnap.height,
                        position: 'fixed',
                        fontSize: animatingSnap.fontSize,
                        lineHeight: animatingSnap.lineHeight,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        pointerEvents: 'none',
                        zIndex: 9999,
                    }}
                    className="bg-[rgba(255,255,255,0.2)] text-white rounded-xl px-4 py-2 shadow-md cursor-pointer select-none backdrop-blur-sm"
                    animate={{
                        top: px(animatingSnap.to.top),
                        left: px(animatingSnap.to.left),
                    }}
                    transition={{ duration: SNAP_DURATION / 1000, ease: 'easeInOut' }}
                >
                    {animatingSnap.id}
                </motion.div>
            )}
        </div>
    );
}
