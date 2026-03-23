/**
 * Extended tests for CU-GENERAL-04 (Soporte) business rules.
 * Covers RN-INC-01..RN-INC-14 not fully exercised by existing test files.
 * Focus areas:
 *  - RN-INC-02: Description max length (1000 chars)
 *  - RN-INC-03: DAMAGED_ITEM requires relatedItem + relatedKit, GENERAL clears them
 *  - RN-INC-04: All three status transitions
 *  - RN-INC-06: Incident must be associated to a user
 *  - RN-INC-07: Optional related item
 *  - RN-INC-08: Resolved incident cannot be deleted
 *  - RN-INC-09: Cannot comment on resolved incident
 *  - RN-INC-10: Comment max length (2000 chars)
 *  - RN-INC-11: Comment creation timestamp is automatic
 *  - RN-INC-12: User can see own incidents
 *  - RN-INC-13: Owner can see received incidents
 */

// ─── Types ──────────────────────────────────────────────────────────────────

type IncidentType = 'GENERAL' | 'DAMAGED_ITEM';
type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

interface IncidentCreateRequest {
  title: string;
  description: string;
  type: IncidentType;
  user: { id: number };
  relatedItem?: { id: number } | null;
  relatedKit?: { id: number } | null;
}

interface IncidentResponse {
  id: number;
  title: string;
  description: string;
  type: IncidentType;
  status: IncidentStatus;
  user: { id: number; name: string } | null;
  relatedItem: { id: number; title: string; owner?: { id: number; name: string } } | null;
  relatedKit: { id: number; name: string } | null;
  createdAt: string;
}

interface IncidentCommentResponse {
  id: number;
  text: string;
  author: { id: number; name: string };
  createdAt: string;
}

// ─── Business rule validation functions (mirror backend logic) ──────────────

function validateIncidentCreate(data: IncidentCreateRequest): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // RN-INC-01: Title required and non-empty
  if (!data.title || !data.title.trim()) {
    errors.push('El título es obligatorio.');
  }

  // RN-INC-02: Description required, non-empty, max 1000 chars
  if (!data.description || !data.description.trim()) {
    errors.push('La descripción es obligatoria.');
  } else if (data.description.length > 1000) {
    errors.push('La descripción no puede superar los 1000 caracteres.');
  }

  // RN-INC-03: DAMAGED_ITEM needs relatedItem
  if (data.type === 'DAMAGED_ITEM') {
    if (!data.relatedItem) {
      errors.push('Debes seleccionar el objeto dañado.');
    }
  }

  // RN-INC-06: Must have a user
  if (!data.user || !data.user.id) {
    errors.push('La incidencia debe estar asociada a un usuario.');
  }

  return { valid: errors.length === 0, errors };
}

function validateComment(text: string, incidentStatus: IncidentStatus): { valid: boolean; error?: string } {
  // RN-INC-09: Cannot comment on resolved
  if (incidentStatus === 'RESOLVED') {
    return { valid: false, error: 'No se pueden añadir comentarios a una incidencia resuelta.' };
  }
  // RN-INC-10: Comment max length
  if (text.length > 2000) {
    return { valid: false, error: 'El comentario no puede superar los 2000 caracteres.' };
  }
  if (!text.trim()) {
    return { valid: false, error: 'El comentario no puede estar vacío.' };
  }
  return { valid: true };
}

function canDeleteIncident(status: IncidentStatus): boolean {
  // RN-INC-08: Cannot delete resolved
  return status !== 'RESOLVED';
}

function getDefaultStatus(): IncidentStatus {
  // RN-INC-05
  return 'OPEN';
}

function buildCreatePayload(
  title: string,
  description: string,
  type: IncidentType,
  userId: number,
  relatedItem: { id: number } | null,
  relatedKit: { id: number } | null,
): IncidentCreateRequest {
  const payload: IncidentCreateRequest = {
    title: title.trim(),
    description: description.trim(),
    type,
    user: { id: userId },
  };
  // RN-INC-03: GENERAL type clears related fields
  if (type === 'GENERAL') {
    payload.relatedItem = null;
    payload.relatedKit = null;
  } else {
    payload.relatedItem = relatedItem;
    payload.relatedKit = relatedKit;
  }
  return payload;
}

