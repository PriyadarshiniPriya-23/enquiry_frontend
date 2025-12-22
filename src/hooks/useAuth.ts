import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { apiRequest } from '../utils/api';

export const useAuth = () => {
    const navigate = useNavigate();

    const getToken = (): string | null => {
        return localStorage.getItem('authToken');
    };

    const setToken = (token: string) => {
        localStorage.setItem('authToken', token);
    };

    const removeToken = () => {
        localStorage.removeItem('authToken');
        navigate('/login', { replace: true });
    };

    useEffect(() => {
        const token = getToken();
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        const validateToken = async () => {
            try {
                await apiRequest('/api/auth/validate-token', { method: 'GET' });
            } catch (error: any) {
                // If the error code is 401 Unauthorized, remove token and redirect
                if (error.status === 401) {
                    removeToken();
                }
            }
        };

        validateToken();
    }, [navigate]);

    return {
        getToken,
        setToken,
        removeToken,
    };
};
