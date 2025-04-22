import { Routes, Route } from 'react-router-dom';
import MainMenuScreen from './screens/MainMenuScreen';
import LessonScreen from './screens/LessonScreen';
import SuccessScreen from './screens/SuccessScreen';
import StatsScreen from './screens/StatsScreen';
import PreferencesScreen from './screens/PreferencesScreen';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainMenuScreen />} />
      <Route path="/lesson/:topicId/:lessonId" element={<LessonScreen />} />
      <Route path="/success" element={<SuccessScreen />} />
      <Route path="/stats" element={<StatsScreen />} />
      <Route path="/preferences" element={<PreferencesScreen />} />
    </Routes>
  );
}

export default App;
