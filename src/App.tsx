// © 2025 Dr. Jana Katharina Dahlmanns. All Rights Reserved.
// This file is part of the OrganIQ project.
// No reuse, redistribution, or modification is permitted without explicit written permission.

import { Routes, Route } from 'react-router-dom';
import MainMenuScreen from './screens/MainMenuScreen';
import LessonScreen from './screens/LessonScreen';
import StatsScreen from './screens/StatsScreen';
import PreferencesScreen from './screens/PreferencesScreen';
import { useEffect } from 'react';
import { useAppSelector } from './store/hooks';

export default function App() {
  const exerciseLanguage = useAppSelector((state) => state.settings.exerciseLanguage);

  useEffect(() => {
    document.documentElement.lang = exerciseLanguage;
  }, [exerciseLanguage]);

  return (
    <Routes>
      <Route path="/" element={<MainMenuScreen />} />
      <Route path="/lesson/:topicId/:lessonId" element={<LessonScreen />} />
      <Route path="/stats" element={<StatsScreen />} />
      <Route path="/preferences" element={<PreferencesScreen />} />
    </Routes>
  );
}
