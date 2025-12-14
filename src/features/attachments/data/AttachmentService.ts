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
        return response;
    }

    /**
     * Get Attachments with filters and pagination
     * Supports includeShared parameter for shared folder attachments
     */
    static async getAttachments(
        filters?: AttachmentFilters,
        pagination?: PaginationParams
    ): Promise<PaginatedAttachments> {
        try {
            const response = await GeneratedAttachmentService.getAttachments(
                filters?.folderId,
                filters?.attachmentTypeId,
                filters?.title,
                filters?.search,
                filters?.amountMin,
                filters?.amountMax,
                filters?.currency,
                filters?.documentDateFrom,
                filters?.documentDateTo,
                filters?.createdAtFrom,
                filters?.createdAtTo,
                filters?.includeShared ? 'true' : undefined,
                pagination?.cursor,
                pagination?.limit
            );
            return response;
        } catch (error: any) {
            console.error('AttachmentService.getAttachments error:', error);
            throw error;
        }
    }

    /**
     * Step 2: Get Presigned URL for upload
     * Backend auto-generates key with user prefix
     */
    static async getPresignedUrl(filename: string, contentType: string) {
        return await GeneratedFilesService.postFilesPresignedUrl({
            filename,
            contentType,
        });
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
        return await GeneratedFilesService.postFiles({
            attachmentId,
            key,
        });
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
     * Composite method: Full Flow - Create attachment and upload file
     * Supports images, PDFs, Word documents, Excel files
     */
    static async createAttachmentWithFile(
        data: CreateAttachmentDTO,
        fileUri: string,
        contentType: string = 'image/jpeg'
    ): Promise<Attachment> {
        // 1. Create Attachment Metadata
        const attachment = await this.createAttachment(data);

        try {
            // Generate unique filename with proper extension
            const extension = this.getExtensionFromContentType(contentType);
            const filename = `${attachment.id}_${Date.now()}.${extension}`;

            // 2. Get Presigned URL (backend auto-prefixes with user ID)
            const { uploadUrl, key } = await this.getPresignedUrl(filename, contentType);

            console.log('Got presigned URL, key:', key);

            // 3. Upload File to R2
            await this.uploadImageToR2(uploadUrl, fileUri, contentType);

            console.log('Upload complete');

            // 4. Save file record (backend validates ownership and returns viewUrl)
            const savedFile = await this.saveFileToAttachment(attachment.id, key);

            console.log('File saved, viewUrl:', savedFile.viewUrl);

            return attachment;
        } catch (error) {
            console.error('Error uploading file for attachment:', error);
            throw error;
        }
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
        return response;
    }

    /**
     * Get files for an attachment
     * Returns viewUrl for each file (backend serves file through authenticated endpoint)
     */
    static async getAttachmentFiles(attachmentId: string): Promise<{ id: string; viewUrl: string; filename: string; contentType?: string; createdAt: string }[]> {
        const response = await GeneratedFilesService.getFilesAttachment(attachmentId);
        return response;
    }

    /**
     * Update an existing attachment
     */
    static async updateAttachment(id: string, data: Partial<CreateAttachmentDTO>): Promise<Attachment> {
        const response = await GeneratedAttachmentService.putAttachments(id, data);
        return response;
    }

    /**
     * Delete an attachment by ID
     */
    static async deleteAttachment(id: string): Promise<void> {
        await GeneratedAttachmentService.deleteAttachments(id);
    }
}
