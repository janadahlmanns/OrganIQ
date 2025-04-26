import { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ExerciseStage from '../components/ExerciseStage';
import Question from '../components/Question';
import Cloze from '../components/Cloze';
import TrueFalse from '../components/TrueFalse';
import Memory from '../components/Memory';
import OrderExercise from '../components/OrderExercise';
import SuccessScreen from '../components/SuccessScreen';
import { useAppDispatch } from '../store/hooks';
import { completeLesson, perfectLesson, addXP, addCrown, unlockLesson } from '../store/lessonSlice';


import exercisesData from '../data/exercises.json';

export default function LessonScreen() {
  const { topicId, lessonId } = useParams();
  const LESSON_LENGTH = 3;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [incorrectIds, setIncorrectIds] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const dispatch = useAppDispatch();

  const topicExercises = exercisesData.exercises
    .filter((e) =>
      e.topic.toLowerCase() === topicId?.toLowerCase() &&
      ['question', 'cloze', 'truefalse', 'memory', 'ordering'].includes(e.type)
    );

  const lessonExercises = useMemo(() => {
    if (topicExercises.length === 0) return [];

    const shuffled = [...topicExercises].sort(() => Math.random() - 0.5);
    const chosen: number[] = [];

    while (chosen.length < LESSON_LENGTH) {
      const next = shuffled[chosen.length % shuffled.length]; // modulo = safely loops over
      chosen.push(next.id);
    }
    return chosen;
  }, [topicExercises]);

  const currentExerciseId = lessonExercises[currentIndex];
  const isLessonComplete = currentIndex >= LESSON_LENGTH;
  const progressStep = 100 / LESSON_LENGTH;

  const getNextLessonId = (current: string) => {
    if (current === 'review') return null;
    const number = parseInt(current, 10);
    if (isNaN(number)) return null;
    if (number >= 9) return null;
    const nextNumber = number + 1;
    return nextNumber.toString().padStart(2, '0');
  };

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

  const handleLessonComplete = () => {
    if (!topicId || !lessonId) return;

    const fullLessonId = `${topicId}-${lessonId}`;

    if (incorrectIds.length > 0) {
      dispatch(completeLesson(fullLessonId));
    } else {
      dispatch(perfectLesson(fullLessonId));
      dispatch(addCrown());
    }

    dispatch(addXP(30));

    if (!['09', 'review'].includes(lessonId)) {
      const nextLessonId = getNextLessonId(lessonId);
      if (nextLessonId) {
        dispatch(unlockLesson(`${topicId}-${nextLessonId}`));
      }
    }
  };

  useEffect(() => {
    if (isLessonComplete) {
      handleLessonComplete();
    }
  }, [isLessonComplete]);

  const currentExercise = topicExercises.find((e) => e.id === currentExerciseId);
  const currentType = currentExercise?.type ?? 'question';




  return (
    <ExerciseStage>
      {isLessonComplete ? (
        <SuccessScreen
          topicId={topicId || ''}
          incorrectIds={incorrectIds}
          lessonLength={LESSON_LENGTH}
        />
      ) : currentType === 'cloze' ? (
        <Cloze
          key={`${currentExerciseId}-${currentIndex}`}
          exerciseId={currentExerciseId}
          beforeProgress={progress}
          progressStep={progressStep}
          onContinue={handleContinue}
        />
      ) : currentType === 'truefalse' ? (
        <TrueFalse
          key={`${currentExerciseId}-${currentIndex}`}
          exerciseId={currentExerciseId}
          beforeProgress={progress}
          progressStep={progressStep}
          onContinue={handleContinue}
        />
      ) : currentType === 'memory' ? (
        <Memory
          key={`${currentExerciseId}-${currentIndex}`}
          exerciseId={currentExerciseId}
          beforeProgress={progress}
          progressStep={progressStep}
          onContinue={handleContinue}
        />
      ) : currentType === 'ordering' ? (
        <OrderExercise
          key={`${currentExerciseId}-${currentIndex}`}
          exerciseId={currentExerciseId}
          beforeProgress={progress}
          progressStep={progressStep}
          onContinue={handleContinue}
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
