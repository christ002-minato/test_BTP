/**
 * Fiche détaillée d'un chantier (/chantiers/:id)
 * 4 onglets métier : Vue d'ensemble, Stocks du chantier, Équipe affectée, Journal de chantier
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Package,
  Users,
  BookOpen,
  Calendar,
  MapPin,
  HardHat,
  Coins,
  CheckCircle2,
  Clock,
  Plus,
  CloudSun,
  ShieldCheck,
  AlertTriangle,
  Phone,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatFCFA, formatDate, formatRelativeTime } from '../utils/formatters.js';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import Table, { TableRow, TableCell } from '../components/ui/Table.jsx';
import Gauge from '../components/ui/Gauge.jsx';
import PageTransition from '../components/layout/PageTransition.jsx';

export default function ChantierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sites, materials, employees, siteLogs, addSiteLog, declareStockExit } = useData();
  const { currentUser, isChef } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'stocks' | 'team' | 'logs'
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [exitQty, setExitQty] = useState(1);
  const [exitMotif, setExitMotif] = useState('');

  // Formulaire nouveau journal
  const [logTitre, setLogTitre] = useState('');
  const [logMeteo, setLogMeteo] = useState('Ensoleillé, 30°C');
  const [logEffectif, setLogEffectif] = useState(25);
  const [logContenu, setLogContenu] = useState('');
  const [logTags, setLogTags] = useState('Coulage, Gros œuvre');

  const site = sites.find((s) => s.id === id);

  if (!site) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Chantier introuvable ou supprimé.
        </h2>
        <Button variant="primary" onClick={() => navigate('/chantiers')}>
          Retour aux chantiers
        </Button>
      </div>
    );
  }

  // Filtrage des éléments associés à ce chantier
  const siteMaterials = materials.filter((m) => m.siteId === site.id);
  const siteEmployees = employees.filter((e) => e.siteId === site.id);
  const siteLogsList = siteLogs.filter((l) => l.siteId === site.id);

  // Soumission nouveau journal
  const handleCreateLog = async (e) => {
    e.preventDefault();
    if (!logTitre.trim() || !logContenu.trim()) return;

    await addSiteLog({
      siteId: site.id,
      titre: logTitre,
      auteur: currentUser?.name || 'Conducteur de Travaux',
      meteo: logMeteo,
      effectifPresent: Number(logEffectif),
      contenu: logContenu,
      tags: logTags.split(',').map((t) => t.trim()),
      validationSecurite: true
    });

    setIsLogModalOpen(false);
    setLogTitre('');
    setLogContenu('');
  };

  // Soumission sortie de stock
  const handleExitStock = async (e) => {
    e.preventDefault();
    if (!selectedMaterial || exitQty <= 0) return;

    await declareStockExit({
      materialId: selectedMaterial.id,
      siteId: site.id,
      quantite: Number(exitQty),
      motif: exitMotif || `Sortie directe chantier ${site.name}`,
      operateur: currentUser?.name || 'Chef de chantier'
    });

    setIsExitModalOpen(false);
    setSelectedMaterial(null);
    setExitQty(1);
    setExitMotif('');
  };

  return (
    <PageTransition className="space-y-6">
      {/* ================= BARRE DE NAVIGATION & RETOUR ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/chantiers')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[#0B1B3A] dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la liste des chantiers</span>
        </button>

        <div className="flex items-center gap-2">
          <Badge size="md">{site.status}</Badge>
          <span className="text-xs font-mono text-slate-400">
            ID: {site.id}
          </span>
        </div>
      </div>

      {/* ================= EN-TÊTE DU CHANTIER ================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="relative h-48 sm:h-64 w-full bg-slate-900 overflow-hidden">
          <img
            src={site.image}
            alt={site.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B3A] via-[#0B1B3A]/40 to-transparent" />

          {/* Informations superposées */}
          <div className="absolute bottom-5 left-5 right-5 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#F26B1D] font-bold">
                {site.type}
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-black uppercase text-white tracking-tight leading-tight">
                {site.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#F26B1D]" />
                  {site.commune}, {site.city}
                </span>
                <span className="flex items-center gap-1.5">
                  <HardHat className="w-3.5 h-3.5 text-[#F26B1D]" />
                  Chef : {site.chefName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#F26B1D]" />
                  Livraison : {formatDate(site.dateFinPrevue, 'short')}
                </span>
              </div>
            </div>

            {/* Pourcentage d'avancement principal */}
            <div className="bg-[#0B1B3A]/90 backdrop-blur-xs p-3.5 rounded-xl border border-white/10 text-right shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Avancement global</span>
              <div className="text-3xl font-black font-heading text-[#F26B1D]">
                {site.progress}%
              </div>
            </div>
          </div>
        </div>

        {/* ================= ONGLETS DE NAVIGATION ================= */}
        <div className="px-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: Building2 },
            { id: 'stocks', label: `Stocks du chantier (${siteMaterials.length})`, icon: Package },
            { id: 'team', label: `Équipe affectée (${siteEmployees.length})`, icon: Users },
            { id: 'logs', label: `Journal de chantier (${siteLogsList.length})`, icon: BookOpen }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-3.5 text-xs sm:text-sm font-heading uppercase tracking-wider font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-[#F26B1D] text-[#0B1B3A] dark:text-white bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F26B1D]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= CONTENU DE L'ONGLET 1 : VUE D'ENSEMBLE ================= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche : Description, Budget et Jalons */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description du projet */}
            <Card title="Descriptif du Programme & Objectifs" icon={Building2}>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {site.description}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Date de Démarrage</span>
                  <strong className="text-slate-800 dark:text-slate-200">{formatDate(site.dateDebut, 'short')}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Livraison Contractuelle</span>
                  <strong className="text-slate-800 dark:text-slate-200">{formatDate(site.dateFinPrevue, 'short')}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Ouvriers Actifs</span>
                  <strong className="text-slate-800 dark:text-slate-200">{site.workersCount} personnes</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Réf. Affaire</span>
                  <strong className="font-mono text-slate-800 dark:text-slate-200">{site.id.toUpperCase()}</strong>
                </div>
              </div>
            </Card>

            {/* Jalons prévisionnels & Planning */}
            <Card title="Planning & Jalons Techniques" icon={CheckCircle2}>
              <div className="space-y-3">
                {site.jalons?.map((jalon, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${
                      jalon.done
                        ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                          jalon.done
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {jalon.done ? '✓' : idx + 1}
                      </div>
                      <span className={`text-sm font-semibold ${jalon.done ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {jalon.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
                      <span>{jalon.date ? formatDate(jalon.date, 'short') : 'À venir'}</span>
                      <Badge size="sm" variant={jalon.done ? 'success' : 'neutral'}>
                        {jalon.done ? 'Validé' : 'En cours'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Colonne droite : Suivi Budgétaire & Métriques */}
          <div className="space-y-6">
            <Card title="Consommation Budgétaire (FCFA)" icon={Coins} accent="safety">
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400 font-mono uppercase block">Budget Total Alloué</span>
                  <div className="text-2xl font-black font-heading text-[#0B1B3A] dark:text-white font-mono">
                    {formatFCFA(site.budgetTotal)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500">Engagé : {formatFCFA(site.budgetConsomme)}</span>
                    <strong className="text-[#F26B1D]">
                      {Math.round((site.budgetConsomme / (site.budgetTotal || 1)) * 100)}%
                    </strong>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-[#F26B1D] h-full rounded-full"
                      style={{ width: `${(site.budgetConsomme / (site.budgetTotal || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>Reliquat disponible :</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatFCFA(site.budgetTotal - site.budgetConsomme)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Météo chantier & Contact d'urgence */}
            <Card title="Conditions & Sécurité Chantier" icon={ShieldCheck}>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300">
                  <div className="flex items-center gap-2">
                    <CloudSun className="w-4 h-4 text-amber-600" />
                    <span>Météo : 29°C Ensoleillé</span>
                  </div>
                  <span className="font-mono font-bold">Vent: 12 km/h</span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Responsable Sécurité (QSE)</span>
                  <p className="font-bold text-slate-800 dark:text-slate-100">Kouamé Adjoua Patricia</p>
                  <p className="font-mono text-slate-500">+225 01 98 76 54 32</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ================= CONTENU DE L'ONGLET 2 : STOCKS DU CHANTIER ================= */}
      {activeTab === 'stocks' && (
        <Card
          title={`Inventaire des Matériaux sur site (${siteMaterials.length})`}
          subtitle="Suivi des dotations, consommations et niveaux d'alerte spécifiques"
          icon={Package}
        >
          {siteMaterials.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              Aucun matériau spécifiquement affecté à ce chantier dans le système central.
            </div>
          ) : (
            <Table
              headers={[
                'Code / Matériau',
                'Catégorie',
                'Niveau Actuel',
                'Seuil Alerte',
                'Statut',
                'Action Rapide'
              ]}
            >
              {siteMaterials.map((mat) => (
                <TableRow key={mat.id}>
                  <TableCell>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 font-heading text-sm block">
                        {mat.name}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {mat.code}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {mat.category}
                  </TableCell>
                  <TableCell className="w-48">
                    <Gauge
                      current={mat.stockActuel}
                      threshold={mat.seuilAlerte}
                      optimal={mat.seuilOptimal}
                      unit={mat.unit}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {mat.seuilAlerte} {mat.unit}
                  </TableCell>
                  <TableCell>
                    <Badge size="sm">{mat.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        setSelectedMaterial(mat);
                        setIsExitModalOpen(true);
                      }}
                      className="text-xs"
                    >
                      Sortie de stock
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          )}
        </Card>
      )}

      {/* ================= CONTENU DE L'ONGLET 3 : ÉQUIPE AFFECTÉE ================= */}
      {activeTab === 'team' && (
        <Card
          title={`Équipe du Chantier (${siteEmployees.length} collaborateurs)`}
          subtitle="Encadrement, ouvriers qualifiés et manœuvres affectés sur ce site"
          icon={Users}
        >
          <Table
            headers={[
              'Collaborateur',
              'Matricule',
              'Fonction Métier',
              'Département',
              'Contact Téléphone',
              'Pointage Aujourd\'hui'
            ]}
          >
            {siteEmployees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {emp.prenom} {emp.nom}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-400">
                  {emp.matricule}
                </TableCell>
                <TableCell className="text-xs font-semibold text-[#0B1B3A] dark:text-slate-200">
                  {emp.fonction}
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {emp.departement}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  <a href={`tel:${emp.telephone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {emp.telephone}
                  </a>
                </TableCell>
                <TableCell>
                  <Badge
                    size="sm"
                    variant={emp.pointageAujourdhui === 'present' ? 'success' : (emp.pointageAujourdhui === 'retard' ? 'warning' : 'rupture')}
                  >
                    {emp.pointageAujourdhui === 'present' ? 'Présent' : (emp.pointageAujourdhui === 'retard' ? 'Retard' : 'Absent')}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Card>
      )}

      {/* ================= CONTENU DE L'ONGLET 4 : JOURNAL DE CHANTIER ================= */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-black uppercase text-[#0B1B3A] dark:text-white">
                Rapports Quotidiens de Chantier
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Historique légal des coulages, inspections et conditions météorologiques
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsLogModalOpen(true)}
            >
              Ajouter une entrée
            </Button>
          </div>

          <div className="space-y-4">
            {siteLogsList.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                Aucun compte-rendu consigné pour l'instant. Rédigez le premier journal de chantier.
              </div>
            ) : (
              siteLogsList.map((log) => (
                <div
                  key={log.id}
                  className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <span className="text-[11px] font-mono text-[#F26B1D] font-bold uppercase">
                        {formatDate(log.date, 'long')} à {log.heure}
                      </span>
                      <h4 className="font-heading font-black text-base text-[#0B1B3A] dark:text-white uppercase mt-0.5">
                        {log.titre}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        Effectif : {log.effectifPresent} ouvriers
                      </span>
                      <span className="px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/40 text-xs text-amber-800 dark:text-amber-300 font-medium">
                        {log.meteo}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {log.contenu}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 text-slate-400">
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      Rédacteur : <strong>{log.auteur}</strong>
                    </span>
                    <div className="flex gap-1.5">
                      {log.tags?.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 font-mono uppercase">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL AJOUT JOURNAL DE CHANTIER ================= */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Ajouter une note au Journal de Chantier"
        subtitle={`Chantier : ${site.name}`}
      >
        <form onSubmit={handleCreateLog} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Titre de l'opération ou compte-rendu
            </label>
            <input
              type="text"
              required
              value={logTitre}
              onChange={(e) => setLogTitre(e.target.value)}
              placeholder="ex: Coulage dalles niveau R+2 et coulage escalier"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Conditions météo
              </label>
              <input
                type="text"
                value={logMeteo}
                onChange={(e) => setLogMeteo(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Effectif sur site
              </label>
              <input
                type="number"
                value={logEffectif}
                onChange={(e) => setLogEffectif(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Observations détaillées & Incidents
            </label>
            <textarea
              rows={4}
              required
              value={logContenu}
              onChange={(e) => setLogContenu(e.target.value)}
              placeholder="Volumes coulés, contrôles qualité, arrivées transporteurs..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Mots-clés / Tags (séparés par virgules)
            </label>
            <input
              type="text"
              value={logTags}
              onChange={(e) => setLogTags(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsLogModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Enregistrer au journal
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL SORTIE DE STOCK DU SITE ================= */}
      <Modal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        title="Déclarer une sortie de matériau"
        subtitle={selectedMaterial ? `${selectedMaterial.name} (Restant: ${selectedMaterial.stockActuel} ${selectedMaterial.unit})` : ''}
      >
        <form onSubmit={handleExitStock} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Quantité à prélever ({selectedMaterial?.unit})
            </label>
            <input
              type="number"
              min="1"
              max={selectedMaterial?.stockActuel || 9999}
              required
              value={exitQty}
              onChange={(e) => setExitQty(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-lg font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Motif de la sortie
            </label>
            <input
              type="text"
              required
              value={exitMotif}
              onChange={(e) => setExitMotif(e.target.value)}
              placeholder="ex: Ferraillage poutres R+1 Villa B"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsExitModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirmer la sortie
            </Button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
}
