import { useParams } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';
import PrimaryButton from './PrimaryButton';
import memoryBackside from '../assets/images/exercises/memory_backside.png';

const exerciseImages = import.meta.glob('/src/assets/images/exercises/**/*.{png,jpg,jpeg}', { eager: true, import: 'default' }) as Record<string, string>;

type MemoryButtonProps = {
    side?: 'front' | 'back';
    frontType: 'text' | 'image';
    frontValue: string;
    onClick: () => void;
    disabled?: boolean;
    interactive?: boolean;
    solved?: boolean;
};

export default function MemoryButton({
    side = 'back',
    frontType,
    frontValue,
    onClick,
    disabled,
    interactive,
    solved,
}: MemoryButtonProps) {
    const { topicId } = useParams();
    const resolvedSrc = topicId
        ? exerciseImages[`/src/assets/images/exercises/${topicId}/${frontValue}`]
        : undefined;

    const controls = useAnimation();
    const [showFront, setShowFront] = useState(side === 'front');

    useEffect(() => {
        const animateSequence = async () => {
            // 1. Flip halfway (90 degrees)
            await controls.start({
                rotateY: 90,
                transition: { duration: 0.3, ease: 'easeInOut' },
            });

            // Swap content
            setShowFront(side === 'front');

            // 2. Complete flip to 0 degrees
            await controls.start({
                rotateY: 0,
                transition: { duration: 0.3, ease: 'easeInOut' },
            });

            // 3. Only if solved, do pop
            if (solved) {
                await controls.start({
                    scale: [1, 0.9, 1.1, 1],
                    transition: { duration: 0.5, ease: 'easeInOut' },
                });
            }
            // 4. Glow will handle its own delay (inside its motion.div)
        };

        animateSequence();
    }, [side, solved, controls]);

    const content = showFront
        ? frontType === 'image'
            ? <img src={resolvedSrc || ''} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center p-2">
                <span className="text-center text-white font-bold text-sm md:text-base lg:text-lg leading-tight break-words">
                    {frontValue}
                </span>
            </div>
        : <img src={memoryBackside} alt="Memory Card Backside" className="w-full h-full object-cover" />;

    return (
        <motion.div
            animate={controls}
            initial={{ rotateY: 0 }}
            className="aspect-square w-full h-auto"
            style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
        >
            <div className="relative w-full h-full">
                <PrimaryButton
                    onClick={onClick}
                    className="w-full h-full !p-0 overflow-hidden !opacity-100"
                    variant="pink"
                    interactive={interactive}
                    disabled={disabled}
                >
                    {content}
                </PrimaryButton>

                {/* Glow pulse effect when solved */}
                {solved && (
                    <motion.div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        initial={{
                            scale: 1,
                            opacity: 0.6,
                            boxShadow: '0 0 12px rgba(255, 0, 255, 0.6)',
                        }}
                        animate={{
                            scale: 2.5,
                            opacity: 0,
                            boxShadow: '0 0 24px rgba(255, 0, 255, 0)',
                        }}
                        transition={{
                            duration: 0.6,
                            delay: 1.1, // Glow starts AFTER pop finishes
                            ease: 'easeOut',
                        }}
                    />
                )}
            </div>
        </motion.div>
    );
}
