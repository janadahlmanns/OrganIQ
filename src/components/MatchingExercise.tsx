// © 2025 Dr. Jana Katharina Dahlmanns. All Rights Reserved.
// This file is part of the OrganIQ project.
// No reuse, redistribution, or modification is permitted without explicit written permission.

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from './PrimaryButton';
import ProgressBar from './ProgressBar';
import CancelButton from './CancelButton';
import FeedbackButton from './FeedbackButton';
import { useAppSelector } from '../store/hooks';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
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
            {...attributes}
            {...listeners}
            className="bg-white text-black rounded-xl px-4 py-2 shadow-md cursor-pointer select-none"
            style={{
                transform: transform
                    ? `translate(${transform.x}px, ${transform.y}px)`
                    : undefined,
                touchAction: 'none',
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
}: {
    label: string;
    attached?: string | null;
    highlight?: 'cyan' | 'pink' | null;
}) {
    const { isOver, setNodeRef } = useDroppable({ id: label });

    const highlightClass =
        highlight === 'cyan'
            ? 'bg-neonCyan text-black'
            : highlight === 'pink'
                ? 'bg-neonPink text-white'
                : 'bg-darkPurple text-white border-white';

    return (
        <div
            ref={setNodeRef}
            className={`border-2 rounded px-6 py-3 font-semibold
              ${highlightClass}
              ${isOver ? 'ring-4 ring-cyan-400 scale-105' : ''}
              transition-all duration-150 ease-in-out`}
        >
            <div className="font-bold">{label}</div>
            {attached && (
                <div className="mt-2 text-sm font-semibold pointer-events-none select-none">
                    {attached}
                </div>
            )}
        </div>
    );
}


