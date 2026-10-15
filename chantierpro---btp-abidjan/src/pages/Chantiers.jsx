/**
 * Page Liste des Chantiers (/chantiers)
 * Vue Cartes et Vue Tableau commutables, filtres par statut, recherche, tri et création de nouveau chantier
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  LayoutGrid,
  List,
  Search,
  Filter,
  Plus,
  Calendar,
  MapPin,
  Users,
  Coins,
  ArrowRight,
  TrendingUp,
  HardHat,
  ChevronDown
} from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatFCFA, formatDate } from '../utils/formatters.js';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Card from '../components/ui/Card.jsx';
import Modal from '../components/ui/Modal.jsx';
import Table, { TableRow, TableCell } from '../components/ui/Table.jsx';
import PageTransition from '../components/layout/PageTransition.jsx';

export default function Chantiers() {
  const navigate = useNavigate();
  const { sites, addSite } = useData();
  const { currentUser, isChef, isAdmin } = useAuth();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('progress_desc');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Formulaire nouveau chantier
  const [newSiteName, setNewSiteName] = useState('');
  const [newCommune, setNewCommune] = useState('Cocody');
  const [newCity, setNewCity] = useState('Abidjan');
  const [newType, setNewType] = useState('Résidentiel Haut Standing');
  const [newChefName, setNewChefName] = useState('Kouassi Koffi');
  const [newBudget, setNewBudget] = useState(450000000);
  const [newDateDebut, setNewDateDebut] = useState(new Date().toISOString().split('T')[0]);
  const [newDateFin, setNewDateFin] = useState('2027-06-30');
  const [newDescription, setNewDescription] = useState('');

  // Filtrage par permissions si chef de chantier
  const userSites = isChef && currentUser?.assignedSiteIds
    ? sites.filter(s => currentUser.assignedSiteIds.includes(s.id))
    : sites;

  // Filtrage combiné recherche et statut
  const filteredSites = userSites
    .filter(site => {
      const matchSearch =
        site.name.toLowerCase().includes(search.toLowerCase()) ||
        site.commune.toLowerCase().includes(search.toLowerCase()) ||
        site.chefName.toLowerCase().includes(search.toLowerCase()) ||
        site.type.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || site.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'progress_desc') return b.progress - a.progress;
      if (sortBy === 'progress_asc') return a.progress - b.progress;
      if (sortBy === 'budget_desc') return b.budgetTotal - a.budgetTotal;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return 0;
    });

  const handleCreateSite = async (e) => {
    e.preventDefault();
    if (!newSiteName.trim()) return;

    await addSite({
      name: newSiteName,
      commune: newCommune,
      city: newCity,
      type: newType,
      chefId: 'emp_01',
      chefName: newChefName,
      budgetTotal: Number(newBudget),
      dateDebut: newDateDebut,
      dateFinPrevue: newDateFin,
      description: newDescription || 'Nouveau chantier de construction BTP à Abidjan.',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?w=600&auto=format&fit=crop&q=80'
    });

    setIsNewModalOpen(false);
    setNewSiteName('');
    setNewDescription('');
  };

  return (
    <PageTransition className="space-y-6">
      {/* ================= EN-TÊTE DE LA PAGE ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#1E293B] dark:text-white uppercase tracking-tight">
            {isChef ? 'Mes Chantiers Assignés' : 'Supervision des Chantiers'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {filteredSites.length} chantier(s) actif(s) sur le territoire ivoirien
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Commutateur de vue grille / tableau */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#1E293B] text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Vue Grille de Cartes"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cartes</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#1E293B] text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Vue Tableau de Données"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Tableau</span>
            </button>
          </div>

          {/* Bouton création (admin uniquement) */}
          {isAdmin && (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => setIsNewModalOpen(true)}
              className="text-xs font-bold"
            >
              Nouveau chantier
            </Button>
          )}
        </div>
      </div>

      {/* ================= BARRE DE RECHERCHE ET FILTRES ================= */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Champ de recherche */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom de chantier, commune, chef de projet..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E293B] dark:focus:ring-blue-500"
          />
        </div>

        {/* Filtres de statut */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'En cours', 'En préparation', 'En finition', 'Livré'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#A64B2A] text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st === 'all' ? 'Tous les statuts' : st}
            </button>
          ))}

          {/* Sélecteur de tri */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="progress_desc">Avancement décroissant</option>
            <option value="progress_asc">Avancement croissant</option>
            <option value="budget_desc">Budget décroissant</option>
            <option value="name_asc">Nom alphabétique</option>
          </select>
        </div>
      </div>

      {/* ================= CONTENU : VUE CARTES OU TABLEAU ================= */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map((site) => (
            <div
              key={site.id}
              onClick={() => navigate(`/chantiers/${site.id}`)}
              className="group bg-white dark:bg-slate-900 rounded-xl border border-[#E8DFD8] dark:border-slate-800 hover:border-[#A64B2A] shadow-xs hover:shadow-md card-hover overflow-hidden cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Image de couverture avec badge statut */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                  <img
                    src={site.image}
                    alt={site.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Badge statut */}
                  <div className="absolute top-3 right-3">
                    <Badge size="sm">{site.status}</Badge>
                  </div>

                  {/* Localisation */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white/90 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#A64B2A]" />
                    <span>{site.commune}, {site.city}</span>
                  </div>
                </div>

                {/* Détails du projet */}
                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#A64B2A] block">
                      {site.type}
                    </span>
                    <h3 className="font-heading font-black text-lg text-[#1E293B] dark:text-white uppercase leading-snug group-hover:text-[#A64B2A] dark:group-hover:text-[#EAB308] transition-colors mt-0.5">
                      {site.name}
                    </h3>
                  </div>

                  {/* Chef de chantier & Effectif */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <HardHat className="w-4 h-4 text-slate-400" />
                      <span>{site.chefName}</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-mono">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{site.workersCount} ouvriers</span>
                    </span>
                  </div>

                  {/* Barre d'avancement technique */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500">Avancement physique</span>
                      <strong className="text-[#1E293B] dark:text-slate-100">{site.progress}%</strong>
                    </div>
                    <div className="w-full bg-[#E8DFD8] dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#A64B2A] to-[#EAB308] h-full rounded-full"
                        style={{ width: `${site.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pied de carte avec budget */}
              <div className="px-5 py-3 bg-[#F5EBE0]/70 dark:bg-slate-800 border-t border-[#E8DFD8] dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Budget consommé</span>
                  <span className="font-bold text-[#1E293B] dark:text-slate-200 font-mono">
                    {formatFCFA(site.budgetConsomme)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Plafond</span>
                  <span className="text-slate-600 dark:text-slate-400 font-mono">
                    {formatFCFA(site.budgetTotal)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ================= VUE TABLEAU ================= */
        <Table
          headers={[
            'Nom du Chantier',
            'Commune / Ville',
            'Conducteur de travaux',
            'Effectif',
            'Avancement',
            'Budget Consommé',
            'Statut',
            'Action'
          ]}
        >
          {filteredSites.map((site) => (
            <TableRow
              key={site.id}
              onClick={() => navigate(`/chantiers/${site.id}`)}
              className="cursor-pointer"
            >
              <TableCell className="font-semibold text-slate-900 dark:text-slate-100 font-heading text-sm">
                {site.name}
              </TableCell>
              <TableCell className="text-xs">
                {site.commune}, {site.city}
              </TableCell>
              <TableCell className="text-xs font-medium">
                {site.chefName}
              </TableCell>
              <TableCell className="text-xs font-mono">
                {site.workersCount} ouvriers
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs">{site.progress}%</span>
                  <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#A64B2A] h-full"
                      style={{ width: `${site.progress}%` }}
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                {formatFCFA(site.budgetConsomme)}
              </TableCell>
              <TableCell>
                <Badge size="sm">{site.status}</Badge>
              </TableCell>
              <TableCell>
                <span className="text-xs text-[#A64B2A] font-bold hover:underline flex items-center gap-1">
                  Ouvrir <ArrowRight className="w-3 h-3" />
                </span>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}

      {/* ================= MODAL DE CRÉATION NOUVEAU CHANTIER ================= */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Créer un nouveau chantier BTP"
        subtitle="Ouverture d'une nouvelle affaire et affectation initiale"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateSite} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Désignation du Chantier
            </label>
            <input
              type="text"
              required
              value={newSiteName}
              onChange={(e) => setNewSiteName(e.target.value)}
              placeholder="ex: Résidence Les Jardins d'Éden - Riviera Golf"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Commune
              </label>
              <select
                value={newCommune}
                onChange={(e) => setNewCommune(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="Cocody">Cocody</option>
                <option value="Plateau">Plateau</option>
                <option value="Yopougon">Yopougon</option>
                <option value="Marcory">Marcory</option>
                <option value="Port-Bouët">Port-Bouët</option>
                <option value="Bingerville">Bingerville</option>
                <option value="Zone Industrielle">Zone Industrielle</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Ville
              </label>
              <input
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Type de structure
              </label>
              <input
                type="text"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="ex: Immeuble R+5"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Chef de chantier
              </label>
              <input
                type="text"
                value={newChefName}
                onChange={(e) => setNewChefName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Budget Global Alloué (FCFA)
            </label>
            <input
              type="number"
              required
              step="5000000"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={newDateDebut}
                onChange={(e) => setNewDateDebut(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Fin prévisionnelle
              </label>
              <input
                type="date"
                value={newDateFin}
                onChange={(e) => setNewDateFin(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNewModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Créer le chantier
            </Button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
}
