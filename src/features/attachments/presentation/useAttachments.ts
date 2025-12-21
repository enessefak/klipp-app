import { useCallback, useEffect, useState } from 'react';
import { AttachmentRepository } from '../data/AttachmentRepository';
import { Attachment } from '../domain/Attachment';

interface UseAttachmentsResult {
    attachments: Attachment[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useAttachments(): UseAttachmentsResult {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAttachments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await AttachmentRepository.getAttachments();
            setAttachments(data.items || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch attachments');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAttachments();
    }, [fetchAttachments]);

    return {
        attachments,
        loading,
        error,
        refresh: fetchAttachments,
    };
}
