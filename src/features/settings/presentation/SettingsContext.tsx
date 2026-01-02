import i18n from '@/src/infrastructure/localization/i18n';
import { DarkColors, LightColors, ThemeColors } from '@/src/infrastructure/theme/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';

type Language = 'tr' | 'en';
type Theme = 'system' | 'light' | 'dark';

interface SettingsContextType {
    language: Language;
    theme: Theme;
    colors: ThemeColors;
    setLanguage: (lang: Language) => Promise<void>;
    setTheme: (theme: Theme) => Promise<void>;
    isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('tr');
    const [theme, setThemeState] = useState<Theme>('system');
    const [isLoading, setIsLoading] = useState(true);
    const systemColorScheme = useColorScheme();

    // Determine active colors based on theme setting and system preference
    const activeTheme = theme === 'system' ? (systemColorScheme ?? 'light') : theme;
    const colors = activeTheme === 'dark' ? DarkColors : LightColors;

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        // Sync with system appearance for native components (like RevenueCat Paywall)
        if (theme === 'system') {
            Appearance.setColorScheme(null);
        } else {
            Appearance.setColorScheme(theme);
        }
    }, [theme]);

    const loadSettings = async () => {
        try {
            const storedLang = await AsyncStorage.getItem('settings.language');
            const storedTheme = await AsyncStorage.getItem('settings.theme');

            if (storedLang) {
                setLanguageState(storedLang as Language);
                i18n.locale = storedLang;
            } else {
                // Default to device locale if supported, or 'tr'
                const deviceLocale = i18n.locale.split('-')[0];
                if (deviceLocale === 'en' || deviceLocale === 'tr') {
                    setLanguageState(deviceLocale as Language);
                }
            }

            if (storedTheme) {
                setThemeState(storedTheme as Theme);
            }
        } catch (e) {
            console.error('Failed to load settings', e);
        } finally {
            setIsLoading(false);
        }
    };

    const setLanguage = async (lang: Language) => {
        i18n.locale = lang;
        setLanguageState(lang);
        try {
            await AsyncStorage.setItem('settings.language', lang);
        } catch (e) {
            console.error('Failed to save language setting:', e);
        }
    };

    const setTheme = async (newTheme: Theme) => {
        setThemeState(newTheme);
        try {
            await AsyncStorage.setItem('settings.theme', newTheme);
        } catch (e) {
            console.error('Failed to save theme setting:', e);
        }
    };

    return (
        <SettingsContext.Provider value={{ language, theme, colors, setLanguage, setTheme, isLoading }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
