
import { WebSessionService } from '@/src/infrastructure/api/generated/services/WebSessionService';

export interface WebSession {
    id: string;
    deviceName: string;
    deviceType: string;
    browser: string;
    os: string;
    ipAddress: string;
    lastActiveAt: string;
    createdAt: string;
}

export const WebSessionRepository = {
    /**
     * Confirms a QR code session to log in the web client
     */
    async confirmSession(sessionCode: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await WebSessionService.postWebQrConfirm({ sessionCode });
            return {
                success: response.success ?? false,
                message: response.message
            };
        } catch (error) {
            console.error('Confirm session error:', error);
            throw error;
        }
    },

    /**
     * Gets list of active web sessions
     */
    async getSessions(): Promise<WebSession[]> {
        try {
            const response = await WebSessionService.getWebSessions();
            if (!response.sessions) return [];

            return response.sessions.map(session => ({
                id: session.id ?? '',
                deviceName: session.deviceName ?? 'Unknown Device',
                deviceType: session.deviceType ?? 'web',
                browser: session.browser ?? '',
                os: session.os ?? '',
                ipAddress: session.ipAddress ?? '',
                lastActiveAt: session.lastActiveAt ?? new Date().toISOString(),
                createdAt: session.createdAt ?? new Date().toISOString()
            }));
        } catch (error) {
            console.error('Get sessions error:', error);
            throw error;
        }
    },

    /**
     * Revokes a specific session (logout remote device)
     */
    async revokeSession(sessionId: string): Promise<void> {
        try {
            await WebSessionService.deleteWebSessions(sessionId);
        } catch (error) {
            console.error('Revoke session error:', error);
            throw error;
        }
    },

    /**
     * Revokes all sessions except the current one (optional)
     */
    async revokeAllSessions(exceptSessionId?: string): Promise<{ count: number }> {
        try {
            const response = await WebSessionService.postWebSessionsRevokeAll({ exceptSessionId });
            return { count: response.count ?? 0 };
        } catch (error) {
            console.error('Revoke all sessions error:', error);
            throw error;
        }
    }
};
