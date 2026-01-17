import i18n from '@/src/infrastructure/localization/i18n';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { groupRepository } from '../../data/GroupRepository';
import { Group } from '../../domain/Group';

export function useGroups() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchGroups = useCallback(async () => {
        try {
            setLoading(true);
            const data = await groupRepository.getGroups();
            setGroups(data);
        } catch (error) {
            console.error(error);
            Alert.alert(i18n.t('common.error'), i18n.t('groups.error_load') || 'Gruplar yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const refresh = useCallback(() => {
        setRefreshing(true);
        fetchGroups();
    }, [fetchGroups]);

    const createGroup = async (name: string) => {
        try {
            const newGroup = await groupRepository.createGroup(name);
            setGroups(prev => [newGroup, ...prev]);
            return newGroup;
        } catch (error) {
            console.error(error);
            Alert.alert(i18n.t('common.error'), i18n.t('groups.error_create') || 'Grup oluşturulamadı');
            throw error;
        }
    };

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    return {
        groups,
        loading,
        refreshing,
        refresh,
        createGroup,
    };
}
