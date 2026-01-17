
import { EFaturaService } from '@/src/infrastructure/api/generated/services/EFaturaService';
import { EInvoice, EInvoiceDirection, EInvoiceStatus, SendEInvoiceDTO } from '../domain/EInvoice';

export class EInvoiceRepository {

    static async sendInvoice(attachmentId: string, dtoi: SendEInvoiceDTO): Promise<{ success: boolean; data?: any }> {
        const response = await EFaturaService.postEInvoicesSend(attachmentId, dtoi);
        return { success: response.success || false, data: response.data };
    }

    static async getStatus(eInvoiceId: string): Promise<EInvoice> {
        const response = await EFaturaService.getEInvoicesStatus(eInvoiceId);
        if (!response.data) throw new Error('Invoice not found');
        return response.data as unknown as EInvoice;
    }

    static async getInvoices(
        folderId: string,
        params: {
            direction?: EInvoiceDirection;
            status?: EInvoiceStatus;
            limit?: number;
            cursor?: string
        } = {}
    ): Promise<{ data: EInvoice[]; nextCursor?: string }> {
        const response = await EFaturaService.getEInvoicesFolder(
            folderId,
            params.direction as any,
            params.status as any,
            params.limit,
            params.cursor
        );
        return {
            data: (response.data || []) as unknown as EInvoice[],
            nextCursor: response.nextCursor || undefined
        };
    }

    static async downloadXml(eInvoiceId: string): Promise<any> {
        return await EFaturaService.getEInvoicesDownload(eInvoiceId);
    }
}
