// © 2025 Dr. Jana Katharina Dahlmanns. All Rights Reserved.
// This file is part of the OrganIQ project.
// No reuse, redistribution, or modification is permitted without explicit written permission.

export const fadeSlideIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" },
};

export const confettiColorsNormal = ['#FF007F', '#8A2BE2', '#00FFFF', '#FFFFFF'];

export const confettiColorsGolden = ['#FF007F', '#8A2BE2', '#00FFFF', '#FFFFFF', '#cbad09'];

export const revealRight = {
    initial: { clipPath: 'inset(0 100% 0 0)' }, // Hide from right
    animate: { clipPath: 'inset(0 0% 0 0)' },    // Reveal fully
    transition: { duration: 1.2, ease: 'easeOut' },
};
