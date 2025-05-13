// © 2025 Dr. Jana Katharina Dahlmanns. All Rights Reserved.
// This file is part of the OrganIQ project.
// No reuse, redistribution, or modification is permitted without explicit written permission.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProgressBar from './ProgressBar';
import CancelButton from './CancelButton';
import FeedbackButton from './FeedbackButton';
import { useAppSelector } from '../store/hooks';
import questionsData from '../data/exercises_matching.json';

type MatchingExerciseProps = {
    exerciseId: number;
    beforeProgress: number;
    progressStep: number;
    onContinue: (result: { incorrect: boolean; progressAfter: number }) => void;
    onCancel: () => void;
};

export default function MatchingExercise({ exerciseId, beforeProgress, progressStep, onContinue, onCancel }: MatchingExerciseProps) {
    const { t } = useTranslation();
    const exerciseLanguage = useAppSelector((state) => state.settings.exerciseLanguage);
    const questionData = questionsData.matching_pairs.find(q => q.id === exerciseId);
    const navigate = useNavigate();
    const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
    const [progressAfter, setProgressAfter] = useState<number>(beforeProgress);


    useEffect(() => {
        setWasCorrect(null);
        setProgressAfter(beforeProgress);
    }, [exerciseId, beforeProgress]);


    const handleSelect = (index: number) => {

        setWasCorrect(true);
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
            <div className="space-y-6 w-full">
                <h2 className="text-xl font-bold text-center">{questionData.title[exerciseLanguage]}</h2>

                Exercise goes here

                {wasCorrect !== null && (
                    <FeedbackButton
                        evaluation={wasCorrect ? t('shared.correct') : t('shared.incorrect')}
                        correct={wasCorrect}
                        onContinue={() => onContinue({ incorrect: !wasCorrect, progressAfter })}
                    />
                )}
            </div>
        </div>
    );
}
