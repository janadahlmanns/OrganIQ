import { useParams, Link } from 'react-router-dom';

export default function LessonScreen() {
  const { topicId, lessonId } = useParams();

  return (
    <div className="text-white text-2xl p-4 space-y-4">
      📘 Lesson Screen

      <div>
        <p>Topic: <span className="text-cyan-400">{topicId}</span></p>
        <p>Lesson: <span className="text-cyan-400">{lessonId}</span></p>
      </div>

      <div className="mt-4">
        <Link to="/" className="text-pink-400 underline">Back to Main Menu</Link>
      </div>
    </div>
  );
}
