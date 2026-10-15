/**
 * Tableau de bord principal (Dashboard) ChantierPro
 * 4 KPIs animés, graphiques Recharts (consommation 6 mois & présence du jour),
 * liste des chantiers avec avancement, alertes urgentes et fil d'activité en temps réel
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  AlertTriangle,
  Users,
  Coins,
  TrendingUp,
  ArrowRight,
  HardHat,
  CalendarCheck,
  Package,
  PlusCircle,
  Truck,
  CloudSun,
  Clock,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useData } from '../context/DataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatFCFA, formatDate, formatRelativeTime } from '../utils/formatters.js';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import CountUp from '../components/ui/CountUp.jsx';
import PageTransition from '../components/layout/PageTransition.jsx';
import { MONTHLY_CONSUMPTION_DATA, ATTENDANCE_BREAKDOWN } from '../data/mockData.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const { sites, materials, employees, movements, siteLogs } = useData();
  const { currentUser, isChef, isAdmin } = useAuth();

  // Filtrage des chantiers si chef de chantier
  const displayedSites = isChef && currentUser?.assignedSiteIds
    ? sites.filter(s => currentUser.assignedSiteIds.includes(s.id))
    : sites;

  // Calculs KPIs
  const activeSitesCount = displayedSites.filter(s => s.status !== 'Livré').length;
  
  const criticalStockAlerts = materials.filter(
    m => m.status === 'Rupture' || m.status === 'Critique'
  );

  const totalEmployees = employees.length;
  const presentEmployees = employees.filter(e => e.pointageAujourdhui === 'present').length;
  const presenceRate = Math.round((presentEmployees / (totalEmployees || 1)) * 100);

  const totalBudgetEngage = displayedSites.reduce((acc, s) => acc + (s.budgetConsomme || 0), 0);
  const totalBudgetGlobal = displayedSites.reduce((acc, s) => acc + (s.budgetTotal || 0), 0);

  // Activité récente (mouvements + logs)
  const recentActivities = [
    ...movements.slice(0, 6).map(m => ({
      id: m.id,
      title: `${m.type === 'entree' ? 'Réception' : (m.type === 'transfert' ? 'Transfert' : 'Sortie')} : ${m.quantite} ${m.materialUnit} ${m.materialName}`,
      subtitle: `${m.siteSourceName ? `De ${m.siteSourceName}` : ''} ${m.siteDestName ? `→ ${m.siteDestName}` : ''} • Par ${m.operateur}`,
      time: m.date,
      type: 'stock',
      badge: m.type
    })),
    ...siteLogs.slice(0, 3).map(l => ({
      id: l.id,
      title: `Journal de bord : ${l.titre}`,
      subtitle: `Site : ${l.auteur} (${l.meteo})`,
      time: `${l.date}T${l.heure}:00Z`,
      type: 'log',
      badge: 'Chantier'
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);

  return (
    <PageTransition className="space-y-6">
      {/* ================= BANDEAU D'ACCUEIL MÉTIER ================= */}
      <div className="relative rounded-xl bg-[#1E293B] text-white p-6 sm:p-8 overflow-hidden shadow-lg border border-[#334155]">
        {/* Image réelle de chantier BTP en fond */}
        <img
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&auto=format&fit=crop&q=80"
          alt="Chantier de construction à Abidjan"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1E293B] via-[#1E293B]/85 to-[#1E293B]/40" />
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-stripes-safety-soft opacity-30 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAB308]/20 text-[#EAB308] text-xs font-bold font-mono tracking-wider uppercase border border-[#EAB308]/40">
                <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-ping" />
                Opérations Abidjan
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {formatDate(new Date(), 'long')}
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Bonjour, {currentUser?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Supervision technique en temps réel des chantiers du District d'Abidjan et des antennes régionales.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isAdmin && (
              <Button
                variant="outlineOnDark"
                size="sm"
                onClick={() => navigate('/fournisseurs')}
                icon={Truck}
                className="text-xs"
              >
                Bons de commande
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/pointage')}
              icon={CalendarCheck}
              className="text-xs font-bold"
            >
              Pointage du jour
            </Button>
            <Button
              variant="outlineOnDark"
              size="sm"
              onClick={() => navigate('/stocks')}
              icon={Package}
              className="text-xs"
            >
              Sortie de stock
            </Button>
          </div>
        </div>
      </div>

      {/* ================= 4 KPIS MAJEURS (COMPTEURS ANIMÉS) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Chantiers Actifs */}
        <Card
          accent="blue"
          className="p-4 sm:p-5 relative overflow-hidden"
          noPadding
        >
          <div className="p-5 flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Chantiers Actifs
              </span>
              <div className="text-3xl font-black font-heading text-[#1E293B] dark:text-white">
                <CountUp end={activeSitesCount} duration={800} />
              </div>
              <p className="text-[11px] text-slate-400">
                Sur {displayedSites.length} projets au total
              </p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Avancement moyen</span>
            <span className="font-bold text-[#1E293B] dark:text-slate-200">60.3%</span>
          </div>
        </Card>

        {/* KPI 2 : Alertes Stocks Critiques */}
        <Card
          accent={criticalStockAlerts.length > 0 ? 'danger' : 'success'}
          className="p-4 sm:p-5 relative overflow-hidden"
          noPadding
        >
          <div className="p-5 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Alertes de Stock
                </span>
                {criticalStockAlerts.some(m => m.status === 'Rupture') && (
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                )}
              </div>
              <div className="text-3xl font-black font-heading text-rose-600 dark:text-rose-400">
                <CountUp end={criticalStockAlerts.length} duration={800} />
              </div>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                {criticalStockAlerts.filter(m => m.status === 'Rupture').length} rupture(s) immédiate(s)
              </p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div
            onClick={() => navigate('/stocks')}
            className="px-5 py-2.5 bg-rose-50/50 dark:bg-rose-950/20 border-t border-rose-100 dark:border-rose-900/40 flex items-center justify-between text-xs cursor-pointer hover:bg-rose-100/50 transition-colors"
          >
            <span className="text-rose-700 dark:text-rose-300 font-medium">Voir les urgences</span>
            <ArrowRight className="w-3.5 h-3.5 text-rose-600" />
          </div>
        </Card>

        {/* KPI 3 : Taux de Présence */}
        <Card
          accent="orange"
          className="p-4 sm:p-5 relative overflow-hidden"
          noPadding
        >
          <div className="p-5 flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Présence du Jour
              </span>
              <div className="text-3xl font-black font-heading text-[#A64B2A]">
                <CountUp end={presenceRate} suffix="%" duration={900} />
              </div>
              <p className="text-[11px] text-slate-400">
                {presentEmployees} ouvriers pointés sur {totalEmployees}
              </p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-[#A64B2A] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div
            onClick={() => navigate('/pointage')}
            className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="text-slate-600 dark:text-slate-300">Pointage des équipes</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </Card>

        {/* KPI 4 : Budget Engagé en FCFA */}
        <Card
          accent="safety"
          className="p-4 sm:p-5 relative overflow-hidden"
          noPadding
        >
          <div className="p-5 flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Budget Engagé
              </span>
              <div className="text-2xl sm:text-3xl font-black font-heading text-[#1E293B] dark:text-white truncate">
                <CountUp end={totalBudgetEngage} isCurrency duration={1100} />
              </div>
              <p className="text-[11px] text-slate-400">
                Plafond : {formatFCFA(totalBudgetGlobal)}
              </p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Coins className="w-6 h-6" />
            </div>
          </div>
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Taux d'engagement</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {Math.round((totalBudgetEngage / (totalBudgetGlobal || 1)) * 100)}%
            </span>
          </div>
        </Card>
      </div>

      {/* ================= SECTION GRAPHIQUES : CONSOMMATION & RÉPARTITION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique 1 : Évolution de la consommation de matériaux (6 mois) */}
        <Card
          title="Consommation des Matériaux Clés (6 Mois)"
          subtitle="Suivi mensuel des volumes de ciment (sacs) et fer (barres)"
          icon={TrendingUp}
          className="lg:col-span-2"
        >
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={MONTHLY_CONSUMPTION_DATA}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val, name) => [
                    `${val} ${name === 'ciment' ? 'sacs' : (name === 'acier' ? 'barres' : 'm³')}`,
                    name === 'ciment' ? 'Ciment CPJ' : (name === 'acier' ? 'Aciers Ø10-16' : 'Agrégats')
                  ]}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  formatter={(v) => (v === 'ciment' ? 'Ciment (Sacs)' : (v === 'acier' ? 'Ferraillage (Barres)' : 'Agrégats (m³)'))}
                />
                <Bar dataKey="ciment" fill="#1E293B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="acier" fill="#A64B2A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="agregats" fill="#64748B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Graphique 2 : Répartition des présences aujourd'hui */}
        <Card
          title="Pointage du Jour"
          subtitle={`${totalEmployees} ouvriers et techniciens enregistrés`}
          icon={Users}
        >
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ATTENDANCE_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {ATTENDANCE_BREAKDOWN.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} personne(s)`, name]}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Légende détaillée */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            {ATTENDANCE_BREAKDOWN.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ================= SECTION 2 COLONNES : AVANCEMENT CHANTIERS & ALERTES URGENTES ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avancement par chantier (2 colonnes) */}
        <Card
          title="Avancement Technique par Chantier"
          subtitle="Progrès physique et respect des jalons prévisionnels"
          icon={Building2}
          action={
            <Button
              variant="ghost"
              size="xs"
              onClick={() => navigate('/chantiers')}
              icon={ArrowRight}
              iconPosition="right"
              className="text-xs"
            >
              Tous les chantiers
            </Button>
          }
          className="lg:col-span-2"
        >
          <div className="space-y-4">
            {displayedSites.map((site) => (
              <div
                key={site.id}
                onClick={() => navigate(`/chantiers/${site.id}`)}
                className="p-3.5 rounded-lg border border-[#E8DFD8] dark:border-slate-800 hover:border-[#A64B2A]/50 hover:bg-[#F5EBE0]/60 dark:hover:bg-slate-800/40 transition-all cursor-pointer space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-bold text-sm text-[#1E293B] dark:text-white truncate">
                        {site.name}
                      </h4>
                      <Badge size="sm">{site.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {site.commune}, {site.city} • Chef : <strong className="text-slate-700 dark:text-slate-300">{site.chefName}</strong>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-heading font-black text-base text-[#A64B2A] font-mono">
                      {site.progress}%
                    </span>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      {formatFCFA(site.budgetConsomme)}
                    </span>
                  </div>
                </div>

                {/* Barre de progression avec marqueur */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#A64B2A] to-[#EAB308] h-full rounded-full transition-all duration-500"
                    style={{ width: `${site.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alertes Matériaux & Fil d'activité direct */}
        <div className="space-y-6">
          {/* Alertes prioritaires */}
          <Card
            title="Alertes Stocks Immédiates"
            subtitle={`${criticalStockAlerts.length} matériau(x) sous le seuil critique`}
            icon={AlertTriangle}
            accent="danger"
          >
            <div className="space-y-3">
              {criticalStockAlerts.slice(0, 4).map((mat) => (
                <div
                  key={mat.id}
                  className="p-3 rounded-lg border border-rose-100 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {mat.name}
                      </p>
                      <Badge variant={mat.status === 'Rupture' ? 'rupture' : 'critique'} size="sm">
                        {mat.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Site : {mat.siteName}
                    </p>
                    <p className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 mt-1">
                      {mat.stockActuel} {mat.unit} restants (Seuil: {mat.seuilAlerte})
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => navigate('/stocks')}
                    className="shrink-0 text-[11px] h-7"
                  >
                    Commander
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Fil d'activité en direct */}
          <Card
            title="Fil d'Activité en Direct"
            subtitle="Derniers mouvements et validations"
            icon={Clock}
          >
            <div className="space-y-3.5 divide-y divide-slate-100 dark:divide-slate-800">
              {recentActivities.map((act) => (
                <div key={act.id} className="pt-3 first:pt-0 flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#A64B2A] mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {act.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {act.subtitle}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatRelativeTime(act.time)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
