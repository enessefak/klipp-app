import { OpenAPI } from '@/src/infrastructure/api/generated/core/OpenAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { AttachmentType } from '../domain/Attachment';

const getToken = async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
        return await AsyncStorage.getItem('token');
    } else {
        return await SecureStore.getItemAsync('token');
    }
};

export function useAttachmentTypes(ownerId?: string) {
    const [attachmentTypes, setAttachmentTypes] = useState<AttachmentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAttachmentTypes();
    }, [ownerId]);

    const loadAttachmentTypes = async () => {
        try {
            setLoading(true);
            setError(null);

            const baseUrl = OpenAPI.BASE;
            const token = await getToken();

            // Build URL with query params
            // Note: simple URL construction, assume existing query params are empty or handled
            let url = `${baseUrl}/attachment-types/`;
            if (ownerId) {
                url += `?ownerId=${ownerId}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch types');
            }

            const data = await response.json();

            // Handle standard API response format { data: [...] } as well as direct array or items
            const types = Array.isArray(data)
                ? data
                : (data.data || data.items || []);

            setAttachmentTypes(types);
        } catch (err) {
            console.error('Failed to load attachment types:', err);
            setError('Failed to load attachment types');
        } finally {
            setLoading(false);
        }
    };

    return {
        attachmentTypes,
        loading,
        error,
        refresh: loadAttachmentTypes
    };
}
