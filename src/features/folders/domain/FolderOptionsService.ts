import { ConfigService } from '@/src/infrastructure/api/generated';
import i18n from '@/src/infrastructure/localization/i18n';
import * as SecureStore from 'expo-secure-store';

interface FolderOptionItem {
    value: string;
    label: string;
}

export interface FolderOptions {
    icons: FolderOptionItem[];
    colors: FolderOptionItem[];
}

// Cache key for folder options
const CACHE_KEY = 'folder_options_cache';
const CACHE_EXPIRY_KEY = 'folder_options_expiry';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Fetch folder options (icons and colors) from the backend.
 * Uses SecureStore for local caching to avoid repeated API calls.
 */
export async function getFolderOptions(): Promise<FolderOptions | null> {
    try {
        // Check cache first
        const cached = await getCachedOptions();
        if (cached) {
            return cached;
        }

        // Fetch from API
        const response = await ConfigService.getFolderOptions();
        if (response.success && response.data) {
            const options = response.data as unknown as FolderOptions;

            // Cache the response
            await cacheOptions(options);

            return options;
        }

        return null;
    } catch (error) {
        console.error('Failed to fetch folder options:', error);
        return null;
    }
}

async function getCachedOptions(): Promise<FolderOptions | null> {
    try {
        // Check if cache is expired
        const expiryStr = await SecureStore.getItemAsync(CACHE_EXPIRY_KEY);
        if (!expiryStr) return null;

        const expiry = parseInt(expiryStr, 10);
        if (Date.now() > expiry) {
            // Cache expired
            return null;
        }

        // Get cached data
        const cachedStr = await SecureStore.getItemAsync(CACHE_KEY + '_' + i18n.locale);
        if (!cachedStr) return null;

        return JSON.parse(cachedStr) as FolderOptions;
    } catch {
        return null;
    }
}

async function cacheOptions(options: FolderOptions): Promise<void> {
    try {
        const expiry = Date.now() + CACHE_DURATION;
        await SecureStore.setItemAsync(CACHE_EXPIRY_KEY, expiry.toString());
        await SecureStore.setItemAsync(CACHE_KEY + '_' + i18n.locale, JSON.stringify(options));
    } catch (error) {
        console.error('Failed to cache folder options:', error);
    }
}

/**
 * Clear the folder options cache.
 * Call this if you need to force a refresh.
 */
export async function clearFolderOptionsCache(): Promise<void> {
    try {
        await SecureStore.deleteItemAsync(CACHE_KEY + '_en');
        await SecureStore.deleteItemAsync(CACHE_KEY + '_tr');
        await SecureStore.deleteItemAsync(CACHE_KEY + '_de');
        await SecureStore.deleteItemAsync(CACHE_EXPIRY_KEY);
    } catch (error) {
        console.error('Failed to clear folder options cache:', error);
    }
}
