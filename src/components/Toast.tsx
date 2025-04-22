import React from 'react';

type ToastProps = {
  message: string;
  visible: boolean;
};

export default function Toast({ message, visible }: ToastProps) {
  return (
    <div
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl border border-white text-darkPurple bg-white/90 text-sm font-semibold shadow-lg transition-all duration-300 ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}
      style={{ zIndex: 1000 }}
    >
      {message}
    </div>
  );
}
