/**
 * Tests de lógica de negocio de CreateIncidentScreen.
 * Valida la función de validación de campos, el filtrado de objetos alquilados,
 * y la construcción del payload de creación.
 */

// ─── Tipos reproducidos para tests sin importar React ──────────────────────

type IncidentType = 'GENERAL' | 'DAMAGED_ITEM';

type FieldErrors = {
  title?: string;
  description?: string;
  type?: string;
  relatedItem?: string;
  general?: string;
};

interface RentedItemResponse {
  itemId: number;
  itemTitle: string;
  ownerName: string;
  ownerId: number;
  kitId: number;
  kitName: string;
  startDate: string;
  endDate: string;
}

// ─── Funciones extraídas de CreateIncidentScreen ────────────────────────────

function validate(
  title: string,
  description: string,
  type: IncidentType | null,
  selectedItem: RentedItemResponse | null,
): { valid: boolean; errors: FieldErrors } {
  const errors: FieldErrors = {};

  if (!title.trim()) errors.title = 'El título es obligatorio.';
  if (!description.trim()) errors.description = 'La descripción es obligatoria.';
  if (!type) errors.type = 'Selecciona un tipo de incidencia.';
  if (type === 'DAMAGED_ITEM' && !selectedItem) {
    errors.relatedItem = 'Debes seleccionar el objeto dañado.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

function filterRentedItems(items: RentedItemResponse[], searchText: string): RentedItemResponse[] {
  if (!searchText.trim()) return items;
  const query = searchText.toLowerCase();
  return items.filter(
    (item) =>
      item.itemTitle.toLowerCase().includes(query) ||
      item.ownerName.toLowerCase().includes(query) ||
      item.kitName.toLowerCase().includes(query),
  );
}

function buildIncidentPayload(
  title: string,
  description: string,
  type: IncidentType,
  userId: number,
  selectedItem: RentedItemResponse | null,
) {
  return {
    title: title.trim(),
    description: description.trim(),
    type,
    user: { id: userId },
    relatedItem: selectedItem ? { id: selectedItem.itemId } : null,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Tests de validación
// ═══════════════════════════════════════════════════════════════════════════

describe('CreateIncidentScreen - validación de campos', () => {
  it('pasa validación con todos los campos correctos (GENERAL)', () => {
    const { valid, errors } = validate('Título', 'Descripción', 'GENERAL', null);
    expect(valid).toBe(true);
    expect(errors).toEqual({});
  });

  it('pasa validación con tipo DAMAGED_ITEM y objeto seleccionado', () => {
    const item: RentedItemResponse = {
      itemId: 1, itemTitle: 'MacBook', ownerName: 'Carlos',
      ownerId: 2, kitId: 10, kitName: 'Pack', startDate: '2026-01-01', endDate: '2026-02-01',
    };
    const { valid, errors } = validate('Daño', 'Pantalla rota', 'DAMAGED_ITEM', item);
    expect(valid).toBe(true);
    expect(errors).toEqual({});
  });

  it('falla si el título está vacío', () => {
    const { valid, errors } = validate('', 'Descripción', 'GENERAL', null);
    expect(valid).toBe(false);
    expect(errors.title).toBe('El título es obligatorio.');
  });

  it('falla si el título solo contiene espacios', () => {
    const { valid, errors } = validate('   ', 'Descripción', 'GENERAL', null);
    expect(valid).toBe(false);
    expect(errors.title).toBe('El título es obligatorio.');
  });

  it('falla si la descripción está vacía', () => {
    const { valid, errors } = validate('Título', '', 'GENERAL', null);
    expect(valid).toBe(false);
    expect(errors.description).toBe('La descripción es obligatoria.');
  });

  it('falla si no se selecciona tipo', () => {
    const { valid, errors } = validate('Título', 'Desc', null, null);
    expect(valid).toBe(false);
    expect(errors.type).toBe('Selecciona un tipo de incidencia.');
  });

  it('falla si tipo es DAMAGED_ITEM sin objeto seleccionado', () => {
    const { valid, errors } = validate('Daño', 'Desc', 'DAMAGED_ITEM', null);
    expect(valid).toBe(false);
    expect(errors.relatedItem).toBe('Debes seleccionar el objeto dañado.');
  });

  it('no requiere objeto para tipo GENERAL', () => {
    const { valid, errors } = validate('Título', 'Desc', 'GENERAL', null);
    expect(valid).toBe(true);
    expect(errors.relatedItem).toBeUndefined();
  });

  it('acumula múltiples errores a la vez', () => {
    const { valid, errors } = validate('', '', null, null);
    expect(valid).toBe(false);
    expect(errors.title).toBeDefined();
    expect(errors.description).toBeDefined();
    expect(errors.type).toBeDefined();
  });

  it('acumula error de objeto dañado junto con otros errores', () => {
    const { valid, errors } = validate('', '', 'DAMAGED_ITEM', null);
    expect(valid).toBe(false);
    expect(errors.title).toBeDefined();
    expect(errors.description).toBeDefined();
    expect(errors.relatedItem).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Tests de filtrado de objetos alquilados
// ═══════════════════════════════════════════════════════════════════════════

describe('CreateIncidentScreen - filtrado de objetos alquilados', () => {
  const items: RentedItemResponse[] = [
    {
      itemId: 1, itemTitle: 'MacBook Pro', ownerName: 'Carlos García',
      ownerId: 2, kitId: 10, kitName: 'Pack Trabajo', startDate: '2026-01-01', endDate: '2026-02-01',
    },
    {
      itemId: 2, itemTitle: 'Cinta de Correr', ownerName: 'María López',
      ownerId: 3, kitId: 11, kitName: 'Pack Fitness', startDate: '2026-01-01', endDate: '2026-03-01',
    },
    {
      itemId: 3, itemTitle: 'Guitarra Yamaha', ownerName: 'Pedro Martínez',
      ownerId: 4, kitId: 12, kitName: 'Pack Musical', startDate: '2026-02-01', endDate: '2026-04-01',
    },
  ];

  it('devuelve todos los items si el texto de búsqueda está vacío', () => {
    expect(filterRentedItems(items, '')).toEqual(items);
  });

  it('devuelve todos los items si el texto solo tiene espacios', () => {
    expect(filterRentedItems(items, '   ')).toEqual(items);
  });

  it('filtra por título del item', () => {
    const result = filterRentedItems(items, 'MacBook');
    expect(result).toHaveLength(1);
    expect(result[0].itemId).toBe(1);
  });

  it('filtra por nombre del propietario', () => {
    const result = filterRentedItems(items, 'María');
    expect(result).toHaveLength(1);
    expect(result[0].itemId).toBe(2);
  });

  it('filtra por nombre del kit', () => {
    const result = filterRentedItems(items, 'Musical');
    expect(result).toHaveLength(1);
    expect(result[0].itemId).toBe(3);
  });

  it('es case-insensitive', () => {
    const result = filterRentedItems(items, 'macbook');
    expect(result).toHaveLength(1);
    expect(result[0].itemId).toBe(1);
  });

  it('filtra por subcadena parcial', () => {
    const result = filterRentedItems(items, 'Pack');
    expect(result).toHaveLength(3); // Todos tienen "Pack" en kitName
  });

  it('devuelve vacío si no hay coincidencias', () => {
    const result = filterRentedItems(items, 'inexistente');
    expect(result).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Tests de construcción del payload
// ═══════════════════════════════════════════════════════════════════════════

describe('CreateIncidentScreen - construcción del payload', () => {
  it('construye payload GENERAL sin relatedItem', () => {
    const payload = buildIncidentPayload('Título', 'Descripción', 'GENERAL', 42, null);
    expect(payload).toEqual({
      title: 'Título',
      description: 'Descripción',
      type: 'GENERAL',
      user: { id: 42 },
      relatedItem: null,
    });
  });

  it('construye payload DAMAGED_ITEM con relatedItem', () => {
    const item: RentedItemResponse = {
      itemId: 7, itemTitle: 'Kayak', ownerName: 'Pedro',
      ownerId: 3, kitId: 15, kitName: 'Pack Verano',
      startDate: '2026-01-01', endDate: '2026-02-01',
    };
    const payload = buildIncidentPayload('Daño', 'Pinchazo', 'DAMAGED_ITEM', 42, item);
    expect(payload).toEqual({
      title: 'Daño',
      description: 'Pinchazo',
      type: 'DAMAGED_ITEM',
      user: { id: 42 },
      relatedItem: { id: 7 },
    });
  });

  it('hace trim al título y descripción', () => {
    const payload = buildIncidentPayload('  Título  ', '  Desc  ', 'GENERAL', 1, null);
    expect(payload.title).toBe('Título');
    expect(payload.description).toBe('Desc');
  });
});
