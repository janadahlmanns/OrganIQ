import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from './PrimaryButton';
import ProgressBar from './ProgressBar';
import CancelButton from './CancelButton';
import clozesData from '../data/exercises_cloze.json';

type ClozeProps = {
    exerciseId: number;
    beforeProgress: number;
    progressStep: number;
    onContinue: (result: { incorrect: boolean; progressAfter: number }) => void;
};

export default function Cloze({ exerciseId, beforeProgress, progressStep, onContinue }: ClozeProps) {
    const questionData = clozesData.clozes.find(q => q.id === exerciseId);

    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
    const [progressAfter, setProgressAfter] = useState<number>(beforeProgress);

    useEffect(() => {
        setSelectedIndex(null);
        setWasCorrect(null);
        setProgressAfter(beforeProgress);
    }, [exerciseId, beforeProgress]);

    if (!questionData) {
        const navigate = useNavigate();
        return (
            <div className="text-white text-center space-y-4">
                <div className="text-xl font-bold">Question not found.</div>
                <PrimaryButton
                    variant="white"
                    active
                    className="w-2/3 mx-auto"
                    onClick={() => navigate('/')}
                >
                    Back to Menu
                </PrimaryButton>
            </div>
        );
    }

    const options = [
        questionData.option_1,
        questionData.option_2,
        questionData.option_3,
        questionData.option_4,
    ];
    const correctIndex = questionData.correct_option - 1;

    const handleSelect = (index: number) => {
        if (selectedIndex !== null) return;

        const correct = index === correctIndex;
        setSelectedIndex(index);
        setWasCorrect(correct);
        setProgressAfter(beforeProgress + progressStep);
    };

    return (
        <div className="w-full max-w-[480px] mx-auto px-4 pt-4 flex flex-col flex-1">
            {/* Top bar with progress + cancel */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                    <ProgressBar value={progressAfter} />
                </div>
                <CancelButton className="ml-4" />
            </div>

            {/* Question and options */}
            <div className="space-y-6 w-full">
                <h2 className="text-xl font-bold text-center">
                    {questionData.question_text.split('___').map((chunk, i, arr) => (
                        <span key={i}>
                            {chunk}
                            {i < arr.length - 1 && (
                                <span className="inline-block w-20 h-[3px] bg-white rounded-full shadow-glowWhite mx-2 align-middle" />
                            )}
                        </span>
                    ))}
                </h2>

                <div className="flex flex-col gap-4">
                    {options.map((option, index) => (
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
                                        ? (index === correctIndex ? 'cyan' : 'white')
                                        : 'pink'
                            }
                        >
                            {option}
                        </PrimaryButton>
                    ))}
                </div>

                {wasCorrect !== null && (
                    <PrimaryButton
                        onClick={() => onContinue({ incorrect: !wasCorrect, progressAfter })}
                        variant={wasCorrect ? 'cyan' : 'white'}
                        active
                        className="w-2/3 mx-auto px-6 py-4 flex flex-col items-center space-y-1 text-base"
                    >
                        <span>{wasCorrect ? 'Correct! Explanation of why goes here.' : 'Incorrect! Explanation of why goes here.'}</span>
                        <span className="font-bold">Continue</span>
                    </PrimaryButton>
                )}
            </div>
        </div>
    );
}
