/**
 * Page de Pointage Journalier (/pointage)
 * Grille d'appel par chantier, boutons 1-clic Présent/Retard/Absent,
 * raccourcis clavier (P/R/A), bouton « Tout marquer présent » et compteurs en temps réel
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  Calendar,
  Users,
  Search,
  CheckCheck,
  HelpCircle
} from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate } from '../utils/formatters.js';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Table, { TableRow, TableCell } from '../components/ui/Table.jsx';
import PageTransition from '../components/layout/PageTransition.jsx';

export default function Pointage() {
  const { employees, sites, updateAttendance, markAllPresent } = useData();
  const { currentUser, isChef } = useAuth();

  // Filtrage initial du chantier
  const initialSiteId = isChef && currentUser?.assignedSiteIds?.length > 0
    ? currentUser.assignedSiteIds[0]
    : (sites[0]?.id || '');

  const [selectedSiteId, setSelectedSiteId] = useState(initialSiteId);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Équipes du chantier sélectionné
  const siteEmployees = employees.filter((emp) => {
    const matchSite = !selectedSiteId || emp.siteId === selectedSiteId;
    const fullName = `${emp.prenom} ${emp.nom}`.toLowerCase();
    const matchSearch =
      fullName.includes(search.toLowerCase()) ||
      emp.matricule.toLowerCase().includes(search.toLowerCase()) ||
      emp.fonction.toLowerCase().includes(search.toLowerCase());
    return matchSite && matchSearch;
  });

  // Statistiques en temps réel
  const totalCount = siteEmployees.length;
  const presentCount = siteEmployees.filter((e) => e.pointageAujourdhui === 'present').length;
  const lateCount = siteEmployees.filter((e) => e.pointageAujourdhui === 'retard').length;
  const absentCount = siteEmployees.filter((e) => e.pointageAujourdhui === 'absent').length;
  const presenceRate = totalCount > 0 ? Math.round(((presentCount + lateCount * 0.5) / totalCount) * 100) : 0;

  // Gestion des raccourcis clavier P / R / A
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignorer si l'utilisateur est dans un champ input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }

      if (siteEmployees.length === 0) return;
      const targetEmp = siteEmployees[focusedIndex];
      if (!targetEmp) return;

      if (e.key.toLowerCase() === 'p') {
        updateAttendance(targetEmp.id, 'present');
        setFocusedIndex((prev) => Math.min(siteEmployees.length - 1, prev + 1));
      } else if (e.key.toLowerCase() === 'r') {
        updateAttendance(targetEmp.id, 'retard');
        setFocusedIndex((prev) => Math.min(siteEmployees.length - 1, prev + 1));
      } else if (e.key.toLowerCase() === 'a') {
        updateAttendance(targetEmp.id, 'absent');
        setFocusedIndex((prev) => Math.min(siteEmployees.length - 1, prev + 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(siteEmployees.length - 1, prev + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [siteEmployees, focusedIndex, updateAttendance]);

  const currentSite = sites.find((s) => s.id === selectedSiteId);

  return (
    <PageTransition className="space-y-6">
      {/* ================= EN-TÊTE ET ACTIONS GLOBALES ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#0B1B3A] dark:text-white uppercase tracking-tight">
            Pointage Journalier des Équipes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Émargement numérique du personnel sur site • Enregistrement officiel de la journée
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Bouton Tout Marquer Présent */}
          <Button
            variant="success"
            size="md"
            icon={CheckCheck}
            onClick={() => markAllPresent(selectedSiteId)}
            className="text-xs font-bold uppercase tracking-wider"
          >
            Tout marquer présent
          </Button>
        </div>
      </div>

      {/* ================= BARRE DE SÉLECTION DU CHANTIER & DATE ================= */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Sélecteur de chantier */}
          <div className="min-w-[240px] flex-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
              Chantier concerné
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedSiteId}
                onChange={(e) => {
                  setSelectedSiteId(e.target.value);
                  setFocusedIndex(0);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.commune})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date du pointage */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
              Date de pointage
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Recherche agent */}
          <div className="min-w-[200px] flex-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">
              Filtrer un ouvrier
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom, matricule..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= COMPTEURS EN TEMPS RÉEL DU CHANTIER ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono block">
            Effectif Théorique
          </span>
          <div className="text-2xl font-black font-heading text-[#0B1B3A] dark:text-white mt-1">
            {totalCount} ouvriers
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase font-mono block">
            Présents à l'heure
          </span>
          <div className="text-2xl font-black font-heading text-emerald-600 dark:text-emerald-300 mt-1">
            {presentCount} ouvriers
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase font-mono block">
            En Retard
          </span>
          <div className="text-2xl font-black font-heading text-amber-600 dark:text-amber-300 mt-1">
            {lateCount} ouvriers
          </div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase font-mono block">
            Absents constatés
          </span>
          <div className="text-2xl font-black font-heading text-rose-600 dark:text-rose-300 mt-1">
            {absentCount} ouvriers
          </div>
        </div>
      </div>

      {/* ================= BANDEAU D'AIDE AUX RACCOURCIS CLAVIERS ================= */}
      <div className="px-4 py-2.5 rounded-lg bg-[#0B1B3A]/5 dark:bg-slate-850 border border-[#0B1B3A]/10 dark:border-slate-700 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#F26B1D]" />
          <span className="font-semibold">Saisie ultra-rapide au clavier :</span>
          <span>Sélectionnez une ligne, puis appuyez sur :</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 font-bold text-emerald-600">P</kbd> = Présent
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 font-bold text-amber-600">R</kbd> = Retard
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 font-bold text-rose-600">A</kbd> = Absent
          </span>
          <span className="inline-flex items-center gap-1 text-slate-400">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 font-bold">↑↓</kbd> = Naviguer
          </span>
        </div>
      </div>

      {/* ================= TABLEAU DE POINTAGE ================= */}
      <Table
        headers={[
          '#',
          'Collaborateur & Métier',
          'Matricule',
          'Téléphone',
          'Statut Actuel',
          'Action Émargement 1-Clic'
        ]}
      >
        {siteEmployees.length === 0 ? (
          <tr>
            <td colSpan={6} className="p-12 text-center text-slate-400">
              Aucun ouvrier rattaché à ce chantier pour cette recherche.
            </td>
          </tr>
        ) : (
          siteEmployees.map((emp, index) => {
            const isFocused = index === focusedIndex;
            return (
              <TableRow
                key={emp.id}
                onClick={() => setFocusedIndex(index)}
                className={isFocused ? 'bg-[#F26B1D]/5 dark:bg-orange-950/20 ring-1 ring-[#F26B1D]/40' : ''}
              >
                {/* Index indicateur */}
                <TableCell className="w-8 font-mono text-xs text-slate-400">
                  {index + 1}
                </TableCell>

                {/* Nom & Métier */}
                <TableCell>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">
                      {emp.prenom} {emp.nom}
                    </span>
                    <span className="text-xs text-[#F26B1D] font-medium">
                      {emp.fonction}
                    </span>
                  </div>
                </TableCell>

                {/* Matricule */}
                <TableCell className="font-mono text-xs text-slate-500">
                  {emp.matricule}
                </TableCell>

                {/* Téléphone */}
                <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
                  {emp.telephone}
                </TableCell>

                {/* Badge Statut */}
                <TableCell>
                  <Badge
                    size="sm"
                    variant={emp.pointageAujourdhui === 'present' ? 'success' : (emp.pointageAujourdhui === 'retard' ? 'warning' : 'rupture')}
                  >
                    {emp.pointageAujourdhui === 'present' ? 'Présent' : (emp.pointageAujourdhui === 'retard' ? 'En Retard' : 'Absent')}
                  </Badge>
                </TableCell>

                {/* 3 boutons d'actions rapides */}
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {/* Présent */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateAttendance(emp.id, 'present');
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        emp.pointageAujourdhui === 'present'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Présent (P)</span>
                    </button>

                    {/* Retard */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateAttendance(emp.id, 'retard');
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        emp.pointageAujourdhui === 'retard'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Retard (R)</span>
                    </button>

                    {/* Absent */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateAttendance(emp.id, 'absent');
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        emp.pointageAujourdhui === 'absent'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Absent (A)</span>
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </Table>
    </PageTransition>
  );
}
