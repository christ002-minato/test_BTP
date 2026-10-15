/**
 * Barre supérieure (Topbar)
 * Fil d'Ariane, météo chantier Abidjan, recherche globale Ctrl+K, centre de notifications et menu utilisateur
 */

import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  CloudSun,
  LogOut,
  User,
  ChevronRight,
  AlertTriangle,
  Package,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import Badge from '../ui/Badge.jsx';

export default function Topbar({ onOpenMobileMenu, onOpenCommandPalette }) {
  const { currentUser, logout } = useAuth();
  const { materials, theme, toggleTheme } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Fermeture des menus au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Génération du fil d'Ariane
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return 'Tableau de bord';
    if (path.startsWith('/chantiers/')) return 'Détails du chantier';
    if (path === '/chantiers') return 'Chantiers en cours';
    if (path === '/stocks') return 'Stocks & Matériaux';
    if (path === '/pointage') return 'Pointage journalier';
    if (path === '/personnel') return 'Répertoire du personnel';
    if (path === '/fournisseurs') return 'Fournisseurs & Commandes';
    if (path === '/rapports') return 'Rapports d\'activité';
    if (path === '/parametres') return 'Paramètres du système';
    return 'ChantierPro';
  };

  // Alertes de stock pour les notifications
  const criticalStockAlerts = materials.filter(
    (m) => m.status === 'Rupture' || m.status === 'Critique'
  );

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Côté gauche : Hamburger mobile + Fil d'Ariane */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Fil d'Ariane" className="hidden sm:flex items-center gap-2 text-xs sm:text-sm font-medium">
          <Link
            to="/"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            ChantierPro
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#1E293B] dark:text-white font-semibold truncate font-heading tracking-wide uppercase text-sm">
            {getBreadcrumb()}
          </span>
        </nav>
      </div>

      {/* Côté droit : Recherche Ctrl+K, Météo Abidjan, Thème, Notifications, Profil */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Raccourci recherche rapide Ctrl+K */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-xs cursor-pointer"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden md:inline">Rechercher...</span>
          <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 shadow-2xs">
            Ctrl K
          </kbd>
        </button>

        {/* Widget météo Abidjan */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-medium">
          <CloudSun className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Abidjan 29°C</span>
        </div>

        {/* Bascule Thème Clair / Sombre */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Cloche de notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {criticalStockAlerts.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {/* Menu déroulant notifications */}
          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                  <span className="font-heading font-bold text-sm text-[#1E293B] dark:text-white uppercase tracking-wider">
                    Alertes & Activités
                  </span>
                  <Badge variant="rupture" size="sm">
                    {criticalStockAlerts.length} urgence(s)
                  </Badge>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {criticalStockAlerts.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Toutes les alertes sont levées. Stocks sous contrôle.
                    </div>
                  ) : (
                    criticalStockAlerts.map((mat) => (
                      <div
                        key={mat.id}
                        onClick={() => {
                          setNotificationsOpen(false);
                          navigate('/stocks');
                        }}
                        className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {mat.name}
                            </p>
                            <Badge variant={mat.status === 'Rupture' ? 'rupture' : 'critique'} size="sm">
                              {mat.status}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Chantier: {mat.siteName} • Reste: {mat.stockActuel} {mat.unit}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center">
                  <Link
                    to="/stocks"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs font-semibold text-[#A64B2A] hover:underline"
                  >
                    Voir l'inventaire complet →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Séparateur vertical */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* Menu Profil Utilisateur */}
        <div className="relative" ref={userRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
              alt={currentUser?.name || 'Utilisateur'}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#1E293B]/20 dark:ring-white/20"
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {currentUser?.name || 'Utilisateur'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {currentUser?.role || 'Opérateur'}
              </p>
            </div>
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 p-1"
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {currentUser?.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser?.email}
                  </p>
                </div>

                <Link
                  to="/parametres"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                  <span>Paramètres & Profil</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                    navigate('/connexion');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Se déconnecter</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
