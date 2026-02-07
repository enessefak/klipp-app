// Load environment variables from .env.development
require('dotenv').config({ path: '.env.development' });

module.exports = {
    expo: {
        name: 'Klipp',
        slug: 'klipp',
        version: '1.0.0',
        orientation: 'portrait',
        icon: './assets/images/icon.png',
        scheme: 'klipp',
        userInterfaceStyle: 'automatic',
        newArchEnabled: true,
        ios: {
            supportsTablet: true,
            bundleIdentifier: 'com.enes.klipp',
            usesAppleSignIn: true,
            infoPlist: {
                ITSAppUsesNonExemptEncryption: false,
                NSCameraUsageDescription: 'Belge ve fiş taramak için kamera izni gereklidir.',
                NSPhotoLibraryUsageDescription: 'Galeriden belge seçmek için fotoğraf izni gereklidir.',
                NSMicrophoneUsageDescription: 'Video kaydı için mikrofon izni gereklidir.',
            },
        },
        android: {
            adaptiveIcon: {
                backgroundColor: '#E6F4FE',
                foregroundImage: './assets/images/android-icon-foreground.png',
                backgroundImage: './assets/images/android-icon-background.png',
                monochromeImage: './assets/images/android-icon-monochrome.png',
            },
            package: 'com.enes.sefa.k.klipp',
            googleServicesFile: './google-services.json',
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false,
        },
        web: {
            output: 'static',
            favicon: './assets/images/favicon.png',
        },
        plugins: [
            'expo-router',
            [
                'expo-font',
                {
                    fonts: ['./assets/fonts/Montserrat-VariableFont_wght.ttf'],
                },
            ],
            [
                'expo-splash-screen',
                {
                    image: './assets/images/splash-icon.png',
                    imageWidth: 300,
                    resizeMode: 'contain',
                    backgroundColor: '#162357',
                    dark: {
                        backgroundColor: '#162357',
                    },
                },
            ],
            'expo-localization',
            'expo-apple-authentication',
            [
                'expo-build-properties',
                {
                    ios: {
                        deploymentTarget: '16.1',
                    },
                },
            ],
            'expo-font',
            'expo-notifications',
            [
                'expo-camera',
                {
                    recordAudioAndroid: true,
                },
            ],
            'expo-iap',
            './plugins/withPodfileDeploymentTarget',
            [
                '@react-native-google-signin/google-signin',
                {
                    iosUrlScheme: 'com.googleusercontent.apps.1053510280344-7gffs2e4gnrufp6nd34mug04ui5s741u',
                },
            ],
        ],
        experiments: {
            typedRoutes: true,
            reactCompiler: true,
        },
        extra: {
            router: {},
            eas: {
                projectId: '1c046509-b7d5-4810-9fa5-51cc9fdb409e',
            },
            // Environment variables accessible via Constants.expoConfig.extra
            EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
            EXPO_PUBLIC_ENV: process.env.EXPO_PUBLIC_ENV,
            EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
            EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
        },
        runtimeVersion: {
            policy: 'appVersion',
        },
        updates: {
            url: 'https://u.expo.dev/1c046509-b7d5-4810-9fa5-51cc9fdb409e',
        },
    },
};
