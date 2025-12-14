import * as SecureStore from 'expo-secure-store';
import { OpenAPI } from './generated/core/OpenAPI';

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
OpenAPI.TOKEN = async () => {
    const token = await SecureStore.getItemAsync('token');
    return token || '';
};
