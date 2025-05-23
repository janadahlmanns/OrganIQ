// © 2025 Dr. Jana Katharina Dahlmanns. All Rights Reserved.
// This file is part of the OrganIQ project.
// No reuse, redistribution, or modification is permitted without explicit written permission.

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/translation.json';
import de from './locales/de/translation.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            de: { translation: de },
        },
        lng: 'en', // default, will be overridden by Redux later
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // react already escapes
        },
    });

export default i18n;
