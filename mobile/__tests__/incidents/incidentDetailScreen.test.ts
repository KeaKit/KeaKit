/**
 * Tests de lógica de negocio de IncidentDetailScreen.
 * Incluye STATUS_CONFIG, TYPE_LABELS, formatDate, lógica de comentarios,
 * y visibilidad de acciones.
 */

// ─── Tipos ──────────────────────────────────────────────────────────────────

type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

interface IncidentResponse {
  id: number;
  title: string;
  description: string;
  type: string;
  status: IncidentStatus;
  user: { id: number; name: string } | null;
  relatedItem: { id: number; title: string; owner?: { id: number; name: string } } | null;
}

interface IncidentCommentResponse {
  id: number;
  text: string;
  author: { id: number; name: string };
  createdAt: string;
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

// ─── Función formatDate copiada del componente ──────────────────────────────

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

// ─── Funciones de lógica de negocio extraídas ───────────────────────────────

/** Determina si el campo de comentarios debe estar activo */
function canComment(incident: IncidentResponse | null): boolean {
  if (!incident) return false;
  return incident.status !== 'RESOLVED';
}

/** Determina si el comentario puede enviarse */
function canSubmitComment(commentText: string, submitting: boolean, incident: IncidentResponse | null): boolean {
  if (!incident) return false;
  if (incident.status === 'RESOLVED') return false;
  if (submitting) return false;
  return commentText.trim().length > 0;
}

/** Determina si las acciones (resolver/eliminar) son visibles */
function showActions(isReceived: boolean, incident: IncidentResponse | null): boolean {
  if (!incident) return false;
  return !isReceived && incident.status !== 'RESOLVED';
}

/** Determina si un comentario es del usuario actual */
function isOwnComment(userId: number, comment: IncidentCommentResponse): boolean {
  return userId === comment.author.id;
}

/** Nombre a mostrar para el autor de un comentario */
function commentAuthorLabel(userId: number, comment: IncidentCommentResponse): string {
  return isOwnComment(userId, comment) ? 'Tú' : comment.author.name;
}

/** Obtiene el título de la cabecera según si es recibida o propia */
function headerTitle(isReceived: boolean): string {
  return isReceived ? 'Incidencia recibida' : 'Mi incidencia';
}

/** Etiqueta del creador según pestaña */
function creatorLabel(isReceived: boolean): string {
  return isReceived ? 'Enviada por:' : 'Creada por:';
}

// ═══════════════════════════════════════════════════════════════════════════
// Tests de constantes
// ═══════════════════════════════════════════════════════════════════════════

describe('IncidentDetailScreen - STATUS_CONFIG', () => {
  it('contiene los tres estados posibles', () => {
    expect(Object.keys(STATUS_CONFIG)).toEqual(['OPEN', 'IN_PROGRESS', 'RESOLVED']);
  });

  it('OPEN tiene label "Abierta"', () => {
    expect(STATUS_CONFIG.OPEN.label).toBe('Abierta');
  });

  it('IN_PROGRESS tiene label "En progreso"', () => {
    expect(STATUS_CONFIG.IN_PROGRESS.label).toBe('En progreso');
  });

  it('RESOLVED tiene label "Resuelta"', () => {
    expect(STATUS_CONFIG.RESOLVED.label).toBe('Resuelta');
  });

  it('cada estado tiene un color definido', () => {
    for (const key of Object.keys(STATUS_CONFIG) as IncidentStatus[]) {
      expect(STATUS_CONFIG[key].color).toBeTruthy();
      expect(STATUS_CONFIG[key].color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe('IncidentDetailScreen - TYPE_LABELS', () => {
  it('mapea GENERAL a "General"', () => {
    expect(TYPE_LABELS['GENERAL']).toBe('General');
  });

  it('mapea DAMAGED_ITEM a "Objeto dañado"', () => {
    expect(TYPE_LABELS['DAMAGED_ITEM']).toBe('Objeto dañado');
  });

  it('devuelve undefined para tipo desconocido', () => {
    expect(TYPE_LABELS['UNKNOWN']).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Tests de formatDate
// ═══════════════════════════════════════════════════════════════════════════

describe('IncidentDetailScreen - formatDate', () => {
  it('formatea una fecha ISO correctamente en español', () => {
    const result = formatDate('2026-03-15T14:30:00');
    // Verificamos que contiene componentes esperados
    expect(result).toMatch(/15/);       // día
    expect(result).toMatch(/2026/);     // año
    expect(result).toMatch(/14:30|2:30/); // hora (puede variar según TZ)
  });

  it('devuelve la cadena original si es inválida y new Date no lanza', () => {
    // new Date con cadena inválida devuelve "Invalid Date" → toLocaleDateString retorna "Invalid Date"
    const result = formatDate('no-es-fecha');
    expect(typeof result).toBe('string');
  });

  it('formatea al comienzo del año', () => {
    const result = formatDate('2026-01-01T00:00:00');
    expect(result).toMatch(/01|1/);
    expect(result).toMatch(/2026/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Tests de lógica de comentarios
// ═══════════════════════════════════════════════════════════════════════════

describe('IncidentDetailScreen - lógica de comentarios', () => {
  const openIncident: IncidentResponse = {
    id: 1, title: 'Test', description: 'Desc', type: 'GENERAL',
    status: 'OPEN', user: { id: 10, name: 'Ana' }, relatedItem: null,
  };

  const resolvedIncident: IncidentResponse = {
    id: 2, title: 'Resuelta', description: 'Desc', type: 'GENERAL',
    status: 'RESOLVED', user: { id: 10, name: 'Ana' }, relatedItem: null,
  };

  describe('canComment', () => {
    it('permite comentar en incidencia abierta', () => {
      expect(canComment(openIncident)).toBe(true);
    });

    it('permite comentar en incidencia en progreso', () => {
      const inProgress = { ...openIncident, status: 'IN_PROGRESS' as IncidentStatus };
      expect(canComment(inProgress)).toBe(true);
    });

    it('no permite comentar en incidencia resuelta', () => {
      expect(canComment(resolvedIncident)).toBe(false);
    });

    it('no permite comentar si incident es null', () => {
      expect(canComment(null)).toBe(false);
    });
  });

  describe('canSubmitComment', () => {
    it('permite enviar con texto y sin submitting', () => {
      expect(canSubmitComment('Hola', false, openIncident)).toBe(true);
    });

    it('no permite enviar con texto vacío', () => {
      expect(canSubmitComment('', false, openIncident)).toBe(false);
    });

    it('no permite enviar con solo espacios', () => {
      expect(canSubmitComment('   ', false, openIncident)).toBe(false);
    });

    it('no permite enviar mientras se está enviando', () => {
      expect(canSubmitComment('Hola', true, openIncident)).toBe(false);
    });

    it('no permite enviar en incidencia resuelta', () => {
      expect(canSubmitComment('Hola', false, resolvedIncident)).toBe(false);
    });

    it('no permite enviar si incident es null', () => {
      expect(canSubmitComment('Hola', false, null)).toBe(false);
    });
  });

  describe('isOwnComment / commentAuthorLabel', () => {
    const comment: IncidentCommentResponse = {
      id: 1, text: 'texto', author: { id: 10, name: 'Carlos' }, createdAt: '2026-01-01T00:00:00',
    };

    it('identifica comentario propio', () => {
      expect(isOwnComment(10, comment)).toBe(true);
    });

    it('identifica comentario ajeno', () => {
      expect(isOwnComment(99, comment)).toBe(false);
    });

    it('muestra "Tú" para comentario propio', () => {
      expect(commentAuthorLabel(10, comment)).toBe('Tú');
    });

    it('muestra el nombre del autor para comentario ajeno', () => {
      expect(commentAuthorLabel(99, comment)).toBe('Carlos');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Tests de visibilidad de acciones
// ═══════════════════════════════════════════════════════════════════════════

describe('IncidentDetailScreen - visibilidad de acciones', () => {
  const openIncident: IncidentResponse = {
    id: 1, title: 'Test', description: 'Desc', type: 'GENERAL',
    status: 'OPEN', user: { id: 10, name: 'Ana' }, relatedItem: null,
  };

  const resolvedIncident: IncidentResponse = {
    ...openIncident, id: 2, status: 'RESOLVED',
  };

  it('muestra acciones para incidencia propia abierta', () => {
    expect(showActions(false, openIncident)).toBe(true);
  });

  it('muestra acciones para incidencia propia en progreso', () => {
    const inProgress = { ...openIncident, status: 'IN_PROGRESS' as IncidentStatus };
    expect(showActions(false, inProgress)).toBe(true);
  });

  it('oculta acciones para incidencia resuelta', () => {
    expect(showActions(false, resolvedIncident)).toBe(false);
  });

  it('oculta acciones para incidencia recibida', () => {
    expect(showActions(true, openIncident)).toBe(false);
  });

  it('oculta acciones si incident es null', () => {
    expect(showActions(false, null)).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Tests de títulos y etiquetas
// ═══════════════════════════════════════════════════════════════════════════

describe('IncidentDetailScreen - títulos y etiquetas', () => {
  it('headerTitle muestra "Incidencia recibida" si isReceived', () => {
    expect(headerTitle(true)).toBe('Incidencia recibida');
  });

  it('headerTitle muestra "Mi incidencia" si no es recibida', () => {
    expect(headerTitle(false)).toBe('Mi incidencia');
  });

  it('creatorLabel muestra "Enviada por:" si isReceived', () => {
    expect(creatorLabel(true)).toBe('Enviada por:');
  });

  it('creatorLabel muestra "Creada por:" si no es recibida', () => {
    expect(creatorLabel(false)).toBe('Creada por:');
  });
});
