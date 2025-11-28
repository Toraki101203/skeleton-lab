import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserProfile, UserRole } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    loginAs: (role: UserRole) => Promise<void>; // Dev helper
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Supabase Auth Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                // In a real app, fetch profile from 'profiles' table
                // For now, we'll try to determine role from metadata or fallback
                const role = session.user.user_metadata.role as UserRole || 'user';

                setUser({
                    uid: session.user.id,
                    email: session.user.email || '',
                    role: role,
                    name: session.user.user_metadata.full_name || 'User',
                    avatarUrl: session.user.user_metadata.avatar_url
                });
            } else {
                // Only clear user if we are not in a "mock" session (optional, but for now strict sync)
                // setUser(null); 
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Mock Login for Development (Modified to set local state, or could be real Supabase login)
    const loginAs = async (role: UserRole) => {
        setLoading(true);
        // Simulate API call
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
        <AuthContext.Provider value={{ user, loading, loginAs, logout }}>
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
