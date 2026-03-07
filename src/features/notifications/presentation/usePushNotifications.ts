import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { getHmsPushToken, isHmsDevice } from '../data/HmsPushService';
import { NotificationService } from '../data/NotificationService';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

type NotificationNavigateCallback = (data: {
    type: string;
    referenceId?: string;
    referenceType?: string;
    notificationId?: string;
    [key: string]: any;
}) => void;

export function usePushNotifications(
    isAuthenticated: boolean = false,
    onNotificationTap?: NotificationNavigateCallback
) {
    const [pushTokenResult, setPushTokenResult] = useState<{ token: string; platform: 'ios' | 'android' | 'huawei' } | null>(null);
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);
    const tokenRegistered = useRef(false);
    const onNotificationTapRef = useRef(onNotificationTap);
    onNotificationTapRef.current = onNotificationTap;

    useEffect(() => {
        // Register for push notifications (get token regardless of auth status)
        registerForPushNotificationsAsync().then(result => {
            if (result) {
                setPushTokenResult(result);
            }
        });

        // Handle notification tapped while app was killed/background
        Notifications.getLastNotificationResponseAsync().then(response => {
            if (response) {
                const data = response.notification.request.content.data;
                onNotificationTapRef.current?.(data as any);
            }
        });

        // Listen for incoming notifications while app is foregrounded
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        // Listen for user tapping a notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            console.log('Notification tapped, data:', data);
            onNotificationTapRef.current?.(data as any);
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    // Register token with backend only when authenticated
    useEffect(() => {
        if (isAuthenticated && pushTokenResult && !tokenRegistered.current) {
            console.log('Registering push token with backend...');
            NotificationService.registerPushToken(pushTokenResult.token, pushTokenResult.platform)
                .then(() => {
                    tokenRegistered.current = true;
                    console.log('Push token registered successfully');
                })
                .catch(err => {
                    console.error('Failed to register push token with backend:', err);
                });
        }
    }, [isAuthenticated, pushTokenResult]);

    return {
        expoPushToken: pushTokenResult?.token ?? null,
        notification,
    };
}

type TokenResult = { token: string; platform: 'ios' | 'android' | 'huawei' } | null;

async function registerForPushNotificationsAsync(): Promise<TokenResult> {
    if (Platform.OS === 'web') {
        return null;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });

        // Check if this is a Huawei/HMS device (no Google Play Services)
        if (isHmsDevice()) {
            return await getHmsToken();
        }
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token: permission not granted');
            return null;
        }

        try {
            const projectId = Constants.expoConfig?.extra?.eas?.projectId;
            if (!projectId) {
                console.error('Project ID not found in app.json');
                return null;
            }
            const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            console.log('Expo push token:', token);
            return { token, platform: Platform.OS === 'ios' ? 'ios' : 'android' };
        } catch (error) {
            console.error('Failed to get expo push token:', error);
            return null;
        }
    } else {
        console.log('Must use physical device for Push Notifications');
        return null;
    }
}

async function getHmsToken(): Promise<TokenResult> {
    // SDK reads App ID from agconnect-services.json automatically
    const token = await getHmsPushToken();
    if (token) {
        console.log('HMS push token:', token);
        return { token, platform: 'huawei' };
    }
    return null;
}

/**
 * Update app badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
    try {
        await Notifications.setBadgeCountAsync(count);
    } catch (error) {
        console.error('Failed to set badge count:', error);
    }
}

/**
 * Clear app badge
 */
export async function clearBadge(): Promise<void> {
    try {
        await Notifications.setBadgeCountAsync(0);
    } catch (error) {
        console.error('Failed to clear badge:', error);
    }
}
