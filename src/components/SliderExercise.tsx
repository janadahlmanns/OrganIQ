import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PrimaryButton from './PrimaryButton';
import FeedbackButton from './FeedbackButton';
import ProgressBar from './ProgressBar';
import CancelButton from './CancelButton';
import { useAppSelector } from '../store/hooks';
import sliderData from '../data/exercises_slider.json';


type SliderExerciseProps = {
  exerciseId: number;
  beforeProgress: number;
  progressStep: number;
  onContinue: (result: { incorrect: boolean; progressAfter: number }) => void;
  onCancel: () => void;
};

export default function SliderExercise({
  exerciseId,
  beforeProgress,
  progressStep,
  onContinue,
  onCancel,
}: SliderExerciseProps) {
  const { t } = useTranslation();
  const exerciseLanguage = useAppSelector((state) => state.settings.exerciseLanguage);
  const [prompt, setPrompt] = useState('');
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);
  const [correct, setCorrect] = useState(0);
  const [tolerance, setTolerance] = useState(0);
  const [unit, setUnit] = useState('');
  const [value, setValue] = useState(50);
  const [explanation, setExplanation] = useState<string | undefined>(undefined);

  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [progressAfter, setProgressAfter] = useState(beforeProgress);

  useEffect(() => {
    const exercise = sliderData.slider.find((ex) => ex.id === exerciseId);
    if (!exercise) return;

    // Handle multilingual fields
    setPrompt(typeof exercise.prompt === 'string' ? exercise.prompt : exercise.prompt[exerciseLanguage]);
    setExplanation(
      typeof exercise.explanation === 'string' ? exercise.explanation : exercise.explanation?.[exerciseLanguage]
    );

    // Load numeric fields
    setMin(exercise.min);
    setMax(exercise.max);
    setCorrect(exercise.correct);
    setTolerance(exercise.tolerance);
    setUnit(exercise.unit || '');
    setValue((exercise.min + exercise.max) / 2);

    // Reset state
    setProgressAfter(beforeProgress);
    setWasCorrect(null);
    setIsEvaluated(false);
  }, [exerciseId, beforeProgress]);

  const handleEvaluate = () => {
    if (isEvaluated) return;
    const isCorrect = Math.abs(value - correct) <= tolerance;
    setWasCorrect(isCorrect);
    setProgressAfter(Math.min(beforeProgress + progressStep, 100));
    setIsEvaluated(true);
  };

  return (
    <div className="w-full max-w-[480px] mx-auto px-4 pt-4 flex flex-col flex-1 font-sans text-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <ProgressBar currentProgress={beforeProgress} newProgress={progressAfter} />
        </div>
        <CancelButton className="ml-4" onClick={onCancel} />
      </div>

      <div className="text-center mb-8">
        <h2 className="text-heading-xl font-bold">{prompt}</h2>
      </div>

      <div className="w-full flex flex-col items-center mb-6">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          disabled={isEvaluated}
          className="w-full accent-neonCyan"
        />
        <div className="mt-4 text-heading-xl font-bold text-glowCyan">
          {value} {unit}
        </div>
      </div>

      {!isEvaluated && (
        <PrimaryButton onClick={handleEvaluate} className="mx-auto w-2/3 !justify-center">
          {t('shared.done')}
        </PrimaryButton>
      )}

      {wasCorrect !== null && (
        <FeedbackButton
          evaluation={wasCorrect ? t('shared.correct') : t('shared.incorrect')}
          explanation={!wasCorrect ? explanation : undefined}
          correct={wasCorrect}
          onContinue={() => onContinue({ incorrect: !wasCorrect, progressAfter })}
        />
      )}
    </div>
  );
}
