import { AttachmentService as GeneratedAttachmentService } from '@/src/infrastructure/api/generated/services/AttachmentService';
import { FilesService as GeneratedFilesService } from '@/src/infrastructure/api/generated/services/FilesService';
import { File } from 'expo-file-system';
import { fetch } from 'expo/fetch';
import { Attachment, AttachmentFilters, CreateAttachmentDTO, PaginatedAttachments, PaginationParams } from '../domain/Attachment';

export class AttachmentService {
    /**
     * Step 1: Create Attachment Metadata
     */
    static async createAttachment(data: CreateAttachmentDTO): Promise<Attachment> {
        const response = await GeneratedAttachmentService.postAttachments(data);
        return (response as any).data || response;
    }

    /**
     * Get Attachments with filters and pagination
     * Supports includeShared parameter for shared folder attachments
     */
    static async getAttachments(
        filters?: AttachmentFilters,
        pagination?: PaginationParams
    ): Promise<PaginatedAttachments> {
        const response = await GeneratedAttachmentService.getAttachments(
            filters?.folderId,
            filters?.categoryId,
            filters?.attachmentTypeId,
            undefined, // tagId
            filters?.transactionType as 'INCOME' | 'EXPENSE' | 'NEUTRAL' | undefined,
            filters?.title,
            undefined, // status
            filters?.search,
            filters?.documentDateFrom,
            filters?.documentDateTo,
            filters?.createdAtFrom,
            filters?.createdAtTo,
            filters?.includeShared ? 'true' : undefined,
            filters?.detailsFilter,
            pagination?.cursor,
            undefined, // page
            undefined, // skip
            pagination?.limit
        );
        return (response as any).data || response;
    }

    /**
     * Step 2: Get Presigned URL for upload
     * Backend auto-generates key with user prefix
     */
    static async getPresignedUrl(filename: string, contentType: string) {
        const response = await GeneratedFilesService.postFilesPresignedUrl({
            filename,
            contentType,
        });
        return (response as any).data || response;
    }

    /**
     * Step 3: Upload Image to R2 (Direct PUT)
     */
    static async uploadImageToR2(uploadUrl: string, imageUri: string, contentType: string): Promise<void> {
        const file = new File(imageUri);

        const response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': contentType,
            },
            body: file,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
        }
    }

    /**
     * Step 4: Save file to attachment (with key, not URL)
     * Backend validates ownership and key prefix
     */
    static async saveFileToAttachment(attachmentId: string, key: string) {
        const response = await GeneratedFilesService.postFiles({
            attachmentId,
            key,
        });
        return (response as any).data || response;
    }

    /**
     * Get file extension from content type
     */
    static getExtensionFromContentType(contentType: string): string {
        const extensionMap: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'image/heic': 'heic',
            'application/pdf': 'pdf',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/vnd.ms-excel': 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        };
        return extensionMap[contentType] || 'bin';
    }

    /**
     * Composite method: Full Flow - Create attachment and upload multiple files sequentially
     * Supports images, PDFs, Word documents, Excel files
     */
    static async createAttachmentWithFiles(
        data: CreateAttachmentDTO,
        files: { fileUri: string; mimeType?: string }[]
    ): Promise<Attachment> {
        if (!files || files.length === 0) {
            throw new Error('No files provided for attachment');
        }

        // 1. Create Attachment Metadata
        const attachment = await this.createAttachment(data);

        try {
            for (const [index, file] of files.entries()) {
                const contentType = file.mimeType || 'image/jpeg';
                const extension = this.getExtensionFromContentType(contentType);
                const filename = `${attachment.id}_${Date.now()}_${index}.${extension}`;

                // 2. Get Presigned URL (backend auto-prefixes with user ID)
                const { uploadUrl, key } = await this.getPresignedUrl(filename, contentType);

                console.log('Got presigned URL, key:', key);

                // 3. Upload File to R2
                await this.uploadImageToR2(uploadUrl, file.fileUri, contentType);

                console.log('Upload complete');

                // 4. Save file record (backend validates ownership and returns viewUrl)
                const savedFile = await this.saveFileToAttachment(attachment.id, key);

                console.log('File saved, viewUrl:', savedFile.viewUrl);
            }

            return attachment;
        } catch (error) {
            console.error('Error uploading file(s) for attachment:', error);
            throw error;
        }
    }

    /**
     * Composite helper for single file compatibility
     */
    static async createAttachmentWithFile(
        data: CreateAttachmentDTO,
        fileUri: string,
        contentType: string = 'image/jpeg'
    ): Promise<Attachment> {
        return this.createAttachmentWithFiles(data, [{ fileUri, mimeType: contentType }]);
    }

    /**
     * @deprecated Use createAttachmentWithFile instead
     */
    static async createAttachmentWithImage(
        data: CreateAttachmentDTO,
        imageUri: string,
        contentType: string = 'image/jpeg'
    ): Promise<Attachment> {
        return this.createAttachmentWithFile(data, imageUri, contentType);
    }

    /**
     * Get single attachment by ID
     */
    static async getAttachmentById(id: string): Promise<Attachment> {
        const response = await GeneratedAttachmentService.getAttachments1(id);
        return (response as any).data || response;
    }

    /**
     * Get files for an attachment
     * Returns viewUrl for each file (backend serves file through authenticated endpoint)
     */
    static async getAttachmentFiles(attachmentId: string): Promise<{ id: string; viewUrl: string; filename: string; contentType?: string; createdAt: string }[]> {
        const response = await GeneratedFilesService.getFilesAttachment(attachmentId);
        return (response as any).data || response;
    }

    /**
     * Update an existing attachment
     */
    static async updateAttachment(id: string, data: Partial<CreateAttachmentDTO>): Promise<Attachment> {
        const response = await GeneratedAttachmentService.putAttachments(id, data);
        return (response as any).data || response;
    }

    /**
     * Delete an attachment by ID
     */
    static async deleteAttachment(id: string): Promise<void> {
        await GeneratedAttachmentService.deleteAttachments(id);
    }

    /**
     * Request approval for an attachment
     */
    static async postAttachmentsRequestApproval(id: string, data: { reviewerEmail: string }): Promise<void> {
        await GeneratedAttachmentService.postAttachmentsRequestApproval(id, data);
    }
}
