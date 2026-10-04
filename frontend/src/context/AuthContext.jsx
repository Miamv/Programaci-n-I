/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

export const AuthContext = createContext(null);

const INITIAL_USERS = [
  {
    username: 'admin',
    email: 'admin@vertice.com',
    password: 'password123',
    role: 'admin',
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(INITIAL_USERS);

  const isAuthenticated = Boolean(user);

  function login({ username, password }) {
    if (!username || !password) {
      return { success: false, error: 'Credenciales incompletas' };
    }

    const foundUser = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!foundUser) {
      return { success: false, error: 'Credenciales incorrectas' };
    }

    const authUserData = {
      username: foundUser.username,
      email: foundUser.email,
      role: foundUser.role ?? 'admin',
    };

    setUser(authUserData);
    return { success: true, user: authUserData };
  }

  function register({ username, email, password }) {
    if (!username || !email || !password) {
      return { success: false, error: 'Todos los campos son obligatorios' };
    }

    const usernameExists = users.some(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (usernameExists) {
      return { success: false, error: 'El nombre de usuario ya está registrado' };
    }

    const emailExists = users.some(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (emailExists) {
      return { success: false, error: 'El correo electrónico ya está registrado' };
    }

    const newUser = {
      username: username.trim(),
      email: email.trim(),
      password,
      role: 'viewer',
    };

    setUsers((prevUsers) => [...prevUsers, newUser]);
    return { success: true };
  }

  function logout() {
    setUser(null);
  }

  const value = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
