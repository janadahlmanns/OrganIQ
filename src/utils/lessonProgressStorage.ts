// © 2025 Dr. Jana Katharina Dahlmanns. All Rights Reserved.
// This file is part of the OrganIQ project.
// No reuse, redistribution, or modification is permitted without explicit written permission.

const STORAGE_KEY = 'organIQ:lessonProgress';

export type LessonProgress = {
    lessonExercises: number[];
    currentIndex: number;
};

export const loadLessonProgress = (): LessonProgress | null => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.warn('Failed to load lesson progress. Ignoring corrupted data.');
        return null;
    }
};

export const saveLessonProgress = (progress: LessonProgress) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
        console.error('Failed to save lesson progress.', error);
    }
};

export const clearLessonProgress = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear lesson progress.', error);
    }
};
