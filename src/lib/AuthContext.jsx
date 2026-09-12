import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserByEmail, getOrCreateCharacter, registerStudent, hashPassword } from '@/api/integrations';
import { getOrCreateFarm } from '@/api/farm';
import { isDemoEmail } from '@/api/demoAccounts';
import { syncUsersAll, pushUsers, pullUsers } from '@/lib/sync';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [character, setCharacter] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Restore session from localStorage (demo)
    try {
      const stored = localStorage.getItem('iara_edu_session');
      if (stored) {
        const email = JSON.parse(stored).email;
        const found = getUserByEmail(email);
        if (found) {
          setUser(found);
          setCharacter(getOrCreateCharacter(found));
          if (found.role === 'aluno') getOrCreateFarm(found);
        }
      }
    } catch (e) {
      // ignore
    }
    setIsLoadingAuth(false);
    // sincroniza as contas com o servidor (best-effort, não bloqueia a interface)
    syncUsersAll();
  }, []);

  const navigateToLogin = () => {
    window.location.href = '/acesso';
  };

  const clearAuthError = () => setAuthError(null);

  const completeLogin = (found, password) => {
    // contas de demonstração entram sempre sem senha
    if (found.password_hash && !isDemoEmail(found.email)) {
      const pw = String(password || '');
      if (!pw || hashPassword(pw) !== found.password_hash) {
        setUser(null);
        setAuthError({ type: 'invalid_password' });
        return false;
      }
    }
    try {
      localStorage.setItem('iara_edu_session', JSON.stringify({ email: found.email, role: found.role }));
    } catch (e) {
      // ignore
    }
    setAuthError(null);
    setUser(found);
    if (found.role === 'aluno' || found.role === 'pai') {
      setCharacter(getOrCreateCharacter(found));
      if (found.role === 'aluno') getOrCreateFarm(found);
    }
    pushUsers();
    window.location.href = '/';
    return true;
  };

  const login = (email, password = '') => {
    const found = getUserByEmail(email);
    if (!found) {
      // usuário pode ter cadastrado em outro aparelho: busca a versão remota antes de negar
      pullUsers().then((merged) => {
        const again = merged ? (getUserByEmail(email) || merged.find((u) => u.email === email)) : null;
        if (!again) {
          setUser(null);
          setAuthError({ type: 'user_not_registered' });
          return;
        }
        completeLogin(again, password);
      });
      return;
    }
    completeLogin(found, password);
  };

  const registerStudentAccount = (data) => {
    const res = registerStudent(data);
    if (!res.ok) {
      setUser(null);
      setAuthError({ type: 'register_error', message: res.error });
      return false;
    }
    login(res.user.email, data.password);
    return true;
  };

  const logout = () => {
    try {
      localStorage.removeItem('iara_edu_session');
    } catch (e) {
      // ignore
    }
    setUser(null);
    setCharacter(null);
    navigateToLogin();
  };

  const refreshUser = () => {
    if (!user) return;
    const fresh = getUserByEmail(user.email);
    if (fresh) {
      setUser(fresh);
      if (fresh.role === 'aluno') setCharacter(getOrCreateCharacter(fresh));
    }
  };

  const value = {
    user,
    character,
    isAuthenticated: !!user,
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    clearAuthError,
    navigateToLogin,
    login,
    registerStudentAccount,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};