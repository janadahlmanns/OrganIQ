import React from 'react';

type PrimaryButtonProps = {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    interactive?: boolean;
    variant?: 'pink' | 'purple' | 'cyan' | 'white';
    active?: boolean;
};

const variantBorders = {
    pink: 'border-neonPink',
    purple: 'border-glowPurple',
    cyan: 'border-neonCyan',
    white: 'border-white',
};

const staticGlow = {
    pink: 'shadow-glow',
    purple: 'shadow-glowPurple',
    cyan: 'shadow-glowCyan',
    white: 'shadow-glowWhite',
};

const hoverGlow = {
    pink: 'enabled:hover:shadow-glow',
    purple: 'enabled:hover:shadow-glowPurple',
    cyan: 'enabled:hover:shadow-glowCyan',
    white: 'enabled:hover:shadow-glowWhite',
};

export default function PrimaryButton({
    children,
    className = '',
    onClick,
    disabled = false,
    interactive = true,
    variant = 'pink',
    active = false,
}: PrimaryButtonProps) {
    const baseClasses =
        'flex justify-between items-center px-6 py-3 rounded font-semibold text-white bg-darkPurple border-2';

    const borderClass = variantBorders[variant];
    const hoverClass = interactive && !disabled ? hoverGlow[variant] : '';
    const activeClass = active ? staticGlow[variant] : '';
    const disabledClass = disabled ? 'cursor-not-allowed opacity-50' : '';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${borderClass} ${hoverClass} ${activeClass} ${disabledClass} ${className}`}
        >
            {children}
        </button>
    );
}
