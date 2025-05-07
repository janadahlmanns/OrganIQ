// store/settingsSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SupportedLanguage = 'en' | 'de';

export interface SettingsState {
    uiLanguage: SupportedLanguage;
    exerciseLanguage: SupportedLanguage;
}

const initialState: SettingsState = {
    uiLanguage: 'en',
    exerciseLanguage: 'en',
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setUiLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
            state.uiLanguage = action.payload;
        },
        setExerciseLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
            state.exerciseLanguage = action.payload;
        },
    },
});

export const { setUiLanguage, setExerciseLanguage } = settingsSlice.actions;

export default settingsSlice.reducer;
