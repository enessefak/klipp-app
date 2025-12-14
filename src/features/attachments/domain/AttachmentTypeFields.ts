import { AttachmentTypeIds } from './Attachment';

export type FieldType = 'text' | 'number' | 'date' | 'currency' | 'textarea' | 'duration';

export interface FieldConfig {
    key: string;
    label: string;
    type: FieldType;
    required?: boolean;
    placeholder?: string;
    unit?: string; // For duration fields (day, month, year)
}

/**
 * Strategy pattern for attachment type-specific fields
 */
export interface AttachmentTypeFieldStrategy {
    getFields(): FieldConfig[];
    getDefaultDetails(): Record<string, any>;
}

class WarrantyFieldStrategy implements AttachmentTypeFieldStrategy {
    getFields(): FieldConfig[] {
        return [
            { key: 'warrantyDuration', label: 'Garanti Süresi', type: 'duration', required: true, unit: 'month' },
            { key: 'warrantyEndDate', label: 'Garanti Bitiş Tarihi', type: 'date', required: true },
            { key: 'warrantyProvider', label: 'Garanti Veren', type: 'text', placeholder: 'Firma adı' },
            { key: 'serialNumber', label: 'Seri No', type: 'text', placeholder: 'Ürün seri numarası' },
            { key: 'productName', label: 'Ürün Adı', type: 'text', placeholder: 'Ürün adı' },
        ];
    }

    getDefaultDetails(): Record<string, any> {
        // Default 2 years warranty
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 2);
        return {
            warrantyEndDate: endDate.toISOString(),
            warrantyDuration: 24,
            warrantyDurationUnit: 'month'
        };
    }
}

class SubscriptionFieldStrategy implements AttachmentTypeFieldStrategy {
    getFields(): FieldConfig[] {
        return [
            { key: 'subscriptionEndDate', label: 'Abonelik Bitiş Tarihi', type: 'date', required: true },
            { key: 'renewalType', label: 'Yenileme Tipi', type: 'text', placeholder: 'Aylık, Yıllık vb.' },
            { key: 'provider', label: 'Sağlayıcı', type: 'text', placeholder: 'Hizmet sağlayıcı' },
        ];
    }

    getDefaultDetails(): Record<string, any> {
        return { subscriptionEndDate: new Date().toISOString() };
    }
}

class InsuranceFieldStrategy implements AttachmentTypeFieldStrategy {
    getFields(): FieldConfig[] {
        return [
            { key: 'policyNumber', label: 'Poliçe Numarası', type: 'text', required: true },
            { key: 'expiryDate', label: 'Son Geçerlilik Tarihi', type: 'date', required: true },
            { key: 'provider', label: 'Sigorta Şirketi', type: 'text', required: true },
            { key: 'coverage', label: 'Teminat', type: 'textarea', placeholder: 'Kapsanan durumlar' },
        ];
    }

    getDefaultDetails(): Record<string, any> {
        return { expiryDate: new Date().toISOString() };
    }
}

class VehicleDocumentFieldStrategy implements AttachmentTypeFieldStrategy {
    getFields(): FieldConfig[] {
        return [
            { key: 'vehiclePlate', label: 'Plaka', type: 'text', placeholder: '34 ABC 123' },
            { key: 'vehicleModel', label: 'Araç Modeli', type: 'text', placeholder: 'Marka ve model' },
            { key: 'expiryDate', label: 'Son Geçerlilik Tarihi', type: 'date' },
        ];
    }

    getDefaultDetails(): Record<string, any> {
        return {};
    }
}

class ContractFieldStrategy implements AttachmentTypeFieldStrategy {
    getFields(): FieldConfig[] {
        return [
            { key: 'contractNumber', label: 'Sözleşme No', type: 'text' },
            { key: 'startDate', label: 'Başlangıç Tarihi', type: 'date' },
            { key: 'endDate', label: 'Bitiş Tarihi', type: 'date' },
            { key: 'party', label: 'Taraf', type: 'text', placeholder: 'Karşı taraf adı' },
        ];
    }

    getDefaultDetails(): Record<string, any> {
        return {};
    }
}

class MedicalFieldStrategy implements AttachmentTypeFieldStrategy {
    getFields(): FieldConfig[] {
        return [
            { key: 'doctorName', label: 'Doktor Adı', type: 'text' },
            { key: 'hospital', label: 'Hastane/Klinik', type: 'text' },
            { key: 'diagnosis', label: 'Teşhis', type: 'textarea' },
        ];
    }

    getDefaultDetails(): Record<string, any> {
        return {};
    }
}

class DefaultFieldStrategy implements AttachmentTypeFieldStrategy {
    getFields(): FieldConfig[] {
        return [];
    }

    getDefaultDetails(): Record<string, any> {
        return {};
    }
}

class CheckFieldStrategy implements AttachmentTypeFieldStrategy {
    getFields(): FieldConfig[] {
        return [
            { key: 'bankName', label: 'Banka Adı', type: 'text', required: true },
            { key: 'checkNumber', label: 'Çek Numarası', type: 'text', required: true },
            { key: 'drawer', label: 'Keşideci', type: 'text', placeholder: 'Çeki düzenleyen kişi/kurum' },
            { key: 'dueDate', label: 'Vade Tarihi', type: 'date', required: true },
        ];
    }

    getDefaultDetails(): Record<string, any> {
        return { dueDate: new Date().toISOString() };
    }
}

class BankSlipFieldStrategy implements AttachmentTypeFieldStrategy {
    getFields(): FieldConfig[] {
        return [
            { key: 'bankName', label: 'Banka Adı', type: 'text', required: true },
            { key: 'accountNumber', label: 'Hesap No / IBAN', type: 'text' },
            { key: 'sender', label: 'Gönderen', type: 'text' },
            { key: 'receiver', label: 'Alıcı', type: 'text' },
            { key: 'transferDate', label: 'İşlem Tarihi', type: 'date' },
        ];
    }

    getDefaultDetails(): Record<string, any> {
        return { transferDate: new Date().toISOString() };
    }
}

/**
 * Factory for creating attachment type field strategies
 * Follows Factory and Strategy patterns
 */
export class AttachmentTypeFieldFactory {
    private static strategies: Map<string, AttachmentTypeFieldStrategy> = new Map([
        [AttachmentTypeIds.WARRANTY, new WarrantyFieldStrategy()],
        [AttachmentTypeIds.SUBSCRIPTION, new SubscriptionFieldStrategy()],
        [AttachmentTypeIds.INSURANCE, new InsuranceFieldStrategy()],
        [AttachmentTypeIds.VEHICLE_DOCUMENT, new VehicleDocumentFieldStrategy()],
        [AttachmentTypeIds.CONTRACT, new ContractFieldStrategy()],
        [AttachmentTypeIds.PRESCRIPTION, new MedicalFieldStrategy()],
        [AttachmentTypeIds.MEDICAL_REPORT, new MedicalFieldStrategy()],
        [AttachmentTypeIds.CHECK, new CheckFieldStrategy()],
        [AttachmentTypeIds.BANK_SLIP, new BankSlipFieldStrategy()],
    ]);

    static getStrategy(attachmentTypeId: string): AttachmentTypeFieldStrategy {
        return this.strategies.get(attachmentTypeId) || new DefaultFieldStrategy();
    }

    static getFields(attachmentTypeId: string): FieldConfig[] {
        return this.getStrategy(attachmentTypeId).getFields();
    }

    static getDefaultDetails(attachmentTypeId: string): Record<string, any> {
        return this.getStrategy(attachmentTypeId).getDefaultDetails();
    }
}
