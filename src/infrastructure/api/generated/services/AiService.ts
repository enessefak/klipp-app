/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AiService {
    /**
     * Scan document with AI
     *
     * Analyzes a document (image or PDF) using Gemini AI and extracts structured data.
     *
     * **Desteklenen Formatlar:**
     * - **Görsel:** JPEG, PNG, GIF, WebP
     * - **PDF:** application/pdf (çok sayfalı belgeler desteklenir)
     * - **NOT:** DOC/DOCX dosyaları desteklenmez, önce PDF'e dönüştürün
     *
     * **Boyut Limitleri:**
     * - Görseller: maksimum 5MB
     * - PDF: maksimum 10MB
     *
     * **Rate Limits:**
     * - 10 requests per minute
     * - 100 requests per day
     *
     * **Request:**
     * - `files` veya `file`: Base64 encoded dosya(lar) (görsel veya PDF).
     * - Tek dosya için string, çok sayfalı/parçalı belgeler için string array gönderebilirsiniz.
     * - `images` ve `image` alanları da desteklenir.
     * - `mimeType`: Dosya MIME tipi (opsiyonel, varsayılan: image/jpeg)
     * - Desteklenen: image/jpeg, image/png, image/gif, image/webp, application/pdf
     * - `attachmentTypeId`: Verilirse, AI o tipe özel alanları çıkarır
     *
     * **Response:**
     * - `suggestedType`: Algılanan belge tipi ve güven skoru
     * - `suggestedTitle`: Önerilen başlık
     * - `suggestedDate`: Belge tarihi (ISO format)
     * - `extractedDetails`: AttachmentType fieldConfig'e uygun key-value çiftleri
     *
     * **Kullanım:**
     * 1. attachmentTypeId olmadan: AI belge tipini otomatik algılar
     * 2. attachmentTypeId ile: Bilinen tip için daha doğru alan çıkarımı
     *
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postAiScanDocument(
        requestBody?: {
            file?: (string | Array<string>);
            files?: Array<string>;
            image?: (string | Array<string>);
            images?: Array<string>;
            /**
             * Dosya MIME tipi. Desteklenen formatlar: image/jpeg, image/png, image/gif, image/webp, application/pdf. Varsayılan: image/jpeg
             */
            mimeType?: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' | 'application/pdf';
            attachmentTypeId?: string;
            folderId?: string;
        },
    ): CancelablePromise<{
        success: boolean;
        message?: string;
        data?: {
            suggestedType: {
                id: string;
                name: string;
                confidence: number;
            } | null;
            suggestedTitle: string | null;
            suggestedDescription: string | null;
            suggestedDate: string | null;
            extractedDetails: Record<string, any>;
            rawText: string | null;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/ai/scan-document',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
                429: `Default Response`,
                500: `Default Response`,
            },
        });
    }
}
