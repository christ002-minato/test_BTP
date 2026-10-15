/**
 * Page de Connexion ChantierPro (/connexion)
 * Écran scindé : panneau bleu nuit animé à gauche, formulaire avec 3 comptes démo cliquables à droite
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HardHat,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  Building2,
  CheckCircle2,
  Users,
  Coins
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import CountUp from '../components/ui/CountUp.jsx';

export default function Login() {
  const { login, loading, authError, setAuthError, savedEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(savedEmail || 'admin@chantierpro.ci');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Redirection après connexion
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Veuillez renseigner votre adresse e-mail et votre mot de passe.');
      return;
    }

    const success = await login(email, password, rememberMe);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  // Pré-remplissage rapide des 3 comptes de démonstration
  const selectDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setAuthError(null);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F5EBE0] dark:bg-[#1E293B] text-slate-800 dark:text-slate-100">
      {/* ================= PANNEAU GAUCHE (PHOTO CHANTIER RÉELLE) ================= */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0F172A] overflow-hidden flex-col justify-between p-12 border-r border-[#334155]">
        {/* Photo réelle de chantier BTP Abidjan */}
        <img
          src="https://images.unsplash.com/photo-1541888946425-d0fbb1861564?w=1400&auto=format&fit=crop&q=80"
          alt="Ouvriers sur un chantier de construction"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Voile terracotta/ardoise pour la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A]/96 via-[#1E293B]/88 to-[#A64B2A]/70" />

        {/* Grille technique de plan BTP */}
        <div className="absolute inset-0 bg-blueprint-grid opacity-25" />

        {/* Motifs géométriques de plan en SVG */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -right-12 -top-12 w-72 h-72 rounded-full border border-[#EAB308]/20 pointer-events-none" />

        {/* En-tête marque */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#A64B2A] text-white flex items-center justify-center shadow-lg shadow-[#A64B2A]/30 border border-[#8B3A2B]">
            <HardHat className="w-7 h-7" />
          </div>
          <div>
            <span className="font-heading text-2xl font-black tracking-wider text-white block uppercase leading-none">
              Chantier<span className="text-[#EAB308]">Pro</span>
            </span>
            <span className="text-xs text-slate-300 font-mono tracking-widest block uppercase mt-1">
              Plateforme SaaS BTP • Abidjan
            </span>
          </div>
        </div>

        {/* Cœur visuel : phrase d'accroche */}
        <div className="relative z-10 my-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAB308]/15 border border-[#EAB308]/40 text-[#EAB308] text-xs font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-ping" />
              Système Opérationnel • Région Côte d'Ivoire
            </div>

            <h1 className="font-heading text-4xl xl:text-5xl font-black text-white uppercase tracking-tight leading-tight">
              La rigueur d’ingénieur au service de vos <span className="text-[#EAB308]">chantiers</span>.
            </h1>

            <p className="text-slate-200 text-sm xl:text-base max-w-lg leading-relaxed font-normal">
              Suivi en temps réel des stocks de matériaux, pointage journalier des équipes sur site, et maîtrise des coûts en Francs CFA à Abidjan et sur tout le territoire.
            </p>
          </motion.div>

          {/* SVG animé de plan d'architecte */}
          <div className="mt-8 p-4 rounded-xl bg-[#0F172A]/70 border border-[#334155] backdrop-blur-xs">
            <svg className="w-full h-32" viewBox="0 0 400 120" fill="none" aria-hidden="true">
              {/* Lignes d'ingénierie */}
              <motion.path
                d="M 20 100 L 80 40 L 140 100 L 200 20 L 260 100 L 320 50 L 380 100"
                stroke="#38BDF8"
                strokeWidth="2"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />
              <motion.path
                d="M 20 100 H 380"
                stroke="#64748B"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.5 }}
              />
              <motion.rect
                x="180"
                y="20"
                width="40"
                height="80"
                stroke="#EAB308"
                strokeWidth="2"
                fill="rgba(234, 179, 8, 0.12)"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
              />
              <circle cx="200" cy="20" r="4" fill="#EAB308" />
              <text x="210" y="25" fill="#EAB308" fontSize="10" fontFamily="monospace">PILIER AXE B2</text>
            </svg>
          </div>

          {/* Chiffres clés qui défilent */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="p-3.5 rounded-lg bg-[#0F172A]/80 border border-[#334155]">
              <span className="text-[11px] text-slate-300 uppercase font-mono block">Chantiers Actifs</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                <CountUp end={6} duration={1000} />
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-[#0F172A]/80 border border-[#334155]">
              <span className="text-[11px] text-slate-300 uppercase font-mono block">Budget Sous Gestion</span>
              <div className="text-xl font-bold font-mono text-[#EAB308] mt-1">
                <CountUp end={5170} suffix=" M" duration={1200} />
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-[#0F172A]/80 border border-[#334155]">
              <span className="text-[11px] text-slate-300 uppercase font-mono block">Taux Présence Moy.</span>
              <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
                <CountUp end={94} suffix="%" duration={1100} />
              </div>
            </div>
          </div>
        </div>

        {/* Pied de panneau gauche */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-300 border-t border-[#334155] pt-4">
          <span>Cocody • Plateau • San-Pédro • Yamoussoukro</span>
          <span className="font-mono text-[#EAB308]">CERTIFIÉ ISO 9001 BTP</span>
        </div>
      </div>

      {/* ================= PANNEAU DROIT (FORMULAIRE & COMPTES DÉMO) ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
        <div className="w-full max-w-md space-y-6">
          {/* Logo visible sur mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-[#A64B2A] text-white flex items-center justify-center">
              <HardHat className="w-5 h-5" />
            </div>
            <span className="font-heading text-xl font-black uppercase text-[#1E293B] dark:text-white">
              Chantier<span className="text-[#A64B2A]">Pro</span>
            </span>
          </div>

          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#1E293B] dark:text-white uppercase tracking-tight">
              Espace Sécurisé Chantier
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Connectez-vous pour accéder au pilotage de vos chantiers et stocks.
            </p>
          </div>

          {/* Message d'erreur animé */}
          <AnimatePresence>
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 flex items-start gap-3 text-xs sm:text-sm text-rose-700 dark:text-rose-300"
              >
                <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
                <span className="leading-snug">{authError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formulaire de connexion */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Adresse e-mail professionnelle
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  required
                  placeholder="nom@chantierpro.ci"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A64B2A] dark:focus:ring-[#EAB308] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Mot de passe
                </label>
                <span className="text-[11px] text-slate-400 font-mono">Démo: password123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A64B2A] dark:focus:ring-[#EAB308] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#A64B2A] focus:ring-[#A64B2A] border-slate-300"
                />
                <span className="text-slate-600 dark:text-slate-400">Se souvenir de moi</span>
              </label>
              <span className="text-[#A64B2A] hover:underline cursor-pointer">
                Assistance technique ?
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full font-heading text-base tracking-wider uppercase"
              icon={ArrowRight}
              iconPosition="right"
            >
              Accéder à la plateforme
            </Button>
          </form>

          {/* ================= 3 COMPTES DE DÉMONSTRATION CLIQUABLES ================= */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              Accès rapide démo (Cliquez pour tester un profil) :
            </p>

            <div className="space-y-2">
              {/* 1. Administrateur */}
              <button
                type="button"
                onClick={() => selectDemoAccount('admin@chantierpro.ci', 'password123')}
                className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                  email === 'admin@chantierpro.ci'
                    ? 'border-[#1E293B] dark:border-blue-500 bg-[#1E293B]/5 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    AD
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      Amadou Coulibaly (Directeur Travaux)
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      admin@chantierpro.ci • Tous droits d'accès
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1E293B] text-white shrink-0">
                  Admin
                </span>
              </button>

              {/* 2. Chef de chantier */}
              <button
                type="button"
                onClick={() => selectDemoAccount('chef@chantierpro.ci', 'password123')}
                className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                  email === 'chef@chantierpro.ci'
                    ? 'border-[#A64B2A] bg-[#A64B2A]/10'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#A64B2A] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    CC
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      Kouassi Koffi (Chef de chantier Cocody)
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      chef@chantierpro.ci • Chantiers affectés & pointage
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#A64B2A] text-white shrink-0">
                  Chef
                </span>
              </button>

              {/* 3. Magasinier */}
              <button
                type="button"
                onClick={() => selectDemoAccount('magasin@chantierpro.ci', 'password123')}
                className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                  email === 'magasin@chantierpro.ci'
                    ? 'border-[#0284C7] bg-sky-50 dark:bg-[#0284C7]/15'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#0284C7] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    MG
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      Bakayoko Drissa (Magasinier Central)
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      magasin@chantierpro.ci • Stocks & Bons commandes
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0284C7] text-white shrink-0">
                  Magasin
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
