/**
 * Page Rapports & Analyses Financières (/rapports)
 * Sélecteur de période, 3 graphiques analytiques Recharts, synthèse budgétaire et export
 */

import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  Coins,
  Building2,
  Users,
  PieChart as PieIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { useData } from '../context/DataContext.jsx';
import { formatFCFA, exportToCSV } from '../utils/formatters.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import PageTransition from '../components/layout/PageTransition.jsx';
import { MONTHLY_CONSUMPTION_DATA, SITE_PROGRESS_SUMMARY } from '../data/mockData.js';

export default function Rapports() {
  const { sites, materials, employees } = useData();
  const [period, setPeriod] = useState('trimestre'); // 'mois' | 'trimestre' | 'annee'

  // Données de répartition des coûts par poste
  const POSTES_DEPENSES = [
    { poste: 'Gros œuvre & Ciment', montant: 1450000000, pourcentage: 38 },
    { poste: 'Aciers & Ferraillage', montant: 920000000, pourcentage: 24 },
    { poste: 'Main d\'œuvre & Encadrement', montant: 780000000, pourcentage: 20 },
    { poste: 'VRD & Enrobés', montant: 420000000, pourcentage: 11 },
    { poste: 'Finitions & Électricité', montant: 260000000, pourcentage: 7 }
  ];

  // Données de présence par chantier
  const PRESENCE_CHIEFS_DATA = sites.map((s) => ({
    name: s.commune,
    taux: Math.min(100, Math.floor(88 + Math.random() * 11)),
    ouvriers: s.workersCount
  }));

  const handleExportReportCSV = () => {
    const headers = ['Poste de Dépense', 'Montant Consommé (FCFA)', 'Part dans le Budget Global (%)'];
    const rows = POSTES_DEPENSES.map((p) => [p.poste, p.montant, `${p.pourcentage}%`]);
    exportToCSV(`rapport_financier_btp_${period}_2026`, headers, rows);
  };

  return (
    <PageTransition className="space-y-6">
      {/* ================= EN-TÊTE ET SÉLECTION PÉRIODE ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#1E293B] dark:text-white uppercase tracking-tight">
            Rapports & Synthèse Analytique
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Analyses de productivité, consommations de matières premières et coûts d'exécution
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sélecteur de période */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 shadow-2xs text-xs">
            <button
              type="button"
              onClick={() => setPeriod('mois')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                period === 'mois'
                  ? 'bg-[#1E293B] text-white font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mois en cours
            </button>
            <button
              type="button"
              onClick={() => setPeriod('trimestre')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                period === 'trimestre'
                  ? 'bg-[#1E293B] text-white font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              3e Trimestre
            </button>
            <button
              type="button"
              onClick={() => setPeriod('annee')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                period === 'annee'
                  ? 'bg-[#1E293B] text-white font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Année 2026
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportReportCSV}
            className="text-xs"
          >
            Exporter
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
            className="text-xs font-bold"
          >
            Imprimer
          </Button>
        </div>
      </div>

      {/* ================= 4 INDICATEURS CLÉS DE GESTION ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono block">Dépenses Cumulées</span>
          <div className="text-xl sm:text-2xl font-black font-heading text-[#1E293B] dark:text-white mt-1">
            3 830 000 000 FCFA
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">+4.2% vs budget cible</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono block">Volume Ciment Écoulé</span>
          <div className="text-xl sm:text-2xl font-black font-heading text-[#A64B2A] mt-1">
            8 300 Sacs
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Sur l'ensemble des 6 chantiers</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono block">Taux Respect Délais</span>
          <div className="text-xl sm:text-2xl font-black font-heading text-emerald-600 mt-1">
            96.8%
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Avancement des jalons à temps</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono block">Productivité Moyenne</span>
          <div className="text-xl sm:text-2xl font-black font-heading text-blue-600 mt-1">
            18.4 m³/j
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Cadence de coulage moyenne</p>
        </div>
      </div>

      {/* ================= GRAPHIQUE 1 & 2 ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique 1 : Dépenses par poste */}
        <Card
          title="Répartition des Coûts par Poste de Dépense"
          subtitle="Analyse structurelle des charges BTP (FCFA)"
          icon={Coins}
        >
          <div className="space-y-4 pt-2">
            {POSTES_DEPENSES.map((poste, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{poste.poste}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {formatFCFA(poste.montant)} ({poste.pourcentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#1E293B] dark:bg-blue-500"
                    style={{ width: `${poste.pourcentage * 2.2}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Graphique 2 : Taux de présence moyen par chantier */}
        <Card
          title="Taux d'Assiduité par Chantier"
          subtitle="Présence moyenne des effectifs sur les chantiers d'Abidjan"
          icon={Users}
        >
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={PRESENCE_CHIEFS_DATA}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Taux de présence']}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="taux" fill="#A64B2A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ================= GRAPHIQUE 3 : ÉVOLUTION MENSUELLE DES DÉPENSES ================= */}
      <Card
        title="Trajectoire Budgétaire Mensuelle (Mai à Octobre 2026)"
        subtitle="Dépenses réelles engagées en matériaux et fournitures (FCFA)"
        icon={TrendingUp}
      >
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={MONTHLY_CONSUMPTION_DATA}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis
                tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                tick={{ fontSize: 11, fill: '#64748B' }}
              />
              <Tooltip
                formatter={(val) => [formatFCFA(val), 'Montant consommé']}
                contentStyle={{
                  backgroundColor: '#1E293B',
                  borderColor: '#334155',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line
                type="monotone"
                dataKey="coutFCFA"
                stroke="#A64B2A"
                strokeWidth={3}
                dot={{ r: 5, fill: '#1E293B', stroke: '#A64B2A', strokeWidth: 2 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </PageTransition>
  );
}
