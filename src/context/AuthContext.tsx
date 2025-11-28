import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserProfile, UserRole } from '../types';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

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
        // For real Firebase Auth
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                // In a real app, we would fetch the user profile from Firestore here
                // For now, we'll just mock it based on a local storage flag or similar if needed
                // But for this dev phase, we rely on manual loginAs state mostly
            } else {
                // setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Mock Login for Development
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
        await firebaseSignOut(auth);
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
