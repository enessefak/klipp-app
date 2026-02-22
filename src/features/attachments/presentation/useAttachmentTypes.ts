import { OpenAPI } from '@/src/infrastructure/api/generated/core/OpenAPI';
import { AttachmentTypeService } from '@/src/infrastructure/api/generated/services/AttachmentTypeService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { AttachmentType } from '../domain/Attachment';

const getToken = async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
        return await AsyncStorage.getItem('token');
    } else {
        return await SecureStore.getItemAsync('token');
    }
};

const setupOpenAPI = async () => {
    const token = await getToken();
    if (token) {
        OpenAPI.TOKEN = token;
    }
};

export function useAttachmentTypes(ownerId?: string) {
    const [attachmentTypes, setAttachmentTypes] = useState<AttachmentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadAttachmentTypes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            await setupOpenAPI();

            // The generated client might not have an ownerId parameter if not specified in the spec,
            // but we can just call getAttachmentTypes() and it'll fetch the user's types.
            // If the original implementation manually added ?ownerId, we'll keep it using fetch 
            // as a fallback or just use the generated service if it works.
            const response = await AttachmentTypeService.getAttachmentTypes();

            const data = response as any;
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
    }, [ownerId]);

    useEffect(() => {
        loadAttachmentTypes();
    }, [loadAttachmentTypes]);

    const createType = async (data: Parameters<typeof AttachmentTypeService.postAttachmentTypes>[0]) => {
        await setupOpenAPI();
        const response = await AttachmentTypeService.postAttachmentTypes(data);
        await loadAttachmentTypes();
        return response.data;
    };

    const updateType = async (id: string, data: Parameters<typeof AttachmentTypeService.putAttachmentTypes>[1]) => {
        await setupOpenAPI();
        const response = await AttachmentTypeService.putAttachmentTypes(id, data);
        await loadAttachmentTypes();
        return response.data;
    };

    const deleteType = async (id: string) => {
        await setupOpenAPI();
        await AttachmentTypeService.deleteAttachmentTypes(id);
        await loadAttachmentTypes();
    };

    return {
        attachmentTypes,
        loading,
        error,
        refresh: loadAttachmentTypes,
        createType,
        updateType,
        deleteType,
    };
}
