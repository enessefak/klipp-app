import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { OpenAPI } from './generated/core/OpenAPI';

// Assign custom axios to OpenAPI (requires OpenAPI core modification or we can just patch it here if exported)
// The generated code imports axios directly, but usually allows passing a client.
// Looking at 'request.ts', it takes 'axiosClient' as optional arg, defaulting to global 'axios'.
// We cannot easily inject this instance into the static service calls because they use internal '__request'
// which uses 'OpenAPI' config but not an instance.
// However, 'axios' import in generated code refers to the module. 
// We can try to set interceptors on the default axios instance if the generated code allows it.
// Or better: The generated 'request.ts' uses strict 'import axios from "axios"'. 
// So modifying the global default should work if we do it early.

const globalAxios = axios;

globalAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.log('[API] 401 Global Interceptor');
            await SecureStore.deleteItemAsync('token');
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
OpenAPI.TOKEN = async () => {
    try {
        const token = await SecureStore.getItemAsync('token');
        return token || '';
    } catch (e) {
        return '';
    }
};

// Fix for server compression issue
OpenAPI.HEADERS = {
    'Accept-Encoding': 'identity',
};
