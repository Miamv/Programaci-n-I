/* eslint-disable react-refresh/only-export-components -- contexto + hook coubicados a propósito */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { login as loginApi, register as registerApi, getProfile, logout as logoutApi } from '../services/api';

export const AuthContext = createContext(null);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('auth_user');
    if (saved && localStorage.getItem('access_token')) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem('access_token')));

  const isAuthenticated = Boolean(user);

  // Mantiene sincronizado el estado ante expiración o invalidación del token en Axios
  useEffect(() => {
    function handleSessionExpired() {
      setUser(null);
    }
    window.addEventListener('auth:logout', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:logout', handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    getProfile()
      .then((res) => {
        const profile = res.data;
        const verifiedUser = {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          role: profile.role?.toLowerCase() || 'viewer',
        };
        setUser(verifiedUser);
        localStorage.setItem('auth_user', JSON.stringify(verifiedUser));
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('auth_user');
          setUser(null);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(
    async ({ username, password }) => {
      const cleanUsername = username?.trim() ?? '';
      if (!cleanUsername || !password) {
        return { success: false, error: 'Ingresá tu usuario y contraseña.' };
      }

      try {
        const response = await loginApi({ username: cleanUsername, password });
        const { access, refresh } = response.data;

        localStorage.setItem('access_token', access);
        if (refresh) {
          localStorage.setItem('refresh_token', refresh);
        }

        let authUserData = {
          username: cleanUsername,
          role: 'viewer',
        };

        try {
          const profileRes = await getProfile();
          const profile = profileRes.data;
          authUserData = {
            id: profile.id,
            username: profile.username,
            email: profile.email,
            role: profile.role?.toLowerCase() || 'viewer',
          };
        } catch {
          // Si el perfil falla temporalmente, se conservan datos mínimos del usuario
        }

        localStorage.setItem('auth_user', JSON.stringify(authUserData));
        setUser(authUserData);

        return { success: true, user: authUserData };
      } catch (err) {
        if (!err.response) {
          return {
            success: false,
            error: 'No se pudo conectar con el servidor. Revisá tu conexión.',
          };
        }

        if (err.response.status === 401) {
          return {
            success: false,
            error: 'Usuario o contraseña incorrectos.',
          };
        }

        if (err.response.status === 400) {
          const detail =
            err.response.data?.non_field_errors?.[0] ||
            err.response.data?.detail ||
            'Por favor, verificá los datos ingresados.';
          return {
            success: false,
            error: detail,
          };
        }

        return {
          success: false,
          error: 'Error en el servidor al intentar iniciar sesión. Intentá más tarde.',
        };
      }
    },
    []
  );

  const register = useCallback(
    async ({ username, email, password }) => {
      const cleanUsername = username?.trim() ?? '';
      const cleanEmail = email?.trim() ?? '';
      if (!cleanUsername || !cleanEmail || !password) {
        return { success: false, error: 'Todos los campos son obligatorios.' };
      }
      if (!EMAIL_RE.test(cleanEmail)) {
        return { success: false, error: 'El correo electrónico no es válido.' };
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        return {
          success: false,
          error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
        };
      }

      try {
        await registerApi({
          username: cleanUsername,
          email: cleanEmail,
          password,
        });

        return { success: true };
      } catch (err) {
        if (!err.response) {
          return {
            success: false,
            error: 'No se pudo conectar con el servidor. Revisá tu conexión.',
          };
        }

        const data = err.response.data;

        if (err.response.status === 400 && data) {
          const hasUsernameError = Boolean(data.username);
          const hasEmailError = Boolean(data.email);

          if (hasUsernameError && hasEmailError) {
            return {
              success: false,
              error: 'El nombre de usuario y el correo electrónico ya están registrados.',
            };
          }
          if (hasUsernameError) {
            const msg = Array.isArray(data.username) ? data.username[0] : data.username;
            if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('ya existe')) {
              return { success: false, error: 'El nombre de usuario ya está registrado.' };
            }
            return { success: false, error: msg || 'Nombre de usuario inválido.' };
          }
          if (hasEmailError) {
            const msg = Array.isArray(data.email) ? data.email[0] : data.email;
            if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('ya existe')) {
              return { success: false, error: 'El correo electrónico ya está registrado.' };
            }
            return { success: false, error: msg || 'Correo electrónico inválido.' };
          }
          if (data.password) {
            return {
              success: false,
              error: Array.isArray(data.password) ? data.password.join(' ') : data.password,
            };
          }
          if (data.non_field_errors) {
            return {
              success: false,
              error: data.non_field_errors[0] || 'Error en los datos enviados.',
            };
          }
          if (data.detail) {
            return { success: false, error: data.detail };
          }
        }

        return {
          success: false,
          error: 'Error en el servidor al intentar crear la cuenta.',
        };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      try {
        await logoutApi(refresh);
      } catch {
        // Si el backend falla o el token ya fue invalidado, se procede con la limpieza local
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated, isLoading, login, register, logout }),
    [user, isAuthenticated, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
