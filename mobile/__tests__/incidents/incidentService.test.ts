import {
  getAllIncidents,
  getIncidentsByUser,
  getReceivedIncidents,
  createIncident,
  getIncidentById,
  updateIncident,
  resolveIncident,
  deleteIncident,
  getIncidentComments,
  addIncidentComment,
  getRentedItems,
} from '../../src/services/incidentService';

// ─── Mock global fetch ──────────────────────────────────────────────────────

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).fetch = mockFetch;

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (key: string) =>
        key.toLowerCase() === 'content-type' ? 'application/json' : null,
    },
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

const TOKEN = 'test-jwt-token';

beforeEach(() => {
  mockFetch.mockReset();
});

// ═══════════════════════════════════════════════════════════════════════════
// getAllIncidents (admin)
// ═══════════════════════════════════════════════════════════════════════════

describe('getAllIncidents', () => {
  it('llama al endpoint correcto y devuelve todas las incidencias', async () => {
    const incidents = [
      { id: 1, title: 'Inc 1', status: 'OPEN', type: 'GENERAL' },
      { id: 2, title: 'Inc 2', status: 'RESOLVED', type: 'DAMAGED_ITEM' },
    ];
    mockFetch.mockResolvedValueOnce(jsonResponse(incidents));

    const result = await getAllIncidents(TOKEN);

    expect(result).toEqual(incidents);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/incidents'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
      }),
    );
  });

  it('devuelve array vacío cuando no hay incidencias', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse([]));

    const result = await getAllIncidents(TOKEN);
    expect(result).toEqual([]);
  });

  it('lanza error cuando el usuario no es admin', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ message: 'No autorizado' }, 403),
    );

    await expect(getAllIncidents(TOKEN)).rejects.toThrow('No autorizado');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// getIncidentsByUser
// ═══════════════════════════════════════════════════════════════════════════

