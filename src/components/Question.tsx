import React, { useMemo } from 'react';
import PrimaryButton from './PrimaryButton'; // adjust path if needed


type QuestionProps = {
    question: string;
    options: string[];
    correctIndex: number;
};

type ShuffledOption = {
    label: string;
    isCorrect: boolean;
};

export default function Question({ question, options, correctIndex }: QuestionProps) {
    // Shuffle the options and preserve correct answer mapping
    const shuffledOptions: ShuffledOption[] = useMemo(() => {
        const labeled = options.map((label, idx) => ({
            label,
            isCorrect: idx === correctIndex,
        }));
        return labeled.sort(() => Math.random() - 0.5); // Fisher-Yates is better, but fine for now
    }, [options, correctIndex]);

    return (
        <div className="space-y-6 w-full">
            <h2 className="text-xl font-bold text-center">{question}</h2>
            <div className="flex flex-col gap-4">
                {shuffledOptions.map((opt, index) => (
                    <PrimaryButton key={index}>
                        {opt.label}
                    </PrimaryButton>
                ))}
            </div>
        </div>
    );
}
