import { OAuthService } from '@/src/infrastructure/api/generated/services/OAuthService';
import { UserService } from '@/src/infrastructure/api/generated/services/UserService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { UpdateUserProfileInput, UserProfile } from '../domain/User';

const setToken = async (token: string) => {
    if (Platform.OS === 'web') {
        await AsyncStorage.setItem('token', token);
    } else {
        await SecureStore.setItemAsync('token', token);
    }
};

const getToken = async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
        return await AsyncStorage.getItem('token');
    } else {
        return await SecureStore.getItemAsync('token');
    }
};

const removeToken = async () => {
    if (Platform.OS === 'web') {
        await AsyncStorage.removeItem('token');
    } else {
        await SecureStore.deleteItemAsync('token');
    }
};

interface LoginResponse {
    token: string;
    user?: UserProfile;
    isNewUser?: boolean;
}

export const AuthService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            await removeToken();

            const response = await UserService.postUsersLogin({ email, password });
            const data = (response as any).data || response;
            const { token } = data;

            await setToken(token);
            return { token };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    async register(name: string, email: string, password: string): Promise<LoginResponse> {
        try {
            await removeToken();

            const response = await UserService.postUsersRegister({ name, email, password });
            const data = (response as any).data || response;
            const { token } = data;

            await setToken(token);
            return { token };
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    async loginWithGoogle(idToken: string): Promise<LoginResponse> {
        try {
            const response = await OAuthService.postAuthGoogle({ idToken });
            const data = (response as any).data || response;
            const { token, user, isNewUser } = data;

            await setToken(token);
            return { token, user, isNewUser };
        } catch (error) {
            console.error('Google login error:', error);
            throw error;
        }
    },

    async loginWithApple(identityToken: string, user?: { email?: string; name?: { firstName?: string; lastName?: string } }): Promise<LoginResponse> {
        try {
            const response = await OAuthService.postAuthApple({ identityToken, user });
            console.log('Apple login response:', response);
            const data = (response as any).data || response;
            const { token, user: responseUser, isNewUser } = data;

            await setToken(token);
            return { token, user: responseUser, isNewUser };
        } catch (error: any) {
            console.error('Apple login error:', error);
            console.error('Error body:', error.body);
            console.error('Error status:', error.status);
            throw error;
        }
    },

    async logout(): Promise<void> {
        await removeToken();
    },

    async isAuthenticated(): Promise<boolean> {
        const token = await getToken();
        return !!token;
    },

    parseJwt(token: string) {
        try {
            const base64Url = token.split('.')[1];
            if (!base64Url) return null;

            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('Error parsing JWT:', e);
            return null;
        }
    },

    async updateProfile(payload: UpdateUserProfileInput): Promise<void> {
        try {
            await UserService.patchUsersMe(payload);
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    },

    async deleteAccount(password?: string): Promise<void> {
        try {
            await UserService.deleteUsersMe({
                password,
                confirmation: 'DELETE_MY_ACCOUNT',
            });
            await this.logout();
        } catch (error) {
            console.error('Delete account error:', error);
            throw error;
        }
    },

    async getUser(): Promise<UserProfile> {
        try {
            const response = await UserService.getUsersMe();
            const data = (response as any).data || response;
            return {
                id: data.id,
                name: data.name,
                email: data.email,
                taxNumber: data.taxNumber,
                taxOffice: data.taxOffice,
                address: data.address,
                city: data.city,
                subdivision: data.subdivision,
                phone: data.phone,
            };
        } catch (error: any) {
            // FIX: If unauthorized, do not fallback. Invalid token means invalid session.
            if (error?.status === 401 || error?.response?.status === 401) {
                throw error;
            }

            console.warn('getUsersMe failed, trying fallback to getUsers(id)...', error);

            // Fallback: Parse token and get user by ID
            try {
                const token = await getToken();
                if (token) {
                    const payload = this.parseJwt(token);
                    if (payload && payload.userId) {
                        const userResponse = await UserService.getUsers(payload.userId);
                        const userData = (userResponse as any).data || userResponse;
                        return {
                            id: userData.id,
                            name: userData.name,
                            email: userData.email,
                            taxNumber: userData.taxNumber,
                            taxOffice: userData.taxOffice,
                            address: userData.address,
                            city: userData.city,
                            subdivision: userData.subdivision,
                            phone: userData.phone,
                        };
                    }
                }
            } catch (fallbackError) {
                console.error('Fallback getUsers failed:', fallbackError);
            }

            console.error('Get user error:', error);
            throw error;
        }
    }
};
