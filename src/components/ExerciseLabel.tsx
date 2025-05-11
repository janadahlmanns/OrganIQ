// © 2025 Dr. Jana Katharina Dahlmanns. All Rights Reserved.
// This file is part of the OrganIQ project.
// No reuse, redistribution, or modification is permitted without explicit written permission.

import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type ExerciseLabelProps = {
    id: string;
    content?: string;
    image?: string;
    variant?: 'native' | 'correct' | 'incorrect';
    disabled?: boolean;
};

export default function ExerciseLabel({
    id,
    content,
    image,
    variant = 'native',
    disabled = false,
}: ExerciseLabelProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const borderColor = {
        native: 'border-white',
        correct: 'border-neonCyan',
        incorrect: 'border-neonPink',
    }[variant];

    const hoverClasses = disabled
        ? ''
        : 'hover:bg-white/30 hover:shadow-glowWhite transition-all duration-DEFAULT ease-DEFAULT';

    const draggingClasses = isDragging
        ? 'bg-white/30 shadow-glowWhite'
        : `bg-white/10 ${hoverClasses}`;

    return (
        <motion.div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                willChange: 'transform',
                opacity: isDragging ? 0.8 : 1,
                touchAction: 'none',
            }}
            {...(disabled ? {} : attributes)}
            {...(disabled ? {} : listeners)}
            className={`select-none rounded border-2 ${borderColor} ${draggingClasses} ${
                image ? 'inline-block' : 'w-full px-4 py-2 text-center font-bold text-white'
              }`}
        >
            {image ? (
                <img
                    src={image}
                    alt=""
                    className="w-full h-auto rounded object-contain max-h-[120px]"
                    draggable={false}
                />
            ) : (
                content
            )}
        </motion.div>
    );
}
