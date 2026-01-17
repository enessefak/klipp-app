import { DashboardService } from "@/src/infrastructure/api/generated/services/DashboardService";
import { DashboardData } from "../domain/Dashboard";

export class DashboardRepository {
    static async getDashboardStats(): Promise<DashboardData> {
        const response = await DashboardService.getDashboardStats();

        if (!response.data) {
            throw new Error('No dashboard data received');
        }

        return {
            overview: response.data.overview,
            folders: response.data.folders.map(f => ({
                ...f,
                summary: f.summary ? {
                    ...f.summary,
                    totalIncome: Number(f.summary.totalIncome || 0),
                    totalExpense: Number(f.summary.totalExpense || 0),
                    netBalance: Number(f.summary.netBalance || 0),
                } : null
            })),
            recentActivity: (response.data.recentActivity || []).map(a => ({
                ...a,
                amount: a.amount ? Number(a.amount) : undefined
            }))
        };
    }
}
