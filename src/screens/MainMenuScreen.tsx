import { useState } from 'react';
import { Link } from 'react-router-dom';
import { topics, lessonIds } from '../data/topics';
import lessonStates from '../data/lessonStates';
import Toast from '../components/Toast';

export default function MainMenuScreen() {
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  const glowClasses = [
    'border-neonPink hover:shadow-[0_0_20px_#FF007F]',
    'border-glowPurple hover:shadow-[0_0_20px_#8A2BE2]',
    'border-neonCyan hover:shadow-[0_0_20px_#00FFFF]',
  ];

  return (
    <div className="screen text-white space-y-8">
      <Toast message={toastMessage} visible={toastVisible} />
      <h1 className="text-3xl font-bold uppercase text-center section">Topics</h1>

      {topics.map((topic, index) => (
        <div key={topic.id} className="space-y-2">
          <div className="relative z-10">
            {/* topic button */}
            <button
              onClick={() => setExpandedTopicId(expandedTopicId === topic.id ? null : topic.id)}
              className={`btn-topic ${glowClasses[index % glowClasses.length]}`}
            >
              <span>{topic.name}</span>
              <span className="text-sm text-white">
                {topic.progress === 10 ? (
                  <img
                    src="/src/assets/checkmark_icon.png"
                    alt="completed"
                    className="w-5 h-5 inline"
                  />
                ) : (
                  `${topic.progress}/10`
                )}
              </span>

            </button>
          </div>

          {expandedTopicId === topic.id && (
            <div className="relative z-0">
              {/* Horizontal line BEHIND everything */}
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white z-[-1]" />

              <div className="flex justify-between relative z-10 w-full">
                {lessonIds.map((lessonId) => {
                  const lessonKey = `${topic.id}-${lessonId}`;
                  const state = lessonStates[lessonKey] || 'uncompleted';

                  const isIcon = state === 'perfect' || state === 'locked';
                  const iconSrc = state === 'perfect'
                    ? '/src/assets/crown_icon.png'
                    : state === 'locked'
                      ? '/src/assets/lock_icon.png'
                      : null;

                  const borderClass =
                    state === 'locked'
                      ? 'border-white/30'
                      : state === 'perfect' || state === 'completed'
                        ? 'border-white shadow-[0_0_20px_white]'
                        : 'border-white';

                  const showTopLine =
                    lessonId === '01' || lessonId === 'review';

                  return (
                    <div className="relative" key={lessonKey}>
                      {showTopLine && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[2px] h-4 bg-white z-[-1]" />
                      )}
                      {state === 'locked' ? (
                        <button
                          onClick={() => showToast('Lesson locked. Complete previous lessons first.')}
                          className={`btn-lesson ${borderClass} cursor-not-allowed`}
                          aria-disabled="true"
                        >
                          <img src={iconSrc!} alt="locked" className="w-5 h-5" />
                        </button>
                      ) : (
                        <Link
                          to={`/lesson/${topic.id}/${lessonId}`}
                          className={`btn-lesson ${borderClass}`}
                        >
                          {isIcon ? (
                            <img src={iconSrc!} alt={state} className="w-5 h-5" />
                          ) : (
                            lessonId === 'review' ? 'R' : lessonId.padStart(2, '0')
                          )}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      ))}

      <div className="mt-8 flex justify-center space-x-8">
        <Link to="/stats" className="btn-utility">Stats</Link>
        <Link to="/preferences" className="btn-utility">Preferences</Link>
      </div>

    </div>
  );
}
