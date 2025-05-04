import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ExerciseStage from '../components/ExerciseStage';
import Question from '../components/Question';
import Cloze from '../components/Cloze';
import TrueFalse from '../components/TrueFalse';
import Memory from '../components/Memory';
import OrderExercise from '../components/OrderExercise';
import SliderExercise from '../components/SliderExercise';
import Hotspot from '../components/Hotspot';
import Puzzle from '../components/Puzzle';
import SuccessScreen from '../components/SuccessScreen';
import { useAppDispatch } from '../store/hooks';
import { completeLesson, perfectLesson, addXP, addCrown, unlockLesson } from '../store/lessonSlice';

import exercisesData from '../data/exercises.json';
import { loadLessonProgress, saveLessonProgress, clearLessonProgress } from '../utils/lessonProgressStorage';

export default function LessonScreen() {
  const { topicId, lessonId } = useParams();
  const LESSON_LENGTH = 3;
  const dispatch = useAppDispatch();
  const [lessonExercises, setLessonExercises] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [incorrectIds, setIncorrectIds] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  const topicExercises = exercisesData.exercises.filter(
    (e) =>
      e.topic.toLowerCase() === topicId?.toLowerCase() &&
      ['question', 'cloze', 'truefalse', 'memory', 'ordering', 'slider', 'hotspot', 'puzzle'].includes(e.type)
    //['question', 'cloze', 'truefalse', 'memory', 'ordering', 'slider', 'hotspot', 'puzzle'].includes(e.type)
  );

  useEffect(() => {
    const savedProgress = loadLessonProgress();

    if (savedProgress && topicExercises.length > 0) {
      setLessonExercises(savedProgress.lessonExercises);
      setCurrentIndex(savedProgress.currentIndex);
      +   setProgress((savedProgress.currentIndex / LESSON_LENGTH) * 100);
    } else if (topicExercises.length > 0) {
      const shuffled = [...topicExercises].sort(() => Math.random() - 0.5);
      const chosen: number[] = [];

      while (chosen.length < LESSON_LENGTH) {
        const next = shuffled[chosen.length % shuffled.length];
        chosen.push(next.id);
      }

      setLessonExercises(chosen);
      setCurrentIndex(0);
      setProgress(0);

      saveLessonProgress({
        lessonExercises: chosen,
        currentIndex: 0,
      });
    }
  }, []);

  useEffect(() => {
    if (lessonExercises.length > 0) {
      saveLessonProgress({
        lessonExercises,
        currentIndex,
      });
    }
  }, [lessonExercises, currentIndex]);

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

  const handleCancel = () => {
    clearLessonProgress();
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

    clearLessonProgress();
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
          onCancel={handleCancel}
        />
      ) : currentType === 'truefalse' ? (
        <TrueFalse
          key={`${currentExerciseId}-${currentIndex}`}
          exerciseId={currentExerciseId}
          beforeProgress={progress}
          progressStep={progressStep}
          onContinue={handleContinue}
          onCancel={handleCancel}
        />
      ) : currentType === 'memory' ? (
        <Memory
          key={`${currentExerciseId}-${currentIndex}`}
          exerciseId={currentExerciseId}
          beforeProgress={progress}
          progressStep={progressStep}
          onContinue={handleContinue}
          onCancel={handleCancel}
        />
      ) : currentType === 'ordering' ? (
        <OrderExercise
          key={`${currentExerciseId}-${currentIndex}`}
          exerciseId={currentExerciseId}
          beforeProgress={progress}
          progressStep={progressStep}
          onContinue={handleContinue}
          onCancel={handleCancel}
        />
      ) : currentType === 'slider' ? (
        <SliderExercise
          key={`${currentExerciseId}-${currentIndex}`}
          exerciseId={currentExerciseId}
          beforeProgress={progress}
          progressStep={progressStep}
          onContinue={handleContinue}
          onCancel={handleCancel}
        />
      ) : currentType === 'hotspot' ? (
        <Hotspot
          key={`${currentExerciseId}-${currentIndex}`}
          exerciseId={currentExerciseId}
          beforeProgress={progress}
          progressStep={progressStep}
          onContinue={handleContinue}
          onCancel={handleCancel}
        />
      ) : currentType === 'puzzle' ? (
        <Puzzle
          key={`${currentExerciseId}-${currentIndex}`}
          exerciseId={currentExerciseId}
          beforeProgress={progress}
          progressStep={progressStep}
          onContinue={handleContinue}
          onCancel={handleCancel}
        />
      ) : (
        <Question
          key={`${currentExerciseId}-${currentIndex}`}
          exerciseId={currentExerciseId}
          beforeProgress={progress}
          progressStep={progressStep}
          onContinue={handleContinue}
          onCancel={handleCancel}
        />
      )}
    </ExerciseStage>
  );
}
