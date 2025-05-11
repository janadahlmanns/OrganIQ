// © 2025 Dr. Jana Katharina Dahlmanns. All Rights Reserved.
// This file is part of the OrganIQ project.
// No reuse, redistribution, or modification is permitted without explicit written permission.

import { useState } from 'react';
import { useScreenSize } from '../hooks/useScreenSize';
import { useAppSelector } from '../store/hooks';
import { RootState } from '../store';
import { motion } from 'framer-motion';
import { revealRight } from '../config/motion';
import { useFirstVisit } from '../hooks/useFirstVisit';
import { useTranslation } from 'react-i18next';

import ScreenLayout from '../components/ScreenLayout';
import Toast from '../components/Toast';
import PrimaryButton from '../components/PrimaryButton';
import LessonButton from '../components/LessonButton';
import UtilityButton from '../components/UtilityButton';

import { topics, lessonIds } from '../data/topics';

export default function MainMenuScreen() {
  const { t, i18n } = useTranslation();

  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(() => {
    return localStorage.getItem('lastTopicId') || null;
  });
  const { isFirstVisit, markVisited } = useFirstVisit();
  const crowns = useAppSelector((state) => state.lessons.crowns);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const { isWide, isMedium, isNarrow } = useScreenSize();
  const lessons = useAppSelector((state: RootState) => state.lessons?.lessons || {});

  const calculateTopicProgress = (topicId: string) => {
    const completedLessons = lessonIds.filter((lessonId) => {
      const lessonKey = `${topicId}-${lessonId}`;
      const status = lessons[lessonKey];
      return status === 'completed' || status === 'perfect';
    });
    return completedLessons.length;
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  return (
    <ScreenLayout className="text-white space-y-8">
      <Toast message={toastMessage} visible={toastVisible} />
      <motion.div
        className="text-white text-center text-xl font-handwriting mb-6 drop-shadow-inner-glowWhite"
        initial={isFirstVisit ? revealRight.initial : false}
        animate={isFirstVisit ? revealRight.animate : false}
        transition={isFirstVisit ? revealRight.transition : undefined}
        onAnimationComplete={() => {
          if (isFirstVisit) markVisited();
        }}
        style={{ willChange: 'clip-path' }}
      >
        <span className="inline-flex items-center gap-2 flex-wrap justify-center">
          {t('main.youHave')} {crowns}
          <img
            src="/images/icons/crown_icon.png"
            alt="Crown"
            className="w-6 h-6 inline-block drop-shadow-inner-glowPink"
          />
          {t('main.getMore')}
        </span>
      </motion.div>
      <h1 className="text-heading-xl font-bold uppercase text-center section">{t('main.topics')}</h1>

      {topics.map((topic, index) => {
        const renderLessonButton = (lessonId: string) => {
          const lessonKey = `${topic.id}-${lessonId}`;
          const status = lessons[lessonKey] || 'uncompleted';

          // Determine props for LessonButton
          const state = status === 'perfect' || status === 'completed'
            ? 'active'
            : status === 'locked'
              ? 'inactive'
              : undefined;

          const to = state !== 'inactive' ? `/lesson/${topic.id}/${lessonId}` : undefined;
          const onClick = state === 'inactive'
            ? () => showToast(t('main.toastLockedLesson'))
            : undefined;

          const content =
            lessonId === 'review'
              ? { icon: "/images/icons/review_icon.png", alt: 'review', fallback: 'R' }
              : status === 'perfect'
                ? { icon: "/images/icons/crown_icon.png", alt: 'perfect', fallback: lessonId.padStart(2, '0') }
                : status === 'locked'
                  ? { icon: "/images/icons/lock_icon.png", alt: 'locked', fallback: lessonId.padStart(2, '0') }
                  : { fallback: lessonId.padStart(2, '0') };

          return (
              <LessonButton
                className='relative flex justify-center border border-red items-center'
                to={to}
                onClick={onClick}
                state={state}
                content={content}
                key={lessonKey}
              />
          );
        };

        return (
          <div key={topic.id} className="space-y-2 px-6">
            {/* Topic button */}
            <div className="relative z-10">
              <PrimaryButton
                onClick={() =>
                  setExpandedTopicId(expandedTopicId === topic.id ? null : topic.id)
                }
                variant={['pink', 'purple', 'cyan'][index % 3] as 'pink' | 'purple' | 'cyan'}
                className="w-full"
                active={expandedTopicId === topic.id}
              >
                <span>{typeof topic.name === 'string' ? topic.name : topic.name[i18n.language as 'en' | 'de']}</span>
                <span className="text-sm text-white">
                  {calculateTopicProgress(topic.id) === 9 ? (
                    <img src="/images/icons/checkmark_icon.png" alt="completed" className="w-5 h-5 inline" />
                  ) : (
                    `${calculateTopicProgress(topic.id)}/9`
                  )}
                </span>
              </PrimaryButton>
            </div>

            {/* Lesson grid */}
            {expandedTopicId === topic.id && (
              <div className="relative z-0 mt-4">
                {/* Button rows will go here */}
                {isWide && (
                  <div className="relative w-full">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[98%] h-[2px] bg-white z-[-1]" />
                    <div className="w-full relative flex justify-between gap-y-2">
                      {lessonIds.map((lessonId) => (
                        <div key={lessonId} className="relative flex justify-center items-center w-12 h-12">
                          {(lessonId === '01' || lessonId === 'review') && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[2px] h-full bg-white z-[-1]" />
                          )}
                          {renderLessonButton(lessonId)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isMedium && (
                  <div className="w-full space-y-2">
                    <div className="relative w-full">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[98%] h-[2px] bg-white z-[-1]" />
                      <div className="w-full flex justify-between gap-y-2">
                        {lessonIds.slice(0, 5).map((lessonId) => (
                          <div className="relative flex justify-center items-center w-12 h-12" key={lessonId}>
                            {(lessonId === '01' || lessonId === '05') && (
                              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[2px] h-full bg-white z-[-1]" />
                            )}
                            {renderLessonButton(lessonId)}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="relative w-full">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[98%] h-[2px] bg-white z-[-1]" />
                      <div className="w-full flex justify-between gap-y-2">
                        {lessonIds.slice(5, 10).map((lessonId) => (
                          <div className="relative flex justify-center items-center w-12 h-12" key={lessonId}>
                            {(lessonId === '06' || lessonId === 'review') && (
                              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[2px] h-full bg-white z-[-1]" />
                            )}
                            {renderLessonButton(lessonId)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {isNarrow && (
                  <div className="w-full space-y-2">
                    {[0, 2, 4, 6, 8].map((startIndex) => (
                      <div className="relative w-full" key={startIndex}>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[98%] h-[2px] bg-white z-[-1]" />
                        <div className="w-full flex justify-between gap-y-2">
                          {lessonIds.slice(startIndex, startIndex + 2).map((lessonId) => (
                            <div
                              key={lessonId}
                              className="relative flex justify-center items-center w-12 h-12"
                            >
                              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[2px] h-full bg-white z-[-1]" />
                              {renderLessonButton(lessonId)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div className="mt-8 flex justify-center space-x-8">
        <UtilityButton to="/stats">{t('main.stats')}</UtilityButton>
        <UtilityButton to="/preferences">{t('main.preferences')}</UtilityButton>
      </div>
    </ScreenLayout>
  );
}
