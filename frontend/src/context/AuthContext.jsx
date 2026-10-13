/* eslint-disable react-refresh/only-export-components -- contexto + hook coubicados a propósito (mock TP7 en memoria); se separará si el módulo crece en TP8 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export const AuthContext = createContext(null);

// TODO(TP8): eliminar usuarios mock y password en texto plano del bundle.
// Autenticar contra el backend con hash en servidor + JWT en cookie httpOnly.
// No commitear credenciales reales en el frontend.
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
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(INITIAL_USERS);

  const isAuthenticated = Boolean(user);

  const login = useCallback(
    ({ username, password }) => {
      const cleanUsername = username?.trim() ?? '';
      if (!cleanUsername || !password) {
        return { success: false, error: 'Credenciales incompletas' };
      }

      const foundUser = users.find(
        (u) =>
          u.username.toLowerCase() === cleanUsername.toLowerCase() &&
          u.password === password
      );

      if (!foundUser) {
        return { success: false, error: 'Credenciales incorrectas' };
      }

      const authUserData = {
        username: foundUser.username,
        email: foundUser.email,
        // Nunca escalar privilegios por defecto: dato legacy/corrupto sin rol => viewer.
        role: foundUser.role ?? 'viewer',
      };

      setUser(authUserData);
      return { success: true, user: authUserData };
    },
    [users]
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
