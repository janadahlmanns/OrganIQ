import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ScreenLayout from '../components/ScreenLayout';
import ProgressBar from '../components/ProgressBar';
import CancelButton from '../components/CancelButton';
import ExerciseStage from '../components/ExerciseStage';
import Question from '../components/Question';
import PrimaryButton from '../components/PrimaryButton';

import exercisesData from '../data/exercises.json';
import questionsData from '../data/exercises_questions.json';
import happyHeart from '../assets/happy_heart.png';
import happyLungs from '../assets/happy_lungs.png';
import happyEar from '../assets/happy_ear.png';


export default function LessonScreen() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const LESSON_LENGTH = 3; // we will have more in the real app
  const progress = Math.min(Math.round((currentIndex / LESSON_LENGTH) * 100), 100);

  // 1. Get all relevant question-type exercises for now
  // 1.1. Get all question-type exercises for the current topic
  const topicExercises = exercisesData.exercises
    .filter((e) => e.topic.toLowerCase() === topicId?.toLowerCase() && e.type === 'question');

  // 1.2. Shuffle the array
  const shuffled = [...topicExercises].sort(() => Math.random() - 0.5);

  // 1.3. Ensure we have exactly LESSON_LENGTH entries
  let selectedExercises: typeof topicExercises = [];

  if (shuffled.length >= LESSON_LENGTH) {
    selectedExercises = shuffled.slice(0, LESSON_LENGTH);
  } else {
    // 1.4. Repeat random items until we reach length
    while (selectedExercises.length < LESSON_LENGTH) {
      const next = shuffled[Math.floor(Math.random() * shuffled.length)];
      selectedExercises.push(next);
    }
  }

  // 1.5. Get full question data
  const lessonExercises = selectedExercises
    .map((e) => questionsData.questions.find((q) => q.id === e.id))
    .filter(Boolean);


  const currentQuestion = lessonExercises[currentIndex];

  // 2. Advance after delay
  const goToNext = () => {
    setTimeout(() => {
      if (currentIndex < LESSON_LENGTH - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Trigger final screen (by advancing one last time)
        setCurrentIndex(LESSON_LENGTH);
      }
    }, 200);
  };

  //3. Get end of lesson picture
  const getHappyImageForTopic = (topicId: string) => {
    switch (topicId.toLowerCase()) {
      case 'heart':
        return happyHeart;
      case 'lungs':
        return happyLungs;
      case 'ear':
        return happyEar;
      default:
        return happyHeart; // fallback
    }
  };

  // 4. Handle end of lesson
  if (!currentQuestion) {
    return (
      <ScreenLayout>
        <div className="w-full max-w-[480px] mx-auto flex flex-col items-center space-y-6 pt-12 text-center">
          <img
            src={getHappyImageForTopic(topicId || '')}
            alt="Happy organ"
            className="w-2/3 h-auto object-contain"
          />
          <div className="text-2xl font-bold text-white">Lesson complete!</div>
          <PrimaryButton
            variant="cyan"
            active
            className="w-2/3 mx-auto px-8 py-3 flex flex-col items-center text-base font-semibold"
            onClick={() => {
              if (topicId) {
                localStorage.setItem('lastTopicId', topicId);
              }
              navigate('/');
            }}
          >
            Back to Menu
          </PrimaryButton>
        </div>
      </ScreenLayout>
    );
  }

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
          <Question
            key={currentIndex} // ✅ Forces a rerender for each exercise step
            question={currentQuestion.question_text}
            options={[
              currentQuestion.option_1,
              currentQuestion.option_2,
              currentQuestion.option_3,
              currentQuestion.option_4,
            ]}
            correctIndex={currentQuestion.correct_option - 1}
            onComplete={goToNext}
          />
        </ExerciseStage>
      </div>
    </ScreenLayout>
  );
}
