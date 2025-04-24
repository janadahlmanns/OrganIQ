import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ScreenLayout from '../components/ScreenLayout';
import ProgressBar from '../components/ProgressBar';
import CancelButton from '../components/CancelButton';
import ExerciseStage from '../components/ExerciseStage';
import Question from '../components/Question';
import SuccessScreen from '../components/SuccessScreen';

import exercisesData from '../data/exercises.json';

export default function LessonScreen() {
  const { topicId } = useParams();
  const LESSON_LENGTH = 3;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [incorrectIds, setIncorrectIds] = useState<number[]>([]);

  const topicExercises = exercisesData.exercises
    .filter((e) => e.topic.toLowerCase() === topicId?.toLowerCase() && e.type === 'question');

  const lessonExercises = useMemo(() => {
    const shuffled = [...topicExercises].sort(() => Math.random() - 0.5);
    const chosen: number[] = [];
    while (chosen.length < LESSON_LENGTH) {
      const next = shuffled[chosen.length % shuffled.length];
      chosen.push(next.id);
    }
    return chosen;
  }, [topicExercises]);

  const currentExerciseId = lessonExercises[currentIndex];
  const isLessonComplete = currentIndex >= LESSON_LENGTH;

  const handleComplete = ({ done, incorrect }: { done: true; incorrect: boolean }) => {
    if (done) {
      if (incorrect) {
        setIncorrectIds((prev) => [...prev, currentExerciseId]);
      }
      setProgress(Math.min(Math.round(((currentIndex + 1) / LESSON_LENGTH) * 100), 100));
    }
  };

  const handleContinue = () => {
    if (currentIndex < LESSON_LENGTH - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(LESSON_LENGTH);
    }
  };

  return (
    <ScreenLayout>
      <div className="w-full max-w-[480px] mx-auto px-4 pt-4 flex flex-col flex-1">
        {/* Top bar with progress + cancel */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <ProgressBar value={progress} />
          </div>
          <CancelButton className="ml-4" />
        </div>

        {/* Main content area */}
        <ExerciseStage>
          {isLessonComplete ? (
            <SuccessScreen
              topicId={topicId || ''}
              incorrectIds={incorrectIds}
              lessonLength={LESSON_LENGTH}
            />
          ) : (
            <div key={currentExerciseId}>
                <Question
                  key={`${currentExerciseId}-${currentIndex}`} // Composite of ExerciseID and currentIndex to trigger re-render even if an exerciseID repeats itself
                  exerciseId={currentExerciseId}
                  onEvaluation={handleComplete}
                  onContinue={handleContinue}
                />

            </div>
          )}
        </ExerciseStage>
      </div>
    </ScreenLayout>
  );
}
