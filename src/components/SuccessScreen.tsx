import { useNavigate } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PrimaryButton from './PrimaryButton';
import confetti from 'canvas-confetti';
import { confettiColorsNormal, confettiColorsGolden } from '../config/motion'
import { motion } from 'framer-motion';


type SuccessScreenProps = {
    topicId: string;
    lessonLength: number;
    incorrectIds: number[];
};

export default function SuccessScreen({ topicId, lessonLength, incorrectIds }: SuccessScreenProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!imgRef.current) return;

            const rect = imgRef.current.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;

            const myConfetti = confetti.create(undefined, { resize: true });

            myConfetti({
                particleCount: 150,
                spread: 360,
                startVelocity: 45,
                origin: { x, y },
                colors: crownEarned ? confettiColorsGolden : confettiColorsNormal,
            });
        }, 714);

        return () => {
            clearTimeout(timeout);
            const confettiCanvas = document.querySelector('canvas');
            if (confettiCanvas) {
                confettiCanvas.remove();
            }
        };
    }, []);

    const getHappyImage = (topicId: string) => {
        switch (topicId.toLowerCase()) {
            case 'heart':
                return "/images/characters/happy_heart.png";
            case 'lungs':
                return "/images/characters/happy_lungs.png";
            case 'ear':
                return "/images/characters/happy_ear.png";
            default:
                return "/images/characters/happy_heart.png";
        }
    };

    const xpGainedText = '+30 XP';
    const crownEarned = incorrectIds.length === 0;

    return (
        <div className="w-full max-w-[480px] mx-auto flex flex-col items-center space-y-6 pt-12 text-center">
            <motion.img
                ref={imgRef} // anchor for confetti
                src={getHappyImage(topicId)}
                alt="Happy organ"
                className="w-full max-w-[240px] h-auto object-contain"
                initial={{ scale: 0 }}
                animate={{
                    scale: [0, 1, 1.1, 1],
                }}
                transition={{
                    duration: 1,
                    times: [0, 0.714, 0.857, 1],
                    ease: 'easeOut',
                }}
            />
            <div className="text-2xl font-bold text-white">{t('success.title')}</div>
            {crownEarned ? (
                <div className="flex flex-col items-center justify-center space-y-1">
                    <div className="text-xl font-bold text-white">{t('success.perfectScore')}</div>
                    <div className="flex items-center justify-center space-x-3">
                        <motion.img
                            src="/images/icons/crown_icon.png"
                            alt="Crown"
                            className="w-8 h-8 drop-shadow-inner-glowPink"
                            style={{transformStyle: 'preserve-3d' }}
                            animate={{ rotateY: 360 }}
                            transition={{
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "linear",
                                duration: 4,
                            }}
                        />
                        <div className="text-2xl font-bold text-neonPink drop-shadow-inner-glowPink">{t('success.crownEarned')}</div>
                    </div>
                </div>
            ) : (
                    <div className="text-xl font-bold text-white">
                        {t('success.correctCount', { correct: lessonLength - incorrectIds.length, total: lessonLength })}
                    </div>
            )}

            <div className="text-xl text-cyan-300 font-semibold">{xpGainedText}</div>

            <PrimaryButton
                variant="cyan"
                active
                className="w-2/3 mx-auto px-8 py-3 flex flex-col items-center text-base font-semibold"
                onClick={() => {
                    localStorage.setItem('lastTopicId', topicId);
                    navigate('/');
                }}
            >
                {t('success.backToMenu')}
            </PrimaryButton>
        </div>
    );
}
