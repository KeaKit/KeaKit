/**
 * Tests de lógica de negocio de MyIncidentsScreen.
 * Incluye STATUS_CONFIG, TYPE_LABELS, filtrado por pestaña,
 * conteo de resumen (summary) e isReceived derivado de tab.
 */

// ─── Tipos ──────────────────────────────────────────────────────────────────

type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
type TabType = 'sent' | 'received';

interface IncidentResponse {
  id: number;
  title: string;
  description: string;
  type: string;
  status: IncidentStatus;
  user: { id: number; name: string } | null;
  relatedItem: { id: number; title: string; owner?: { id: number; name: string } } | null;
}

// ─── Constantes copiadas del componente ──────────────────────────────────────

const STATUS_CONFIG: Record<IncidentStatus, { label: string; color: string }> = {
  OPEN: { label: 'Abierta', color: '#f59e0b' },
  IN_PROGRESS: { label: 'En progreso', color: '#3b82f6' },
  RESOLVED: { label: 'Resuelta', color: '#10b981' },
};

const TYPE_LABELS: Record<string, string> = {
  GENERAL: 'General',
  DAMAGED_ITEM: 'Objeto dañado',
};

// ─── Funciones extraídas del componente ─────────────────────────────────────

function getCurrentIncidents(
  activeTab: TabType,
  sentIncidents: IncidentResponse[],
  receivedIncidents: IncidentResponse[],
): IncidentResponse[] {
  return activeTab === 'sent' ? sentIncidents : receivedIncidents;
}

function getSummary(incidents: IncidentResponse[]) {
  return {
    total: incidents.length,
    open: incidents.filter((i) => i.status === 'OPEN').length,
    inProgress: incidents.filter((i) => i.status === 'IN_PROGRESS').length,
    resolved: incidents.filter((i) => i.status === 'RESOLVED').length,
  };
}

function isReceivedTab(activeTab: TabType): boolean {
  return activeTab === 'received';
}

function getTypeLabel(type: string): string {
  return TYPE_LABELS[type] || type;
}

// ─── Datos de prueba ────────────────────────────────────────────────────────

const sentIncidents: IncidentResponse[] = [
  {
    id: 1, title: 'Pantalla rota', description: 'El portátil tiene la pantalla rota',
    type: 'DAMAGED_ITEM', status: 'OPEN',
    user: { id: 10, name: 'Ana' },
    relatedItem: { id: 100, title: 'MacBook Pro' },
  },
  {
    id: 2, title: 'Pedido sin llegar', description: 'Llevo 3 días esperando',
    type: 'GENERAL', status: 'IN_PROGRESS',
    user: { id: 10, name: 'Ana' },
    relatedItem: null,
  },
  {
    id: 3, title: 'Devuelto con daño', description: 'El casco está rayado',
    type: 'DAMAGED_ITEM', status: 'RESOLVED',
    user: { id: 10, name: 'Ana' },
    relatedItem: { id: 101, title: 'Casco' },
  },
];

