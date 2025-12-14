import { useRouter, useSegments } from 'expo-router';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AuthService } from '../data/AuthService';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: { id: string; name: string; email: string } | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    loginWithGoogle: (idToken: string) => Promise<void>;
    loginWithApple: (identityToken: string, user?: { email?: string; name?: { firstName?: string; lastName?: string } }) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (name: string) => Promise<void>;
    deleteAccount: (password?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const segments = useSegments();
    const router = useRouter();

    const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!isAuthenticated && !inAuthGroup) {
            // Redirect to the sign-in page.
            router.replace('/(auth)/login');
        } else if (isAuthenticated && inAuthGroup) {
            // Redirect away from the sign-in page.
            router.replace('/(tabs)');
        }
    }, [isAuthenticated, segments, isLoading]);

    const checkAuth = async () => {
        try {
            const isAuth = await AuthService.isAuthenticated();
            if (isAuth) {
                const userData = await AuthService.getUser();
                setUser(userData);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }

            // If we are authenticated but in auth group (clean restart on login page), 
            // the effect above will handle it. 
        } catch (error) {
            console.error('Auth check failed', error);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            await AuthService.login(email, password);
            // Assuming login returns user or we need to fetch it. 
            // If AuthService.login returns user, use it. If not, fetch it.
            // Looking at AuthService (I will check next), usually login returns AuthResponse.
            const userData = await AuthService.getUser();
            setUser(userData);
            setIsAuthenticated(true);
            // Navigation handled by effect
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            await AuthService.register(name, email, password);
            const userData = await AuthService.getUser();
            setUser(userData);
            setIsAuthenticated(true);
            // Navigation handled by effect
        } catch (error) {
            console.error('Registration failed', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = async (idToken: string) => {
        setIsLoading(true);
        try {
            await AuthService.loginWithGoogle(idToken);
            const userData = await AuthService.getUser();
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Google login failed', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithApple = async (identityToken: string, user?: { email?: string; name?: { firstName?: string; lastName?: string } }) => {
        setIsLoading(true);
        try {
            const response = await AuthService.loginWithApple(identityToken, user);

            if (response.user) {
                setUser(response.user);
            } else {
                const userData = await AuthService.getUser();
                setUser(userData);
            }

            setIsAuthenticated(true);
        } catch (error) {
            console.error('Apple login failed', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await AuthService.logout();
        setIsAuthenticated(false);
    };

    const updateProfile = async (name: string) => {
        setIsLoading(true);
        try {
            await AuthService.updateProfile(name);
            const userData = await AuthService.getUser();
            setUser(userData);
        } catch (error) {
            console.error('Update profile failed', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteAccount = async (password?: string) => {
        setIsLoading(true);
        try {
            await AuthService.deleteAccount(password);
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Delete account failed', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isLoading,
            user,
            login,
            register,
            loginWithGoogle,
            loginWithApple,
            logout,
            updateProfile,
            deleteAccount
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
