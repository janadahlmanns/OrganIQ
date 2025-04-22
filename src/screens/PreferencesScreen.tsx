import { Link } from 'react-router-dom';

export default function PreferencesScreen() {
  return (
    <div className="text-white text-3xl p-4 space-y-4">
      ⚙️ Preferences Screen

      <div className="mt-4">
        <Link to="/" className="text-cyan-400 underline">Back to Main Menu</Link>
      </div>
    </div>
  );
}
