/**
 * Utilitaires de formatage pour ChantierPro
 * Monnaie FCFA (XOF), dates en français et export CSV conforme
 */

/**
 * Formate un montant en Franc CFA (ex: "1 250 000 FCFA")
 * @param {number} amount 
 * @returns {string}
 */
export function formatFCFA(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 FCFA';
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} FCFA`;
}

/**
 * Formate un nombre standard avec séparateur d'espace
 * @param {number} num 
 * @returns {string}
 */
export function formatNumber(num) {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Formate une date ISO ou standard en français
 * @param {string|Date} dateStr 
 * @param {'short'|'medium'|'long'|'full'} style 
 * @returns {string}
 */
export function formatDate(dateStr, style = 'medium') {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';

  if (style === 'short') {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  if (style === 'medium') {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  if (style === 'long') {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formate un temps relatif (ex: "il y a 2h", "hier", "à l'instant")
 * @param {string|Date} dateStr 
 * @returns {string}
 */
export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "à l'instant";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `il y a ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `il y a ${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'hier';
  if (diffInDays < 7) return `il y a ${diffInDays}j`;
  return formatDate(dateStr, 'medium');
}

/**
 * Télécharge un fichier CSV encodé en UTF-8 avec BOM pour compatibilité Excel
 * @param {string} filename 
 * @param {string[]} headers 
 * @param {Array<Array<string|number>>} rows 
 */
export function exportToCSV(filename, headers, rows) {
  const sanitize = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(sanitize).join(';'),
    ...rows.map(row => row.map(sanitize).join(';'))
  ].join('\r\n');

  // Ajout du BOM UTF-8 pour Excel
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
