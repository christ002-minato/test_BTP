/**
 * Contexte d'authentification pour ChantierPro
 * Gestion des rôles (Admin, Chef de chantier, Magasinier), permissions et session
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USERS } from '../data/mockData.js';

const AuthContext = createContext(null);

const STORAGE_KEY = 'chantierpro_session_user';
const REMEMBER_KEY = 'chantierpro_remember_email';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Erreur lecture session:', e);
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Sauvegarder dans localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentUser]);

  /**
   * Connexion avec email et mot de passe (simule un délai réseau)
   */
  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    setAuthError(null);

    // Simulation de latence réseau
    await new Promise((resolve) => setTimeout(resolve, 600));

    const foundUser = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!foundUser || (password !== 'password123' && password !== 'admin123' && password !== 'chef123' && password !== 'magasin123')) {
      setAuthError('Identifiants incorrects. Veuillez vérifier votre adresse e-mail ou mot de passe.');
      setLoading(false);
      return false;
    }

    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, email);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }

    setCurrentUser(foundUser);
    setLoading(false);
    return true;
  };

  /**
   * Déconnexion
   */
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  /**
   * Vérification des permissions
   */
  const hasPermission = (permission) => {
    if (!currentUser) return false;
    if (currentUser.roleCode === 'admin' || currentUser.permissions.includes('all')) return true;
    return currentUser.permissions.includes(permission);
  };

  const isAdmin = currentUser?.roleCode === 'admin';
  const isChef = currentUser?.roleCode === 'chef';
  const isMagasinier = currentUser?.roleCode === 'magasinier';

  /**
   * Vérifie si un chantier est accessible par l'utilisateur connecté
   */
  const canAccessSite = (siteId) => {
    if (!currentUser) return false;
    if (isAdmin || isMagasinier) return true;
    if (isChef && currentUser.assignedSiteIds) {
      return currentUser.assignedSiteIds.includes(siteId);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        loading,
        authError,
        setAuthError,
        login,
        logout,
        hasPermission,
        isAdmin,
        isChef,
        isMagasinier,
        canAccessSite,
        savedEmail: localStorage.getItem(REMEMBER_KEY) || ''
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider');
  }
  return context;
}
