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

    const hoverClasses = disabled
        ? ''
        : 'hover:bg-white/30 hover:shadow-glowWhite transition-all duration-DEFAULT ease-DEFAULT';

    return (
        <motion.div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                willChange: 'transform',
                opacity: isDragging ? 0.8 : 1,
            }}
            {...(disabled ? {} : attributes)}
            {...(disabled ? {} : listeners)}
            className={`w-full px-4 py-2 text-center font-bold text-white select-none rounded border ${isDragging
                    ? 'bg-white/30 shadow-glowWhite'
                    : `bg-white/10 ${hoverClasses}`
                }`}
        >
            {content}
        </motion.div>
    );
}
