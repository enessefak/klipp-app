import TextRecognition from '@react-native-ml-kit/text-recognition';
import { Buffer } from 'buffer';
import { File } from 'expo-file-system';

// Optional imports for document parsing
let mammoth: any;
let pdfParse: any;

try {
    mammoth = require('mammoth');
} catch (e) {
    console.log('[OCRService] Mammoth not available');
}

/*
try {
    pdfParse = require('pdf-parse');
} catch (e) {
    console.log('[OCRService] pdf-parse not available');
}
*/

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
     * Main entry point: scans image, PDF, or DOCX based on mimeType
     */
    static async scanDocument(uri: string, mimeType: string): Promise<OCRResult> {
        if (mimeType.includes('image')) {
            return this.scanImage(uri);
        } else if (mimeType.includes('pdf')) {
            return this.scanPdf(uri);
        } else if (mimeType.includes('word') || mimeType.includes('document')) {
            return this.scanDocx(uri);
        }

        return {
            rawText: '',
            extractedData: {},
            confidence: 0,
        };
    }

    /**
     * Scan image and extract text using ML Kit
     */
    static async scanImage(imageUri: string): Promise<OCRResult> {
        try {
            const result = await TextRecognition.recognize(imageUri);
            const rawText = result.text;

            // Parse the extracted text
            const extractedData = this.parseText(rawText);

            return {
                rawText,
                extractedData,
                confidence: result.blocks.length > 0 ? 0.8 : 0.2,
            };
        } catch (error) {
            console.error('OCR Error:', error);
            return {
                rawText: '',
                extractedData: {},
                confidence: 0,
            };
        }
    }

    /**
     * Extract text from PDF files using new File API
     */
    static async scanPdf(uri: string): Promise<OCRResult> {
        try {
            // Use new File API
            const file = new File(uri);
            if (!file.exists) {
                console.warn('[OCRService] PDF file does not exist at path:', uri);
                return { rawText: '', extractedData: {}, confidence: 0 };
            }

            // Read as base64 to avoid encoding errors (PDF is binary)
            const base64 = await file.base64();
            const buffer = Buffer.from(base64, 'base64');
            // Convert to binary string to preserve raw PDF commands for regex
            const rawContent = buffer.toString('binary');

            let extractedText = '';

            /* 1. Try robust parsing with pdf-parse (handles compressed PDFs)
            if (pdfParse) {
                try {
                    console.log('[OCRService] Attempting pdf-parse...');
                    const data = await pdfParse(buffer);
                    if (data && data.text) {
                        extractedText = data.text;
                        console.log('[OCRService] pdf-parse success, text length:', extractedText.length);
                    }
                } catch (parseError) {
                    console.warn('[OCRService] pdf-parse failed, falling back to regex:', parseError);
                }
            }
            */

            // 2. Fallback: Binary regex extraction
            if (!extractedText) { // Only use fallback if pdf-parse didn't extract anything
                extractedText = this.extractTextFromPdfRaw(rawContent);
            }

            const extractedData = this.parseText(extractedText);

            // Validate result
            const hasData = extractedText.length > 20 || Object.keys(extractedData).length > 0;

            return {
                rawText: extractedText,
                extractedData,
                confidence: hasData ? 0.7 : 0.1,
            };
        } catch (error) {
            console.error('PDF Scan Error:', error);
            // Fallback for permissions
            return { rawText: '', extractedData: {}, confidence: 0 };
        }
    }

    /**
     * Extract text from DOCX files using mammoth and new File API
     */
    static async scanDocx(uri: string): Promise<OCRResult> {
        if (!mammoth) return { rawText: '', extractedData: {}, confidence: 0 };

        try {
            const file = new File(uri);
            if (!file.exists) {
                return { rawText: '', extractedData: {}, confidence: 0 };
            }

            // Mammoth needs ArrayBuffer usually, but base64 works with buffer shim
            // Try reading as base64 using new API
            // Note: The method might be base64Async or similar. Assuming .base64() based on text().
            // If .base64() is not available, we might need bytes() which returns Uint8Array.

            // Checking common new API patterns: text(), json(), bytes(), base64().
            // Let's try base64()
            const base64 = await file.base64();
            const buffer = Buffer.from(base64, 'base64');

            const result = await mammoth.extractRawText({ buffer });
            const rawText = result.value;
            const extractedData = this.parseText(rawText);

            return {
                rawText,
                extractedData,
                confidence: 0.9,
            };
        } catch (error) {
            console.error('DOCX Scan Error:', error);
            return { rawText: '', extractedData: {}, confidence: 0 };
        }
    }

    /**
     * Simple regex-based PDF text extractor (fallback)
     */
    private static extractTextFromPdfRaw(content: string): string {
        // Look for text within parentheses (PDF literal strings)
        // e.g. (Hello World)Tj
        const textMatches = content.match(/\((.*?)\)/g);
        if (textMatches) {
            // common PDF metadata/font keywords to ignore
            const ignorePattern = /Adobe|Identity|Font|Type\s*\d|CID|Designer|Experience|Generated|XML|XMP|Arial|Times|Courier|Helvetica|Frutiger|LiveCycle/i;

            return textMatches
                .map(m => m.slice(1, -1))
                // Filter out likely binary/garbage data
                .filter(text =>
                    /^[\w\s.,;:!@#$%^&*()_\-+=İıŞşĞğÜüÖöÇç]+$/.test(text) &&
                    text.length > 2 &&
                    !ignorePattern.test(text)
                )
                .join(' ');
        }
        return '';
    }

    /**
     * Parse raw text to extract structured data
     */
    private static parseText(text: string): OCRResult['extractedData'] {
        const lines = text.split('\n').filter(line => line.trim());
        const type = this.detectType(text);

        let title = this.extractTitle(lines);

        // Safety check separate from extractTitle to handle full logic
        if (title) {
            // Check for garbage density
            const garbageCount = (title.match(/[^\w\s.,İıŞşĞğÜüÖöÇç\-]/g) || []).length;
            if (garbageCount > title.length * 0.3) {
                title = undefined;
            }
            // Check for System ID / Database Keys (e.g. INTERNET_SUBE_DEKONT_INT_TR_EN)
            // If it's all uppercase (mostly) and contains underscores, it's likely a system key
            else if (title.includes('_') && title.toUpperCase() === title && title.length > 10) {
                title = undefined;
            }
        }

        return {
            title,
            amount: this.extractAmount(text),
            currency: this.extractCurrency(text),
            date: this.extractDate(text),
            type,
            details: this.extractDetailsByType(text, type),
        };
    }

    /**
     * Extract title (usually first meaningful line or merchant name)
     */
    private static extractTitle(lines: string[]): string | undefined {
        // Skip very short lines, look for store/merchant name
        for (const line of lines.slice(0, 5)) {
            const cleaned = line.trim();
            // Skip lines that are mostly numbers or very short
            if (cleaned.length >= 3 && !/^\d+[.,]?\d*$/.test(cleaned)) {
                return cleaned;
            }
        }
        return lines[0]?.trim();
    }

    /**
     * Extract amount using regex patterns
     */
    private static extractAmount(text: string): number | undefined {
        // Common patterns: $12.50, 12,50 €, TOTAL: 25.00, etc.
        const patterns = [
            /(?:total|toplam|tutar|amount|genel\s*toplam)[:\s]*[₺$€£]?\s*([\d.,]+)/i, // Label + Amount
            /[₺$€£]\s*([\d.,]+)/g, // Symbol + Amount
            /(?:[\d.,]+)\s*[₺$€£]/g, // Amount + Symbol
            /([\d.,]+)\s*(?:TL|TRY|USD|EUR|GBP)/i, // Amount + Currency Text
            /([\d]+[.,][\d]{2})(?:\s|$)/g, // Just number with decimals (risky, keep last)
        ];

        for (const pattern of patterns) {
            const matches = text.match(pattern);
            if (matches && matches.length > 0) {
                // Get the last match (usually the total at the bottom)
                const lastMatch = matches[matches.length - 1];
                // Extract just the number
                const numMatch = lastMatch.match(/[\d.,]+/);
                if (numMatch) {
                    // Handle both comma and dot as decimal separator
                    const numStr = numMatch[0].replace(',', '.');
                    // Handle "1.234,50" -> "1234.50" case
                    // If multiple dots/commas, simplistic approach: keep last separator as decimal
                    const cleanNumStr = this.normalizeNumberString(numMatch[0]);
                    const amount = parseFloat(cleanNumStr);
                    if (!isNaN(amount) && amount > 0) {
                        return amount;
                    }
                }
            }
        }
        return undefined;
    }

    /**
     * Normalize number string with mixed separators (e.g. 1.250,50 -> 1250.50)
     */
    private static normalizeNumberString(str: string): string {
        // If contains both . and ,
        if (str.includes('.') && str.includes(',')) {
            // Assume the last one is the decimal separator
            const lastDot = str.lastIndexOf('.');
            const lastComma = str.lastIndexOf(',');
            if (lastComma > lastDot) {
                // Comma is decimal (1.250,50) -> remove dots, replace comma with dot
                return str.replace(/\./g, '').replace(',', '.');
            } else {
                // Dot is decimal (1,250.50) -> remove commas
                return str.replace(/,/g, '');
            }
        }
        // If only comma, usually decimal in TR (12,50) -> 12.50
        if (str.includes(',')) {
            return str.replace(',', '.');
        }
        return str;
    }

    /**
     * Detect currency from text
     */
    private static extractCurrency(text: string): string | undefined {
        if (text.includes('₺') || /TL|TRY/i.test(text)) return 'TRY';
        if (text.includes('$') || /USD/i.test(text)) return 'USD';
        if (text.includes('€') || /EUR/i.test(text)) return 'EUR';
        if (text.includes('£') || /GBP/i.test(text)) return 'GBP';
        return 'TRY'; // Default for Turkish receipts
    }

    /**
     * Extract date from text
     */
    private static extractDate(text: string): string | undefined {
        // Prioritize "Tarih: DD.MM.YYYY" pattern
        const strictPatterns = [
            /(?:tarih|date)[:\s]*(\d{2}[./-]\d{2}[./-]\d{4})/i,
            /(?:tarih|date)[:\s]*(\d{4}[./-]\d{2}[./-]\d{2})/i,
        ];

        for (const pattern of strictPatterns) {
            const match = text.match(pattern);
            if (match) {
                return this.normalizeDate(match[1]);
            }
        }

        // Fallback to general date patterns
        const patterns = [
            /(\d{2}[./-]\d{2}[./-]\d{4})/,  // DD/MM/YYYY or DD.MM.YYYY
            /(\d{4}[./-]\d{2}[./-]\d{2})/,  // YYYY-MM-DD
            /(\d{2}[./-]\d{2}[./-]\d{2})/,  // DD/MM/YY
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                try {
                    return this.normalizeDate(match[1]);
                } catch (e) {
                    continue;
                }
            }
        }
        return undefined;
    }

    /**
     * Normalize date to ISO format
     */
    private static normalizeDate(dateStr: string): string {
        const parts = dateStr.split(/[./-]/);
        if (parts.length === 3) {
            let year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
            // Assume DD/MM/YYYY format for Turkish dates
            if (parseInt(parts[0]) <= 31 && parseInt(parts[1]) <= 12) {
                return new Date(`${year}-${parts[1]}-${parts[0]}`).toISOString();
            }
            // Try YYYY-MM-DD format
            if (parts[0].length === 4) {
                return new Date(dateStr).toISOString();
            }
        }
        return new Date().toISOString();
    }

    /**
     * Detect attachment type based on keywords
     */
    private static detectType(text: string): string | undefined {
        const lowerText = text.toLowerCase();

        // Warranty keywords (Turkish and English)
        if (/garanti|warranty|güvence|garanti belgesi|garanti süresi/i.test(lowerText)) {
            return 'warranty';
        }

        // Insurance keywords
        if (/sigorta|insurance|poliçe|police|trafik sigortası|kasko/i.test(lowerText)) {
            return 'insurance';
        }

        // Contract keywords
        if (/sözleşme|contract|anlaşma|mukavele/i.test(lowerText)) {
            return 'contract';
        }

        // Subscription keywords
        if (/abonelik|subscription|üyelik|membership/i.test(lowerText)) {
            return 'subscription';
        }

        // Medical keywords
        if (/rapor|sağlık|hastane|hospital|medical|doktor|doctor|muayene/i.test(lowerText)) {
            return 'medical_report';
        }

        // Prescription keywords
        if (/reçete|prescription|ilaç|eczane|pharmacy/i.test(lowerText)) {
            return 'prescription';
        }

        // Vehicle document keywords
        if (/ruhsat|trafik|araç|vehicle|plaka|muayene|egzoz/i.test(lowerText)) {
            return 'vehicle_document';
        }

        // Invoice keywords
        if (/fatura|invoice|fattura|e-fatura/i.test(lowerText)) {
            return 'invoice';
        }

        // Bill keywords
        if (/elektrik|su|doğalgaz|internet|telefon|fatura/i.test(lowerText)) {
            return 'bill';
        }

        // Slip/receipt keywords
        if (/slip|fiş|dekont|makbuz|tahsilat|ödeme/i.test(lowerText)) {
            return 'slip';
        }

        // Default to receipt
        return 'receipt';
    }

    /**
     * Extract type-specific details from text
     */
    private static extractDetailsByType(text: string, type?: string): Record<string, any> {
        if (!type) return {};

        switch (type) {
            case 'warranty':
                return this.extractWarrantyDetails(text);
            case 'insurance':
                return this.extractInsuranceDetails(text);
            case 'vehicle_document':
                return this.extractVehicleDetails(text);
            case 'contract':
                return this.extractContractDetails(text);
            case 'subscription':
                return this.extractSubscriptionDetails(text);
            case 'medical_report':
            case 'prescription':
                return this.extractMedicalDetails(text);
            default:
                return {};
        }
    }

    /**
     * Extract warranty-specific details
     */
    private static extractWarrantyDetails(text: string): Record<string, any> {
        const details: Record<string, any> = {};

        // Extract warranty duration (e.g., "2 yıl garanti", "24 ay")
        const durationMatch = text.match(/(\d+)\s*(yıl|yil|year|ay|month)/i);
        if (durationMatch) {
            const value = parseInt(durationMatch[1]);
            const unit = durationMatch[2].toLowerCase();
            if (unit.includes('yıl') || unit.includes('yil') || unit.includes('year')) {
                details.warrantyDuration = value * 12; // Convert to months
            } else {
                details.warrantyDuration = value;
            }
            details.warrantyDurationUnit = 'month';

            // Calculate end date
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + details.warrantyDuration);
            details.warrantyEndDate = endDate.toISOString();
        }

        // Extract serial number patterns
        const serialMatch = text.match(/(?:seri\s*(?:no|numarası)?|serial\s*(?:no|number)?|s\/n)[:\s]*([A-Z0-9-]{5,})/i);
        if (serialMatch) {
            details.serialNumber = serialMatch[1].trim();
        }

        // Extract product name (line after "ürün" or "product")
        const productMatch = text.match(/(?:ürün|product|model)[:\s]*([^\n]+)/i);
        if (productMatch) {
            details.productName = productMatch[1].trim();
        }

        // Extract warranty provider/brand
        const providerMatch = text.match(/(?:marka|brand|firma|şirket)[:\s]*([^\n]+)/i);
        if (providerMatch) {
            details.warrantyProvider = providerMatch[1].trim();
        }

        return details;
    }

    /**
     * Extract insurance-specific details
     */
    private static extractInsuranceDetails(text: string): Record<string, any> {
        const details: Record<string, any> = {};

        // Extract policy number
        const policyMatch = text.match(/(?:poliçe\s*(?:no|numarası)?|policy\s*(?:no|number)?)[:\s]*([A-Z0-9-]+)/i);
        if (policyMatch) {
            details.policyNumber = policyMatch[1].trim();
        }

        // Extract insurance company
        const companyPatterns = [
            /(?:sigorta\s*şirketi|insurance\s*company)[:\s]*([^\n]+)/i,
            /([\w\s]+)\s*sigorta/i,
            /(allianz|axa|aksigorta|anadolu sigorta|ergo|mapfre|groupama|hdi|sompo|ray sigorta|turk nippon)/i,
        ];
        for (const pattern of companyPatterns) {
            const match = text.match(pattern);
            if (match) {
                details.provider = match[1].trim();
                break;
            }
        }

        // Extract expiry date
        const expiryMatch = text.match(/(?:bitiş|son\s*geçerlilik|vade\s*sonu|expiry|valid\s*until)[:\s]*(\d{2}[./-]\d{2}[./-]\d{4})/i);
        if (expiryMatch) {
            details.expiryDate = this.normalizeDate(expiryMatch[1]);
        }

        return details;
    }

    /**
     * Extract vehicle-specific details
     */
    private static extractVehicleDetails(text: string): Record<string, any> {
        const details: Record<string, any> = {};

        // Extract license plate (Turkish format: 34 ABC 123 or 34ABC123)
        const plateMatch = text.match(/\b(\d{2}\s*[A-Z]{1,3}\s*\d{2,4})\b/i);
        if (plateMatch) {
            details.vehiclePlate = plateMatch[1].replace(/\s+/g, ' ').toUpperCase();
        }

        // Extract vehicle model/brand
        const modelPatterns = [
            /(?:marka|model|araç)[:\s]*([^\n]+)/i,
            /(toyota|honda|ford|volkswagen|bmw|mercedes|audi|renault|fiat|hyundai|kia|nissan|peugeot|citroen|opel|skoda|seat|volvo|mazda|suzuki|mitsubishi|dacia)\s*([^\n,]+)?/i,
        ];
        for (const pattern of modelPatterns) {
            const match = text.match(pattern);
            if (match) {
                details.vehicleModel = (match[1] + (match[2] || '')).trim();
                break;
            }
        }

        // Extract expiry date for inspection/registration
        const expiryMatch = text.match(/(?:geçerlilik|muayene|son\s*tarih)[:\s]*(\d{2}[./-]\d{2}[./-]\d{4})/i);
        if (expiryMatch) {
            details.expiryDate = this.normalizeDate(expiryMatch[1]);
        }

        return details;
    }

    /**
     * Extract contract-specific details
     */
    private static extractContractDetails(text: string): Record<string, any> {
        const details: Record<string, any> = {};

        // Extract contract number
        const contractMatch = text.match(/(?:sözleşme\s*(?:no|numarası)?|contract\s*(?:no|number)?)[:\s]*([A-Z0-9-]+)/i);
        if (contractMatch) {
            details.contractNumber = contractMatch[1].trim();
        }

        // Extract party name
        const partyMatch = text.match(/(?:taraf|party|müşteri|customer|alıcı|satıcı)[:\s]*([^\n]+)/i);
        if (partyMatch) {
            details.party = partyMatch[1].trim();
        }

        // Extract start and end dates
        const startMatch = text.match(/(?:başlangıç|start\s*date)[:\s]*(\d{2}[./-]\d{2}[./-]\d{4})/i);
        if (startMatch) {
            details.startDate = this.normalizeDate(startMatch[1]);
        }

        const endMatch = text.match(/(?:bitiş|end\s*date|son\s*tarih)[:\s]*(\d{2}[./-]\d{2}[./-]\d{4})/i);
        if (endMatch) {
            details.endDate = this.normalizeDate(endMatch[1]);
        }

        return details;
    }

    /**
     * Extract subscription-specific details
     */
    private static extractSubscriptionDetails(text: string): Record<string, any> {
        const details: Record<string, any> = {};

        // Extract provider/service name
        const providerPatterns = [
            /(?:sağlayıcı|provider|hizmet)[:\s]*([^\n]+)/i,
            /(netflix|spotify|youtube|apple|amazon|disney|hbo|turkcell|vodafone|türk telekom|superonline)/i,
        ];
        for (const pattern of providerPatterns) {
            const match = text.match(pattern);
            if (match) {
                details.provider = match[1].trim();
                break;
            }
        }

        // Extract renewal type
        const renewalMatch = text.match(/(?:yenileme|renewal|dönem)[:\s]*(aylık|yıllık|monthly|yearly|annual)/i);
        if (renewalMatch) {
            details.renewalType = renewalMatch[1].trim();
        }

        // Extract end date
        const endMatch = text.match(/(?:bitiş|son\s*tarih|expiry|valid\s*until)[:\s]*(\d{2}[./-]\d{2}[./-]\d{4})/i);
        if (endMatch) {
            details.subscriptionEndDate = this.normalizeDate(endMatch[1]);
        }

        return details;
    }

    /**
     * Extract medical-specific details
     */
    private static extractMedicalDetails(text: string): Record<string, any> {
        const details: Record<string, any> = {};

        // Extract doctor name
        const doctorMatch = text.match(/(?:dr\.?|doktor|doctor|uzm\.?|prof\.?)[:\s]*([^\n,]+)/i);
        if (doctorMatch) {
            details.doctorName = doctorMatch[1].trim();
        }

        // Extract hospital/clinic name
        const hospitalPatterns = [
            /(?:hastane|hospital|klinik|clinic|sağlık\s*merkezi)[:\s]*([^\n]+)/i,
            /([\w\s]+)\s*(?:hastanesi|hospital|klinik|tıp\s*merkezi)/i,
        ];
        for (const pattern of hospitalPatterns) {
            const match = text.match(pattern);
            if (match) {
                details.hospital = match[1].trim();
                break;
            }
        }

        // Extract diagnosis (for prescriptions, look for diagnosis section)
        const diagnosisMatch = text.match(/(?:tanı|teşhis|diagnosis)[:\s]*([^\n]+)/i);
        if (diagnosisMatch) {
            details.diagnosis = diagnosisMatch[1].trim();
        }

        return details;
    }
}
