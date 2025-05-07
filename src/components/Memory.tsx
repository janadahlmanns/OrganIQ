import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PrimaryButton from './PrimaryButton';
import ProgressBar from './ProgressBar';
import CancelButton from './CancelButton';
import FeedbackButton from './FeedbackButton';
import MemoryButton from './MemoryButton';
import { useAppSelector } from '../store/hooks';
import memoriesData from '../data/exercises_memory.json';


type MemoryProps = {
    exerciseId: number;
    beforeProgress: number;
    progressStep: number;
    onContinue: (result: { incorrect: boolean; progressAfter: number }) => void;
    onCancel: () => void;
};

type CardType = {
    id: number;
    pairId: number;
    frontType: 'text' | 'image';
    frontValue: string;
    side: 'front' | 'back';
    solved?: boolean;
};

// helper to handle string vs {en, de}
function resolveValue(value: string | { en: string; de: string }, lang: 'en' | 'de'): string {
    return typeof value === 'string' ? value : value[lang];
}

function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export default function Memory({ exerciseId, beforeProgress, progressStep, onContinue, onCancel }: MemoryProps) {
    const { t } = useTranslation();
    const exerciseLanguage = useAppSelector((state) => state.settings.exerciseLanguage);
    const questionData = memoriesData.memory_pairs.find(q => q.id === exerciseId);
    const navigate = useNavigate();

    const [cards, setCards] = useState<CardType[]>([]);
    const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
    const [progressAfter, setProgressAfter] = useState<number>(beforeProgress);
    const [moves, setMoves] = useState<number>(0);

    useEffect(() => {
        setWasCorrect(null);
        setProgressAfter(beforeProgress);
        setMoves(0);

        if (!questionData) return;

        let idCounter = 0;
        const builtCards: CardType[] = [];

        questionData.pairs.forEach((pair, pairIndex) => {
            builtCards.push({
                id: idCounter++,
                pairId: pairIndex,
                frontType: pair.cardA.type as 'text' | 'image',
                frontValue: resolveValue(pair.cardA.value, exerciseLanguage),
                side: 'back',
                solved: false,
            });
            builtCards.push({
                id: idCounter++,
                pairId: pairIndex,
                frontType: pair.cardB.type as 'text' | 'image',
                frontValue: resolveValue(pair.cardB.value, exerciseLanguage),
                side: 'back',
                solved: false,
            });
        });

        setCards(shuffleArray(builtCards));
    }, [questionData, beforeProgress]);

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

    const [guessClicks, setGuessClicks] = useState(0);
    const [firstSelectedId, setFirstSelectedId] = useState<number | null>(null);

    const handleCardClick = (id: number) => {
        if (guessClicks >= 2) return;
        if (guessClicks === 1 && id === firstSelectedId) return;

        setCards(prevCards =>
            prevCards.map(card =>
                card.id === id
                    ? { ...card, side: card.side === 'front' ? 'back' : 'front' }
                    : card
            )
        );

        if (guessClicks === 0) {
            setFirstSelectedId(id);
            setGuessClicks(1);
        } else if (guessClicks === 1) {
            setGuessClicks(2);
            setMoves(prev => prev + 1);

            const firstCard = cards.find(card => card.id === firstSelectedId);
            const secondCard = cards.find(card => card.id === id);

            if (firstCard && secondCard) {
                if (firstCard.pairId === secondCard.pairId) {
                    setCards(prevCards =>
                        prevCards.map(card =>
                            card.id === firstCard.id || card.id === secondCard.id
                                ? { ...card, solved: true }
                                : card
                        )
                    );

                    const allSolved = cards.every(card =>
                        card.solved || card.id === firstCard.id || card.id === secondCard.id
                    );
                    if (allSolved) handleSolved();
                } else {
                    setTimeout(() => {
                        setCards(prevCards =>
                            prevCards.map(card =>
                                card.id === firstCard.id || card.id === secondCard.id
                                    ? { ...card, side: 'back' }
                                    : card
                            )
                        );
                    }, 1000);
                }
            }

            setTimeout(() => {
                setGuessClicks(0);
                setFirstSelectedId(null);
            }, 1);
        }
    };

    const handleSolved = () => {
        setTimeout(() => {
            setWasCorrect(true);
            setProgressAfter(prev => Math.min(prev + progressStep, 100));
        }, 1700);
    };

    return (
        <div className="w-full max-w-[480px] mx-auto px-4 pt-4 flex flex-col flex-1">
            {/* Top bar with progress + cancel */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                    <ProgressBar currentProgress={beforeProgress} newProgress={progressAfter} />
                </div>
                <CancelButton className="ml-4" onClick={onCancel} />
            </div>

            {/* Prompt */}
            <h2 className="text-xl font-bold text-left text-white mb-6">{t('memory.findThePairs')}</h2>

            {/* Memory board */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {cards.map((card) => (
                    <MemoryButton
                        key={card.id}
                        side={card.side}
                        frontType={card.frontType}
                        frontValue={card.frontValue}
                        solved={card.solved}
                        onClick={() => handleCardClick(card.id)}
                        disabled={(firstSelectedId === card.id && guessClicks === 1) || card.solved}
                        interactive={!((firstSelectedId === card.id && guessClicks === 1) || card.solved)}
                    />
                ))}
            </div>

            {/* Moves counter */}
            <div className="text-white text-center mb-4">
                {t('memory.moves', { count: moves })}
            </div>

            {/* Feedback */}
            {wasCorrect !== null && (
                <FeedbackButton
                    evaluation={t(wasCorrect ? 'shared.correct' : 'shared.incorrect')}
                    explanation={wasCorrect ? t('memory.feedbackMoves', { count: moves }) : undefined}
                    correct={wasCorrect}
                    onContinue={() => onContinue({ incorrect: !wasCorrect, progressAfter })}
                />
            )}
        </div>
    );
}