const receivedIncidents: IncidentResponse[] = [
  {
    id: 4, title: 'Cinta ruidosa', description: 'Hace ruido al correr',
    type: 'DAMAGED_ITEM', status: 'OPEN',
    user: { id: 20, name: 'Carlos' },
    relatedItem: { id: 200, title: 'Cinta de correr' },
  },
  {
    id: 5, title: 'Error en precio', description: 'El precio mostrado es incorrecto',
    type: 'GENERAL', status: 'OPEN',
    user: { id: 30, name: 'María' },
    relatedItem: null,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Tests de STATUS_CONFIG
// ═══════════════════════════════════════════════════════════════════════════

describe('MyIncidentsScreen - STATUS_CONFIG', () => {
  it('contiene exactamente OPEN, IN_PROGRESS, RESOLVED', () => {
    expect(Object.keys(STATUS_CONFIG).sort()).toEqual(['IN_PROGRESS', 'OPEN', 'RESOLVED']);
  });

  it.each([
    ['OPEN', 'Abierta'],
    ['IN_PROGRESS', 'En progreso'],
    ['RESOLVED', 'Resuelta'],
  ] as const)('estado %s tiene label "%s"', (status, expectedLabel) => {
    expect(STATUS_CONFIG[status].label).toBe(expectedLabel);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Tests de TYPE_LABELS
// ═══════════════════════════════════════════════════════════════════════════

describe('MyIncidentsScreen - TYPE_LABELS / getTypeLabel', () => {
  it('mapea GENERAL correctamente', () => {
    expect(getTypeLabel('GENERAL')).toBe('General');
  });

  it('mapea DAMAGED_ITEM correctamente', () => {
    expect(getTypeLabel('DAMAGED_ITEM')).toBe('Objeto dañado');
  });

  it('devuelve el tipo tal cual para tipos desconocidos', () => {
    expect(getTypeLabel('CUSTOM_TYPE')).toBe('CUSTOM_TYPE');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Tests de selección de pestaña
// ═══════════════════════════════════════════════════════════════════════════

describe('MyIncidentsScreen - getCurrentIncidents', () => {
  it('devuelve sentIncidents cuando la pestaña es sent', () => {
    const result = getCurrentIncidents('sent', sentIncidents, receivedIncidents);
    expect(result).toBe(sentIncidents);
    expect(result).toHaveLength(3);
  });

  it('devuelve receivedIncidents cuando la pestaña es received', () => {
    const result = getCurrentIncidents('received', sentIncidents, receivedIncidents);
    expect(result).toBe(receivedIncidents);
    expect(result).toHaveLength(2);
  });

  it('devuelve lista vacía si la pestaña sent no tiene incidencias', () => {
    const result = getCurrentIncidents('sent', [], receivedIncidents);
    expect(result).toHaveLength(0);
  });

  it('devuelve lista vacía si la pestaña received no tiene incidencias', () => {
    const result = getCurrentIncidents('received', sentIncidents, []);
    expect(result).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Tests de resumen (summary)
// ═══════════════════════════════════════════════════════════════════════════

describe('MyIncidentsScreen - getSummary', () => {
  it('calcula correctamente el resumen de sentIncidents', () => {
    const summary = getSummary(sentIncidents);
    expect(summary).toEqual({
      total: 3,
      open: 1,
      inProgress: 1,
      resolved: 1,
    });
  });

  it('calcula correctamente el resumen de receivedIncidents', () => {
    const summary = getSummary(receivedIncidents);
    expect(summary).toEqual({
      total: 2,
      open: 2,
      inProgress: 0,
      resolved: 0,
    });
  });

  it('devuelve todo cero para lista vacía', () => {
    const summary = getSummary([]);
    expect(summary).toEqual({
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
    });
  });

  it('cuenta múltiples incidencias del mismo estado', () => {
    const allOpen: IncidentResponse[] = [
      { ...sentIncidents[0], id: 100, status: 'OPEN' },
      { ...sentIncidents[0], id: 101, status: 'OPEN' },
      { ...sentIncidents[0], id: 102, status: 'OPEN' },
    ];
    const summary = getSummary(allOpen);
    expect(summary).toEqual({
      total: 3,
      open: 3,
      inProgress: 0,
      resolved: 0,
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Tests de isReceivedTab
// ═══════════════════════════════════════════════════════════════════════════

describe('MyIncidentsScreen - isReceivedTab', () => {
  it('devuelve true para pestaña received', () => {
    expect(isReceivedTab('received')).toBe(true);
  });

  it('devuelve false para pestaña sent', () => {
    expect(isReceivedTab('sent')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Tests de navegación a detalle
// ═══════════════════════════════════════════════════════════════════════════

describe('MyIncidentsScreen - parámetros de navegación al detalle', () => {
  function getNavigationParams(incident: IncidentResponse, activeTab: TabType) {
    return {
      incidentId: incident.id,
      isReceived: activeTab === 'received',
    };
  }

  it('envia isReceived=false desde la pestaña sent', () => {
    const params = getNavigationParams(sentIncidents[0], 'sent');
    expect(params).toEqual({ incidentId: 1, isReceived: false });
  });

  it('envia isReceived=true desde la pestaña received', () => {
    const params = getNavigationParams(receivedIncidents[0], 'received');
    expect(params).toEqual({ incidentId: 4, isReceived: true });
  });

  it('pasa el id correcto de la incidencia', () => {
    const params = getNavigationParams(sentIncidents[1], 'sent');
    expect(params.incidentId).toBe(2);
  });
});
