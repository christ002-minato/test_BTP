/**
 * Page Fournisseurs & Bons de Commande (/fournisseurs)
 * Liste des 8 fournisseurs ivoiriens, gestion des bons de commande (brouillon, envoyé, livré),
 * création d'un bon de commande à partir d'une alerte et détails de commande
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  Plus,
  Search,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Coins,
  CheckCircle2,
  Send,
  FileText,
  PackageCheck,
  AlertTriangle,
  Star,
  ExternalLink,
  Printer
} from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatFCFA, formatDate } from '../utils/formatters.js';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import Table, { TableRow, TableCell } from '../components/ui/Table.jsx';
import PageTransition from '../components/layout/PageTransition.jsx';

export default function Fournisseurs() {
  const { suppliers, purchaseOrders, materials, sites, createPurchaseOrder, updatePOStatus } = useData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'suppliers'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal création bon de commande
  const [isNewPOModalOpen, setIsNewPOModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?.id || '');
  const [selectedMaterialId, setSelectedMaterialId] = useState(materials[0]?.id || '');
  const [poQty, setPoQty] = useState(100);
  const [poMotif, setPoMotif] = useState('');
  const [poEstDate, setPoEstDate] = useState('2026-10-20');

  // Modal aperçu bon de commande
  const [selectedPO, setSelectedPO] = useState(null);

  // Commandes filtrées
  const filteredOrders = purchaseOrders.filter((po) => {
    const matchSearch =
      po.code.toLowerCase().includes(search.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      po.siteName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Fournisseurs filtrés
  const filteredSuppliers = suppliers.filter((s) => {
    return (
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Soumission nouveau bon
  const handleCreatePO = async (e) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === selectedSupplierId);
    const site = sites.find((s) => s.id === selectedSiteId);
    const mat = materials.find((m) => m.id === selectedMaterialId);

    const unitPrice = mat ? mat.prixUnitaire : 5000;
    const totalTTC = unitPrice * Number(poQty);

    await createPurchaseOrder({
      supplierId: selectedSupplierId,
      supplierName: sup ? sup.name : 'Fournisseur CI',
      siteId: selectedSiteId,
      siteName: site ? site.name : 'Chantier Central',
      dateLivraisonEstimee: poEstDate,
      status: 'envoye',
      totalTTC,
      motif: poMotif || `Commande de réapprovisionnement ${mat?.name}`,
      creePar: currentUser?.name || 'Responsable Achats',
      items: [
        {
          materialId: selectedMaterialId,
          materialName: mat ? mat.name : 'Matériau',
          quantite: Number(poQty),
          prixUnitaire: unitPrice,
          total: totalTTC
        }
      ]
    });

    setIsNewPOModalOpen(false);
    setPoMotif('');
  };

  return (
    <PageTransition className="space-y-6">
      {/* ================= EN-TÊTE ET COMMUTATEUR ONGLETS ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#1E293B] dark:text-white uppercase tracking-tight">
            Fournisseurs & Bons de Commande
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gestion du panel d'approvisionnement BTP d'Abidjan et suivi des réceptions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsNewPOModalOpen(true)}
            className="text-xs font-bold"
          >
            Nouveau bon de commande
          </Button>
        </div>
      </div>

      {/* ================= ONGLETS BONS DE COMMANDE / CATALOGUE FOURNISSEURS ================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`py-2.5 px-4 font-heading text-sm uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'border-[#A64B2A] text-[#1E293B] dark:text-white'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Bons de Commande ({purchaseOrders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('suppliers')}
          className={`py-2.5 px-4 font-heading text-sm uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'suppliers'
              ? 'border-[#A64B2A] text-[#1E293B] dark:text-white'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Répertoire Fournisseurs Agréés ({suppliers.length})
        </button>
      </div>

      {/* ================= RECHERCHE & FILTRES STATUT ================= */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === 'orders'
                ? 'Rechercher par référence BC, fournisseur, chantier...'
                : 'Rechercher une entreprise, catégorie, interlocuteur...'
            }
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
          />
        </div>

        {activeTab === 'orders' && (
          <div className="flex items-center gap-1.5">
            {['all', 'brouillon', 'envoye', 'livre'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#1E293B] text-white dark:bg-blue-600 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'Tous' : st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ================= ONGLET 1 : BONS DE COMMANDE ================= */}
      {activeTab === 'orders' && (
        <Table
          headers={[
            'Réf. Commande',
            'Fournisseur Agréé',
            'Chantier Destinataire',
            'Date Création',
            'Livraison Prévue',
            'Montant TTC',
            'Statut',
            'Actions'
          ]}
        >
          {filteredOrders.length === 0 ? (
            <tr>
              <td colSpan={8} className="p-12 text-center text-slate-400">
                Aucun bon de commande trouvé.
              </td>
            </tr>
          ) : (
            filteredOrders.map((po) => (
              <TableRow key={po.id}>
                <TableCell className="font-mono font-bold text-xs text-[#1E293B] dark:text-white">
                  {po.code}
                </TableCell>
                <TableCell className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                  {po.supplierName}
                </TableCell>
                <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                  {po.siteName}
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-500">
                  {formatDate(po.dateCreation, 'short')}
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-500">
                  {formatDate(po.dateLivraisonEstimee, 'short')}
                </TableCell>
                <TableCell className="font-mono font-bold text-xs text-[#1E293B] dark:text-slate-100">
                  {formatFCFA(po.totalTTC)}
                </TableCell>
                <TableCell>
                  <Badge
                    size="sm"
                    variant={po.status === 'livre' ? 'success' : (po.status === 'envoye' ? 'info' : 'warning')}
                  >
                    {po.status === 'livre' ? 'Livré sur site' : (po.status === 'envoye' ? 'Envoyé' : 'Brouillon')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {/* Visualiser */}
                    <button
                      type="button"
                      onClick={() => setSelectedPO(po)}
                      className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Aperçu & Impression du bon"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>

                    {/* Transition statut */}
                    {po.status === 'brouillon' && (
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => updatePOStatus(po.id, 'envoye')}
                      >
                        Envoyer
                      </Button>
                    )}
                    {po.status === 'envoye' && (
                      <Button
                        variant="success"
                        size="xs"
                        onClick={() => updatePOStatus(po.id, 'livre')}
                      >
                        Marquer Livré
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      )}

      {/* ================= ONGLET 2 : CATALOGUE FOURNISSEURS ================= */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#A64B2A] font-mono">
                    {sup.code}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{sup.rating}</span>
                  </div>
                </div>

                <h3 className="font-heading font-black text-lg text-[#1E293B] dark:text-white uppercase leading-snug">
                  {sup.name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Spécialité : <strong className="text-slate-700 dark:text-slate-300">{sup.category}</strong>
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{sup.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Délai moyen constaté : {sup.delaiMoyenJours} jour(s)</span>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">Volume Commandes</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {sup.totalCommandes} ({formatFCFA(sup.montantCumule)})
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    setSelectedSupplierId(sup.id);
                    setIsNewPOModalOpen(true);
                  }}
                  className="text-xs"
                >
                  Commander
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= MODAL CRÉATION BON DE COMMANDE ================= */}
      <Modal
        isOpen={isNewPOModalOpen}
        onClose={() => setIsNewPOModalOpen(false)}
        title="Créer un Bon de Commande Approvisionnement"
        subtitle="Émission officielle pour les chantiers d'Abidjan"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreatePO} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Fournisseur
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Chantier Destinataire
              </label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Article / Matériau
              </label>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.stockActuel} {m.unit} restants)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Quantité commandée
              </label>
              <input
                type="number"
                min="1"
                required
                value={poQty}
                onChange={(e) => setPoQty(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Date de livraison souhaitée
              </label>
              <input
                type="date"
                required
                value={poEstDate}
                onChange={(e) => setPoEstDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Motif d'engagement
              </label>
              <input
                type="text"
                value={poMotif}
                onChange={(e) => setPoMotif(e.target.value)}
                placeholder="ex: Sécurisation approvisionnement coulage"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsNewPOModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Valider et émettre la commande
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL APERÇU OFFICIEL DU BON DE COMMANDE ================= */}
      <Modal
        isOpen={!!selectedPO}
        onClose={() => setSelectedPO(null)}
        title="Bon de Commande Officiel BTP"
        subtitle={selectedPO ? `Référence : ${selectedPO.code}` : ''}
        maxWidth="max-w-2xl"
      >
        {selectedPO && (
          <div className="space-y-6">
            {/* Entête du bon imprimable */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-start">
              <div>
                <h4 className="font-heading font-black text-xl text-[#1E293B] dark:text-white uppercase">
                  ChantierPro Côte d'Ivoire
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  Direction Générale & Travaux • Abidjan Plateau
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  Tél: +225 27 20 21 00 00 • CC: 9812401 B
                </p>
              </div>

              <div className="text-right">
                <span className="font-mono text-sm font-black text-[#A64B2A] block">
                  {selectedPO.code}
                </span>
                <span className="text-xs text-slate-400">
                  Émis le : {formatDate(selectedPO.dateCreation, 'short')}
                </span>
              </div>
            </div>

            {/* Détails du fournisseur et du chantier */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Fournisseur :</span>
                <strong className="text-sm font-bold text-slate-900 dark:text-slate-100 block mt-0.5">
                  {selectedPO.supplierName}
                </strong>
                <p className="text-slate-500 mt-1">Livraison prévue : {formatDate(selectedPO.dateLivraisonEstimee, 'medium')}</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Chantier de destination :</span>
                <strong className="text-sm font-bold text-slate-900 dark:text-slate-100 block mt-0.5">
                  {selectedPO.siteName}
                </strong>
                <p className="text-slate-500 mt-1">Émis par : {selectedPO.creePar}</p>
              </div>
            </div>

            {/* Lignes de commande */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-heading uppercase">
                  <tr>
                    <th className="p-3 text-left">Désignation</th>
                    <th className="p-3 text-right">Quantité</th>
                    <th className="p-3 text-right">P.U. (FCFA)</th>
                    <th className="p-3 text-right">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedPO.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{item.materialName}</td>
                      <td className="p-3 text-right font-mono">{item.quantite}</td>
                      <td className="p-3 text-right font-mono">{formatFCFA(item.prixUnitaire)}</td>
                      <td className="p-3 text-right font-mono font-bold">{formatFCFA(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-800 font-bold border-t border-slate-200 dark:border-slate-700">
                  <tr>
                    <td colSpan={3} className="p-3 text-right uppercase">Total Général TTC :</td>
                    <td className="p-3 text-right font-mono text-[#A64B2A] text-sm">
                      {formatFCFA(selectedPO.totalTTC)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                icon={Printer}
                onClick={() => window.print()}
              >
                Imprimer le bon
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedPO(null)}
              >
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageTransition>
  );
}