export default function MatchingExercise({ exerciseId, beforeProgress, progressStep, onContinue, onCancel }: MatchingExerciseProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const exerciseLanguage = useAppSelector((state) => state.settings.exerciseLanguage);
    const matchingData = questionsData.matching_pairs.find(q => q.id === exerciseId);


    if (!matchingData) {
        return (
            <div className="text-white text-center space-y-4">
                <div className="text-xl font-bold">{t('shared.questionNotFound')}</div>
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
    const evaluationMode = matchingData.type; // 'repel' or 'evaluate'
    const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
    const [progressAfter, setProgressAfter] = useState<number>(beforeProgress);
    const [bQueue, setBQueue] = useState<string[]>([]);
    const [currentB, setCurrentB] = useState<string | null>(null);
    const [assignments, setAssignments] = useState<{ [a: string]: string }>({});
    const [comboCount, setComboCount] = useState(0);
    const correctMap = Object.fromEntries(
        matchingData.pairs.map(p => [
            p.cardA.value[exerciseLanguage],
            p.cardB.value[exerciseLanguage],
        ])
    );
    const [highlighted, setHighlighted] = useState<{ [a: string]: 'cyan' | 'pink' | null }>({});
    const [attachedB, setAttachedB] = useState<{ [a: string]: string }>({});


    useEffect(() => {
        if (matchingData) {
            const bItems = matchingData.pairs.map(p => p.cardB.value[exerciseLanguage]);
            const shuffled = [...bItems].sort(() => Math.random() - 0.5);
            setBQueue(shuffled);
            setCurrentB(shuffled[0]);
        }
    }, [matchingData, exerciseLanguage]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const dragged = active.id as string;
        const target = over.id as string;

        const isCorrect = correctMap[target] === dragged;

        if (evaluationMode === 'repel') {
            if (assignments[target]) return; // already assigned

            if (isCorrect) {
                setAssignments(prev => ({ ...prev, [target]: dragged }));
                setHighlighted(prev => ({ ...prev, [target]: 'cyan' }));
                setAttachedB(prev => ({ ...prev, [target]: dragged }));
                setComboCount(prev => prev + 1);

                setTimeout(() => {
                    setHighlighted(prev => ({ ...prev, [target]: null }));
                }, 600);
                const nextQueue = bQueue.slice(1);
                setBQueue(nextQueue);
                setCurrentB(nextQueue[0] ?? null);
                if (nextQueue.length === 0) {
                    setWasCorrect(true);
                    setProgressAfter(Math.min(beforeProgress + progressStep, 100));
                }

            } else {
                setHighlighted(prev => ({ ...prev, [target]: 'pink' }));
                setTimeout(() => {
                    setHighlighted(prev => ({ ...prev, [target]: null }));
                }, 600);
                // Don't advance B queue — same B stays
            }
        }

        if (evaluationMode === 'evaluate') {
            // Reassign old if needed
            let reassigned = { ...attachedB };
            const alreadyAttached = Object.entries(attachedB).find(([_, b]) => b === dragged);
            if (alreadyAttached) {
                delete reassigned[alreadyAttached[0]];
            }

            let oldB = attachedB[target];
            // Remove dragged B from queue
            let newQueue = bQueue.filter((b) => b !== dragged);

            // Push old B back to front if being replaced
            if (oldB) {
                newQueue = [oldB, ...newQueue];
            }

            reassigned[target] = dragged;
            setAttachedB(reassigned);
            setBQueue(newQueue);

            setCurrentB(newQueue[0] ?? null);

            // If last one placed, trigger evaluation
            const expectedBs = matchingData.pairs.map(p => p.cardB.value[exerciseLanguage]);
            const placedBs = Object.values(reassigned);
            const missingBs = expectedBs.filter(b => !placedBs.includes(b));

            if (missingBs.length === 0) {
                handleFinalEvaluation(reassigned);
            }
        }
    };

    useEffect(() => {
        setWasCorrect(null);
        setProgressAfter(beforeProgress);
    }, [exerciseId, beforeProgress]);


    const handleFinalEvaluation = (finalAssignments: { [a: string]: string }) => {
        const result = Object.entries(finalAssignments).every(
            ([a, b]) => correctMap[a] === b
        );

        setWasCorrect(result);
        setProgressAfter(Math.min(beforeProgress + progressStep, 100));
    };

    return (
        <div className="w-full max-w-[480px] mx-auto px-4 pt-4 flex flex-col flex-1">
            {/* Top bar with progress + cancel */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                    <ProgressBar
                        currentProgress={beforeProgress}
                        newProgress={progressAfter}
                    />
                </div>
                <CancelButton className="ml-4" onClick={onCancel} />
            </div>

            {/* Exercise area */}
            <DndContext onDragEnd={handleDragEnd}>
                <div className="space-y-6 w-full">
                    <h2 className="text-xl font-bold text-center">{matchingData.title[exerciseLanguage]}</h2>

                    {/* B item tray */}
                    <div className="relative min-h-[80px] mb-8">
                        {currentB && (
                            <div className="absolute inset-0 flex justify-center items-center z-50">
                                <DraggableB id={currentB} />
                            </div>
                        )}
                    </div>
                    {/* A-item drop grid */}
                    <div className="grid grid-cols-2 gap-4 w-full">
                        {matchingData.pairs.map((pair) => {
                            const label = pair.cardA.value[exerciseLanguage];
                            return (
                                <DropZone
                                    key={label}
                                    label={label}
                                    highlight={highlighted[label] ?? null}
                                    attached={attachedB[label]}
                                />
                            );
                        })}
                    </div>
                    {evaluationMode === 'repel' && (
                        <div className="text-center text-cyan-300 font-bold text-lg mt-2">
                            🔥 Combo: {comboCount}
                        </div>
                    )}

                    {/* Feedback */}
                    {wasCorrect !== null && (
                        <FeedbackButton
                            evaluation={wasCorrect ? t('shared.correct') : t('shared.incorrect')}
                            correct={wasCorrect}
                            onContinue={() => onContinue({ incorrect: !wasCorrect, progressAfter })}
                        />
                    )}
                </div>
            </DndContext>
        </div>
    );
}
