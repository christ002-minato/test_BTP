/**
 * Page Paramètres & Profil (/parametres)
 * Profil utilisateur, bascule thème clair/sombre, alertes et réinitialisation des données
 */

import React, { useState } from 'react';
import {
  Settings,
  User,
  Moon,
  Sun,
  Bell,
  RotateCcw,
  Shield,
  Smartphone,
  Mail,
  Building2,
  HardHat,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Modal from '../components/ui/Modal.jsx';
import PageTransition from '../components/layout/PageTransition.jsx';

export default function Parametres() {
  const { currentUser } = useAuth();
  const { theme, toggleTheme, resetAllData, addToast } = useData();

  const [notifStock, setNotifStock] = useState(true);
  const [notifLivraison, setNotifLivraison] = useState(true);
  const [notifPointage, setNotifPointage] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    addToast({
      type: 'success',
      message: 'Préférences d\'alerte et de système enregistrées.'
    });
  };

  const handleConfirmReset = () => {
    resetAllData();
    setIsResetModalOpen(false);
  };

  return (
    <PageTransition className="space-y-6 max-w-4xl">
      {/* ================= EN-TÊTE ================= */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#1E293B] dark:text-white uppercase tracking-tight">
          Paramètres du Système & Profil
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Configuration des préférences utilisateur, affichage et maintenance des données
        </p>
      </div>

      {/* ================= 1. PROFIL DE L'UTILISATEUR CONNECTÉ ================= */}
      <Card title="Profil Utilisateur & Accréditations" icon={User}>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <img
            src={currentUser?.avatar}
            alt={currentUser?.name}
            className="w-16 h-16 rounded-xl object-cover ring-2 ring-[#A64B2A]"
          />
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-black text-lg text-[#1E293B] dark:text-white uppercase">
                {currentUser?.name}
              </h3>
              <Badge size="sm" variant="safety">
                {currentUser?.role}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {currentUser?.title}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-2 font-mono">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {currentUser?.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                {currentUser?.phone}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* ================= 2. APPARENCE & THÈME ================= */}
      <Card title="Apparence de l'Interface" icon={theme === 'dark' ? Moon : Sun}>
        <div className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choisissez le mode visuel adapté aux conditions de luminosité (bureau ou soleil sur le chantier).
          </p>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <button
              type="button"
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-[#1E293B] ring-2 ring-[#1E293B]/20 bg-slate-50'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Sun className="w-6 h-6 text-amber-500 mb-2" />
              <strong className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                Mode Clair (Défaut)
              </strong>
              <span className="text-xs text-slate-500">
                Idéal en plein jour et pour les rapports imprimés.
              </span>
            </button>

            <button
              type="button"
              onClick={() => theme === 'light' && toggleTheme()}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-[#A64B2A] ring-2 ring-[#A64B2A]/20 bg-slate-800'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Moon className="w-6 h-6 text-blue-400 mb-2" />
              <strong className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                Mode Sombre (Ingénieur)
              </strong>
              <span className="text-xs text-slate-500">
                Repos visuel et contraste bleu nuit accentué.
              </span>
            </button>
          </div>
        </div>
      </Card>

      {/* ================= 3. NOTIFICATIONS ET ALERTES ================= */}
      <Card title="Préférences des Alertes Opérationnelles" icon={Bell}>
        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifStock}
                onChange={(e) => setNotifStock(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-[#A64B2A] focus:ring-[#A64B2A]"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Alertes de rupture et stock critique
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Notification immédiate dès qu'un matériau passe sous le seuil d'alerte.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifLivraison}
                onChange={(e) => setNotifLivraison(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-[#A64B2A] focus:ring-[#A64B2A]"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Réceptions de livraisons fournisseurs
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Signalement lors de la validation d'un bon de livraison (BL).
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifPointage}
                onChange={(e) => setNotifPointage(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-[#A64B2A] focus:ring-[#A64B2A]"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Rappel quotidien de pointage (08h00)
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Rappel automatique au chef de chantier pour valider l'appel du matin.
                </span>
              </div>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button type="submit" variant="primary" size="sm">
              Enregistrer les préférences
            </Button>
          </div>
        </form>
      </Card>

      {/* ================= 4. MAINTENANCE ET RÉINITIALISATION DÉMO ================= */}
      <Card title="Maintenance & Données Démo" icon={RotateCcw} accent="danger">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Réinitialiser la base de démonstration
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Restaure l'ensemble des 6 chantiers, 20 matériaux et 60 mouvements initiaux de Côte d'Ivoire.
            </p>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsResetModalOpen(true)}
            className="shrink-0 text-xs font-bold"
          >
            Réinitialiser les données
          </Button>
        </div>
      </Card>

      {/* Modal confirmation réinitialisation */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Confirmer la réinitialisation"
        subtitle="Cette opération réinitialisera votre session locale"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Êtes-vous certain de vouloir réinitialiser la base de données ? Toutes les modifications locales effectuées (créations de commandes, pointages, sorties de stocks) seront restaurées à leur état de démonstration d'origine.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsResetModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmReset}>
              Oui, tout réinitialiser
            </Button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
}
