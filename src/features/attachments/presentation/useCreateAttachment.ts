import { useState } from 'react';
import { AttachmentRepository } from '../data/AttachmentRepository';
import { Attachment, CreateAttachmentDTO } from '../domain/Attachment';

export function useCreateAttachment() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createAttachment = async (
        data: CreateAttachmentDTO, 
        fileUri: string,
        mimeType: string = 'image/jpeg'
    ): Promise<Attachment | null> => {
        try {
            setLoading(true);
            setError(null);

            const attachment = await AttachmentRepository.createAttachment(data, fileUri, mimeType);

            return attachment;
        } catch (err) {
            console.error(err);
            setError('Failed to create attachment');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        createAttachment,
        loading,
        error
    };
}
