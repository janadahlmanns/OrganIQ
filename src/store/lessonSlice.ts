import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { topics, lessonIds } from '../data/topics'; // ✅ Import your topics and lessonIds

type LessonStatus = 'uncompleted' | 'completed' | 'perfect' | 'locked';

export interface LessonsState {
    lessons: Record<string, LessonStatus>;
    xp: number;
    crowns: number;
}

// 🔥 Helper to initialize all lessons
const initializeLessons = () => {
    const lessons: Record<string, LessonStatus> = {};

    topics.forEach((topic) => {
        lessonIds.forEach((lessonId) => {
            if (lessonId === '01' || lessonId === 'review') {
                lessons[`${topic.id}-${lessonId}`] = 'uncompleted'; // unlocked by default
            } else {
                lessons[`${topic.id}-${lessonId}`] = 'locked'; // all others locked
            }
        });
    });

    return lessons;
};

const initialState: LessonsState = {
    lessons: initializeLessons(),
    xp: 0,
    crowns: 0,
};

const lessonSlice = createSlice({
    name: 'lessons',
    initialState,
    reducers: {
        completeLesson: (state, action: PayloadAction<string>) => {
            const lessonId = action.payload;
            state.lessons[lessonId] = 'completed';
        },
        perfectLesson: (state, action: PayloadAction<string>) => {
            const lessonId = action.payload;
            state.lessons[lessonId] = 'perfect';
        },
        unlockLesson: (state, action: PayloadAction<string>) => {
            const lessonId = action.payload;
            state.lessons[lessonId] = 'uncompleted';
        },
        addXP: (state, action: PayloadAction<number>) => {
            state.xp += action.payload;
        },
        addCrown: (state) => {
            state.crowns += 1;
        },
        resetProgress: (state) => {
            state.lessons = initializeLessons(); // 🔥 Reset to initial locked state
            state.xp = 0;
            state.crowns = 0;
        },
    },
});

export const {
    completeLesson,
    perfectLesson,
    unlockLesson,
    addXP,
    addCrown,
    resetProgress,
} = lessonSlice.actions;

export default lessonSlice.reducer;
