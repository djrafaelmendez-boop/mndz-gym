import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('mndz_token');
        if (token) {
            api.getMe()
                .then(setUser)
                .catch(() => {
                    localStorage.removeItem('mndz_token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        const res = await api.login({ username, password });
        localStorage.setItem('mndz_token', res.token);
        setUser(res.user);
        return res;
    };

    const register = async (username, email, password, firstName, lastName) => {
        const res = await api.register({ username, email, password, firstName, lastName });
        localStorage.setItem('mndz_token', res.token);
        setUser(res.user);
        return res;
    };

    const logout = () => {
        localStorage.removeItem('mndz_token');
        localStorage.removeItem('mndz_active_session');
        setUser(null);
        // Force full refresh to clear any stale contexts/state
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
