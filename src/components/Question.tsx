import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from './PrimaryButton';
import ProgressBar from './ProgressBar';
import CancelButton from './CancelButton';
import FeedbackButton from './FeedbackButton';
import questionsData from '../data/exercises_questions.json';

type QuestionProps = {
    exerciseId: number;
    beforeProgress: number;
    progressStep: number;
    onContinue: (result: { incorrect: boolean; progressAfter: number }) => void;
};

export default function Question({ exerciseId, beforeProgress, progressStep, onContinue }: QuestionProps) {
    const questionData = questionsData.questions.find(q => q.id === exerciseId);
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
            { text: questionData.option_1, isCorrect: questionData.correct_option === 1 },
            { text: questionData.option_2, isCorrect: questionData.correct_option === 2 },
            { text: questionData.option_3, isCorrect: questionData.correct_option === 3 },
            { text: questionData.option_4, isCorrect: questionData.correct_option === 4 },
        ];

        const shuffled = newOptions.sort(() => Math.random() - 0.5);

        setShuffledOptions(shuffled.map(opt => opt.text));
        setShuffledCorrectIndex(shuffled.findIndex(opt => opt.isCorrect));
    }, [exerciseId, beforeProgress]);

    if (!questionData) {
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

    const handleSelect = (index: number) => {
        if (selectedIndex !== null) return;

        const correct = index === shuffledCorrectIndex;
        setSelectedIndex(index);
        setWasCorrect(correct);
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
                <CancelButton className="ml-4" />
            </div>

            {/* Question and options */}
            <div className="space-y-6 w-full">
                <h2 className="text-xl font-bold text-center">{questionData.question_text}</h2>

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
                        evaluation={wasCorrect ? 'Correct!' : 'Incorrect!'}
                        explanation={!wasCorrect ? 'Explanation goes here.' : undefined}
                        correct={wasCorrect}
                        onContinue={() => onContinue({ incorrect: !wasCorrect, progressAfter })}
                    />
                )}
            </div>
        </div>
    );
}
