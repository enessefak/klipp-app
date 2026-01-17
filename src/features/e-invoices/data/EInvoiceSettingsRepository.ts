import { EInvoiceSettingsService } from '@/src/infrastructure/api/generated/services/EInvoiceSettingsService';
import { EInvoiceSettings, UpdateEInvoiceSettingsDTO } from '../domain/EInvoiceSettings';

export class EInvoiceSettingsRepository {
    static async getSettings(folderId: string): Promise<EInvoiceSettings> {
        const response = await EInvoiceSettingsService.getEInvoiceSettings(folderId);
        return response.data;
    }

    static async updateSettings(folderId: string, dto: UpdateEInvoiceSettingsDTO): Promise<EInvoiceSettings> {
        const response = await EInvoiceSettingsService.putEInvoiceSettings(folderId, dto);
        return response.data as EInvoiceSettings;
    }

    static async deleteSettings(folderId: string): Promise<void> {
        await EInvoiceSettingsService.deleteEInvoiceSettings(folderId);
    }
}
