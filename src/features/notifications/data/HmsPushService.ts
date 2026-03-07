import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { HmsPushInstanceId } from '@hmscore/react-native-hms-push';

/**
 * Returns true if this is a Huawei/Honor device.
 * We use manufacturer check as a fast pre-filter before calling HMS APIs.
 */
export function isHmsDevice(): boolean {
    if (Platform.OS !== 'android') return false;
    const manufacturer = (Device.manufacturer ?? '').toLowerCase();
    return manufacturer.includes('huawei') || manufacturer.includes('honor');
}

/**
 * Gets the HMS push token using the official Huawei SDK.
 * Requires agconnect-services.json to be present in android/app/.
 * Returns null if token retrieval fails (e.g. HMS Core not available).
 */
export async function getHmsPushToken(): Promise<string | null> {
    if (!HmsPushInstanceId) return null;
    try {
        // SDK reads App ID from agconnect-services.json automatically
        const result: any = await HmsPushInstanceId.getToken('');
        // SDK returns { result: "token_string" }
        const token = typeof result === 'string' ? result : result?.result;
        return token || null;
    } catch (error) {
        console.error('Failed to get HMS push token:', error);
        return null;
    }
}
