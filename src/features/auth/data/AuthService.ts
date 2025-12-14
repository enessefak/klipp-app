import { OAuthService } from '@/src/infrastructure/api/generated/services/OAuthService';
import { UserService } from '@/src/infrastructure/api/generated/services/UserService';
import { Buffer } from 'buffer';
import * as SecureStore from 'expo-secure-store';

interface LoginResponse {
    token: string;
    user?: {
        id: string;
        email: string;
        name?: string;
    };
    isNewUser?: boolean;
}

export const AuthService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            // Clear any existing token to ensure a clean login request
            // Clear any existing token to ensure a clean login request
            await SecureStore.deleteItemAsync('token');

            const response = await UserService.postUsersLogin({ email, password });
            const { token } = response;

            await SecureStore.setItemAsync('token', token);
            return { token };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    async register(name: string, email: string, password: string): Promise<LoginResponse> {
        try {
            // Clear any existing token to ensure a clean registration request
            await SecureStore.deleteItemAsync('token');

            const response = await UserService.postUsersRegister({ name, email, password });
            const { token } = response;

            await SecureStore.setItemAsync('token', token);
            return { token };
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    async loginWithGoogle(idToken: string): Promise<LoginResponse> {
        try {
            const response = await OAuthService.postAuthGoogle({ idToken });
            const { token, user, isNewUser } = response;

            await SecureStore.setItemAsync('token', token);
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
            const { token, user: responseUser, isNewUser } = response;

            await SecureStore.setItemAsync('token', token);
            return { token, user: responseUser, isNewUser };
        } catch (error: any) {
            console.error('Apple login error:', error);
            console.error('Error body:', error.body);
            console.error('Error status:', error.status);
            throw error;
        }
    },

    async logout(): Promise<void> {
        await SecureStore.deleteItemAsync('token');
    },

    async isAuthenticated(): Promise<boolean> {
        const token = await SecureStore.getItemAsync('token');
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

    async updateProfile(name: string): Promise<void> {
        try {
            await UserService.patchUsersMe({ name });
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

    async getUser(): Promise<{ id: string; name: string; email: string }> {
        try {
            const response = await UserService.getUsersMe();
            return {
                id: response.id,
                name: response.name,
                email: response.email,
            };
        } catch (error) {
            console.warn('getUsersMe failed, trying fallback to getUsers(id)...', error);

            // Fallback: Parse token and get user by ID
            try {
                const token = await SecureStore.getItemAsync('token');
                if (token) {
                    const payload = this.parseJwt(token);
                    if (payload && payload.userId) {
                        const userResponse = await UserService.getUsers(payload.userId);
                        return {
                            id: userResponse.id,
                            name: userResponse.name,
                            email: userResponse.email,
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
