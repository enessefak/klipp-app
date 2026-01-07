import { AttachmentTypeService } from '@/src/infrastructure/api/generated/services/AttachmentTypeService';
import { useEffect, useState } from 'react';
import { AttachmentType } from '../domain/Attachment';

export function useAttachmentTypes() {
    const [attachmentTypes, setAttachmentTypes] = useState<AttachmentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAttachmentTypes();
    }, []);

    const loadAttachmentTypes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response: any = await AttachmentTypeService.getAttachmentTypes();

            // Handle standard API response format { data: [...] } as well as direct array or items
            const types = Array.isArray(response)
                ? response
                : (response.data || response.items || []);

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
