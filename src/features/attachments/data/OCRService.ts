import { AiService } from '@/src/infrastructure/api/generated/services/AiService';
import { File } from 'expo-file-system';

export interface OCRResult {
    rawText: string;
    extractedData: {
        title?: string;
        amount?: number;
        currency?: string;
        date?: string;
        type?: string;
        details?: Record<string, any>;
    };
    confidence: number;
}

export class OCRService {
    /**
     * Main entry point: scans image or PDF using AI Backend
     */
    static async scanDocument(uri: string, mimeType: string): Promise<OCRResult> {
        try {
            // Read file as base64 using new File API
            const file = new File(uri);
            const base64 = await file.base64();

            // Normalize mimeType for API
            let apiMimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' | 'application/pdf' = 'image/jpeg';

            if (mimeType.toLowerCase().includes('pdf')) {
                apiMimeType = 'application/pdf';
            } else if (mimeType.toLowerCase().includes('png')) {
                apiMimeType = 'image/png';
            } else if (mimeType.toLowerCase().includes('gif')) {
                apiMimeType = 'image/gif';
            } else if (mimeType.toLowerCase().includes('webp')) {
                apiMimeType = 'image/webp';
            }
            // default jpeg

            const response = await AiService.postAiScanDocument({
                file: base64,
                mimeType: apiMimeType,
            });

            console.log("------------------- [AI SERVICE RESPONSE START] -------------------")
            console.log(JSON.stringify(response, null, 2))
            console.log("------------------- [AI SERVICE RESPONSE END] -------------------")

            let extractedDetails = response.extractedDetails || {};
            let suggestedType = response.suggestedType;
            let suggestedTitle = response.suggestedTitle;
            let suggestedDate = response.suggestedDate;

            // Fallback: If AI returned raw JSON in rawText but backend failed to parse it
            if ((!response.success || Object.keys(extractedDetails).length === 0) && response.rawText) {
                try {
                    // Try to clean markdown code blocks if present
                    let cleanText = response.rawText.trim();
                    if (cleanText.includes('```')) {
                        cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '');
                    }

                    if (cleanText.startsWith('{')) {
                        const rawJson = JSON.parse(cleanText);
                        console.log('Parsed rawText JSON fallback:', rawJson);

                        if (rawJson.documentType) {
                            suggestedType = {
                                id: rawJson.documentType,
                                name: rawJson.documentType,
                                confidence: rawJson.confidence || 0.8
                            };
                        }
                        if (rawJson.title) suggestedTitle = rawJson.title;
                        if (rawJson.date) suggestedDate = rawJson.date; // Ensure AI returns ISO or valid format

                        // Map details
                        extractedDetails = { ...rawJson };

                        // If the parsed JSON has its own 'rawText' field (the actual document text), usage that
                        // otherwise use the original rawText if it wasn't just the JSON string
                        if (rawJson.rawText) {
                            // Update the main rawText variable to be returned
                            // We can't modify response.rawText, so we'll handle return below
                            response.rawText = rawJson.rawText;
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
                rawText: response.rawText || '',
                extractedData: {
                    title: suggestedTitle || undefined,
                    date: suggestedDate || undefined,
                    type: suggestedType?.id,
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
