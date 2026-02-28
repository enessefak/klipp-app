import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Alert, Platform } from 'react-native';
import i18n from '../localization/i18n';
import { OpenAPI } from './generated/core/OpenAPI';

// ... (existing comments)

const globalAxios = axios;

globalAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        const data = error.response?.data;

        // Handle Subscription Required
        if (status === 403 && (data?.error === 'subscription_required' || data?.error === 'subscription_required_guest')) {
            console.log('[API] Subscription Required Triggered');

            // Show alert if message is provided
            if (data?.message) {
                Alert.alert(
                    i18n.t('subscription.required.title'),
                    data.message + '\n\n' + i18n.t('subscription.required.subtitle'),
                    [
                        {
                            text: i18n.t('subscription.required.cancel'),
                            style: 'cancel',
                            onPress: () => console.log('Subscription cancelled')
                        },
                        {
                            text: i18n.t('subscription.required.cta'),
                            style: 'default',
                            onPress: () => {
                                console.log('Navigating to paywall from interceptor');
                                try {
                                    // Use replace to avoid stacking if already there, or push
                                    router.push('/subscription/paywall');
                                } catch (err) {
                                    console.error('Navigation error:', err);
                                }
                            }
                        }
                    ]
                );
            } else {
                router.push('/subscription/paywall');
            }

            return Promise.reject(error);
        }

        if (status === 401) {
            console.log('[API] 401 Global Interceptor Triggered');

            if (Platform.OS === 'web') {
                await AsyncStorage.removeItem('token');
            } else {
                await SecureStore.deleteItemAsync('token');
            }
        }
        return Promise.reject(error);
    }
);

// Get API URL from environment variable or use default
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://klipp-api.orjinfinity.net';
const ENV = process.env.EXPO_PUBLIC_ENV || 'development';

// Log current environment (only in development)
if (__DEV__) {
    console.log(`[API Config] Environment: ${ENV}`);
    console.log(`[API Config] API URL: ${API_URL}`);
}

// Set base URL (without trailing slash)
OpenAPI.BASE = API_URL;

// Inject token
OpenAPI.TOKEN = async (options) => {
    // Skip token for auth endpoints to prevent 401s from invalid/expired tokens
    if (options?.url === '/users/login' || options?.url === '/users/register') {
        return '';
    }

    try {
        if (Platform.OS === 'web') {
            const token = await AsyncStorage.getItem('token');
            return token || '';
        } else {
            const token = await SecureStore.getItemAsync('token');
            return token || '';
        }
    } catch (e) {
        return '';
    }
};

// Fix for server compression issue & Localization
OpenAPI.HEADERS = async () => {
    return {
        'Accept-Encoding': 'identity',
        'Accept-Language': i18n.locale || 'tr',
    };
};
