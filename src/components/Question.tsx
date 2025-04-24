import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from './PrimaryButton';
import questionsData from '../data/exercises_questions.json';

type QuestionProps = {
    exerciseId: number;
    onEvaluation: (result: { done: true; incorrect: boolean }) => void;
    onContinue: () => void;
};

export default function Question({ exerciseId, onEvaluation, onContinue }: QuestionProps) {
    const questionData = questionsData.questions.find(q => q.id === exerciseId);

    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

    useEffect(() => {
        setSelectedIndex(null);
        setWasCorrect(null);
    }, [exerciseId]);

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

        onEvaluation({ done: true, incorrect: !correct });
    };

    return (
        <div className="space-y-6 w-full">
            <h2 className="text-xl font-bold text-center">{questionData.question_text}</h2>
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
                    onClick={onContinue}
                    variant={wasCorrect ? 'cyan' : 'white'}
                    active
                    className="w-2/3 mx-auto px-6 py-4 flex flex-col items-center space-y-1 text-base"
                >
                    <span>{wasCorrect ? 'Correct! Explanation of why goes here.' : 'Incorrect! Explanation of why goes here.'}</span>
                    <span className="font-bold">Continue</span>
                </PrimaryButton>
            )}
        </div>
    );
}