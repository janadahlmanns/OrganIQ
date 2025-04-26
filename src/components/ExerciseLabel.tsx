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

    return (
        <motion.div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                willChange: 'transform',
                opacity: isDragging ? 0.8 : 1,
            }}
            {...attributes}
            {...listeners}
            className="w-full px-4 py-2 text-center font-bold text-white select-none rounded border-2 shadow-md"
        >
            {content}
        </motion.div>
    );
}
