/**
 * Layout principal de l'application ChantierPro
 * Assemble Sidebar, Topbar, Palette de commandes et Conteneur de Toasts
 */

import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import CommandPalette from './CommandPalette.jsx';
import ToastContainer from '../ui/Toast.jsx';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Raccourci clavier global Ctrl+K ou Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#F5EBE0] dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden">
      {/* Sidebar latérale */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Conteneur principal */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Topbar supérieure */}
        <Topbar
          onOpenMobileMenu={() => setMobileOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        {/* Zone de contenu défilante */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-blueprint-dots dark:bg-none">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Palette de commandes Ctrl+K */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Notifications Toast */}
      <ToastContainer />
    </div>
  );
}
