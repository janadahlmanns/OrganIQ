import { useMemo, useState } from 'react';
import PrimaryButton from './PrimaryButton';

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
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const shuffledOptions: ShuffledOption[] = useMemo(() => {
        const labeled = options.map((label, idx) => ({
            label,
            isCorrect: idx === correctIndex,
        }));
        return labeled.sort(() => Math.random() - 0.5);
    }, [options, correctIndex]);

    const handleSelect = (index: number) => {
        if (selectedIndex !== null) return; // prevent multiple clicks
        setSelectedIndex(index);

        // Feedback delay (1s) — replace with next() call later
        setTimeout(() => {
            console.log(
                shuffledOptions[index].isCorrect ? '✅ Correct' : '❌ Incorrect'
            );
        }, 1000);
    };

    return (
        <div className="space-y-6 w-full">
            <h2 className="text-xl font-bold text-center">{question}</h2>
            <div className="flex flex-col gap-4">
                {shuffledOptions.map((opt, index) => {
                    return (
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
                                        ? (shuffledOptions[index].isCorrect ? 'cyan' : 'white')
                                        : 'pink'
                            }
                        >
                            {opt.label}
                        </PrimaryButton>

                    );
                })}
            </div>
        </div>
    );
}
