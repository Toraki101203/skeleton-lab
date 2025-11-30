import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserProfile, UserRole } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    loginAs: (role: UserRole) => Promise<void>; // Dev helper
    login: (email: string, password: string) => Promise<{ error: any }>;
    register: (email: string, password: string, name: string, role?: UserRole) => Promise<{ error: any }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Helper to fetch profile using raw fetch (bypassing potential client hangs)
    const fetchProfileRaw = async (uid: string, token: string) => {
        try {
            const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${uid}&select=*`;
            const response = await fetch(url, {
                headers: {
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            return data && data.length > 0 ? data[0] : null;
        } catch (error) {
            console.error('AuthContext: Raw fetch error', error);
            return null;
        }
    };

    useEffect(() => {
        console.log('AuthContext: Setting up listener');
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('AuthContext: Auth event:', event);
            if (session?.user) {
                console.log('AuthContext: User session found');

                // 1. Optimistic update from session
                const initialRole = session.user.user_metadata.role as UserRole || 'user';
                setUser({
                    uid: session.user.id,
                    email: session.user.email || '',
                    role: initialRole,
                    name: session.user.user_metadata.full_name || 'User',
                    avatarUrl: session.user.user_metadata.avatar_url
                });

                // 2. Fetch profile using Raw Fetch
                console.log('AuthContext: Fetching profile via Raw REST...');
                fetchProfileRaw(session.user.id, session.access_token).then(profile => {
                    if (profile) {
                        console.log('AuthContext: Profile fetched (Raw):', profile);
                        setUser(prev => {
                            if (!prev || prev.uid !== session.user.id) return prev;
                            return {
                                ...prev,
                                role: profile.role || prev.role,
                                name: profile.name || prev.name,
                                avatarUrl: profile.avatar_url || prev.avatarUrl
                            };
                        });
                    } else {
                        console.log('AuthContext: Profile fetch returned null');
                    }
                });

            } else {
                console.log('AuthContext: No user session');
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<{ error: any }> => {
        console.log('AuthContext: login called');
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        console.log('AuthContext: signInWithPassword result:', error);
        setLoading(false);
        return { error };
    };

    const register = async (email: string, password: string, name: string, role: UserRole = 'user'): Promise<{ error: any }> => {
        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    role: role,
                    avatar_url: `https://ui-avatars.com/api/?name=${name}&background=random`
                }
            }
        });

        if (!error && data.user) {
            // Profile is created automatically by database trigger
        }

        setLoading(false);
        return { error };
    };

    const loginAs = async (role: UserRole) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockUser: UserProfile = {
            uid: `mock-${role}-uid`,
            role: role,
            name: role === 'user' ? 'Test User' : role === 'clinic_admin' ? 'Dr. Smith' : 'Admin Operator',
            email: `${role}@example.com`,
            avatarUrl: `https://ui-avatars.com/api/?name=${role}&background=random`
        };
        setUser(mockUser);
        setLoading(false);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginAs, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