describe('getIncidentsByUser', () => {
  it('devuelve la lista de incidencias del usuario', async () => {
    const incidents = [
      { id: 1, title: 'Inc 1', status: 'OPEN', type: 'GENERAL' },
      { id: 2, title: 'Inc 2', status: 'RESOLVED', type: 'DAMAGED_ITEM' },
    ];
    mockFetch.mockResolvedValueOnce(jsonResponse(incidents));

    const result = await getIncidentsByUser(42, TOKEN);

    expect(result).toEqual(incidents);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/incidents/user/42'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: `Bearer ${TOKEN}` }),
      }),
    );
  });

  it('lanza error cuando la respuesta no es ok', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ message: 'No autorizado' }, 403),
    );

    await expect(getIncidentsByUser(42, TOKEN)).rejects.toThrow('No autorizado');
  });

  it('lanza error genérico si no hay mensaje en JSON', async () => {
    const res = {
      ok: false,
      status: 500,
      headers: { get: () => 'text/plain' },
      text: async () => 'Internal Server Error',
    } as unknown as Response;
    mockFetch.mockResolvedValueOnce(res);

    await expect(getIncidentsByUser(1, TOKEN)).rejects.toThrow('Internal Server Error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// getReceivedIncidents
// ═══════════════════════════════════════════════════════════════════════════

describe('getReceivedIncidents', () => {
  it('llama al endpoint correcto con el ownerId', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse([]));

    await getReceivedIncidents(99, TOKEN);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/incidents/received/99'),
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('devuelve las incidencias recibidas', async () => {
    const data = [{ id: 5, title: 'Daño reportado' }];
    mockFetch.mockResolvedValueOnce(jsonResponse(data));

    const result = await getReceivedIncidents(99, TOKEN);
    expect(result).toEqual(data);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// createIncident
// ═══════════════════════════════════════════════════════════════════════════

describe('createIncident', () => {
  const payload = {
    title: 'Problema',
    description: 'Descripción del problema',
    type: 'GENERAL' as const,
    user: { id: 1 },
  };

  it('envía POST con el cuerpo correcto y devuelve la incidencia creada', async () => {
    const created = { id: 10, ...payload, status: 'OPEN' };
    mockFetch.mockResolvedValueOnce(jsonResponse(created));

    const result = await createIncident(payload, TOKEN);

    expect(result).toEqual(created);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/incidents'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        }),
      }),
    );
  });

  it('envía relatedItem cuando es DAMAGED_ITEM', async () => {
    const damagedPayload = {
      ...payload,
      type: 'DAMAGED_ITEM' as const,
      relatedItem: { id: 7 },
    };
    mockFetch.mockResolvedValueOnce(jsonResponse({ id: 11, ...damagedPayload }));

    await createIncident(damagedPayload, TOKEN);

    const callBody = JSON.parse(mockFetch.mock.calls[0][1]!.body as string);
    expect(callBody.relatedItem).toEqual({ id: 7 });
    expect(callBody.type).toBe('DAMAGED_ITEM');
  });

  it('lanza error si el servidor rechaza la petición', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ message: 'Título obligatorio' }, 400),
    );

    await expect(createIncident(payload, TOKEN)).rejects.toThrow('Título obligatorio');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// getIncidentById
// ═══════════════════════════════════════════════════════════════════════════

describe('getIncidentById', () => {
  it('llama al endpoint correcto y devuelve la incidencia', async () => {
    const incident = { id: 3, title: 'Test', status: 'OPEN' };
    mockFetch.mockResolvedValueOnce(jsonResponse(incident));

    const result = await getIncidentById(3, TOKEN);

    expect(result).toEqual(incident);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/incidents/3'),
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('lanza error si no se encuentra', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ message: 'Incidencia no encontrada' }, 404),
    );

    await expect(getIncidentById(999, TOKEN)).rejects.toThrow('Incidencia no encontrada');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// updateIncident
// ═══════════════════════════════════════════════════════════════════════════

describe('updateIncident', () => {
  it('envía PUT con datos parciales', async () => {
    const updated = { id: 3, title: 'Nuevo título', status: 'OPEN' };
    mockFetch.mockResolvedValueOnce(jsonResponse(updated));

    const result = await updateIncident(3, { title: 'Nuevo título' }, TOKEN);

    expect(result).toEqual(updated);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/incidents/3'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ title: 'Nuevo título' }),
      }),
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// resolveIncident
// ═══════════════════════════════════════════════════════════════════════════

describe('resolveIncident', () => {
  it('llama al endpoint de resolución con PUT', async () => {
    const resolved = { id: 5, status: 'RESOLVED' };
    mockFetch.mockResolvedValueOnce(jsonResponse(resolved));

    const result = await resolveIncident(5, TOKEN);

    expect(result).toEqual(resolved);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/incidents/5/resolve'),
      expect.objectContaining({ method: 'PUT' }),
    );
  });

  it('lanza error si no tiene permisos', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ message: 'Sin permisos' }, 403),
    );

    await expect(resolveIncident(5, TOKEN)).rejects.toThrow('Sin permisos');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// deleteIncident
// ═══════════════════════════════════════════════════════════════════════════

describe('deleteIncident', () => {
  it('envía DELETE y no lanza error si ok', async () => {
    const res = {
      ok: true,
      status: 204,
      headers: { get: () => null },
    } as unknown as Response;
    mockFetch.mockResolvedValueOnce(res);

    await expect(deleteIncident(7, TOKEN)).resolves.toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/incidents/7'),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('lanza error si la incidencia está resuelta', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ message: 'No se puede eliminar una incidencia resuelta' }, 400),
    );

    await expect(deleteIncident(7, TOKEN)).rejects.toThrow(
      'No se puede eliminar una incidencia resuelta',
    );
  });

  it('lanza error con texto plano cuando content-type no es JSON', async () => {
    const res = {
      ok: false,
      status: 500,
      headers: { get: () => 'text/plain' },
      text: async () => 'Error interno del servidor',
    } as unknown as Response;
    mockFetch.mockResolvedValueOnce(res);

    await expect(deleteIncident(1, TOKEN)).rejects.toThrow('Error interno del servidor');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// getIncidentComments
// ═══════════════════════════════════════════════════════════════════════════

describe('getIncidentComments', () => {
  it('devuelve los comentarios de una incidencia', async () => {
    const comments = [
      { id: 1, text: 'Hola', author: { id: 1, name: 'Ana' }, createdAt: '2026-03-01T10:00:00' },
    ];
    mockFetch.mockResolvedValueOnce(jsonResponse(comments));

    const result = await getIncidentComments(10, TOKEN);

    expect(result).toEqual(comments);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/incidents/10/comments'),
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('devuelve array vacío si no hay comentarios', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse([]));

    const result = await getIncidentComments(10, TOKEN);
    expect(result).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// addIncidentComment
// ═══════════════════════════════════════════════════════════════════════════

describe('addIncidentComment', () => {
  it('envía POST con el comentario y devuelve el creado', async () => {
    const payload = { text: 'Nuevo comentario', author: { id: 5 } };
    const created = {
      id: 20,
      text: 'Nuevo comentario',
      author: { id: 5, name: 'Pedro' },
      createdAt: '2026-03-10T14:00:00',
    };
    mockFetch.mockResolvedValueOnce(jsonResponse(created));

    const result = await addIncidentComment(10, payload, TOKEN);

    expect(result).toEqual(created);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/incidents/10/comments'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    );
  });

  it('lanza error si la incidencia está resuelta', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ message: 'No se pueden añadir comentarios a una incidencia resuelta' }, 400),
    );

    await expect(
      addIncidentComment(10, { text: 'test', author: { id: 1 } }, TOKEN),
    ).rejects.toThrow('No se pueden añadir comentarios a una incidencia resuelta');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// getRentedItems
// ═══════════════════════════════════════════════════════════════════════════

describe('getRentedItems', () => {
  it('devuelve objetos alquilados por el usuario', async () => {
    const items = [
      {
        itemId: 1,
        itemTitle: 'MacBook',
        ownerName: 'Carlos',
        ownerId: 2,
        kitId: 10,
        kitName: 'Pack Tech',
        startDate: '2026-03-01',
        endDate: '2026-04-01',
      },
    ];
    mockFetch.mockResolvedValueOnce(jsonResponse(items));

    const result = await getRentedItems(42, TOKEN);

    expect(result).toEqual(items);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/kits/rented/42'),
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('devuelve array vacío si no tiene alquileres', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse([]));

    const result = await getRentedItems(42, TOKEN);
    expect(result).toEqual([]);
  });
});
