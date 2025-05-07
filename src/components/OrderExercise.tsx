import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PrimaryButton from './PrimaryButton';
import ProgressBar from './ProgressBar';
import CancelButton from './CancelButton';
import FeedbackButton from './FeedbackButton';
import ExerciseLabel from './ExerciseLabel';
import { useAppSelector } from '../store/hooks';
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
    content?: string;
    image?: string;
};

export default function OrderExercise({
    exerciseId,
    beforeProgress,
    progressStep,
    onContinue,
    onCancel,
}: OrderExerciseProps) {
    const { t } = useTranslation();
    const exerciseLanguage = useAppSelector((state) => state.settings.exerciseLanguage);
    const [items, setItems] = useState<Item[]>([]);
    const [correctOrder, setCorrectOrder] = useState<string[]>([]);
    const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
    const [progressAfter, setProgressAfter] = useState<number>(beforeProgress);
    const [isEvaluated, setIsEvaluated] = useState<boolean>(false);
    const [questionText, setQuestionText] = useState<string>('');
    const [explanation, setExplanation] = useState<string | undefined>(undefined);

    useEffect(() => {
        const exercise = orderingData.ordering.find((ex) => ex.id === exerciseId);
        if (!exercise) return;

        const isImageType = exercise.type === 'image';

        const orderedItems: Item[] = isImageType
            ? (exercise.items as string[]).map((imgPath: string, index: number) => ({
                id: String(index),
                image: `/images/exercises/${imgPath}`,
            }))
            : (exercise.items as Record<string, string[]>)[exerciseLanguage].map((text: string, index: number) => ({
                id: String(index),
                content: text,
            }));

        setCorrectOrder(orderedItems.map((item) => item.id));
        setItems([...orderedItems].sort(() => Math.random() - 0.5));

        if (isImageType) {
            orderedItems.forEach((item) => {
                if (item.image) {
                    const img = new Image();
                    img.src = item.image;
                }
            });
        }

        setQuestionText(
            typeof exercise.question_text === 'string' ? exercise.question_text : exercise.question_text[exerciseLanguage]
        );

        if (typeof exercise.explanation === 'string') {
            setExplanation(exercise.explanation);
        } else if (exercise.explanation?.[exerciseLanguage]) {
            setExplanation(exercise.explanation[exerciseLanguage]);
        }

        setProgressAfter(beforeProgress);
        setWasCorrect(null);
        setIsEvaluated(false);
    }, [exerciseId, beforeProgress]);

    const handleEvaluate = () => {
        if (isEvaluated) return;

        const currentOrder = items.map((item) => item.id);
        const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(correctOrder);

        setWasCorrect(isCorrect);
        setProgressAfter(Math.min(beforeProgress + progressStep, 100));
        setIsEvaluated(true);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        setItems(newItems);
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 1 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
    );

    return (
        <div className="w-full max-w-[480px] mx-auto px-4 pt-4 flex flex-col flex-1 font-sans text-white">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                    <ProgressBar currentProgress={beforeProgress} newProgress={progressAfter} />
                </div>
                <CancelButton className="ml-4" onClick={onCancel} />
            </div>

            {/* Question */}
            <div className="text-center mb-6">
                <h2 className="text-heading-xl font-bold">{questionText}</h2>
            </div>

            {/* Sortable Items */}
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                    <div className="relative flex flex-col gap-4 mb-6">
                        {items.map((item, index) => (
                            <div className="flex justify-center" key={item.id}>
                                <ExerciseLabel
                                    id={item.id}
                                    content={item.content}
                                    image={item.image}
                                    disabled={isEvaluated}
                                    variant={
                                        !isEvaluated
                                            ? 'native'
                                            : item.id === correctOrder[index]
                                                ? 'correct'
                                                : 'incorrect'
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Buttons */}
            {!isEvaluated && (
                <PrimaryButton onClick={handleEvaluate} className="mx-auto w-2/3 !justify-center">
                    {t('shared.done')}
                </PrimaryButton>
            )}
            {wasCorrect !== null && (
                <FeedbackButton
                    evaluation={t(wasCorrect ? 'shared.correct' : 'shared.incorrect')}
                    explanation={!wasCorrect ? explanation : undefined}
                    correct={wasCorrect}
                    onContinue={() => onContinue({ incorrect: !wasCorrect, progressAfter })}
                />
            )}
        </div>
    );
}
