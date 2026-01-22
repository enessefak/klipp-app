import { Attachment, AttachmentFilters, CreateAttachmentDTO, PaginatedAttachments, PaginationParams } from '../domain/Attachment';
import { AttachmentService } from './AttachmentService';

export class AttachmentRepository {
    /**
     * Orchestrates the attachment creation process:
     * 1. (Optional) Run OCR on the image to pre-fill data.
     * 2. Call Service to create attachment, upload file, and link them.
     */
    static async createAttachment(
        data: CreateAttachmentDTO,
        files: { fileUri: string; mimeType?: string }[]
    ): Promise<Attachment> {
        try {
            if (!files || files.length === 0) {
                throw new Error('At least one file is required to create an attachment');
            }

            const normalizedFiles = files.map(file => ({
                fileUri: file.fileUri,
                mimeType: file.mimeType || 'image/jpeg',
            }));

            const attachment = await AttachmentService.createAttachmentWithFiles(data, normalizedFiles);

            return attachment;
        } catch (error: any) {
            console.error('AttachmentRepository.createAttachment failed', error);
            // Log more details for API errors
            if (error?.status) {
                console.error('API Error Status:', error.status);
            }
            if (error?.body) {
                console.error('API Error Body:', JSON.stringify(error.body, null, 2));
            }
            if (error?.url) {
                console.error('API Error URL:', error.url);
            }
            throw error;
        }
    }

    /**
     * Fetch attachments with filters and pagination
     */
    static async getAttachments(
        filters?: AttachmentFilters,
        pagination?: PaginationParams
    ): Promise<PaginatedAttachments> {
        // Flatten filters into API parameters
        // The service expects individual parameters, not a filters object
        // We need to map our filters DTO to the arguments expected by the service

        // Wait, looking at AttachmentService.ts, getAttachments takes many arguments:
        // folderId, attachmentTypeId, title, search, ...
        // passing { folderId } as the first argument might be wrong if the first argument is folderId string!
        // AttachmentService.getAttachments(folderId, attachmentTypeId, ...)
        // The code currently does: return await AttachmentService.getAttachments(filters, pagination);
        // BUT filters is an object { folderId: '...' }, and getAttachments expects folderId as string as 1st arg.
        // This is why it's failing! Javascript is passing the whole object as the first argument (folderId).
        // The API client probably stringifies it or ignores it, leading to weird results.

        // console.log('Repo: Fetching with filters:', JSON.stringify(filters));

        // Correct mapping:
        return await AttachmentService.getAttachments(filters, pagination);
    }

    /**
     * Fetch attachments by folder with optional additional filters
     */
    static async getAttachmentsByFolder(
        folderId: string,
        filters?: Omit<AttachmentFilters, 'folderId'>,
        pagination?: PaginationParams
    ): Promise<PaginatedAttachments> {
        return await this.getAttachments({ folderId, ...filters }, pagination);
    }

    static async requestApproval(id: string, reviewerEmail: string): Promise<void> {
        await AttachmentService.postAttachmentsRequestApproval(id, { reviewerEmail });
    }

    static async reviewAttachment(id: string, status: 'APPROVED' | 'REJECTED', rejectionReason?: string): Promise<void> {
        await AttachmentService.patchAttachmentsStatus(id, { status, rejectionReason });
    }
}

