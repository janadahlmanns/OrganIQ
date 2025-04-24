import { useMemo, useState, useEffect } from 'react';
import PrimaryButton from './PrimaryButton';

type QuestionProps = {
    question: string;
    options: string[];
    correctIndex: number;
    onAnswerSelected: () => void;
    onComplete: () => void;
};

type ShuffledOption = {
    label: string;
    isCorrect: boolean;
};

export default function Question({ question, options, correctIndex, onAnswerSelected, onComplete }: QuestionProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [showContinue, setShowContinue] = useState(false);
    const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

    useEffect(() => {
        setSelectedIndex(null);
        setShowContinue(false);      // ✅ hide feedback card
        setWasCorrect(null);         // ✅ clear previous result
    }, [question]);


    const shuffledOptions: ShuffledOption[] = useMemo(() => {
        const labeled = options.map((label, idx) => ({
            label,
            isCorrect: idx === correctIndex,
        }));
        return labeled.sort(() => Math.random() - 0.5);
    }, [options, correctIndex]);

    const handleSelect = (index: number) => {
        if (selectedIndex !== null) return;

        setSelectedIndex(index);
        setWasCorrect(shuffledOptions[index].isCorrect);
        setShowContinue(true);
        onAnswerSelected();
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
            {showContinue && (
                <PrimaryButton
                    onClick={onComplete}
                    variant={wasCorrect ? 'cyan' : 'white'}
                    active // 🔥 static glow
                    className="w-2/3 mx-auto px-6 py-4 flex flex-col items-center space-y-1 text-base"
                >
                    <span>{wasCorrect ? 'Correct!' : 'Incorrect'}</span>
                    <span className="font-bold">Continue</span>
                </PrimaryButton>
            )}
        </div>
    );
}
