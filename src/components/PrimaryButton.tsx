import React from 'react';

type PrimaryButtonProps = {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    variant?: 'pink' | 'purple' | 'cyan';
};

const variantClasses = {
    pink: 'border-neonPink hover:shadow-[0_0_20px_#FF007F]',
    purple: 'border-glowPurple hover:shadow-[0_0_20px_#8A2BE2]',
    cyan: 'border-neonCyan hover:shadow-[0_0_20px_#00FFFF]',
};

export default function PrimaryButton({
    children,
    className = '',
    onClick,
    disabled = false,
    variant = 'pink',
}: PrimaryButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`btn-topic ${variantClasses[variant]} ${className}`}
        >
            {children}
        </button>
    );
}
