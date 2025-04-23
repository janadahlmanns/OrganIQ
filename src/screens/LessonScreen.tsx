import { useParams } from 'react-router-dom';
import { useState } from 'react';
import ProgressBar from '../components/ProgressBar';
import CancelButton from '../components/CancelButton';
import ExerciseStage from '../components/ExerciseStage';
import Question from '../components/Question';

{/* Dynamically retireve exercise data */ }
import exercisesData from '../data/exercises.json';
import questionsData from '../data/exercises_questions.json';

const getQuestionById = (id: number) => {
  const exercise = exercisesData.exercises.find((e) => e.id === id && e.type === 'question');
  const questionDetail = questionsData.questions.find((q) => q.id === id);

  if (!exercise || !questionDetail) return null;

  return {
    question: questionDetail.question_text,
    options: [
      questionDetail.option_1,
      questionDetail.option_2,
      questionDetail.option_3,
      questionDetail.option_4,
    ],
    correctIndex: questionDetail.correct_option - 1, // adjust from 1-based to 0-based
  };
};


export default function LessonScreen() {
  {/*const { topicId, lessonId } = useParams(); */ }
  const [progress] = useState(10); // temp value for testing
  const currentQuestion = getQuestionById(1);

  return (
    <div className="screen text-white flex flex-col space-y-4 items-center">
      <div className="w-full max-w-[480px] px-4 pt-4 flex flex-col flex-1">
        {/* Top bar with progress + cancel */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <ProgressBar value={progress} />
          </div>
          <CancelButton className="ml-4" />
        </div>

        {/* Main content area */}
        <ExerciseStage>
          {currentQuestion && (
            <Question
              question={currentQuestion.question}
              options={currentQuestion.options}
              correctIndex={currentQuestion.correctIndex}
            />
          )}
        </ExerciseStage>
      </div>
    </div>
  );
}
