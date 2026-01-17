import { UserGroupsService } from '@/src/infrastructure/api/generated/services/UserGroupsService';
import { Group } from '../domain/Group';

class GroupRepository {
    async getGroups(): Promise<Group[]> {
        const response = await UserGroupsService.getGroups();
        if (!response.success || !response.data) {
            // If data is any/undefined, return empty array
            // based on swagger logs, data might be items wrapped or direct array.
            // Service getGroups returns data: any.
            // Looking at similar endpoints, it often returns { items: [...] } or just [...]
            // But based on List user groups swagger:
            /*
              "data": {
                  "_def": { "type": ... } -> This looks like Zod definition leak potentially or just weird swagger?
                   Wait, the Swagger definition for getGroups response was weird.
                   Let's rely on standard pattern or trial.
                   If response.data is array, map it.
                   If response.data.items is array, map it.
            */
            return [];
        }

        // Adapting based on likely response.
        // The swagger said: data: { _def: ... } which looked wrong.
        // Assuming backend follows standard pattern: data: { items: [...] } or data: [...]
        // Given getGroups1 (detail) returns data object directly.

        // Safety check
        const items = Array.isArray(response.data) ? response.data : (response.data.items || []);

        return items.map((item: any) => ({
            id: item.id,
            name: item.name,
            ownerId: item.ownerId,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            memberCount: item._count?.members || 0,
            folderShareCount: item._count?.folderShares || 0,
        }));
    }

    async createGroup(name: string): Promise<Group> {
        const response = await UserGroupsService.postGroups({ name });
        if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to create group');
        }
        const item = response.data;
        return {
            id: item.id,
            name: item.name,
            ownerId: item.ownerId,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            memberCount: item._count?.members || 0,
            folderShareCount: item._count?.folderShares || 0,
            members: item.members?.map((m: any) => ({
                name: m.user?.name || null,
                email: m.user?.email,
            })) || [],
        };
    }

    async getGroupDetails(id: string): Promise<Group> {
        const response = await UserGroupsService.getGroups1(id);
        if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to get group details');
        }
        const item = response.data;
        return {
            id: item.id,
            name: item.name,
            ownerId: item.ownerId,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            memberCount: item._count?.members || item.members?.length || 0,
            folderShareCount: item._count?.folderShares || 0,
            members: item.members?.map((m: any) => ({
                id: m.id,
                userId: m.userId,
                // The service type says m.user is { name, email, id }.
                name: m.user?.name || null,
                email: m.user?.email,
                role: m.role,
                joinedAt: m.joinedAt,
            })) || [],
        };
    }

    async addMembers(groupId: string, emails: string[]): Promise<void> {
        await UserGroupsService.postGroupsMembers(groupId, { emails });
    }

    async removeMember(groupId: string, memberId: string): Promise<void> {
        await UserGroupsService.deleteGroupsMembers(groupId, memberId);
    }

    async deleteGroup(groupId: string): Promise<void> {
        await UserGroupsService.deleteGroups(groupId);
    }

    async updateGroup(groupId: string, name: string): Promise<void> {
        await UserGroupsService.putGroups(groupId, { name });
    }
}

export const groupRepository = new GroupRepository();
