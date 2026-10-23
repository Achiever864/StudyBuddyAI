import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider ({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const login = (userData) => {
        setUser(userData);
    };

    const logout  = () => {
        setUser(null);
    };

    const value = {
        user,
        isAuthenticated: Boolean(user),
        loading,
        setLoading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error ("useAuth must be used within AuthProvider");
    };
    return context;
}