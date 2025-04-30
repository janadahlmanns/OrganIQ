import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { resetProgress } from '../store/lessonSlice';
import UtilityButton from '../components/UtilityButton';
import Toast from '../components/Toast';


export default function PreferencesScreen() {
  const dispatch = useAppDispatch();
  const [toastVisible, setToastVisible] = useState(false);

  const handleResetProgress = () => {
    dispatch(resetProgress());
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  return (
    <div className="text-white text-3xl p-4 space-y-4">
      <Toast message="Progress reset!" visible={toastVisible} />

      ⚙️ Preferences Screen

      <div className="mt-4">
        <Link to="/" className="text-cyan-400 underline">Back to Main Menu</Link>
      </div>

      <div className="mt-8 flex flex-col items-center space-y-4">
        <UtilityButton onClick={handleResetProgress}>
          Reset Progress
        </UtilityButton>
      </div>
    </div>
  );
}
