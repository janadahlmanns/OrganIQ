import { Link } from 'react-router-dom';

export default function SuccessScreen() {
  return (
    <div className="text-white text-3xl p-4 space-y-4">
      🏆 Success Screen 

      <div className="mt-4">
        <Link to="/" className="text-pink-400 underline">Back to Main Menu</Link>
      </div>
    </div>
  );
}
