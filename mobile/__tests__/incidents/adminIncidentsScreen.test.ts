/**
 * Tests de lógica de negocio de AdminIncidentsScreen.
 * Incluye filterIncidents, computeSummary, constantes de filtro
 * y comportamiento esperado de la pantalla de administración.
 */

import { filterIncidents, computeSummary } from '../../src/utils/incidentFilters';

// ─── Tipos ──────────────────────────────────────────────────────────────────

type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
type IncidentType = 'GENERAL' | 'DAMAGED_ITEM';

interface IncidentResponse {
  id: number;
  title: string;
  description: string;
  type: IncidentType;
  status: IncidentStatus;
  user: { id: number; name: string; email: string };
  relatedItem: { id: number; title: string; owner: { id: number; name: string } } | null;
}

// ─── Datos de prueba ────────────────────────────────────────────────────────

const SAMPLE_INCIDENTS: IncidentResponse[] = [
  {
    id: 1,
    title: 'Objeto roto',
    description: 'La pantalla está rota',
    type: 'DAMAGED_ITEM',
    status: 'OPEN',
    user: { id: 10, name: 'Juan García', email: 'juan@test.com' },
    relatedItem: { id: 100, title: 'Tablet Samsung', owner: { id: 20, name: 'María López' } },
  },
  {
    id: 2,
    title: 'Problema con el servicio',
    description: 'No puedo acceder a mi cuenta',
    type: 'GENERAL',
    status: 'IN_PROGRESS',
    user: { id: 11, name: 'Pedro Martínez', email: 'pedro@test.com' },
    relatedItem: null,
  },
  {
    id: 3,
    title: 'Entrega tardía',
    description: 'El kit llegó con dos días de retraso',
    type: 'GENERAL',
    status: 'RESOLVED',
    user: { id: 12, name: 'Ana Ruiz', email: 'ana@test.com' },
    relatedItem: null,
  },
  {
    id: 4,
    title: 'Cable dañado',
    description: 'El cable del cargador está roto',
    type: 'DAMAGED_ITEM',
    status: 'OPEN',
    user: { id: 10, name: 'Juan García', email: 'juan@test.com' },
    relatedItem: { id: 101, title: 'Cargador USB-C', owner: { id: 21, name: 'Carlos Díaz' } },
  },
  {
    id: 5,
    title: 'Consulta general',
    description: 'Duda sobre política de devoluciones',
    type: 'GENERAL',
    status: 'OPEN',
    user: { id: 13, name: 'Laura Sánchez', email: 'laura@test.com' },
    relatedItem: null,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// computeSummary
// ═══════════════════════════════════════════════════════════════════════════

describe('computeSummary', () => {
  it('calcula correctamente el resumen de todas las incidencias', () => {
    const summary = computeSummary(SAMPLE_INCIDENTS);
    expect(summary).toEqual({
      total: 5,
      open: 3,
      inProgress: 1,
      resolved: 1,
    });
  });

  it('devuelve ceros para lista vacía', () => {
    const summary = computeSummary([]);
    expect(summary).toEqual({
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
    });
  });

  it('maneja lista con un solo estado', () => {
    const onlyOpen = SAMPLE_INCIDENTS.filter((i) => i.status === 'OPEN');
    const summary = computeSummary(onlyOpen);
    expect(summary.total).toBe(3);
    expect(summary.open).toBe(3);
    expect(summary.inProgress).toBe(0);
    expect(summary.resolved).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// filterIncidents — Filtro por estado
// ═══════════════════════════════════════════════════════════════════════════

describe('filterIncidents — filtro por estado', () => {
  it('devuelve todas las incidencias con filtro ALL', () => {
    const result = filterIncidents(SAMPLE_INCIDENTS, 'ALL', 'ALL', '');
    expect(result).toHaveLength(5);
  });

  it('filtra solo incidencias OPEN', () => {
    const result = filterIncidents(SAMPLE_INCIDENTS, 'OPEN', 'ALL', '');
    expect(result).toHaveLength(3);
    result.forEach((i) => expect(i.status).toBe('OPEN'));
  });

  it('filtra solo incidencias IN_PROGRESS', () => {
    const result = filterIncidents(SAMPLE_INCIDENTS, 'IN_PROGRESS', 'ALL', '');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('filtra solo incidencias RESOLVED', () => {
    const result = filterIncidents(SAMPLE_INCIDENTS, 'RESOLVED', 'ALL', '');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(3);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// filterIncidents — Filtro por tipo
// ═══════════════════════════════════════════════════════════════════════════

describe('filterIncidents — filtro por tipo', () => {
  it('filtra solo incidencias GENERAL', () => {
    const result = filterIncidents(SAMPLE_INCIDENTS, 'ALL', 'GENERAL', '');
    expect(result).toHaveLength(3);
    result.forEach((i) => expect(i.type).toBe('GENERAL'));
  });

  it('filtra solo incidencias DAMAGED_ITEM', () => {
    const result = filterIncidents(SAMPLE_INCIDENTS, 'ALL', 'DAMAGED_ITEM', '');
    expect(result).toHaveLength(2);
    result.forEach((i) => expect(i.type).toBe('DAMAGED_ITEM'));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// filterIncidents — Búsqueda por texto
// ═══════════════════════════════════════════════════════════════════════════

describe('filterIncidents — búsqueda por texto', () => {
  it('busca por título (case insensitive)', () => {
    const result = filterIncidents(SAMPLE_INCIDENTS, 'ALL', 'ALL', 'cable');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(4);
  });

  it('busca por nombre de usuario', () => {
    const result = filterIncidents(SAMPLE_INCIDENTS, 'ALL', 'ALL', 'Juan');
    expect(result).toHaveLength(2);
    expect(result.map((i) => i.id)).toEqual([1, 4]);
  });

  it('busca por email de usuario', () => {
    const result = filterIncidents(SAMPLE_INCIDENTS, 'ALL', 'ALL', 'pedro@test');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('búsqueda vacía devuelve todo', () => {
    const result = filterIncidents(SAMPLE_INCIDENTS, 'ALL', 'ALL', '  ');
    expect(result).toHaveLength(5);
  });

  it('búsqueda sin resultados devuelve vacío', () => {
    const result = filterIncidents(SAMPLE_INCIDENTS, 'ALL', 'ALL', 'xyz123');
    expect(result).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// filterIncidents — Combinaciones de filtros
// ═══════════════════════════════════════════════════════════════════════════

describe('filterIncidents — combinación de filtros', () => {
  it('filtra por estado OPEN y tipo DAMAGED_ITEM', () => {
    const result = filterIncidents(SAMPLE_INCIDENTS, 'OPEN', 'DAMAGED_ITEM', '');
    expect(result).toHaveLength(2);
    result.forEach((i) => {
      expect(i.status).toBe('OPEN');
      expect(i.type).toBe('DAMAGED_ITEM');
    });
  });

  it('filtra por estado OPEN y tipo GENERAL', () => {
    const result = filterIncidents(SAMPLE_INCIDENTS, 'OPEN', 'GENERAL', '');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(5);
  });

  it('filtra por estado y búsqueda de texto simultáneamente', () => {
    const result = filterIncidents(SAMPLE_INCIDENTS, 'OPEN', 'ALL', 'Juan');
    expect(result).toHaveLength(2);
  });

  it('filtra por tipo, estado y búsqueda a la vez', () => {
    const result = filterIncidents(SAMPLE_INCIDENTS, 'OPEN', 'DAMAGED_ITEM', 'cable');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(4);
  });

  it('combinación que no tiene resultados', () => {
    const result = filterIncidents(SAMPLE_INCIDENTS, 'RESOLVED', 'DAMAGED_ITEM', '');
    expect(result).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// filterIncidents — Casos borde
// ═══════════════════════════════════════════════════════════════════════════

describe('filterIncidents — casos borde', () => {
  it('funciona con lista vacía', () => {
    const result = filterIncidents([], 'ALL', 'ALL', '');
    expect(result).toHaveLength(0);
  });

  it('funciona con lista vacía y filtros activos', () => {
    const result = filterIncidents([], 'OPEN', 'GENERAL', 'test');
    expect(result).toHaveLength(0);
  });

  it('la búsqueda es case-insensitive', () => {
    const upper = filterIncidents(SAMPLE_INCIDENTS, 'ALL', 'ALL', 'JUAN');
    const lower = filterIncidents(SAMPLE_INCIDENTS, 'ALL', 'ALL', 'juan');
    const mixed = filterIncidents(SAMPLE_INCIDENTS, 'ALL', 'ALL', 'JuAn');
    expect(upper).toEqual(lower);
    expect(lower).toEqual(mixed);
  });

  it('maneja usuario con campos null-ish graciosamente', () => {
    const incidentWithNullUser: IncidentResponse[] = [
      {
        id: 99,
        title: 'Test',
        description: 'Desc',
        type: 'GENERAL',
        status: 'OPEN',
        user: { id: 1, name: '', email: '' },
        relatedItem: null,
      },
    ];
    // No debería lanzar error
    const result = filterIncidents(incidentWithNullUser, 'ALL', 'ALL', 'nonexistent');
    expect(result).toHaveLength(0);
  });
});
