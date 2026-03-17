import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authClient } from '../lib/auth';

interface AuthContextType {
    session: any | null;
    user: any | null;
    loading: boolean;
    refreshSession: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<any | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshSession = async () => {
        try {
            const result = await authClient.getSession();
            if (result.data?.session) {
                setSession(result.data.session);
                setUser(result.data.user);
            } else {
                setSession(null);
                setUser(null);
            }
        } catch (error) {
            console.error('Error fetching session:', error);
            setSession(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshSession();
    }, []);

    const signOut = async () => {
        setLoading(true);
        await authClient.signOut();
        setSession(null);
        setUser(null);
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, refreshSession, signOut }}>
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
