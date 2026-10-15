/**
 * Page Répertoire du Personnel (/personnel)
 * Liste des collaborateurs BTP, filtres métier, et tiroir de fiche détaillée (30 jours de présence, contrat, qualification)
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  HardHat,
  Phone,
  Mail,
  Calendar,
  Building2,
  Award,
  Coins,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { formatFCFA, formatDate } from '../utils/formatters.js';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Drawer from '../components/ui/Drawer.jsx';
import Table, { TableRow, TableCell } from '../components/ui/Table.jsx';
import PageTransition from '../components/layout/PageTransition.jsx';

export default function Personnel() {
  const { employees, sites } = useData();

  const [search, setSearch] = useState('');
  const [siteFilter, setSiteFilter] = useState('all');
  const [departementFilter, setDepartementFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Départements distincts
  const departements = ['all', ...Array.from(new Set(employees.map((e) => e.departement)))];

  // Filtrage combiné
  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.prenom} ${emp.nom}`.toLowerCase();
    const matchSearch =
      fullName.includes(search.toLowerCase()) ||
      emp.matricule.toLowerCase().includes(search.toLowerCase()) ||
      emp.fonction.toLowerCase().includes(search.toLowerCase());
    const matchSite = siteFilter === 'all' || emp.siteId === siteFilter;
    const matchDep = departementFilter === 'all' || emp.departement === departementFilter;
    return matchSearch && matchSite && matchDep;
  });

  const handleOpenEmployee = (emp) => {
    setSelectedEmployee(emp);
    setIsDrawerOpen(true);
  };

  return (
    <PageTransition className="space-y-6">
      {/* ================= EN-TÊTE ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#0B1B3A] dark:text-white uppercase tracking-tight">
            Répertoire des Équipes & Ouvriers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gestion des qualifications, fiches agents et historiques de présence BTP
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge size="lg" variant="info">
            {employees.length} collaborateurs actifs
          </Badge>
        </div>
      </div>

      {/* ================= RECHERCHE ET FILTRES ================= */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, prénom, matricule ou métier..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1B3A]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Tous les chantiers</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={departementFilter}
            onChange={(e) => setDepartementFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Tous les corps de métier</option>
            {departements.filter((d) => d !== 'all').map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= TABLEAU DU PERSONNEL ================= */}
      <Table
        headers={[
          'Nom & Prénom',
          'Matricule',
          'Corps d\'État / Fonction',
          'Chantier d\'Affectation',
          'Téléphone',
          'Taux Présence Mois',
          'Statut Aujourd\'hui',
          'Action'
        ]}
      >
        {filteredEmployees.map((emp) => (
          <TableRow
            key={emp.id}
            onClick={() => handleOpenEmployee(emp)}
            className="cursor-pointer"
          >
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0B1B3A] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {emp.prenom[0]}{emp.nom[0]}
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">
                    {emp.prenom} {emp.nom}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {emp.email}
                  </span>
                </div>
              </div>
            </TableCell>

            <TableCell className="font-mono text-xs text-slate-500">
              {emp.matricule}
            </TableCell>

            <TableCell>
              <span className="text-xs font-semibold text-[#0B1B3A] dark:text-slate-200 block">
                {emp.fonction}
              </span>
              <span className="text-[10px] text-slate-400">
                {emp.departement}
              </span>
            </TableCell>

            <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {emp.siteName}
            </TableCell>

            <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
              {emp.telephone}
            </TableCell>

            <TableCell>
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {emp.tauxPresenceMois}%
              </span>
            </TableCell>

            <TableCell>
              <Badge
                size="sm"
                variant={emp.pointageAujourdhui === 'present' ? 'success' : (emp.pointageAujourdhui === 'retard' ? 'warning' : 'rupture')}
              >
                {emp.pointageAujourdhui === 'present' ? 'Présent' : (emp.pointageAujourdhui === 'retard' ? 'Retard' : 'Absent')}
              </Badge>
            </TableCell>

            <TableCell>
              <button
                type="button"
                className="text-xs text-[#F26B1D] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Détails <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </TableCell>
          </TableRow>
        ))}
      </Table>

      {/* ================= TIROIR LATÉRAL : FICHE COLLABORATEUR ================= */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedEmployee ? `${selectedEmployee.prenom} ${selectedEmployee.nom}` : 'Fiche Agent'}
        subtitle={selectedEmployee ? `Matricule : ${selectedEmployee.matricule}` : ''}
        width="max-w-lg"
      >
        {selectedEmployee && (
          <div className="space-y-6">
            {/* Carte d'identité BTP */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#0B1B3A] text-[#F26B1D] flex items-center justify-center font-heading text-xl font-black shrink-0 border border-white/10">
                {selectedEmployee.prenom[0]}{selectedEmployee.nom[0]}
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-black text-lg text-[#0B1B3A] dark:text-white uppercase leading-tight">
                  {selectedEmployee.prenom} {selectedEmployee.nom}
                </h3>
                <p className="text-xs font-semibold text-[#F26B1D]">
                  {selectedEmployee.fonction}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Affectation principale : <strong>{selectedEmployee.siteName}</strong>
                </p>
              </div>
            </div>

            {/* Coordonnées & Contrat */}
            <div className="space-y-3 text-xs">
              <h4 className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Informations Contractuelles & Contact
              </h4>
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Téléphone direct</span>
                  <a href={`tel:${selectedEmployee.telephone}`} className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    {selectedEmployee.telephone}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">E-mail</span>
                  <span className="truncate block text-slate-700 dark:text-slate-300">{selectedEmployee.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Date d'embauche</span>
                  <span className="text-slate-700 dark:text-slate-300">{formatDate(selectedEmployee.dateEmbauche, 'medium')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Rémunération de base</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatFCFA(selectedEmployee.salaireBase)}</span>
                </div>
              </div>
            </div>

            {/* Diplôme & Habilitation de sécurité */}
            <div className="space-y-2 text-xs">
              <h4 className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Certification & Habilitation
              </h4>
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                <Award className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <strong className="text-emerald-900 dark:text-emerald-200 block text-xs">
                    {selectedEmployee.qualification}
                  </strong>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Habilitation valide pour travail en hauteur et sécurité chantier Abidjan.
                  </span>
                </div>
              </div>
            </div>

            {/* Grille des 30 derniers jours de présence */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Historique Présence (30 Derniers Jours)
                </h4>
                <span className="text-xs font-mono font-bold text-emerald-600">
                  {selectedEmployee.tauxPresenceMois}% d'assiduité
                </span>
              </div>

              {/* 30 pastilles calendaires */}
              <div className="grid grid-cols-6 gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                {Array.from({ length: 30 }).map((_, i) => {
                  const dayNum = 30 - i;
                  // Distribution réaliste basée sur son taux
                  const isWeekend = (dayNum % 7 === 0 || dayNum % 7 === 6);
                  const isAbsent = !isWeekend && (dayNum === 14 && selectedEmployee.tauxPresenceMois < 90);
                  const isLate = !isWeekend && (dayNum === 8 && selectedEmployee.tauxPresenceMois < 95);

                  let bg = 'bg-emerald-500';
                  let label = 'P';
                  if (isWeekend) {
                    bg = 'bg-slate-200 dark:bg-slate-700 text-slate-400';
                    label = 'R';
                  } else if (isAbsent) {
                    bg = 'bg-rose-500 text-white';
                    label = 'A';
                  } else if (isLate) {
                    bg = 'bg-amber-500 text-white';
                    label = 'R';
                  }

                  return (
                    <div
                      key={i}
                      className={`h-9 rounded-md flex flex-col items-center justify-center text-[10px] font-mono text-white ${bg}`}
                      title={`Jour ${dayNum} : ${isAbsent ? 'Absent' : (isLate ? 'Retard' : (isWeekend ? 'Repos' : 'Présent'))}`}
                    >
                      <span className="font-bold">{dayNum}</span>
                      <span className="text-[8px] opacity-80">{label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Vert: Présent</span>
                <span>Orange: Retard</span>
                <span>Rouge: Absent</span>
                <span>Gris: Repos</span>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </PageTransition>
  );
}
