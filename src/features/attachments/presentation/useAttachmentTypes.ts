import { useEffect, useState } from 'react';
import { AttachmentTypeService } from '@/src/infrastructure/api/generated/services/AttachmentTypeService';
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
            const types = await AttachmentTypeService.getAttachmentTypes();
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
