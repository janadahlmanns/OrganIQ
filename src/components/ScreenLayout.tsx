import React from 'react';

type ScreenLayoutProps = {
    children: React.ReactNode;
    className?: string;
};

export default function ScreenLayout({ children, className = '' }: ScreenLayoutProps) {
    return (
        <div className={`min-h-screen px-4 py-6 sm:px-8 md:px-16 max-w-screen-xl mx-auto ${className}`}>
            {children}
        </div>
    );
}
