import { useState, useEffect } from 'react';
import PrimaryButton from './PrimaryButton';
import ProgressBar from './ProgressBar';
import CancelButton from './CancelButton';
import FeedbackButton from './FeedbackButton';
import ExerciseLabel from './ExerciseLabel';
import orderingData from '../data/exercises_ordering.json';

import {
    DndContext,
    closestCorners,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';

import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

type OrderExerciseProps = {
    exerciseId: number;
    beforeProgress: number;
    progressStep: number;
    onContinue: (result: { incorrect: boolean; progressAfter: number }) => void;
    onCancel: () => void;
};

type Item = {
    id: string;
    content: string;
};

export default function OrderExercise({ exerciseId, beforeProgress, progressStep, onContinue, onCancel }: OrderExerciseProps) {
    const [items, setItems] = useState<Item[]>([]);
    const [correctOrder, setCorrectOrder] = useState<string[]>([]);
    const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
    const [progressAfter, setProgressAfter] = useState<number>(beforeProgress);
    const [isEvaluated, setIsEvaluated] = useState<boolean>(false);
    const [questionText, setQuestionText] = useState<string>('');

    useEffect(() => {
        const exercise = orderingData.ordering.find((ex) => ex.id === exerciseId);
        if (!exercise) return;

        const correctItems = exercise.items.map((text, index) => ({
            id: String(index),
            content: text,
        }));

        setCorrectOrder(correctItems.map(item => item.id));
        const shuffledItems = [...correctItems].sort(() => Math.random() - 0.5);
        setItems(shuffledItems);

        setQuestionText(exercise.question_text); // ✅ New line: set instruction text
        setProgressAfter(beforeProgress);
        setWasCorrect(null);
        setIsEvaluated(false);
    }, [exerciseId, beforeProgress]);

    const handleEvaluate = () => {
        if (isEvaluated) return;

        const currentOrder = items.map(item => item.id);
        const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(correctOrder);

        setWasCorrect(isCorrect);
        setProgressAfter(Math.min(beforeProgress + progressStep, 100));
        setIsEvaluated(true);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        setItems(newItems);
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 1 }, // Desktop interaction
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 100, tolerance: 5 }, // Mobile interaction
        })
    );

    return (
        <div className="w-full max-w-[480px] mx-auto px-4 pt-4 flex flex-col flex-1 font-sans text-white">
            {/* Top bar with progress and cancel */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                    <ProgressBar currentProgress={beforeProgress} newProgress={progressAfter} />
                </div>
                <CancelButton className="ml-4" onClick={onCancel} />
            </div>

            {/* Exercise instruction */}
            <div className="text-center mb-6">
                <h2 className="text-heading-xl font-bold">
                    {questionText}
                </h2>
            </div>

            {/* Drag and drop area */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="relative flex flex-col gap-4 mb-6">
                        {items.map((item, index) => (
                            <ExerciseLabel
                                key={item.id}
                                id={item.id}
                                content={item.content}
                                disabled={isEvaluated}
                                variant={
                                    !isEvaluated
                                        ? 'native'
                                        : item.id === correctOrder[index]
                                            ? 'correct'
                                            : 'incorrect'
                                }
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Done button */}
            {!isEvaluated && (
                <PrimaryButton onClick={handleEvaluate} className="mx-auto w-2/3 !justify-center">
                    Done
                </PrimaryButton>
            )}
            {/* Feedback after evaluation */}
            {wasCorrect !== null && (
                <FeedbackButton
                    evaluation={wasCorrect ? 'Correct!' : 'Incorrect!'}
                    explanation={!wasCorrect ? 'Explanation goes here.' : undefined}
                    correct={wasCorrect}
                    onContinue={() => onContinue({ incorrect: !wasCorrect, progressAfter })}
                />
            )}
        </div>
    );
}
