import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import I18nLocal from '@/src/infrastructure/localization/i18n';
import RNDateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useMemo, useState } from 'react';
import { Modal, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button } from './Button';

interface DatePickerFieldProps {
    label?: string;
    value?: Date;
    onChange: (date: Date) => void;
    placeholder?: string;
    minimumDate?: Date;
    maximumDate?: Date;
    mode?: 'date' | 'time' | 'datetime';
    error?: string;
    containerStyle?: any;
}

export function DatePickerField({
    label,
    value,
    onChange,
    placeholder = 'Select Date',
    minimumDate,
    maximumDate,
    mode = 'date',
    error,
    containerStyle,
}: DatePickerFieldProps) {
    const { colors, language } = useSettings();
    const [showPicker, setShowPicker] = useState(false);

    // Initial value for picker if value is undefined
    const pickerValue = value || new Date();

    const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }

        if (selectedDate) {
            onChange(selectedDate);
        }
    };

    const confirmIOSDate = () => {
        setShowPicker(false);
    };

    const formattedDate = useMemo(() => {
        if (!value) return null;
        return value.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            ...(mode !== 'date' ? { hour: '2-digit', minute: '2-digit' } : {}),
        });
    }, [value, language, mode]);

    const styles = useMemo(() => StyleSheet.create({
        container: {
            marginBottom: 16,
            ...containerStyle,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
            marginLeft: 4,
        },
        button: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.inputBackground,
            borderWidth: 1,
            borderColor: error ? colors.error : colors.border,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            minHeight: 50,
        },
        icon: {
            marginRight: 10,
        },
        text: {
            fontSize: 16,
            color: colors.text,
            flex: 1,
        },
        placeholder: {
            fontSize: 16,
            color: colors.textLight,
            flex: 1,
        },
        errorText: {
            fontSize: 12,
            color: colors.error,
            marginTop: 4,
            marginLeft: 4,
        },
        // iOS Modal Styles
        iosModalContainer: {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)',
        },
        iosModalContent: {
            backgroundColor: colors.card,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 16,
            paddingBottom: 32,
        },
        iosHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        iosTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
        },
        picker: {
            height: 120,
            width: '100%',
        },
    }), [colors, error, containerStyle]);

    return (
        <View style={styles.container}>
            {label && <ThemedText style={styles.label}>{label}</ThemedText>}

            <TouchableOpacity
                style={styles.button}
                onPress={() => setShowPicker(true)}
                activeOpacity={0.7}
            >
                <IconSymbol name="calendar" size={20} color={colors.gray} style={styles.icon} />
                <ThemedText style={value ? styles.text : styles.placeholder}>
                    {formattedDate || placeholder}
                </ThemedText>
            </TouchableOpacity>

            {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

            {/* Platform Specific Piekcer Implementation */}
            {showPicker && (
                Platform.OS === 'ios' ? (
                    <Modal
                        transparent
                        animationType="fade"
                        visible={showPicker}
                        onRequestClose={() => setShowPicker(false)}
                    >
                        <TouchableOpacity
                            style={styles.iosModalContainer}
                            activeOpacity={1}
                            onPress={() => setShowPicker(false)}
                        >
                            <TouchableOpacity activeOpacity={1} style={styles.iosModalContent}>
                                <View style={styles.iosHeader}>
                                    <View style={{ width: 60 }} />
                                    <ThemedText style={styles.iosTitle}>
                                        {label || placeholder}
                                    </ThemedText>
                                    <Button
                                        title={I18nLocal.t('common.actions.ok')}
                                        onPress={confirmIOSDate}
                                        size="small"
                                        style={{ minWidth: 60, height: 32 }}
                                    />
                                </View>
                                <RNDateTimePicker
                                    value={pickerValue}
                                    mode={mode}
                                    display="spinner"
                                    onChange={handleChange}
                                    minimumDate={minimumDate}
                                    maximumDate={maximumDate}
                                    locale={language === 'tr' ? 'tr-TR' : 'en-US'}
                                    themeVariant={colors.white === '#FFFFFF' ? 'light' : 'dark'}
                                    style={styles.picker}
                                    textColor={colors.text}
                                />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </Modal>
                ) : (
                    <RNDateTimePicker
                        value={pickerValue}
                        mode={mode}
                        display="default"
                        onChange={handleChange}
                        minimumDate={minimumDate}
                        maximumDate={maximumDate}
                    />
                )
            )}
        </View>
    );
}
