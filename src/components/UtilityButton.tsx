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
    const sharedClassName = `px-6 py-2 text-white text-sm uppercase transition text-center inline-block hover:[text-shadow:_0_0_8px_currentColor] ${className}`;

    if (to) {
        return (
            <Link to={to} className={sharedClassName}>
                {children}
            </Link>
        );
    }

    return (
        <button type={type} onClick={onClick} className={sharedClassName}>
            {children}
        </button>
    );
}