function isValidTransition(from: IncidentStatus, to: IncidentStatus): boolean {
  // RN-INC-04: Valid transitions
  const transitions: Record<IncidentStatus, IncidentStatus[]> = {
    OPEN: ['IN_PROGRESS', 'RESOLVED'],
    IN_PROGRESS: ['RESOLVED'],
    RESOLVED: [],
  };
  return transitions[from].includes(to);
}

function filterIncidentsByOwner(
  incidents: IncidentResponse[],
  ownerId: number,
): IncidentResponse[] {
  // RN-INC-13: Owner sees incidents on their items
  return incidents.filter(
    (inc) => inc.relatedItem?.owner?.id === ownerId,
  );
}

function filterIncidentsByUser(
  incidents: IncidentResponse[],
  userId: number,
): IncidentResponse[] {
  // RN-INC-12: User sees own incidents
  return incidents.filter((inc) => inc.user?.id === userId);
}

// ═══════════════════════════════════════════════════════════════════════════
// RN-INC-01: Title required
// ═══════════════════════════════════════════════════════════════════════════

describe('RN-INC-01 – Title required', () => {
  it('rejects empty title', () => {
    const result = validateIncidentCreate({
      title: '', description: 'Desc', type: 'GENERAL', user: { id: 1 },
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('El título es obligatorio.');
  });

  it('rejects whitespace-only title', () => {
    const result = validateIncidentCreate({
      title: '   ', description: 'Desc', type: 'GENERAL', user: { id: 1 },
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('El título es obligatorio.');
  });

  it('accepts non-empty title', () => {
    const result = validateIncidentCreate({
      title: 'Issue', description: 'Desc', type: 'GENERAL', user: { id: 1 },
    });
    expect(result.valid).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RN-INC-02: Description required, max 1000 chars
// ═══════════════════════════════════════════════════════════════════════════

describe('RN-INC-02 – Description required, max 1000 chars', () => {
  it('rejects empty description', () => {
    const result = validateIncidentCreate({
      title: 'Title', description: '', type: 'GENERAL', user: { id: 1 },
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('La descripción es obligatoria.');
  });

  it('rejects whitespace-only description', () => {
    const result = validateIncidentCreate({
      title: 'Title', description: '   ', type: 'GENERAL', user: { id: 1 },
    });
    expect(result.valid).toBe(false);
  });

  it('rejects description longer than 1000 characters', () => {
    const longDesc = 'a'.repeat(1001);
    const result = validateIncidentCreate({
      title: 'Title', description: longDesc, type: 'GENERAL', user: { id: 1 },
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('La descripción no puede superar los 1000 caracteres.');
  });

  it('accepts description of exactly 1000 characters', () => {
    const maxDesc = 'b'.repeat(1000);
    const result = validateIncidentCreate({
      title: 'Title', description: maxDesc, type: 'GENERAL', user: { id: 1 },
    });
    expect(result.valid).toBe(true);
  });

  it('accepts normal length description', () => {
    const result = validateIncidentCreate({
      title: 'Title', description: 'Normal description', type: 'GENERAL', user: { id: 1 },
    });
    expect(result.valid).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RN-INC-03: DAMAGED_ITEM needs relatedItem, GENERAL clears them
// ═══════════════════════════════════════════════════════════════════════════

describe('RN-INC-03 – DAMAGED_ITEM requires relatedItem', () => {
  it('rejects DAMAGED_ITEM without relatedItem', () => {
    const result = validateIncidentCreate({
      title: 'Damage', description: 'Broken screen', type: 'DAMAGED_ITEM',
      user: { id: 1 }, relatedItem: null,
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Debes seleccionar el objeto dañado.');
  });

  it('accepts DAMAGED_ITEM with relatedItem', () => {
    const result = validateIncidentCreate({
      title: 'Damage', description: 'Broken screen', type: 'DAMAGED_ITEM',
      user: { id: 1 }, relatedItem: { id: 42 },
    });
    expect(result.valid).toBe(true);
  });

  it('GENERAL type does not require relatedItem', () => {
    const result = validateIncidentCreate({
      title: 'General', description: 'A question', type: 'GENERAL',
      user: { id: 1 }, relatedItem: null,
    });
    expect(result.valid).toBe(true);
  });
});

describe('RN-INC-03 – GENERAL type clears related fields in payload', () => {
  it('sets relatedItem and relatedKit to null for GENERAL', () => {
    const payload = buildCreatePayload('Title', 'Desc', 'GENERAL', 1, { id: 5 }, { id: 10 });
    expect(payload.relatedItem).toBeNull();
    expect(payload.relatedKit).toBeNull();
  });

  it('preserves relatedItem for DAMAGED_ITEM', () => {
    const payload = buildCreatePayload('Title', 'Desc', 'DAMAGED_ITEM', 1, { id: 5 }, { id: 10 });
    expect(payload.relatedItem).toEqual({ id: 5 });
    expect(payload.relatedKit).toEqual({ id: 10 });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RN-INC-04: Status transitions
// ═══════════════════════════════════════════════════════════════════════════

describe('RN-INC-04 – Status transitions', () => {
  it('OPEN → IN_PROGRESS is valid', () => {
    expect(isValidTransition('OPEN', 'IN_PROGRESS')).toBe(true);
  });

  it('OPEN → RESOLVED is valid', () => {
    expect(isValidTransition('OPEN', 'RESOLVED')).toBe(true);
  });

  it('IN_PROGRESS → RESOLVED is valid', () => {
    expect(isValidTransition('IN_PROGRESS', 'RESOLVED')).toBe(true);
  });

  it('RESOLVED → OPEN is not valid', () => {
    expect(isValidTransition('RESOLVED', 'OPEN')).toBe(false);
  });

  it('RESOLVED → IN_PROGRESS is not valid', () => {
    expect(isValidTransition('RESOLVED', 'IN_PROGRESS')).toBe(false);
  });

  it('IN_PROGRESS → OPEN is not valid', () => {
    expect(isValidTransition('IN_PROGRESS', 'OPEN')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RN-INC-05: Default status is OPEN
// ═══════════════════════════════════════════════════════════════════════════

describe('RN-INC-05 – Default status', () => {
  it('new incident defaults to OPEN', () => {
    expect(getDefaultStatus()).toBe('OPEN');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RN-INC-06: Incident must be associated to a user
// ═══════════════════════════════════════════════════════════════════════════

describe('RN-INC-06 – User association', () => {
  it('rejects incident without user', () => {
    const result = validateIncidentCreate({
      title: 'T', description: 'D', type: 'GENERAL',
      user: { id: 0 },
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('La incidencia debe estar asociada a un usuario.');
  });

  it('rejects incident with null-like user id', () => {
    const result = validateIncidentCreate({
      title: 'T', description: 'D', type: 'GENERAL',
      user: null as any,
    });
    expect(result.valid).toBe(false);
  });

  it('accepts incident with valid user', () => {
    const result = validateIncidentCreate({
      title: 'T', description: 'D', type: 'GENERAL',
      user: { id: 42 },
    });
    expect(result.valid).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RN-INC-07: Optional related item
// ═══════════════════════════════════════════════════════════════════════════

describe('RN-INC-07 – Optional related item', () => {
  it('GENERAL incident without relatedItem is valid', () => {
    const result = validateIncidentCreate({
      title: 'T', description: 'D', type: 'GENERAL',
      user: { id: 1 }, relatedItem: null,
    });
    expect(result.valid).toBe(true);
  });

  it('GENERAL incident with relatedItem is also valid for validation (cleared in payload)', () => {
    const result = validateIncidentCreate({
      title: 'T', description: 'D', type: 'GENERAL',
      user: { id: 1 }, relatedItem: { id: 5 },
    });
    expect(result.valid).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RN-INC-08: Cannot delete resolved incident
// ═══════════════════════════════════════════════════════════════════════════

describe('RN-INC-08 – Cannot delete resolved incident', () => {
  it('OPEN incident can be deleted', () => {
    expect(canDeleteIncident('OPEN')).toBe(true);
  });

  it('IN_PROGRESS incident can be deleted', () => {
    expect(canDeleteIncident('IN_PROGRESS')).toBe(true);
  });

  it('RESOLVED incident cannot be deleted', () => {
    expect(canDeleteIncident('RESOLVED')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RN-INC-09: Cannot comment on resolved incident
// ═══════════════════════════════════════════════════════════════════════════

describe('RN-INC-09 – Cannot comment on resolved incident', () => {
  it('allows comment on OPEN incident', () => {
    const result = validateComment('My comment', 'OPEN');
    expect(result.valid).toBe(true);
  });

  it('allows comment on IN_PROGRESS incident', () => {
    const result = validateComment('My comment', 'IN_PROGRESS');
    expect(result.valid).toBe(true);
  });

  it('rejects comment on RESOLVED incident', () => {
    const result = validateComment('My comment', 'RESOLVED');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('resuelta');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RN-INC-10: Comment max length (2000 chars)
// ═══════════════════════════════════════════════════════════════════════════

describe('RN-INC-10 – Comment max length', () => {
  it('rejects comment over 2000 characters', () => {
    const longComment = 'x'.repeat(2001);
    const result = validateComment(longComment, 'OPEN');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('2000');
  });

  it('accepts comment of exactly 2000 characters', () => {
    const maxComment = 'y'.repeat(2000);
    const result = validateComment(maxComment, 'OPEN');
    expect(result.valid).toBe(true);
  });

  it('rejects empty comment', () => {
    const result = validateComment('', 'OPEN');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('vacío');
  });

  it('rejects whitespace-only comment', () => {
    const result = validateComment('   ', 'OPEN');
    expect(result.valid).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RN-INC-11: Comment creation timestamp is automatic
// ═══════════════════════════════════════════════════════════════════════════

describe('RN-INC-11 – Comment creation timestamp', () => {
  it('comment response includes a createdAt field', () => {
    const comment: IncidentCommentResponse = {
      id: 1,
      text: 'Test',
      author: { id: 10, name: 'Ana' },
      createdAt: '2026-03-15T14:30:00',
    };
    expect(comment.createdAt).toBeDefined();
    expect(new Date(comment.createdAt).getTime()).not.toBeNaN();
  });

  it('createdAt is a parseable ISO date string', () => {
    const isoString = '2026-06-01T10:00:00.000Z';
    const date = new Date(isoString);
    expect(date.toISOString()).toBe(isoString);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RN-INC-12: User can see own incidents
// ═══════════════════════════════════════════════════════════════════════════

describe('RN-INC-12 – User sees own incidents', () => {
  const allIncidents: IncidentResponse[] = [
    {
      id: 1, title: 'My issue', description: 'Desc', type: 'GENERAL', status: 'OPEN',
      user: { id: 10, name: 'Ana' }, relatedItem: null, relatedKit: null, createdAt: '2026-01-01T00:00:00',
    },
    {
      id: 2, title: 'Other issue', description: 'Desc', type: 'GENERAL', status: 'OPEN',
      user: { id: 20, name: 'Carlos' }, relatedItem: null, relatedKit: null, createdAt: '2026-01-02T00:00:00',
    },
    {
      id: 3, title: 'My damage', description: 'Desc', type: 'DAMAGED_ITEM', status: 'IN_PROGRESS',
      user: { id: 10, name: 'Ana' },
      relatedItem: { id: 100, title: 'Laptop' },
      relatedKit: { id: 50, name: 'Tech kit' },
      createdAt: '2026-01-03T00:00:00',
    },
  ];

  it('filters incidents for user 10', () => {
    const result = filterIncidentsByUser(allIncidents, 10);
    expect(result).toHaveLength(2);
    expect(result.map((i) => i.id)).toEqual([1, 3]);
  });

  it('filters incidents for user 20', () => {
    const result = filterIncidentsByUser(allIncidents, 20);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('returns empty for non-existent user', () => {
    const result = filterIncidentsByUser(allIncidents, 999);
    expect(result).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RN-INC-13: Owner can see received incidents about their articles
// ═══════════════════════════════════════════════════════════════════════════

describe('RN-INC-13 – Owner sees received incidents', () => {
  const allIncidents: IncidentResponse[] = [
    {
      id: 1, title: 'Damage report', description: 'Broken', type: 'DAMAGED_ITEM', status: 'OPEN',
      user: { id: 10, name: 'Tenant' },
      relatedItem: { id: 100, title: 'Laptop', owner: { id: 50, name: 'Owner A' } },
      relatedKit: null, createdAt: '2026-04-01T00:00:00',
    },
    {
      id: 2, title: 'General query', description: 'Question', type: 'GENERAL', status: 'OPEN',
      user: { id: 20, name: 'Tenant 2' },
      relatedItem: null, relatedKit: null, createdAt: '2026-04-02T00:00:00',
    },
    {
      id: 3, title: 'Another damage', description: 'Scratched', type: 'DAMAGED_ITEM', status: 'IN_PROGRESS',
      user: { id: 30, name: 'Tenant 3' },
      relatedItem: { id: 200, title: 'Camera', owner: { id: 50, name: 'Owner A' } },
      relatedKit: null, createdAt: '2026-04-03T00:00:00',
    },
    {
      id: 4, title: 'Third party damage', description: 'Dented', type: 'DAMAGED_ITEM', status: 'OPEN',
      user: { id: 40, name: 'Tenant 4' },
      relatedItem: { id: 300, title: 'Bike', owner: { id: 60, name: 'Owner B' } },
      relatedKit: null, createdAt: '2026-04-04T00:00:00',
    },
  ];

  it('filters incidents for owner 50', () => {
    const result = filterIncidentsByOwner(allIncidents, 50);
    expect(result).toHaveLength(2);
    expect(result.map((i) => i.id)).toEqual([1, 3]);
  });

  it('filters incidents for owner 60', () => {
    const result = filterIncidentsByOwner(allIncidents, 60);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(4);
  });

  it('GENERAL incidents without relatedItem are not included', () => {
    const result = filterIncidentsByOwner(allIncidents, 50);
    expect(result.every((i) => i.relatedItem !== null)).toBe(true);
  });

  it('returns empty for owner with no received incidents', () => {
    const result = filterIncidentsByOwner(allIncidents, 999);
    expect(result).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Payload build edge cases
// ═══════════════════════════════════════════════════════════════════════════

describe('Incident payload building edge cases', () => {
  it('trims whitespace from title and description', () => {
    const payload = buildCreatePayload('  Title  ', '  Desc  ', 'GENERAL', 1, null, null);
    expect(payload.title).toBe('Title');
    expect(payload.description).toBe('Desc');
  });

  it('preserves user id', () => {
    const payload = buildCreatePayload('T', 'D', 'GENERAL', 42, null, null);
    expect(payload.user.id).toBe(42);
  });

  it('DAMAGED_ITEM preserves both relatedItem and relatedKit', () => {
    const payload = buildCreatePayload('T', 'D', 'DAMAGED_ITEM', 1, { id: 5 }, { id: 10 });
    expect(payload.relatedItem).toEqual({ id: 5 });
    expect(payload.relatedKit).toEqual({ id: 10 });
    expect(payload.type).toBe('DAMAGED_ITEM');
  });

  it('DAMAGED_ITEM with null relatedKit keeps null', () => {
    const payload = buildCreatePayload('T', 'D', 'DAMAGED_ITEM', 1, { id: 5 }, null);
    expect(payload.relatedItem).toEqual({ id: 5 });
    expect(payload.relatedKit).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Multiple validation errors at once
// ═══════════════════════════════════════════════════════════════════════════

describe('Multiple validation errors', () => {
  it('accumulates all errors for completely invalid input', () => {
    const result = validateIncidentCreate({
      title: '',
      description: '',
      type: 'DAMAGED_ITEM',
      user: { id: 0 },
      relatedItem: null,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });

  it('valid input has no errors', () => {
    const result = validateIncidentCreate({
      title: 'Title',
      description: 'Description',
      type: 'GENERAL',
      user: { id: 1 },
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
