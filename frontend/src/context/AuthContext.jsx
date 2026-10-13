/* eslint-disable react-refresh/only-export-components -- contexto + hook coubicados a propósito (mock TP7 en memoria); se separará si el módulo crece en TP8 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { login as loginApi, getProfile } from '../services/api';

export const AuthContext = createContext(null);

// Mocks mantenidos temporalmente para registro hasta su migración en el próximo objetivo
const INITIAL_USERS = [
  {
    username: 'admin',
    email: 'admin@vertice.com',
    password: 'password123',
    role: 'admin',
  },
];

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
  const [users, setUsers] = useState(INITIAL_USERS);

  const isAuthenticated = Boolean(user);

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
    ({ username, email, password }) => {
      const cleanUsername = username?.trim() ?? '';
      const cleanEmail = email?.trim() ?? '';
      if (!cleanUsername || !cleanEmail || !password) {
        return { success: false, error: 'Todos los campos son obligatorios' };
      }
      if (!EMAIL_RE.test(cleanEmail)) {
        return { success: false, error: 'El correo electrónico no es válido' };
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        return {
          success: false,
          error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
        };
      }

      const usernameExists = users.some(
        (u) => u.username.toLowerCase() === cleanUsername.toLowerCase()
      );
      if (usernameExists) {
        return { success: false, error: 'El nombre de usuario ya está registrado' };
      }

      const emailExists = users.some(
        (u) => u.email.toLowerCase() === cleanEmail.toLowerCase()
      );
      if (emailExists) {
        return { success: false, error: 'El correo electrónico ya está registrado' };
      }

      // Mock en memoria: se guarda plano solo para TP7. En TP8 el password
      // nunca debe llegar ni guardarse en el frontend (hash en backend + JWT).
      const newUser = {
        username: cleanUsername,
        email: cleanEmail,
        password,
        role: 'viewer',
      };

      setUsers((prevUsers) => [...prevUsers, newUser]);
      return { success: true };
    },
    [users]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated, login, register, logout }),
    [user, isAuthenticated, login, register, logout]
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
