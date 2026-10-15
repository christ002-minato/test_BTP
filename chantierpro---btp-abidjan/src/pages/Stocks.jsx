/**
 * Page de Gestion des Stocks & Matériaux (/stocks)
 * Tableau technique, jauges dynamiques, alertes, 4 actions (sortie, entrée, transfert, ajout),
 * tiroir d'historique des 60 mouvements et export CSV conforme
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Download,
  History,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatFCFA, formatDate, exportToCSV, formatRelativeTime } from '../utils/formatters.js';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import Drawer from '../components/ui/Drawer.jsx';
import Table, { TableRow, TableCell } from '../components/ui/Table.jsx';
import Gauge from '../components/ui/Gauge.jsx';
import PageTransition from '../components/layout/PageTransition.jsx';

export default function Stocks() {
  const {
    materials,
    sites,
    movements,
    suppliers,
    declareStockExit,
    declareStockEntry,
    declareStockTransfer,
    addMaterial
  } = useData();

  const { currentUser, isChef, isMagasinier, isAdmin } = useAuth();

  // États de filtrage
  const [search, setSearch] = useState('');
  const [siteFilter, setSiteFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Tiroir d'historique des mouvements
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [historyFilterType, setHistoryFilterType] = useState('all');

  // Modales d'actions
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isNewMatModalOpen, setIsNewMatModalOpen] = useState(false);

  // État du matériau sélectionné
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [actionQty, setActionQty] = useState(10);
  const [actionMotif, setActionMotif] = useState('');
  const [actionRefBon, setActionRefBon] = useState('');
  const [actionDestSiteId, setActionDestSiteId] = useState('');

  // Nouveau matériau
  const [newMatName, setNewMatName] = useState('');
  const [newMatCode, setNewMatCode] = useState('');
  const [newMatCategory, setNewMatCategory] = useState('Gros œuvre');
  const [newMatUnit, setNewMatUnit] = useState('Sacs 50kg');
  const [newMatSiteId, setNewMatSiteId] = useState(sites[0]?.id || '');
  const [newMatStock, setNewMatStock] = useState(100);
  const [newMatSeuil, setNewMatSeuil] = useState(30);
  const [newMatOptimal, setNewMatOptimal] = useState(250);
  const [newMatPrice, setNewMatPrice] = useState(5000);

  // Catégories distinctes
  const categories = ['all', ...Array.from(new Set(materials.map((m) => m.category)))];

  // Filtrage combiné
  const filteredMaterials = materials.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      m.siteName.toLowerCase().includes(search.toLowerCase());
    const matchSite = siteFilter === 'all' || m.siteId === siteFilter;
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchCat = categoryFilter === 'all' || m.category === categoryFilter;
    return matchSearch && matchSite && matchStatus && matchCat;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage) || 1;
  const paginatedMaterials = filteredMaterials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Mouvements filtrés pour le tiroir
  const filteredMovements = movements.filter((m) => {
    if (historyFilterType === 'all') return true;
    return m.type === historyFilterType;
  });

  // Action : Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Code Matériau',
      'Désignation',
      'Catégorie',
      'Chantier Affecté',
      'Stock Actuel',
      'Unité',
      'Seuil Critique',
      'Seuil Optimal',
      'Prix Unitaire (FCFA)',
      'Valeur Stock (FCFA)',
      'Statut'
    ];

    const rows = filteredMaterials.map((m) => [
      m.code,
      m.name,
      m.category,
      m.siteName,
      m.stockActuel,
      m.unit,
      m.seuilAlerte,
      m.seuilOptimal,
      m.prixUnitaire,
      m.stockActuel * m.prixUnitaire,
      m.status
    ]);

    exportToCSV(`inventaire_stocks_chantierpro_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  // Exécution : Sortie de stock
  const submitStockExit = async (e) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    await declareStockExit({
      materialId: selectedMaterial.id,
      quantite: Number(actionQty),
      motif: actionMotif || 'Sortie pour travaux de coulage',
      operateur: currentUser?.name || 'Opérateur Chantier'
    });

    setIsExitModalOpen(false);
    setSelectedMaterial(null);
  };

  // Exécution : Réapprovisionnement
  const submitStockEntry = async (e) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    await declareStockEntry({
      materialId: selectedMaterial.id,
      quantite: Number(actionQty),
      motif: actionMotif || 'Livraison commande fournisseur',
      operateur: currentUser?.name || 'Magasinier',
      refBon: actionRefBon
    });

    setIsEntryModalOpen(false);
    setSelectedMaterial(null);
  };

  // Exécution : Transfert inter-chantiers
  const submitStockTransfer = async (e) => {
    e.preventDefault();
    if (!selectedMaterial || !actionDestSiteId) return;

    await declareStockTransfer({
      materialId: selectedMaterial.id,
      sourceSiteId: selectedMaterial.siteId,
      destSiteId: actionDestSiteId,
      quantite: Number(actionQty),
      motif: actionMotif || 'Transfert inter-chantiers d\'urgence',
      operateur: currentUser?.name || 'Magasinier'
    });

    setIsTransferModalOpen(false);
    setSelectedMaterial(null);
  };

  // Exécution : Nouveau matériau
  const submitNewMaterial = async (e) => {
    e.preventDefault();
    if (!newMatName.trim()) return;

    const assignedSite = sites.find((s) => s.id === newMatSiteId);

    await addMaterial({
      name: newMatName,
      code: newMatCode || `MAT-${newMatCategory.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      category: newMatCategory,
      unit: newMatUnit,
      siteId: newMatSiteId,
      siteName: assignedSite ? assignedSite.name : 'Dépôt Central Abidjan',
      stockActuel: Number(newMatStock),
      seuilAlerte: Number(newMatSeuil),
      seuilOptimal: Number(newMatOptimal),
      prixUnitaire: Number(newMatPrice),
      supplierId: suppliers[0]?.id || 'sup_01',
      supplierName: suppliers[0]?.name || 'Fournisseur Agréé CI'
    });

    setIsNewMatModalOpen(false);
    setNewMatName('');
    setNewMatCode('');
  };

  return (
    <PageTransition className="space-y-6">
      {/* ================= EN-TÊTE & BOUTONS D'ACTIONS ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#1E293B] dark:text-white uppercase tracking-tight">
            Gestion des Stocks & Matériaux
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Suivi des approvisionnements, seuils de sécurité et flux de matériaux à Abidjan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Bouton Export CSV */}
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
            className="text-xs"
          >
            Exporter CSV
          </Button>

          {/* Bouton Historique Mouvements */}
          <Button
            variant="outline"
            size="sm"
            icon={History}
            onClick={() => setIsHistoryDrawerOpen(true)}
            className="text-xs"
          >
            Mouvements ({movements.length})
          </Button>

          {/* Bouton Nouveau Matériau (Admin & Magasinier) */}
          {(isAdmin || isMagasinier) && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsNewMatModalOpen(true)}
              className="text-xs font-bold"
            >
              Nouveau matériau
            </Button>
          )}
        </div>
      </div>

      {/* ================= RECHERCHE & FILTRES RAPIDES ================= */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Recherche */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Rechercher par libellé de matériau, référence, chantier..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
            />
          </div>

          {/* Filtre Chantier */}
          <div>
            <select
              value={siteFilter}
              onChange={(e) => {
                setSiteFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">Tous les chantiers</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Catégorie */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">Toutes les catégories</option>
              {categories.filter((c) => c !== 'all').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Boutons d'état : Normal / À surveiller / Critique / Rupture */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase font-mono mr-1">
            Statut :
          </span>
          {[
            { id: 'all', label: 'Tous les niveaux' },
            { id: 'Normal', label: 'Normal' },
            { id: 'À surveiller', label: 'À surveiller' },
            { id: 'Critique', label: 'Critique' },
            { id: 'Rupture', label: 'Rupture immédiate' }
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => {
                setStatusFilter(st.id);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-[#1E293B] text-white dark:bg-blue-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= TABLEAU TECHNIQUE DES STOCKS ================= */}
      <Table
        headers={[
          'Réf. & Matériau',
          'Catégorie',
          'Chantier Affecté',
          'Jauge Stock / Seuil',
          'Prix Unitaire',
          'Valeur en Stock',
          'Statut',
          'Actions de Flux'
        ]}
      >
        {paginatedMaterials.length === 0 ? (
          <tr>
            <td colSpan={8} className="p-12 text-center text-slate-400">
              Aucun matériau ne correspond aux filtres appliqués.
            </td>
          </tr>
        ) : (
          paginatedMaterials.map((mat) => (
            <TableRow key={mat.id}>
              {/* Libellé & Code */}
              <TableCell>
                <div className="min-w-0">
                  <span className="font-heading font-black text-sm text-[#1E293B] dark:text-white block uppercase">
                    {mat.name}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {mat.code}
                  </span>
                </div>
              </TableCell>

              {/* Catégorie */}
              <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                {mat.category}
              </TableCell>

              {/* Chantier affecté */}
              <TableCell className="text-xs font-medium text-slate-800 dark:text-slate-200">
                {mat.siteName}
              </TableCell>

              {/* Jauge interactive avec seuil d'alerte */}
              <TableCell className="w-56">
                <Gauge
                  current={mat.stockActuel}
                  threshold={mat.seuilAlerte}
                  optimal={mat.seuilOptimal}
                  unit={mat.unit}
                />
              </TableCell>

              {/* Prix unitaire */}
              <TableCell className="font-mono text-xs">
                {formatFCFA(mat.prixUnitaire)}
              </TableCell>

              {/* Valeur totale du stock */}
              <TableCell className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                {formatFCFA(mat.stockActuel * mat.prixUnitaire)}
              </TableCell>

              {/* Badge de statut */}
              <TableCell>
                <Badge size="sm">{mat.status}</Badge>
              </TableCell>

              {/* Actions de flux BTP (Sortie, Entrée, Transfert) */}
              <TableCell>
                <div className="flex items-center gap-1.5">
                  {/* Bouton Sortie */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMaterial(mat);
                      setActionQty(Math.min(10, mat.stockActuel || 1));
                      setActionMotif('');
                      setIsExitModalOpen(true);
                    }}
                    disabled={mat.stockActuel === 0}
                    className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900 dark:text-rose-300 disabled:opacity-40 transition-colors cursor-pointer"
                    title="Déclarer une sortie de matériel"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  {/* Bouton Entrée (Magasinier & Admin) */}
                  {(isAdmin || isMagasinier) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMaterial(mat);
                        setActionQty(50);
                        setActionMotif('');
                        setActionRefBon(`BL-LIV-${Math.floor(1000 + Math.random() * 9000)}`);
                        setIsEntryModalOpen(true);
                      }}
                      className="p-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900 dark:text-emerald-300 transition-colors cursor-pointer"
                      title="Enregistrer une entrée (réapprovisionnement)"
                    >
                      <ArrowDownLeft className="w-4 h-4" />
                    </button>
                  )}

                  {/* Bouton Transfert (Magasinier & Admin) */}
                  {(isAdmin || isMagasinier) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMaterial(mat);
                        setActionQty(10);
                        const otherSites = sites.filter((s) => s.id !== mat.siteId);
                        setActionDestSiteId(otherSites[0]?.id || '');
                        setActionMotif('');
                        setIsTransferModalOpen(true);
                      }}
                      disabled={mat.stockActuel < 5}
                      className="p-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:hover:bg-blue-900 dark:text-blue-300 disabled:opacity-40 transition-colors cursor-pointer"
                      title="Transférer vers un autre chantier"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </Table>

      {/* ================= PAGINATION ================= */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500">
        <span>
          Affichage de {Math.min(filteredMaterials.length, (currentPage - 1) * itemsPerPage + 1)} à{' '}
          {Math.min(filteredMaterials.length, currentPage * itemsPerPage)} sur {filteredMaterials.length} matériaux
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono font-bold px-2 text-slate-700 dark:text-slate-300">
            Page {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ================= MODAL 1 : SORTIE DE MATÉRIEL ================= */}
      <Modal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        title="Sortie de Stock Chantier"
        subtitle={selectedMaterial ? `${selectedMaterial.name} • Actuel: ${selectedMaterial.stockActuel} ${selectedMaterial.unit}` : ''}
      >
        <form onSubmit={submitStockExit} className="space-y-4">
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
            Cette sortie déduira immédiatement le stock. Une option d'annulation sera proposée dans la notification.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Quantité à sortir ({selectedMaterial?.unit})
            </label>
            <input
              type="number"
              min="1"
              max={selectedMaterial?.stockActuel || 1}
              required
              value={actionQty}
              onChange={(e) => setActionQty(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-lg font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Motif & Destination technique
            </label>
            <input
              type="text"
              required
              value={actionMotif}
              onChange={(e) => setActionMotif(e.target.value)}
              placeholder="ex: Coulage semelles filantes zone Nord"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsExitModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Valider la sortie
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL 2 : RÉAPPROVISIONNEMENT (ENTRÉE) ================= */}
      <Modal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        title="Réception de Matériaux (Entrée)"
        subtitle={selectedMaterial ? `${selectedMaterial.name} • Actuel: ${selectedMaterial.stockActuel} ${selectedMaterial.unit}` : ''}
      >
        <form onSubmit={submitStockEntry} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Quantité livrée ({selectedMaterial?.unit})
            </label>
            <input
              type="number"
              min="1"
              required
              value={actionQty}
              onChange={(e) => setActionQty(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-lg font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              N° Bon de Livraison Transporteur / Fournisseur
            </label>
            <input
              type="text"
              required
              value={actionRefBon}
              onChange={(e) => setActionRefBon(e.target.value)}
              placeholder="ex: BL-CIMAF-9842"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Observations de réception
            </label>
            <input
              type="text"
              value={actionMotif}
              onChange={(e) => setActionMotif(e.target.value)}
              placeholder="ex: Livraison conforme sans avarie constatée"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEntryModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="success" size="sm">
              Enregistrer l'entrée
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL 3 : TRANSFERT INTER-CHANTIERS ================= */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Transfert Inter-Chantiers"
        subtitle={selectedMaterial ? `${selectedMaterial.name} • Source: ${selectedMaterial.siteName}` : ''}
      >
        <form onSubmit={submitStockTransfer} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Chantier Destinataire
            </label>
            <select
              value={actionDestSiteId}
              onChange={(e) => setActionDestSiteId(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              {sites
                .filter((s) => s.id !== selectedMaterial?.siteId)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.commune})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Quantité à transférer ({selectedMaterial?.unit})
            </label>
            <input
              type="number"
              min="1"
              max={selectedMaterial?.stockActuel || 1}
              required
              value={actionQty}
              onChange={(e) => setActionQty(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-lg font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Motif du transfert
            </label>
            <input
              type="text"
              required
              value={actionMotif}
              onChange={(e) => setActionMotif(e.target.value)}
              placeholder="ex: Dépannage urgent en fer Ø12 avant coulage"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsTransferModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Valider le transfert
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL 4 : NOUVEAU MATÉRIAU ================= */}
      <Modal
        isOpen={isNewMatModalOpen}
        onClose={() => setIsNewMatModalOpen(false)}
        title="Ajouter un matériau au catalogue"
        subtitle="Enregistrement d'un nouvel article dans la base d'approvisionnement"
        maxWidth="max-w-xl"
      >
        <form onSubmit={submitNewMaterial} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Désignation du Matériau
              </label>
              <input
                type="text"
                required
                value={newMatName}
                onChange={(e) => setNewMatName(e.target.value)}
                placeholder="ex: Câble armé 4G16"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Code Référence
              </label>
              <input
                type="text"
                value={newMatCode}
                onChange={(e) => setNewMatCode(e.target.value)}
                placeholder="ex: MAT-ELEC-416"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Catégorie
              </label>
              <select
                value={newMatCategory}
                onChange={(e) => setNewMatCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="Gros œuvre">Gros œuvre</option>
                <option value="Ferraillage">Ferraillage</option>
                <option value="Agrégats">Agrégats</option>
                <option value="Maçonnerie">Maçonnerie</option>
                <option value="Électricité">Électricité</option>
                <option value="Plomberie">Plomberie</option>
                <option value="Revêtements">Revêtements</option>
                <option value="Sécurité & EPI">Sécurité & EPI</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Unité de mesure
              </label>
              <input
                type="text"
                value={newMatUnit}
                onChange={(e) => setNewMatUnit(e.target.value)}
                placeholder="ex: Sacs 50kg, m³, Barres 12m"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Stock Initial
              </label>
              <input
                type="number"
                value={newMatStock}
                onChange={(e) => setNewMatStock(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Seuil Critique
              </label>
              <input
                type="number"
                value={newMatSeuil}
                onChange={(e) => setNewMatSeuil(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Seuil Optimal
              </label>
              <input
                type="number"
                value={newMatOptimal}
                onChange={(e) => setNewMatOptimal(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Prix Unitaire (FCFA)
              </label>
              <input
                type="number"
                value={newMatPrice}
                onChange={(e) => setNewMatPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Chantier d'affectation
              </label>
              <select
                value={newMatSiteId}
                onChange={(e) => setNewMatSiteId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsNewMatModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Ajouter le matériau
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= TIROIR LATÉRAL : HISTORIQUE DES MOUVEMENTS ================= */}
      <Drawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        title="Journal des Flux & Mouvements"
        subtitle={`${filteredMovements.length} transactions enregistrées`}
        width="max-w-lg"
      >
        <div className="space-y-4">
          {/* Filtres de flux */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            {['all', 'sortie', 'entree', 'transfert'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setHistoryFilterType(f)}
                className={`flex-1 py-1 px-2 rounded-md font-medium uppercase text-[10px] tracking-wider transition-colors cursor-pointer ${
                  historyFilterType === f
                    ? 'bg-white dark:bg-slate-900 text-[#1E293B] dark:text-white font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {f === 'all' ? 'Tous' : f}
              </button>
            ))}
          </div>

          {/* Liste des mouvements */}
          <div className="space-y-3">
            {filteredMovements.map((mvt) => (
              <div
                key={mvt.id}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${
                        mvt.type === 'entree'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : (mvt.type === 'transfert'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300')
                      }`}
                    >
                      {mvt.type === 'entree' ? '↓' : (mvt.type === 'transfert' ? '⇄' : '↑')}
                    </span>
                    <strong className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase">
                      {mvt.type.toUpperCase()}
                    </strong>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">
                    {formatRelativeTime(mvt.date)}
                  </span>
                </div>

                <div className="text-xs space-y-0.5">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {mvt.quantite} {mvt.materialUnit} • {mvt.materialName}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    {mvt.motif}
                  </p>
                  {mvt.siteSourceName && (
                    <p className="text-[11px] text-slate-400">
                      Origine : {mvt.siteSourceName}
                    </p>
                  )}
                  {mvt.siteDestName && (
                    <p className="text-[11px] text-slate-400">
                      Destination : {mvt.siteDestName}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Réf : {mvt.refBon}</span>
                  <span>Opérateur : {mvt.operateur}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Drawer>
    </PageTransition>
  );
}
