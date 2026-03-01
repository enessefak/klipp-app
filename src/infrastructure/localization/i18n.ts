import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

import { de } from './locales/de';
import { en } from './locales/en';
import { tr } from './locales/tr';

const i18n = new I18n({
    en,
    tr,
    de,
});

// Set the locale once at the beginning of your app.
const deviceLanguage = getLocales()[0]?.languageCode ?? 'en';
i18n.locale = deviceLanguage;

// When a value is missing from a language it'll fallback to another language with the key present.
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;
