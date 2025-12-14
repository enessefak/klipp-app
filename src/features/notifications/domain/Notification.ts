export type NotificationType = 
    | 'FOLDER_SHARE_INVITE' 
    | 'FOLDER_SHARE_ACCEPTED' 
    | 'FOLDER_SHARE_REJECTED' 
    | 'SYSTEM';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    referenceId: string | null;
    referenceType: string | null;
    isRead: boolean;
    data?: any;
    createdAt: string;
}

export interface NotificationResponse {
    items: Notification[];
    unreadCount: number;
}
