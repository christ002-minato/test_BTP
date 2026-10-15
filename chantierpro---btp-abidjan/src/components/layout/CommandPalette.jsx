/**
 * Palette de commandes globale (Ctrl+K)
 * Recherche rapide multi-entités : chantiers, matériaux, personnel et navigation
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Building2, Package, Users, Compass, ArrowRight, CornerDownLeft, X } from 'lucide-react';
import { useData } from '../../context/DataContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const { sites, materials, employees } = useData();
  const { hasPermission, isChef, currentUser } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Pages disponibles selon le rôle
  const navItems = [
    { label: 'Tableau de bord', path: '/', icon: Compass, category: 'Navigation', perm: true },
    { label: 'Gestion des chantiers', path: '/chantiers', icon: Building2, category: 'Navigation', perm: true },
    { label: 'Gestion des stocks & Matériaux', path: '/stocks', icon: Package, category: 'Navigation', perm: hasPermission('stock_view') || !isChef },
    { label: 'Pointage journalier du personnel', path: '/pointage', icon: Users, category: 'Navigation', perm: hasPermission('attendance_manage') || currentUser?.roleCode === 'admin' },
    { label: 'Répertoire du personnel', path: '/personnel', icon: Users, category: 'Navigation', perm: currentUser?.roleCode === 'admin' || currentUser?.roleCode === 'chef' },
    { label: 'Fournisseurs & Commandes', path: '/fournisseurs', icon: Package, category: 'Navigation', perm: currentUser?.roleCode === 'admin' || currentUser?.roleCode === 'magasinier' },
    { label: 'Rapports & Analyses financières', path: '/rapports', icon: Compass, category: 'Navigation', perm: currentUser?.roleCode === 'admin' },
    { label: 'Paramètres du compte', path: '/parametres', icon: Compass, category: 'Navigation', perm: true }
  ].filter(item => item.perm);

  // Recherche filtrée
  const q = query.toLowerCase().trim();
  const results = [];

  if (q.length > 0) {
    // 1. Navigation
    navItems.forEach(item => {
      if (item.label.toLowerCase().includes(q)) {
        results.push({
          id: `nav_${item.path}`,
          title: item.label,
          subtitle: 'Page principale',
          category: 'Pages',
          icon: item.icon,
          action: () => navigate(item.path)
        });
      }
    });

    // 2. Chantiers
    sites.forEach(site => {
      if (site.name.toLowerCase().includes(q) || site.commune.toLowerCase().includes(q) || site.city.toLowerCase().includes(q)) {
        results.push({
          id: `site_${site.id}`,
          title: site.name,
          subtitle: `${site.commune}, ${site.city} • Chef : ${site.chefName}`,
          category: 'Chantiers',
          icon: Building2,
          action: () => navigate(`/chantiers/${site.id}`)
        });
      }
    });

    // 3. Matériaux
    materials.forEach(mat => {
      if (mat.name.toLowerCase().includes(q) || mat.code.toLowerCase().includes(q) || mat.category.toLowerCase().includes(q)) {
        results.push({
          id: `mat_${mat.id}`,
          title: mat.name,
          subtitle: `${mat.stockActuel} ${mat.unit} restants • ${mat.siteName} (${mat.status})`,
          category: 'Matériaux & Stocks',
          icon: Package,
          action: () => navigate('/stocks')
        });
      }
    });

    // 4. Personnel
    employees.forEach(emp => {
      const fullName = `${emp.prenom} ${emp.nom}`.toLowerCase();
      if (fullName.includes(q) || emp.fonction.toLowerCase().includes(q) || emp.matricule.toLowerCase().includes(q)) {
        results.push({
          id: `emp_${emp.id}`,
          title: `${emp.prenom} ${emp.nom}`,
          subtitle: `${emp.fonction} • ${emp.siteName} (${emp.telephone})`,
          category: 'Personnel',
          icon: Users,
          action: () => navigate('/personnel')
        });
      }
    });
  } else {
    // Suggestions par défaut
    navItems.slice(0, 5).forEach(item => {
      results.push({
        id: `nav_${item.path}`,
        title: item.label,
        subtitle: 'Accès rapide',
        category: 'Navigation',
        icon: item.icon,
        action: () => navigate(item.path)
      });
    });
  }

  const handleSelect = (result) => {
    if (result && result.action) {
      result.action();
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0B1B3A]/70 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-10"
          >
            {/* Input de recherche */}
            <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher un chantier, matériau, ouvrier ou raccourci..."
                className="w-full px-3 py-4 text-sm sm:text-base bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Liste des résultats */}
            <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
              {results.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400">
                  Aucun résultat correspondant à « {query} »
                </div>
              ) : (
                results.map((item, idx) => {
                  const ItemIcon = item.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#F26B1D]/10 text-[#0B1B3A] dark:text-orange-300'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-[#F26B1D] text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {item.category}
                        </span>
                        {isSelected && (
                          <CornerDownLeft className="w-4 h-4 text-[#F26B1D]" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pied de palette */}
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span>↑↓ pour naviguer</span>
                <span>↵ pour valider</span>
                <span>Échap pour quitter</span>
              </div>
              <span className="font-mono text-slate-400">ChantierPro CI</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
