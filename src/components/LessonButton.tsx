import React from 'react';
import { Link } from 'react-router-dom';

type LessonButtonProps = {
    to?: string;
    onClick?: () => void;
    disabled?: boolean;
    children?: React.ReactNode;
    className?: string;
    icon?: string;
    alt?: string;
};

export default function LessonButton({
    to,
    onClick,
    disabled = false,
    children,
    className = '',
    icon,
    alt = '',
}: LessonButtonProps) {
    const baseStyle = `flex items-center justify-center bg-darkPurple text-white font-bold rounded border-2 transition w-[3rem] h-[3rem] p-1 overflow-hidden ${disabled
        ? 'cursor-not-allowed'
        : 'hover:brightness-125 hover:shadow-[0_0_18px_white]'
        } ${className}`;
    if (to) {
        return (
            <Link to={to} className={baseStyle} aria-disabled={disabled}>
                {icon ? (
                    <img src={icon} alt={alt} className="w-full h-full object-contain" />
                ) : (
                    children
                )}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={baseStyle} disabled={disabled} aria-disabled={disabled}>
            {icon ? (
                <img src={icon} alt={alt} className="w-full h-full object-contain" />
            ) : (
                children
            )}
        </button>
    );
}
