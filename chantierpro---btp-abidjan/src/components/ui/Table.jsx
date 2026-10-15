/**
 * Tableau de données technique et réactif
 * En-têtes figés, alternance de lignes, typographie condensée pour les données denses
 */

import React from 'react';

export default function Table({
  headers = [],
  children,
  className = '',
  stickyHeader = false,
  empty = false,
  emptyText = 'Aucune donnée disponible.'
}) {
  return (
    <div className={`w-full overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs bg-white dark:bg-slate-900 ${className}`}>
      <table className="w-full text-left border-collapse text-xs sm:text-sm">
        {headers.length > 0 && (
          <thead className={`bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-heading tracking-wider uppercase border-b border-slate-200 dark:border-slate-700/80 ${stickyHeader ? 'sticky top-0 z-10 backdrop-blur-xs' : ''}`}>
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 font-bold ${typeof h === 'object' ? h.className : ''}`}
                >
                  {typeof h === 'object' ? h.label : h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {empty ? (
            <tr>
              <td
                colSpan={headers.length || 1}
                className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 italic"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export function TableRow({ children, className = '', onClick = null }) {
  return (
    <tr
      onClick={onClick}
      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = '', align = 'left' }) {
  const aligns = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  return (
    <td className={`px-4 py-3 text-slate-700 dark:text-slate-300 ${aligns[align] || 'text-left'} ${className}`}>
      {children}
    </td>
  );
}
