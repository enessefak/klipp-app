import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
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

export function usePushNotifications(isAuthenticated: boolean = false) {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);
    const tokenRegistered = useRef(false);

    useEffect(() => {
        // Register for push notifications (get token regardless of auth status)
        registerForPushNotificationsAsync().then(token => {
            if (token) {
                setExpoPushToken(token);
            }
        });

        // Listen for incoming notifications while app is foregrounded
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        // Listen for user interaction with notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            console.log('Notification response data:', data);

            // Handle notification tap based on type
            if (data?.type === 'FOLDER_SHARE_INVITE' && data?.shareId) {
                // Navigate to share invitation screen
                // This will be handled by the component using this hook
            }
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
        if (isAuthenticated && expoPushToken && !tokenRegistered.current) {
            console.log('Registering push token with backend...');
            const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
            NotificationService.registerPushToken(expoPushToken, platform)
                .then(() => {
                    tokenRegistered.current = true;
                    console.log('Push token registered successfully');
                })
                .catch(err => {
                    console.error('Failed to register push token with backend:', err);
                });
        }
    }, [isAuthenticated, expoPushToken]);

    return {
        expoPushToken,
        notification,
    };
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
    let token: string | null = null;

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
            // Get projectId from app.json via expo-constants
            const projectId = Constants.expoConfig?.extra?.eas?.projectId;
            if (!projectId) {
                console.error('Project ID not found in app.json');
                return null;
            }

            // Check if Google Play Services is available (required for FCM/Expo push)
            // Huawei devices without GMS will fail here
            if (Platform.OS === 'android') {
                const manufacturer = ((Device as any).manufacturer as string | null)?.toLowerCase() ?? '';
                if (manufacturer.includes('huawei') || manufacturer.includes('honor')) {
                    console.warn('Huawei device detected: Google Play Services may be unavailable. Push notifications may not work.');
                }
            }

            token = (await Notifications.getExpoPushTokenAsync({
                projectId,
            })).data;
            console.log('Expo push token:', token);
        } catch (error: any) {
            // On Huawei/HMS devices without Google Play Services, FCM token retrieval fails
            if (
                Platform.OS === 'android' &&
                (error?.message?.includes('Google Play') ||
                    error?.message?.includes('GoogleApi') ||
                    error?.message?.includes('SERVICE_NOT_AVAILABLE') ||
                    error?.message?.includes('MISSING_INSTANCEID_SERVICE'))
            ) {
                console.warn('Push notifications not supported on this device (no Google Play Services). Huawei HMS devices require a separate integration.');
            } else {
                console.error('Failed to get expo push token:', error);
            }
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
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
