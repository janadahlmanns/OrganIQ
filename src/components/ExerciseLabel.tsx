// /src/components/ExerciseLabel.tsx

import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type ExerciseLabelProps = {
    id: string;
    content: string;
    variant?: 'native' | 'correct' | 'incorrect';
    disabled?: boolean;
};

export default function ExerciseLabel({ id, content, variant = 'native', disabled = false }: ExerciseLabelProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    // Border color logic based on variant
    const borderColor = {
        native: 'border-white',
        correct: 'border-neonCyan',
        incorrect: 'border-neonPink',
    }[variant];

    // Hover classes (only if enabled)
    const hoverClasses = disabled
        ? ''
        : 'hover:bg-white/30 hover:shadow-glowWhite transition-all duration-DEFAULT ease-DEFAULT';

    // Dragging classes
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
                touchAction: 'none', // 🚨 Add this line
            }}
            {...(disabled ? {} : attributes)}
            {...(disabled ? {} : listeners)}
            className={`w-full px-4 py-2 text-center font-bold text-white select-none rounded border-2 ${borderColor} ${draggingClasses}`}
        >
            {content}
        </motion.div>
    );
}
