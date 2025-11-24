import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getSession();

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email, password, metadata = {}) => {
        return await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        });
    };

    const signIn = async (email, password) => {
        return await supabase.auth.signInWithPassword({
            email,
            password,
        });
    };

    const signOut = async () => {
        return await supabase.auth.signOut();
    };

    const refreshUser = async () => {
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
            const { data: { user: updatedUser }, error: userError } = await supabase.auth.getUser();

            if (updatedUser) {
                setUser(updatedUser);
            }
            
            if (session) {
                setSession(session);
            }
            
            return { user: updatedUser, session, error: sessionError || userError };
        } catch (error) {
            console.error("Error refreshing user:", error);
            return { error };
        }
    };

    const value = {
        signUp,
        signIn,
        signOut,
        refreshUser,
        user,
        session,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
