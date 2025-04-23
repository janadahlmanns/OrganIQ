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
    pink: 'shadow-[0_0_20px_#FF007F]',
    purple: 'shadow-[0_0_20px_#8A2BE2]',
    cyan: 'shadow-[0_0_20px_#00FFFF]',
    white: 'shadow-[0_0_20px_white]',
};

const hoverGlow = {
    pink: 'enabled:hover:shadow-[0_0_20px_#FF007F]',
    purple: 'enabled:hover:shadow-[0_0_20px_#8A2BE2]',
    cyan: 'enabled:hover:shadow-[0_0_20px_#00FFFF]',
    white: 'enabled:hover:shadow-[0_0_20px_white]',
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
        'w-full flex justify-between items-center px-6 py-3 rounded font-semibold text-white transition bg-darkPurple border-2 duration-200 ease-in-out';

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
