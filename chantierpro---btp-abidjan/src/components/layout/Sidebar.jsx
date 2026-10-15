/**
 * Barre de navigation latérale (Sidebar) rétractable
 * Respect strict des permissions par rôle : menus masqués si non autorisés
 * Transition Framer Motion et indicateur actif sur ressort
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  Package,
  Users,
  CalendarCheck,
  Truck,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  HardHat,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) {
  const { currentUser, isAdmin, isChef, isMagasinier, hasPermission } = useAuth();

  // Définition des liens avec filtrage strict par rôle
  const allNavigationItems = [
    {
      to: '/',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      visible: true // Visible par tous les rôles
    },
    {
      to: '/chantiers',
      label: isChef ? 'Mes Chantiers' : 'Chantiers',
      icon: Building2,
      visible: isAdmin || isChef // Masqué pour magasinier
    },
    {
      to: '/stocks',
      label: 'Stocks & Matériaux',
      icon: Package,
      visible: isAdmin || isMagasinier || isChef // Tous consultent ou gèrent
    },
    {
      to: '/pointage',
      label: 'Pointage Journalier',
      icon: CalendarCheck,
      visible: isAdmin || isChef // Masqué pour magasinier
    },
    {
      to: '/personnel',
      label: 'Personnel & Équipes',
      icon: Users,
      visible: isAdmin // Uniquement admin
    },
    {
      to: '/fournisseurs',
      label: 'Fournisseurs & Commandes',
      icon: Truck,
      visible: isAdmin || isMagasinier // Masqué pour chef
    },
    {
      to: '/rapports',
      label: 'Rapports & Synthèse',
      icon: BarChart3,
      visible: isAdmin // Uniquement admin
    },
    {
      to: '/parametres',
      label: 'Paramètres',
      icon: Settings,
      visible: true
    }
  ];

  const visibleItems = allNavigationItems.filter((item) => item.visible);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B1B3A] text-white border-r border-[#152A55] select-none">
      {/* En-tête Logo */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#152A55] bg-[#071328]">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Logo ChantierPro : casque & règle */}
          <div className="w-10 h-10 rounded-lg bg-[#F26B1D] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#F26B1D]/30 border border-[#d9590f]">
            <HardHat className="w-6 h-6" />
          </div>

          {(!collapsed || mobileOpen) && (
            <div className="min-w-0 transition-opacity duration-200">
              <span className="font-heading text-lg font-black tracking-wider text-white block uppercase leading-none">
                Chantier<span className="text-[#F26B1D]">Pro</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest block uppercase mt-0.5">
                Abidjan • BTP v2.4
              </span>
            </div>
          )}
        </div>

        {/* Bouton fermeture sur mobile */}
        {mobileOpen && (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Rôle utilisateur connecté */}
      {(!collapsed || mobileOpen) && currentUser && (
        <div className="px-4 py-3 bg-[#081732] border-b border-[#152A55] flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-[#F26B1D]/50"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate leading-tight">
              {currentUser.name}
            </p>
            <span className="inline-block mt-0.5 text-[10px] font-semibold text-[#F26B1D] bg-[#F26B1D]/15 px-1.5 py-0.2 rounded border border-[#F26B1D]/30 uppercase">
              {currentUser.role}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => mobileOpen && setMobileOpen(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white font-semibold bg-[#152A55]'
                    : 'text-slate-300 hover:text-white hover:bg-[#112347]'
                } ${collapsed && !mobileOpen ? 'justify-center px-2' : ''}`
              }
              title={collapsed && !mobileOpen ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#F26B1D] rounded-r"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#F26B1D]' : 'text-slate-400'}`} />
                  {(!collapsed || mobileOpen) && (
                    <span className="truncate">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bas de sidebar : bandeau de sécurité BTP et bouton de rétraction */}
      <div className="p-3 border-t border-[#152A55] bg-[#071328]">
        {/* Rétractation bureau */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex w-full items-center justify-center gap-2 py-2 px-3 text-xs text-slate-400 hover:text-white hover:bg-[#112347] rounded-lg transition-colors cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Réduire le menu</span>
            </>
          )}
        </button>

        {/* Liseré de sécurité chantier */}
        <div className="h-1 w-full bg-stripes-safety rounded-full mt-2 opacity-80" />
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Bureau */}
      <aside
        className={`hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Drawer Mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Menu glissant */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-72 max-w-[85vw] h-full z-10"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
