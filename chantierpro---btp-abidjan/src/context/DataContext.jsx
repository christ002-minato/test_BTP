/**
 * Contexte de données global pour ChantierPro
 * useReducer, persistance localStorage, simulation de latence, gestion des toasts et annulation de sortie
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  INITIAL_SITES,
  INITIAL_MATERIALS,
  INITIAL_EMPLOYEES,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_SITE_LOGS
} from '../data/mockData.js';

const DataContext = createContext(null);

const STORAGE_KEY = 'chantierpro_db_store_v1';
const THEME_KEY = 'chantierpro_theme_mode';

// État initial par défaut
const getInitialState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const themeSaved = localStorage.getItem(THEME_KEY) || 'light';
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        toasts: [],
        lastExitAction: null,
        theme: themeSaved
      };
    }
  } catch (e) {
    console.error('Erreur chargement données localStorage:', e);
  }

  return {
    sites: INITIAL_SITES,
    materials: INITIAL_MATERIALS,
    employees: INITIAL_EMPLOYEES,
    movements: INITIAL_STOCK_MOVEMENTS,
    suppliers: INITIAL_SUPPLIERS,
    purchaseOrders: INITIAL_PURCHASE_ORDERS,
    siteLogs: INITIAL_SITE_LOGS,
    toasts: [],
    lastExitAction: null,
    theme: localStorage.getItem(THEME_KEY) || 'light'
  };
};

function dataReducer(state, action) {
  switch (action.type) {
    // --- GESTION DU THÈME ---
    case 'SET_THEME':
      return { ...state, theme: action.payload };

    // --- TOASTS ---
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, { id: 'toast_' + Date.now() + Math.random(), ...action.payload }]
      };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.payload)
      };

    // --- SORTIE DE STOCK (avec possibilité d'annulation) ---
    case 'STOCK_EXIT': {
      const { materialId, quantite, motif, operateur, refBon } = action.payload;
      const numQty = Number(quantite);
      let previousQty = 0;
      let targetMaterial = null;

      const updatedMaterials = state.materials.map(mat => {
        if (mat.id === materialId) {
          previousQty = mat.stockActuel;
          targetMaterial = mat;
          const newQty = Math.max(0, mat.stockActuel - numQty);
          let newStatus = 'Normal';
          if (newQty === 0) newStatus = 'Rupture';
          else if (newQty <= mat.seuilAlerte) newStatus = 'Critique';
          else if (newQty <= mat.seuilAlerte * 1.3) newStatus = 'À surveiller';

          return {
            ...mat,
            stockActuel: newQty,
            status: newStatus,
            lastUpdated: new Date().toISOString()
          };
        }
        return mat;
      });

      const newMovement = {
        id: `mvt_${Date.now()}`,
        type: 'sortie',
        materialId,
        materialName: targetMaterial ? targetMaterial.name : 'Matériau inconnu',
        materialUnit: targetMaterial ? targetMaterial.unit : 'Unités',
        quantite: numQty,
        siteSourceId: targetMaterial ? targetMaterial.siteId : null,
        siteSourceName: targetMaterial ? targetMaterial.siteName : null,
        siteDestId: null,
        siteDestName: null,
        date: new Date().toISOString(),
        motif: motif || 'Sortie chantier',
        operateur: operateur || 'Utilisateur ChantierPro',
        refBon: refBon || `BS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      };

      return {
        ...state,
        materials: updatedMaterials,
        movements: [newMovement, ...state.movements],
        lastExitAction: {
          materialId,
          quantite: numQty,
          previousQty,
          movementId: newMovement.id,
          materialName: targetMaterial?.name,
          timestamp: Date.now()
        }
      };
    }

    // --- ANNULATION DE LA DERNIÈRE SORTIE DE STOCK ---
    case 'UNDO_LAST_EXIT': {
      if (!state.lastExitAction) return state;
      const { materialId, quantite, movementId, materialName } = state.lastExitAction;

      const updatedMaterials = state.materials.map(mat => {
        if (mat.id === materialId) {
          const newQty = mat.stockActuel + quantite;
          let newStatus = 'Normal';
          if (newQty === 0) newStatus = 'Rupture';
          else if (newQty <= mat.seuilAlerte) newStatus = 'Critique';
          else if (newQty <= mat.seuilAlerte * 1.3) newStatus = 'À surveiller';

          return {
            ...mat,
            stockActuel: newQty,
            status: newStatus,
            lastUpdated: new Date().toISOString()
          };
        }
        return mat;
      });

      // Supprimer le mouvement de sortie ou ajouter un rectificatif
      const filteredMovements = state.movements.filter(m => m.id !== movementId);

      return {
        ...state,
        materials: updatedMaterials,
        movements: filteredMovements,
        lastExitAction: null
      };
    }

    // --- ENTRÉE DE STOCK (RÉAPPROVISIONNEMENT) ---
    case 'STOCK_ENTRY': {
      const { materialId, quantite, motif, operateur, refBon } = action.payload;
      const numQty = Number(quantite);
      let targetMaterial = null;

      const updatedMaterials = state.materials.map(mat => {
        if (mat.id === materialId) {
          targetMaterial = mat;
          const newQty = mat.stockActuel + numQty;
          let newStatus = 'Normal';
          if (newQty === 0) newStatus = 'Rupture';
          else if (newQty <= mat.seuilAlerte) newStatus = 'Critique';
          else if (newQty <= mat.seuilAlerte * 1.3) newStatus = 'À surveiller';

          return {
            ...mat,
            stockActuel: newQty,
            status: newStatus,
            lastUpdated: new Date().toISOString()
          };
        }
        return mat;
      });

      const newMovement = {
        id: `mvt_${Date.now()}`,
        type: 'entree',
        materialId,
        materialName: targetMaterial ? targetMaterial.name : 'Matériau inconnu',
        materialUnit: targetMaterial ? targetMaterial.unit : 'Unités',
        quantite: numQty,
        siteSourceId: null,
        siteSourceName: null,
        siteDestId: targetMaterial ? targetMaterial.siteId : null,
        siteDestName: targetMaterial ? targetMaterial.siteName : null,
        date: new Date().toISOString(),
        motif: motif || 'Réapprovisionnement fournisseur',
        operateur: operateur || 'Utilisateur ChantierPro',
        refBon: refBon || `BL-REC-${Math.floor(1000 + Math.random() * 9000)}`
      };

      return {
        ...state,
        materials: updatedMaterials,
        movements: [newMovement, ...state.movements]
      };
    }

    // --- TRANSFERT DE MATÉRIAU INTER-CHANTIERS ---
    case 'STOCK_TRANSFER': {
      const { materialId, destSiteId, quantite, motif, operateur, refBon } = action.payload;
      const numQty = Number(quantite);
      const targetSite = state.sites.find(s => s.id === destSiteId);
      let targetMaterial = null;

      const updatedMaterials = state.materials.map(mat => {
        if (mat.id === materialId) {
          targetMaterial = mat;
          const newQty = Math.max(0, mat.stockActuel - numQty);
          let newStatus = 'Normal';
          if (newQty === 0) newStatus = 'Rupture';
          else if (newQty <= mat.seuilAlerte) newStatus = 'Critique';
          else if (newQty <= mat.seuilAlerte * 1.3) newStatus = 'À surveiller';

          return {
            ...mat,
            stockActuel: newQty,
            status: newStatus,
            lastUpdated: new Date().toISOString()
          };
        }
        return mat;
      });

      const newMovement = {
        id: `mvt_${Date.now()}`,
        type: 'transfert',
        materialId,
        materialName: targetMaterial ? targetMaterial.name : 'Matériau',
        materialUnit: targetMaterial ? targetMaterial.unit : 'Unités',
        quantite: numQty,
        siteSourceId: targetMaterial?.siteId,
        siteSourceName: targetMaterial?.siteName,
        siteDestId: destSiteId,
        siteDestName: targetSite?.name || 'Chantier destination',
        date: new Date().toISOString(),
        motif: motif || 'Transfert inter-chantiers',
        operateur: operateur || 'Utilisateur ChantierPro',
        refBon: refBon || `BT-${Math.floor(1000 + Math.random() * 9000)}`
      };

      return {
        ...state,
        materials: updatedMaterials,
        movements: [newMovement, ...state.movements]
      };
    }

    // --- AJOUT D'UN NOUVEAU MATÉRIAU ---
    case 'ADD_MATERIAL': {
      const newMat = {
        ...action.payload,
        id: `mat_${Date.now()}`,
        code: action.payload.code || `MAT-NEW-${Math.floor(100 + Math.random() * 900)}`,
        lastUpdated: new Date().toISOString(),
        status: action.payload.stockActuel === 0 ? 'Rupture' : (action.payload.stockActuel <= action.payload.seuilAlerte ? 'Critique' : 'Normal')
      };
      return {
        ...state,
        materials: [newMat, ...state.materials]
      };
    }

    // --- POINTAGE EMPLOYÉ ---
    case 'UPDATE_ATTENDANCE': {
      const { employeeId, status } = action.payload;
      return {
        ...state,
        employees: state.employees.map(emp => {
          if (emp.id === employeeId) {
            return {
              ...emp,
              pointageAujourdhui: status
            };
          }
          return emp;
        })
      };
    }

    // --- TOUT MARQUER PRÉSENT (SUR UN CHANTIER) ---
    case 'MARK_ALL_PRESENT': {
      const { siteId } = action.payload;
      return {
        ...state,
        employees: state.employees.map(emp => {
          if (!siteId || emp.siteId === siteId) {
            return {
              ...emp,
              pointageAujourdhui: 'present'
            };
          }
          return emp;
        })
      };
    }

    // --- CRÉATION DE BON DE COMMANDE ---
    case 'CREATE_PURCHASE_ORDER': {
      const newPO = {
        ...action.payload,
        id: `po_${Date.now()}`,
        code: `BC-2026-0${Math.floor(100 + Math.random() * 900)}`,
        dateCreation: new Date().toISOString()
      };
      return {
        ...state,
        purchaseOrders: [newPO, ...state.purchaseOrders]
      };
    }

    // --- MISE À JOUR STATUT COMMANDE ---
    case 'UPDATE_PO_STATUS': {
      const { poId, status } = action.payload;
      return {
        ...state,
        purchaseOrders: state.purchaseOrders.map(po => {
          if (po.id === poId) {
            return { ...po, status };
          }
          return po;
        })
      };
    }

    // --- AJOUT JOURNAL DE CHANTIER ---
    case 'ADD_SITE_LOG': {
      const newLog = {
        ...action.payload,
        id: `log_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      return {
        ...state,
        siteLogs: [newLog, ...state.siteLogs]
      };
    }

    // --- CRÉATION NOUVEAU CHANTIER ---
    case 'ADD_SITE': {
      const newSite = {
        ...action.payload,
        id: `site_${Date.now()}`,
        budgetConsomme: 0,
        progress: 0,
        status: 'En préparation',
        workersCount: 0,
        jalons: [
          { name: 'Installation de chantier', done: true, date: new Date().toISOString().split('T')[0] },
          { name: 'Terrassement & Fondations', done: false, date: '' },
          { name: 'Gros œuvre', done: false, date: '' },
          { name: 'Second œuvre', done: false, date: '' }
        ]
      };
      return {
        ...state,
        sites: [newSite, ...state.sites]
      };
    }

    // --- RÉINITIALISATION DES DONNÉES DÉMO ---
    case 'RESET_ALL_DATA': {
      return {
        sites: INITIAL_SITES,
        materials: INITIAL_MATERIALS,
        employees: INITIAL_EMPLOYEES,
        movements: INITIAL_STOCK_MOVEMENTS,
        suppliers: INITIAL_SUPPLIERS,
        purchaseOrders: INITIAL_PURCHASE_ORDERS,
        siteLogs: INITIAL_SITE_LOGS,
        toasts: [{ id: 'toast_reset', type: 'info', message: 'Toutes les données ont été réinitialisées aux valeurs initiales d\'Abidjan.' }],
        lastExitAction: null,
        theme: state.theme
      };
    }

    default:
      return state;
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, null, getInitialState);

  // Sauvegarde persistante des collections dans localStorage
  useEffect(() => {
    try {
      const toSave = {
        sites: state.sites,
        materials: state.materials,
        employees: state.employees,
        movements: state.movements,
        suppliers: state.suppliers,
        purchaseOrders: state.purchaseOrders,
        siteLogs: state.siteLogs
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error('Erreur sauvegarde localStorage:', e);
    }
  }, [state.sites, state.materials, state.employees, state.movements, state.suppliers, state.purchaseOrders, state.siteLogs]);

  // Synchronisation du thème avec le DOM HTML
  useEffect(() => {
    localStorage.setItem(THEME_KEY, state.theme);
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Actions toast
  const addToast = useCallback(({ type = 'info', message, duration = 4500, action = null }) => {
    dispatch({ type: 'ADD_TOAST', payload: { type, message, duration, action } });
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  // Sortie de stock avec toast d'annulation
  const declareStockExit = async (data) => {
    // Simule une micro-latence pour réalisme
    await new Promise(r => setTimeout(r, 200));
    dispatch({ type: 'STOCK_EXIT', payload: data });
    
    addToast({
      type: 'warning',
      message: `Sortie de ${data.quantite} unité(s) enregistrée avec succès.`,
      action: {
        label: 'Annuler',
        onClick: () => {
          dispatch({ type: 'UNDO_LAST_EXIT' });
          addToast({
            type: 'info',
            message: 'La sortie de stock a été annulée et le matériel réintégré.'
          });
        }
      }
    });
  };

  const declareStockEntry = async (data) => {
    await new Promise(r => setTimeout(r, 200));
    dispatch({ type: 'STOCK_ENTRY', payload: data });
    addToast({
      type: 'success',
      message: `Réapprovisionnement de ${data.quantite} unité(s) validé.`
    });
  };

  const declareStockTransfer = async (data) => {
    await new Promise(r => setTimeout(r, 200));
    dispatch({ type: 'STOCK_TRANSFER', payload: data });
    addToast({
      type: 'success',
      message: `Transfert inter-chantiers de ${data.quantite} unité(s) effectué.`
    });
  };

  const addMaterial = async (data) => {
    await new Promise(r => setTimeout(r, 200));
    dispatch({ type: 'ADD_MATERIAL', payload: data });
    addToast({
      type: 'success',
      message: `Matériau « ${data.name} » ajouté au catalogue avec succès.`
    });
  };

  const updateAttendance = (employeeId, status) => {
    dispatch({ type: 'UPDATE_ATTENDANCE', payload: { employeeId, status } });
  };

  const markAllPresent = (siteId) => {
    dispatch({ type: 'MARK_ALL_PRESENT', payload: { siteId } });
    addToast({
      type: 'success',
      message: 'Tous les ouvriers ont été pointés « Présents » pour aujourd\'hui.'
    });
  };

  const createPurchaseOrder = async (poData) => {
    await new Promise(r => setTimeout(r, 300));
    dispatch({ type: 'CREATE_PURCHASE_ORDER', payload: poData });
    addToast({
      type: 'success',
      message: `Bon de commande créé avec succès auprès de ${poData.supplierName}.`
    });
  };

  const updatePOStatus = (poId, status) => {
    dispatch({ type: 'UPDATE_PO_STATUS', payload: { poId, status } });
    addToast({
      type: 'info',
      message: `Statut de la commande mis à jour : ${status.toUpperCase()}`
    });
  };

  const addSiteLog = async (logData) => {
    await new Promise(r => setTimeout(r, 200));
    dispatch({ type: 'ADD_SITE_LOG', payload: logData });
    addToast({
      type: 'success',
      message: 'Entrée enregistrée au journal de chantier.'
    });
  };

  const addSite = async (siteData) => {
    await new Promise(r => setTimeout(r, 250));
    dispatch({ type: 'ADD_SITE', payload: siteData });
    addToast({
      type: 'success',
      message: `Nouveau chantier « ${siteData.name} » créé avec succès.`
    });
  };

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: state.theme === 'light' ? 'dark' : 'light' });
  };

  const resetAllData = () => {
    dispatch({ type: 'RESET_ALL_DATA' });
  };

  return (
    <DataContext.Provider
      value={{
        ...state,
        declareStockExit,
        declareStockEntry,
        declareStockTransfer,
        addMaterial,
        updateAttendance,
        markAllPresent,
        createPurchaseOrder,
        updatePOStatus,
        addSiteLog,
        addSite,
        addToast,
        removeToast,
        toggleTheme,
        resetAllData
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData doit être utilisé au sein de DataProvider');
  }
  return context;
}
