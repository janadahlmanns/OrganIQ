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
import truefalseData from '../data/exercises_truefalse.json';

type TrueFalseProps = {
    exerciseId: number;
    beforeProgress: number;
    progressStep: number;
    onContinue: (result: { incorrect: boolean; progressAfter: number }) => void;
    onCancel: () => void;
};

export default function TrueFalse({
    exerciseId,
    beforeProgress,
    progressStep,
    onContinue,
    onCancel,
}: TrueFalseProps) {
    const { t } = useTranslation();
    const exerciseLanguage = useAppSelector((state) => state.settings.exerciseLanguage);
    const questionData = truefalseData.truefalse.find(q => q.id === exerciseId);
    const navigate = useNavigate();

    const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
    const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
    const [progressAfter, setProgressAfter] = useState<number>(beforeProgress);

    useEffect(() => {
        setSelectedAnswer(null);
        setWasCorrect(null);
        setProgressAfter(beforeProgress);
    }, [exerciseId, beforeProgress]);

    if (!questionData) {
        return (
            <div className="text-white text-center space-y-4">
                <div className="text-xl font-bold">{t('feedback.questionNotFound')}</div>
                <PrimaryButton
                    variant="white"
                    active
                    className="w-2/3 mx-auto"
                    onClick={() => navigate('/')}
                >
                    {t('feedback.backToMenu')}
                </PrimaryButton>
            </div>
        );
    }

    const handleSelect = (answer: boolean) => {
        if (selectedAnswer !== null) return;

        const correct = answer === questionData.correct_option;
        setSelectedAnswer(answer);
        setWasCorrect(correct);
        setProgressAfter(beforeProgress + progressStep);
    };

    const questionText =
        typeof questionData.question_text === 'string'
            ? questionData.question_text
            : questionData.question_text[exerciseLanguage];

    const explanation =
        typeof questionData.explanation === 'string'
            ? questionData.explanation
            : questionData.explanation?.[exerciseLanguage];

    return (
        <div className="w-full max-w-[480px] mx-auto px-4 pt-4 flex flex-col flex-1">
            {/* Top bar with progress + cancel */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                    <ProgressBar currentProgress={beforeProgress} newProgress={progressAfter} />
                </div>
                <CancelButton className="ml-4" onClick={onCancel} />
            </div>

            {/* Question and options */}
            <div className="space-y-6 w-full">
                <h2 className="text-xl font-bold text-center">{questionText}</h2>

                <div className="flex flex-col gap-4">
                    <PrimaryButton
                        onClick={() => handleSelect(true)}
                        disabled={selectedAnswer !== null}
                        interactive={selectedAnswer === null}
                        active={selectedAnswer === true}
                        variant={
                            selectedAnswer === null
                                ? 'pink'
                                : selectedAnswer === true
                                    ? (questionData.correct_option === true ? 'cyan' : 'white')
                                    : 'pink'
                        }
                    >
                        {t('truefalse.true')}
                    </PrimaryButton>

                    <PrimaryButton
                        onClick={() => handleSelect(false)}
                        disabled={selectedAnswer !== null}
                        interactive={selectedAnswer === null}
                        active={selectedAnswer === false}
                        variant={
                            selectedAnswer === null
                                ? 'pink'
                                : selectedAnswer === false
                                    ? (questionData.correct_option === false ? 'cyan' : 'white')
                                    : 'pink'
                        }
                    >
                        {t('truefalse.false')}
                    </PrimaryButton>
                </div>

                {wasCorrect !== null && (
                    <FeedbackButton
                        evaluation={wasCorrect ? t('shared.correct') : t('shared.incorrect')}
                        explanation={!wasCorrect && explanation ? explanation : undefined}
                        correct={wasCorrect}
                        onContinue={() => onContinue({ incorrect: !wasCorrect, progressAfter })}
                    />
                )}
            </div>
        </div>
    );
}
