
import { Link } from 'react-router-dom';

type LessonButtonProps = {
    to?: string;
    onClick?: () => void;
    state?: 'active' | 'inactive' | undefined;
    content: string | { icon: string; alt: string };
    className?: string;
};

export default function LessonButton({
    to,
    onClick,
    state,
    content,
    className = '',
}: LessonButtonProps) {
const isActive = state === 'active';
const isInactive = state === 'inactive';
const isDefault = state === undefined;

    const baseClasses =
        'flex items-center justify-center w-[3rem] h-[3rem] p-1 rounded border text-white bg-darkPurple font-bold transition overflow-hidden';
    const staticGlow = isActive ? 'shadow-glowWhite' : '';
    const hoverGlow = isDefault ? 'hover:shadow-glowWhite hover:brightness-125' : '';
    const clickability = isInactive ? 'cursor-not-allowed' : '';

    const combinedClassName = [
        baseClasses,
        staticGlow,
        hoverGlow,
        clickability,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    const inner =
        typeof content === 'string' ? (
            <span className="text-sm leading-none w-full text-center">{content}</span>
        ) : (
            <img src={content.icon} alt={content.alt} className="w-full h-full object-contain" />
        );

    if (!isInactive && to) {
        return (
            <Link to={to} className={combinedClassName}>
                {inner}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={combinedClassName}>
            {inner}
        </button>
    );
}
