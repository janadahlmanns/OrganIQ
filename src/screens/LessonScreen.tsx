import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ExerciseStage from '../components/ExerciseStage';
import Question from '../components/Question';
import SuccessScreen from '../components/SuccessScreen';

import exercisesData from '../data/exercises.json';

export default function LessonScreen() {
  const { topicId } = useParams();
  const LESSON_LENGTH = 3;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [incorrectIds, setIncorrectIds] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

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
  const progressStep = 100 / LESSON_LENGTH;

  const handleContinue = ({ incorrect, progressAfter }: { incorrect: boolean; progressAfter: number }) => {
    if (incorrect) {
      setIncorrectIds((prev) => [...prev, currentExerciseId]);
    }

    setProgress(progressAfter);

    if (currentIndex < LESSON_LENGTH - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(LESSON_LENGTH);
    }
  };

  return (
    <ExerciseStage>
      {isLessonComplete ? (
        <SuccessScreen
          topicId={topicId || ''}
          incorrectIds={incorrectIds}
          lessonLength={LESSON_LENGTH}
        />
      ) : (
        <Question
          key={`${currentExerciseId}-${currentIndex}`}
          exerciseId={currentExerciseId}
          beforeProgress={progress}
          progressStep={progressStep}
          onContinue={handleContinue}
        />
      )}
    </ExerciseStage>
  );
}
