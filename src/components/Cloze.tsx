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
import clozesData from '../data/exercises_cloze.json';



type ClozeProps = {
    exerciseId: number;
    beforeProgress: number;
    progressStep: number;
    onContinue: (result: { incorrect: boolean; progressAfter: number }) => void;
    onCancel: () => void;
};

export default function Cloze({ exerciseId, beforeProgress, progressStep, onContinue, onCancel }: ClozeProps) {
    const { t } = useTranslation();
    const exerciseLanguage = useAppSelector((state) => state.settings.exerciseLanguage);
    const questionData = clozesData.clozes.find(q => q.id === exerciseId);
    const navigate = useNavigate();

    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
    const [progressAfter, setProgressAfter] = useState<number>(beforeProgress);
    const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
    const [shuffledCorrectIndex, setShuffledCorrectIndex] = useState<number>(0);

    useEffect(() => {
        setSelectedIndex(null);
        setWasCorrect(null);
        setProgressAfter(beforeProgress);

        if (!questionData) return;

        const newOptions = [
            { text: questionData.option_1[exerciseLanguage], isCorrect: questionData.correct_option === 1 },
            { text: questionData.option_2[exerciseLanguage], isCorrect: questionData.correct_option === 2 },
            { text: questionData.option_3[exerciseLanguage], isCorrect: questionData.correct_option === 3 },
            { text: questionData.option_4[exerciseLanguage], isCorrect: questionData.correct_option === 4 },
        ];

        const shuffled = newOptions.sort(() => Math.random() - 0.5);

        setShuffledOptions(shuffled.map(opt => opt.text));
        setShuffledCorrectIndex(shuffled.findIndex(opt => opt.isCorrect));
    }, [exerciseId, beforeProgress]);

    if (!questionData) {
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

    const handleSelect = (index: number) => {
        if (selectedIndex !== null) return;

        const correct = index === shuffledCorrectIndex;
        setSelectedIndex(index);
        setWasCorrect(correct);
        setProgressAfter(beforeProgress + progressStep);
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

            {/* Question and options */}
            <div className="space-y-6 w-full">
                <h2 className="text-xl font-bold text-center">
                    {questionData.question_text[exerciseLanguage].split('___').map((chunk, i, arr) => (
                        <span key={i}>
                            {chunk}
                            {i < arr.length - 1 && (
                                <span className="inline-block w-20 h-[3px] bg-white rounded-full shadow-glowWhite mx-2 align-middle" />
                            )}
                        </span>
                    ))}
                </h2>

                <div className="flex flex-col gap-4">
                    {shuffledOptions.map((option, index) => (
                        <PrimaryButton
                            key={index}
                            onClick={() => handleSelect(index)}
                            disabled={selectedIndex !== null}
                            interactive={selectedIndex === null}
                            active={index === selectedIndex}
                            variant={
                                selectedIndex === null
                                    ? 'pink'
                                    : index === selectedIndex
                                        ? (index === shuffledCorrectIndex ? 'cyan' : 'white')
                                        : 'pink'
                            }
                        >
                            {option}
                        </PrimaryButton>
                    ))}
                </div>

                {wasCorrect !== null && (
                    <FeedbackButton
                        evaluation={t(wasCorrect ? 'shared.correct' : 'shared.incorrect')}
                        explanation={!wasCorrect ? questionData.explanation?.[exerciseLanguage] : undefined}
                        correct={wasCorrect}
                        onContinue={() => onContinue({ incorrect: !wasCorrect, progressAfter })}
                    />
                )}
            </div>
        </div>
    );
}
