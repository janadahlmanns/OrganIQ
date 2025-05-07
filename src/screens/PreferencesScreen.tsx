import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { resetProgress } from '../store/lessonSlice';
import { setUiLanguage, setExerciseLanguage } from '../store/settingsSlice';
import { useTranslation } from 'react-i18next';

import UtilityButton from '../components/UtilityButton';
import Toast from '../components/Toast';

export default function PreferencesScreen() {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  const [toastVisible, setToastVisible] = useState(false);

  const uiLanguage = useAppSelector((state) => state.settings.uiLanguage);
  const exerciseLanguage = useAppSelector((state) => state.settings.exerciseLanguage);

  const handleResetProgress = () => {
    dispatch(resetProgress());
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  const handleUiLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as 'en' | 'de';
    dispatch(setUiLanguage(newLang));
    i18n.changeLanguage(newLang); // Update i18next language
  };

  const handleExerciseLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as 'en' | 'de';
    dispatch(setExerciseLanguage(newLang));
  };

  return (
    <div className="text-white text-3xl p-4 space-y-4">
      <Toast message={t('preferences.toastReset')} visible={toastVisible} />

      <h1>{t('preferences.title')}</h1>

      <div className="mt-8 flex flex-col items-center space-y-4">
        <UtilityButton onClick={handleResetProgress}>
          {t('preferences.reset')}
        </UtilityButton>

        <div className="text-base mt-8 space-y-4">
          <div className="flex flex-col">
            <label htmlFor="ui-language" className="mb-1">{t('preferences.uiLanguage')}</label>
            <select
              id="ui-language"
              className="text-black rounded px-2 py-1"
              value={uiLanguage}
              onChange={handleUiLanguageChange}
            >
              <option value="en">{t('language.english')}</option>
              <option value="de">{t('language.german')}</option>
            </select>
          </div>

          <div className="flex flex-col mt-4">
            <label htmlFor="exercise-language" className="mb-1">{t('preferences.exerciseLanguage')}</label>
            <select
              id="exercise-language"
              className="text-black rounded px-2 py-1"
              value={exerciseLanguage}
              onChange={handleExerciseLanguageChange}
            >
              <option value="en">{t('language.english')}</option>
              <option value="de">{t('language.german')}</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <Link to="/" className="text-cyan-400 underline">
            {t('preferences.back')}
          </Link>
        </div>

      </div>
    </div>
  );
}
