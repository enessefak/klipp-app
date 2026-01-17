import { AiService } from '@/src/infrastructure/api/generated/services/AiService';
import { File } from 'expo-file-system';

export interface OCRResult {
    rawText: string;
    extractedData: {
        title?: string;
        description?: string;
        amount?: number;
        currency?: string;
        date?: string;
        type?: string;
        details?: Record<string, any>;
    };
    confidence: number;
}

export interface OCRScanFileInput {
    uri: string;
    mimeType: string;
}

export class OCRService {
    /**
     * Main entry point: scans image or PDF using AI Backend
     */
    static async scanDocument(files: OCRScanFileInput[], folderId?: string): Promise<OCRResult> {
        try {
            if (!files || files.length === 0) {
                throw new Error('No files provided for OCR scan');
            }

            // Read files as base64 in parallel
            const base64Files = await Promise.all(files.map(async (input) => {
                const file = new File(input.uri);
                return file.base64();
            }));

            // Normalize mimeType for API using first file as reference
            const primaryMime = files[0].mimeType?.toLowerCase() || 'image/jpeg';
            let apiMimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' | 'application/pdf' = 'image/jpeg';

            if (primaryMime.includes('pdf')) {
                apiMimeType = 'application/pdf';
            } else if (primaryMime.includes('png')) {
                apiMimeType = 'image/png';
            } else if (primaryMime.includes('gif')) {
                apiMimeType = 'image/gif';
            } else if (primaryMime.includes('webp')) {
                apiMimeType = 'image/webp';
            }
            // default jpeg

            const requestPayload: Record<string, any> = {
                mimeType: apiMimeType,
                folderId
            };

            if (base64Files.length === 1) {
                requestPayload.file = base64Files[0];
            } else {
                requestPayload.files = base64Files;
            }

            const response = await AiService.postAiScanDocument(requestPayload);

            console.log("------------------- [AI SERVICE RESPONSE START] -------------------")
            console.log(JSON.stringify(response, null, 2))
            console.log("------------------- [AI SERVICE RESPONSE END] -------------------")

            const data = (response as any).data || response;

            let extractedDetails = data.extractedDetails || {};
            let suggestedType = data.suggestedType;
            let suggestedTitle = data.suggestedTitle;
            let suggestedDescription = data.suggestedDescription;
            let suggestedDate = data.suggestedDate;
            let rawText = data.rawText;

            // Fallback: If AI returned raw JSON in rawText but backend failed to parse it
            if ((!data.success && Object.keys(extractedDetails).length === 0) && rawText) {
                try {
                    // Try to clean markdown code blocks if present
                    let cleanText = rawText.trim();
                    if (cleanText.includes('```')) {
                        cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '');
                    }

                    if (cleanText.startsWith('{')) {
                        const rawJson = JSON.parse(cleanText);
                        console.log('Parsed rawText JSON fallback:', rawJson);

                        if (rawJson.documentType) {
                            suggestedType = {
                                id: rawJson.documentType, // Use key as ID for fallback
                                name: rawJson.documentType,
                                confidence: rawJson.confidence || 0.8
                            };
                        }
                        if (rawJson.title) suggestedTitle = rawJson.title;
                        if (rawJson.description) suggestedDescription = rawJson.description;
                        if (rawJson.date) suggestedDate = rawJson.date; // Ensure AI returns ISO or valid format

                        // Map details
                        extractedDetails = { ...rawJson };

                        // If the parsed JSON has its own 'rawText' field (the actual document text), usage that
                        // otherwise use the original rawText if it wasn't just the JSON string
                        if (rawJson.rawText) {
                            // Update the main rawText variable to be returned
                            rawText = rawJson.rawText;
                        }
                    }
                } catch (e) {
                    console.warn('Failed to parse rawText as JSON fallback', e);
                }
            }

            // Normalize details keys: ensure we have snake_case versions for form compatibility
            // e.g. bankName -> bank_name
            const normalizedDetails = { ...extractedDetails };

            // Common mappings for field compatibility
            const keyMappings: Record<string, string[]> = {
                'bankName': ['bank_name', 'vendor'], // Bank name usually goes to 'bank_name' or 'vendor'
                'sellerName': ['vendor', 'merchant'],
                'merchantName': ['vendor', 'merchant'],
                'storeName': ['vendor', 'merchant'],
                'receiverName': ['receiver', 'recipient'],
                'senderName': ['sender'],
                'accountNumber': ['account_no', 'account_number', 'iban'],
                'iban': ['account_no', 'account_number', 'iban'],
                'transferType': ['transfer_type', 'transaction_type'],
                'referenceNumber': ['reference_no', 'reference_number', 'transaction_id']
            };

            Object.keys(extractedDetails).forEach(key => {
                const value = extractedDetails[key];

                // 1. Snake case conversion
                const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                if (snakeKey !== key) {
                    normalizedDetails[snakeKey] = value;
                }

                // 2. Explicit mappings
                if (keyMappings[key]) {
                    keyMappings[key].forEach(targetKey => {
                        // Only set if not already set (preserve original if it was exact match)
                        if (!normalizedDetails[targetKey]) {
                            normalizedDetails[targetKey] = value;
                        }
                    });
                }
            });

            return {
                rawText: '', // User requested to stop using rawText
                extractedData: {
                    title: suggestedTitle || undefined,
                    description: suggestedDescription || undefined,
                    date: suggestedDate || undefined,
                    type: suggestedType?.name || suggestedType?.id, // Use name as primary key
                    amount: normalizedDetails.amount,
                    currency: normalizedDetails.currency,
                    details: normalizedDetails,
                },
                confidence: suggestedType?.confidence || 0,
            };

        } catch (error) {
            console.error('OCR/AI Scan Error:', error);
            return {
                rawText: '',
                extractedData: {},
                confidence: 0,
            };
        }
    }
}
