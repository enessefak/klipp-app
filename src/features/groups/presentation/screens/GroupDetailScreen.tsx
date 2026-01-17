import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { groupRepository } from '../../data/GroupRepository';
import { Group } from '../../domain/Group';

export default function GroupDetailScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [addingLoading, setAddingLoading] = useState(false);

    useEffect(() => {
        if (id) {
            loadGroup();
        }
    }, [id]);

    const loadGroup = async () => {
        try {
            setLoading(true);
            const data = await groupRepository.getGroupDetails(id);
            setGroup(data);
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'Grup detayları yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async () => {
        if (!newMemberEmail.trim()) return;

        try {
            setAddingLoading(true);
            await groupRepository.addMembers(id, [newMemberEmail.trim()]);
            setNewMemberEmail('');
            setIsAddingMember(false);
            loadGroup(); // Reload to see new member
            Alert.alert('Başarılı', 'Üye eklendi');
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'Üye eklenemedi');
        } finally {
            setAddingLoading(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        Alert.alert(
            'Üye Çıkar',
            'Bu üyeyi gruptan çıkarmak istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Çıkar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await groupRepository.removeMember(id, memberId);
                            loadGroup();
                        } catch (error) {
                            console.error(error);
                            Alert.alert('Hata', 'Üye çıkarılamadı');
                        }
                    }
                }
            ]
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: colors.headerBackground,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            justifyContent: 'space-between',
        },
        backButton: {
            marginRight: 16,
        },
        headerTitleContainer: {
            flex: 1,
        },
        scrollContent: {
            padding: 16,
        },
        card: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            flexDirection: 'row',
            alignItems: 'center',
        },
        groupIconLarge: {
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
        },
        groupStats: {
            flex: 1,
        },
        membersHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        addMemberButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.card,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
        },
        memberList: {
            backgroundColor: colors.card,
            borderRadius: 16,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.cardBorder,
        },
        memberItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        memberAvatar: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            borderWidth: 1,
            borderColor: colors.border,
        },
        memberAvatarText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.text,
        },
        memberInfo: {
            flex: 1,
        },
        memberName: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
        },
        memberEmail: {
            fontSize: 14,
            color: colors.textLight,
        },
        roleBadge: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            backgroundColor: colors.primary + '20',
            marginRight: 8,
        },
        roleText: {
            fontSize: 12,
            color: colors.primary,
            fontWeight: '600',
        },
        removeButton: {
            padding: 8,
        },
        // Add Member Input
        addMemberContainer: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.primary,
        },
        inputRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        input: {
            flex: 1,
            backgroundColor: colors.background,
            borderRadius: 8,
            padding: 10,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
        },
    });

    if (loading) {
        return (
            <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!group) {
        return (
            <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
                <ThemedText>Grup bulunamadı</ThemedText>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <ThemedText type="subtitle">{group.name}</ThemedText>
                </View>
                <TouchableOpacity onPress={() => {/* Settings? */ }}>
                    {/* <IconSymbol name="gear" size={24} color={colors.text} /> */}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Info Card */}
                <View style={styles.card}>
                    <View style={styles.groupIconLarge}>
                        <IconSymbol name="person.3.fill" size={32} color={colors.textLight} />
                    </View>
                    <View style={styles.groupStats}>
                        <ThemedText type="defaultSemiBold" style={{ fontSize: 18, marginBottom: 4 }}>{group.name}</ThemedText>
                        <ThemedText style={{ color: colors.textLight }}>{group.memberCount} Üye</ThemedText>
                    </View>
                </View>

                {/* Add Member Section */}
                {isAddingMember && (
                    <View style={styles.addMemberContainer}>
                        <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>Üye Ekle</ThemedText>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="E-posta adresi girin"
                                placeholderTextColor={colors.textLight}
                                value={newMemberEmail}
                                onChangeText={setNewMemberEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                            <TouchableOpacity
                                style={{ backgroundColor: colors.primary, padding: 10, borderRadius: 8 }}
                                onPress={handleAddMember}
                                disabled={addingLoading}
                            >
                                {addingLoading ? <ActivityIndicator color="#fff" size="small" /> : <IconSymbol name="plus" size={20} color="#fff" />}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ padding: 10 }}
                                onPress={() => setIsAddingMember(false)}
                            >
                                <IconSymbol name="xmark" size={20} color={colors.textLight} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Members List Header */}
                <View style={styles.membersHeader}>
                    <ThemedText type="subtitle">Üyeler ({group.members?.length || 0})</ThemedText>
                    {!isAddingMember && (
                        <TouchableOpacity style={styles.addMemberButton} onPress={() => setIsAddingMember(true)}>
                            <IconSymbol name="plus" size={16} color={colors.text} style={{ marginRight: 4 }} />
                            <ThemedText style={{ fontSize: 14, fontWeight: '500' }}>Üye Ekle</ThemedText>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Members List */}
                <View style={styles.memberList}>
                    {group.members?.map((member) => (
                        <View key={member.id || member.userId || member.email} style={styles.memberItem}>
                            <View style={styles.memberAvatar}>
                                <Text style={styles.memberAvatarText}>
                                    {(member.name || member.email || '?').charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.memberInfo}>
                                <Text style={styles.memberName}>{member.name || 'İsimsiz'}</Text>
                                <Text style={styles.memberEmail}>{member.email}</Text>
                            </View>
                            {member.role === 'ADMIN' && (
                                <View style={styles.roleBadge}>
                                    <Text style={styles.roleText}>Admin</Text>
                                </View>
                            )}
                            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveMember(member.id!)}>
                                <IconSymbol name="person.badge.minus" size={20} color={colors.textLight} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

            </ScrollView>

        </SafeAreaView>
    );
}
