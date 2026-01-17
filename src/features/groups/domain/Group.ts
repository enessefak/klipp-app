export interface GroupMember {
    id?: string;
    userId?: string;
    name: string | null;
    email: string;
    role?: string;
    joinedAt?: string;
}

export interface Group {
    id: string;
    name: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    memberCount: number;
    folderShareCount: number;
    members?: GroupMember[];
}
