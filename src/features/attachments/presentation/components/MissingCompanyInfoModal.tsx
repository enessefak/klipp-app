
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { UserService } from '@/src/infrastructure/api/generated/services/UserService';
import i18n from '@/src/infrastructure/localization/i18n';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface MissingCompanyInfoModalProps {
    visible: boolean;
    onClose: () => void;
    missingFields?: string[];
    onSuccess: () => void;
    description?: string;
}

export const MissingCompanyInfoModal: React.FC<MissingCompanyInfoModalProps> = ({ visible, onClose, missingFields = [], onSuccess, description }) => {
    const { colors } = useSettings();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        taxNumber: '',
        taxOffice: '',
        city: '',
        address: ''
    });

    useEffect(() => {
        if (visible) {
            loadUserData();
        }
    }, [visible]);

    const loadUserData = async () => {
        try {
            setLoading(true);
            const response = await UserService.getUsersMe();
            if (response.success && response.data) {
                setFormData({
                    name: response.data.name || '',
                    taxNumber: response.data.taxNumber || '',
                    taxOffice: response.data.taxOffice || '',
                    city: response.data.city || '',
                    address: response.data.address || ''
                });
            }
        } catch (error) {
            console.error('Failed to load user data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.city || !formData.address) {
            Alert.alert(i18n.t('common.error'), i18n.t('common.requiredFields'));
            return;
        }

        try {
            setLoading(true);
            await UserService.patchUsersMe(formData);
            Alert.alert(i18n.t('common.success'), i18n.t('profile.updateSuccess') || "Profile updated");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Update failed', error);
            Alert.alert(i18n.t('common.error'), error.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.centeredView}
            >
                <View style={[styles.modalView, { backgroundColor: colors.card }]}>
                    <View style={styles.header}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            {i18n.t('profile.company.title') || "Company Information"}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.description, { color: colors.textSecondary }]}>
                        {description || i18n.t('common.export_missing_company_info_desc') || "Please complete missing information to export."}
                    </Text>

                    {missingFields.length > 0 && (
                        <View style={styles.missingContainer}>
                            <Text style={styles.missingLabel}>{i18n.t('common.missing')}: </Text>
                            <Text style={styles.missingText}>{missingFields.join(', ')}</Text>
                        </View>
                    )}

                    <ScrollView style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>{i18n.t('profile.company.fields.name') || "Name / Company Name"}</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="Acme Corp"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={[styles.label, { color: colors.text }]}>{i18n.t('profile.company.fields.taxNumber') || "Tax ID"}</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                    value={formData.taxNumber}
                                    onChangeText={(text) => setFormData({ ...formData, taxNumber: text })}
                                    keyboardType="numeric"
                                    placeholder="1234567890"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                <Text style={[styles.label, { color: colors.text }]}>{i18n.t('profile.company.fields.taxOffice') || "Tax Office"}</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                    value={formData.taxOffice}
                                    onChangeText={(text) => setFormData({ ...formData, taxOffice: text })}
                                    placeholder="Maslak"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>{i18n.t('profile.company.fields.city') || "City"}</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                value={formData.city}
                                onChangeText={(text) => setFormData({ ...formData, city: text })}
                                placeholder="Istanbul"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>{i18n.t('profile.company.fields.address') || "Address"}</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background, height: 80 }]}
                                value={formData.address}
                                onChangeText={(text) => setFormData({ ...formData, address: text })}
                                multiline
                                placeholder="Full Address"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>
                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        <Text style={styles.saveButtonText}>
                            {loading ? i18n.t('common.processing') : i18n.t('common.actions.save')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '90%',
        width: '100%',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        marginBottom: 15,
    },
    missingContainer: {
        flexDirection: 'row',
        backgroundColor: '#FEE2E2',
        padding: 8,
        borderRadius: 4,
        marginBottom: 15,
    },
    missingLabel: {
        color: '#EF4444',
        fontWeight: 'bold',
        fontSize: 12,
    },
    missingText: {
        color: '#EF4444',
        fontSize: 12,
    },
    formContainer: {
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
    },
    saveButton: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
