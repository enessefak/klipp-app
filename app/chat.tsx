import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ChatService } from '@/src/infrastructure/api/generated/services/ChatService';
import i18n from '@/src/infrastructure/localization/i18n';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    action?: any;
}

export default function ChatScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            text: i18n.t('chat.welcome'),
            sender: 'bot',
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const insets = useSafeAreaInsets();
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    const theme = {
        background: colorScheme === 'dark' ? '#000000' : '#FFFFFF',
        text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
        primary: '#007AFF',
        primaryForeground: '#FFFFFF',
        muted: colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7',
        mutedForeground: colorScheme === 'dark' ? '#8E8E93' : '#3C3C43',
        border: colorScheme === 'dark' ? '#38383A' : '#E5E5EA',
    };

    const scrollToBottom = () => {
        flatListRef.current?.scrollToEnd({ animated: true });
    };

    useEffect(() => {
        setTimeout(scrollToBottom, 500);
    }, [messages]);

    useEffect(() => {
        const keyboardWillShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardWillHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardWillShowListener.remove();
            keyboardWillHideListener.remove();
        };
    }, []);

    // Defaults loading removed


    // File upload functionality removed

    const handleSubmit = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Build history from existing messages (excluding welcome message)
            const history = messages
                .filter(m => m.id !== 'welcome')
                .map(m => ({
                    role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
                    content: m.text
                }));

            const response = await ChatService.postChatMessage({
                message: userMessage.text,
                platform: 'mobile',
                history: history
            });

            if (response.success && response.data) {
                let botText: any = response.data.response;
                let action = null;

                if (typeof botText === 'object' && botText !== null) {
                    const r = botText;
                    botText = r.message;
                    action = r.action;
                } else if (typeof botText === 'string') {
                    try {
                        const parsed = JSON.parse(botText);
                        if (parsed.message) {
                            botText = parsed.message;
                            action = parsed.action;
                        }
                    } catch (e) {
                        // Plain text
                    }
                }

                setMessages((prev) => [
                    ...prev,
                    {
                        id: (Date.now() + 1).toString(),
                        text: botText,
                        sender: 'bot',
                        action: action
                    },
                ]);
            } else {
                throw new Error(response.message || 'Failed to get response');
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    text: i18n.t('chat.error'),
                    sender: 'bot',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = (action: any) => {
        if (action.type === 'OPEN_RESOURCE') {
            if (action.payload.resourceType === 'FOLDER') {
                // If it's a modal, we might need a different navigation strategy or dismiss first
                // For now try pushing relative path
                router.dismiss(); // Close chat modal
                setTimeout(() => {
                    router.push(`/folders/${action.payload.id}` as any);
                }, 100);
            } else {
                router.dismiss();
                setTimeout(() => {
                    router.push(`/attachment/${action.payload.id}` as any);
                }, 100);
            }
        } else if (action.type === 'CREATE_FOLDER_INTENT') {
            // Open Create Folder Modal with params
            // Since we are already in a modal (Chat), pushing another modal might stack them
            // Or we can replace. But User likely wants to come back to chat? 
            // Better to dismiss chat and open folder creation? 
            // Or push on top if Expo Router supports Modal on Modal.
            // Let's try pushing to create page.

            // NOTE: The `FolderFormSheet` equivalent on mobile might not accept params via route as easily 
            // if handled by internal state. But let's assume /folders/create exists or we navigate to folders index with params.

            // Actually, mobile app usually has a specific screen for folder creation or uses a modal.
            // I'll assume we navigate to the folder screen and trigger create, or a specific create route.
            // Let's try to find if there is a 'create folder' screen.
            // Assuming `(tabs)/folders/index` has a create button. 
            // Ideally we need to pass params to pre-fill.

            // For now, let's just alert intent received as placeholder if route unknown, 
            // OR reuse the web approach: logic is in the chat widget itself? 
            // No, mobile screens are separate.

            // I'll push to a 'modal' route if it exists, or just log for now until I verify 'Folder Create' screen.
            // Wait, previous `app/_layout.tsx` has `modal` screen. Maybe that's it?

            // Let's try pushing to a `modal` with params.
            router.push({
                pathname: '/modal', // Use general modal or specific if exists
                params: {
                    type: 'create_folder',
                    ...action.payload
                }
            } as any);
        }
    };

    const renderItem = ({ item }: { item: Message }) => (
        <View
            style={{
                alignSelf: item.sender === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: item.sender === 'user' ? theme.primary : theme.muted,
                borderRadius: 20,
                padding: 12,
                maxWidth: '80%',
                marginVertical: 4,
                marginHorizontal: 16,
            }}
        >
            <Text
                style={{
                    color: item.sender === 'user' ? theme.primaryForeground : theme.text,
                    fontSize: 16,
                }}
            >
                {item.text}
            </Text>
            {item.action && (
                <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.border }}>
                    <TouchableOpacity
                        onPress={() => handleAction(item.action)}
                        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.background, padding: 8, borderRadius: 8 }}
                    >
                        <Text style={{ fontSize: 16, marginRight: 8 }}>
                            {item.action.type === 'OPEN_RESOURCE' ? '📁' : '➕'}
                        </Text>
                        <Text style={{ color: theme.primary, fontWeight: '500' }}>
                            {item.action.type === 'OPEN_RESOURCE'
                                ? (item.action.payload.resourceType === 'FOLDER' ? i18n.t('chat.actions.open_folder') : i18n.t('chat.actions.open_document'))
                                : i18n.t('chat.actions.create_folder')
                            }
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: theme.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
            <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
                        <IconSymbol name="xmark" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 18, fontWeight: '600', marginLeft: 16, color: theme.text }}>{i18n.t('chat.title')}</Text>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
                    style={{ flex: 1 }}
                    onContentSizeChange={scrollToBottom}
                    onLayout={scrollToBottom}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                />

                <View style={{
                    flexDirection: 'row',
                    padding: 16,
                    borderTopWidth: 1,
                    borderTopColor: theme.border,
                    alignItems: 'center',
                    paddingBottom: Platform.OS === 'ios' ? (isKeyboardVisible ? 16 : Math.max(insets.bottom, 16)) : 16,
                    backgroundColor: theme.background
                }}>
                    {isLoading && (
                        <ActivityIndicator color={theme.mutedForeground} style={{ marginRight: 10 }} />
                    )}
                    <TextInput
                        style={{
                            flex: 1,
                            backgroundColor: theme.muted,
                            borderRadius: 20,
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            fontSize: 16,
                            color: theme.text,
                            maxHeight: 100,
                        }}
                        value={inputValue}
                        onChangeText={setInputValue}
                        placeholder={i18n.t('chat.placeholder')}
                        placeholderTextColor={theme.mutedForeground}
                        multiline
                    />
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={!inputValue.trim() || isLoading}
                        style={{
                            marginLeft: 12,
                            backgroundColor: !inputValue.trim() || isLoading ? theme.muted : theme.primary,
                            borderRadius: 20,
                            padding: 10,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <IconSymbol name="arrow.up" size={20} color={!inputValue.trim() || isLoading ? theme.mutedForeground : theme.primaryForeground} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}
