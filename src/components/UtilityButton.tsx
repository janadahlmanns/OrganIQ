import React from 'react';
import { Link } from 'react-router-dom';

type UtilityButtonProps = {
    children: React.ReactNode;
    className?: string;
    to?: string;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
};

export default function UtilityButton({
    children,
    className = '',
    to,
    onClick,
    type = 'button',
}: UtilityButtonProps) {
    const sharedClassName =
        `px-6 py-2 text-white text-sm uppercase transition text-center inline-block ${className}`;

    const glowOnHover = {
        onMouseEnter: (e: React.MouseEvent) =>
            (e.currentTarget as HTMLElement).style.textShadow = '0 0 8px currentColor',
        onMouseLeave: (e: React.MouseEvent) =>
            (e.currentTarget as HTMLElement).style.textShadow = 'none',
    };

    if (to) {
        return (
            <Link to={to} className={sharedClassName} {...glowOnHover}>
                {children}
            </Link>
        );
    }

    return (
        <button
            type={type}
            onClick={onClick}
            className={sharedClassName}
            {...glowOnHover}
        >
            {children}
        </button>
    );
}
