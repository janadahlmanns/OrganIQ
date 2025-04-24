import { useState } from 'react';
import { useScreenSize } from '../hooks/useScreenSize';
import { topics, lessonIds } from '../data/topics';
import lessonStates from '../data/lessonStates';
import ScreenLayout from '../components/ScreenLayout';
import Toast from '../components/Toast';
import PrimaryButton from '../components/PrimaryButton';
import LessonButton from '../components/LessonButton';
import UtilityButton from '../components/UtilityButton';
import crownIcon from '../assets/crown_icon.png';
import lockIcon from '../assets/lock_icon.png';
import checkmarkIcon from '../assets/checkmark_icon.png';

export default function MainMenuScreen() {
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(() => {
    return localStorage.getItem('lastTopicId') || null;
  });

  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const { isWide, isMedium, isNarrow } = useScreenSize();

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  return (
    <ScreenLayout className="text-white space-y-8">
      <Toast message={toastMessage} visible={toastVisible} />
      <h1 className="text-heading-xl font-bold uppercase text-center section">Topics</h1>

      {topics.map((topic, index) => {
        // ✅ This helper must be inside so we can use topic.id
        const renderLessonButton = (lessonId: string) => {
          const lessonKey = `${topic.id}-${lessonId}`;
          const status = lessonStates[lessonKey] || 'uncompleted';

          // Determine props for LessonButton
          const state = status === 'perfect' || status === 'completed'
            ? 'active'
            : status === 'locked'
              ? 'inactive'
              : undefined;

          const to = state !== 'inactive' ? `/lesson/${topic.id}/${lessonId}` : undefined;
          const onClick = state === 'inactive'
            ? () => showToast('Lesson locked. Complete previous lessons first.')
            : undefined;

          const content = status === 'perfect'
            ? { icon: crownIcon, alt: 'perfect' }
            : status === 'locked'
              ? { icon: lockIcon, alt: 'locked' }
              : lessonId === 'review'
                ? 'R'
                : lessonId.padStart(2, '0');

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
                <span>{topic.name}</span>
                <span className="text-sm text-white">
                  {topic.progress === 10 ? (
                    <img src={checkmarkIcon} alt="completed" className="w-5 h-5 inline" />
                  ) : (
                    `${topic.progress}/10`
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
        <UtilityButton to="/stats">Stats</UtilityButton>
        <UtilityButton to="/preferences">Preferences</UtilityButton>
      </div>
    </ScreenLayout>
  );
}
