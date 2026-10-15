/**
 * Page 404 - Chantier Introuvable
 * Signalétique et esthétique d'ingénierie BTP
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HardHat, Compass, Home, Search } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import PageTransition from '../components/layout/PageTransition.jsx';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <PageTransition className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-2xl bg-[#1E293B] text-[#A64B2A] flex items-center justify-center shadow-xl border border-white/10 mx-auto">
          <Compass className="w-12 h-12 animate-pulse" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#A64B2A] text-white flex items-center justify-center">
          <HardHat className="w-4 h-4" />
        </div>
      </div>

      <span className="text-xs font-mono font-bold tracking-widest text-[#A64B2A] uppercase">
        Erreur 404 • Hors Périmètre
      </span>

      <h1 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#1E293B] dark:text-white mt-1">
        Zone de Chantier Introuvable
      </h1>

      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-2 mb-8 leading-relaxed">
        Le plan ou la ressource demandée n'existe pas ou a été déplacée vers un autre lot technique.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="primary"
          size="md"
          icon={Home}
          onClick={() => navigate('/')}
        >
          Retour au tableau de bord
        </Button>
        <Button
          variant="outline"
          size="md"
          icon={Search}
          onClick={() => navigate('/chantiers')}
        >
          Consulter les chantiers
        </Button>
      </div>

      {/* Bande de signalisation sécurité */}
      <div className="w-64 h-2 bg-stripes-safety rounded-full mt-12 opacity-80" />
    </PageTransition>
  );
}
