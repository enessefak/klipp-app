export const LightColors = {
    primary: '#1C2A4E', // Navy Blue
    primaryLight: '#4DABF7',
    accent: '#4DABF7',  // Cyan/Light Blue
    background: '#F8F9FA', // Light Gray/White
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardBorder: '#E0E0E0',
    inputBackground: '#F0F0F0',
    tabBarBackground: '#FFFFFF',
    headerBackground: '#FFFFFF',
    subtext: '#666666',
    white: '#FFFFFF',
    text: '#333333',
    textLight: '#666666',
    border: '#E0E0E0',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    gray: '#B0B0B0',
};

export const DarkColors = {
    primary: '#4DABF7', // Brighter blue for dark mode
    primaryLight: '#1C2A4E',
    accent: '#4DABF7',
    background: '#121212', // Dark background
    surface: '#1E1E1E', // Dark surface
    card: '#1E1E1E', // Dark card background
    cardBorder: '#333333',
    inputBackground: '#2C2C2E',
    tabBarBackground: '#1E1E1E',
    headerBackground: '#121212',
    subtext: '#AAAAAA',
    white: '#FFFFFF',
    text: '#F0F0F0', // Light text
    textLight: '#AAAAAA',
    border: '#333333',
    error: '#FF453A',
    success: '#32D74B',
    warning: '#FF9F0A',
    gray: '#666666',
};

// Backward compatibility (default to Light)
export const Colors = LightColors;

export type ThemeColors = typeof LightColors;
