/**
 * Application principale ChantierPro
 * Configuration des routes React Router v6, gardes de sécurité par rôle et enveloppes de contextes
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { DataProvider } from './context/DataContext.jsx';

// Composants de mise en page
import AppLayout from './components/layout/AppLayout.jsx';

// Écrans métier
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Chantiers from './pages/Chantiers.jsx';
import ChantierDetail from './pages/ChantierDetail.jsx';
import Stocks from './pages/Stocks.jsx';
import Pointage from './pages/Pointage.jsx';
import Personnel from './pages/Personnel.jsx';
import Fournisseurs from './pages/Fournisseurs.jsx';
import Rapports from './pages/Rapports.jsx';
import Parametres from './pages/Parametres.jsx';
import NotFound from './pages/NotFound.jsx';

/**
 * Composant de protection des routes
 * Redirige vers /connexion si l'utilisateur n'est pas authentifié
 */
function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, currentUser } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  // Vérification de rôle spécifique
  if (requiredRole && currentUser?.roleCode !== 'admin' && currentUser?.roleCode !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Route publique de connexion */}
            <Route path="/connexion" element={<Login />} />

            {/* Routes protégées dans le Layout métier */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* 1. Tableau de bord */}
              <Route index element={<Dashboard />} />

              {/* 2. Chantiers */}
              <Route path="chantiers" element={<Chantiers />} />
              <Route path="chantiers/:id" element={<ChantierDetail />} />

              {/* 3. Stocks & Matériaux */}
              <Route path="stocks" element={<Stocks />} />

              {/* 4. Pointage Journalier (Chef & Admin) */}
              <Route path="pointage" element={<Pointage />} />

              {/* 5. Répertoire Personnel (Admin & Chef) */}
              <Route path="personnel" element={<Personnel />} />

              {/* 6. Fournisseurs & Commandes (Admin & Magasinier) */}
              <Route path="fournisseurs" element={<Fournisseurs />} />

              {/* 7. Rapports & Analyses (Admin) */}
              <Route path="rapports" element={<Rapports />} />

              {/* 8. Paramètres & Profil */}
              <Route path="parametres" element={<Parametres />} />

              {/* Route 404 */}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Redirection fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
