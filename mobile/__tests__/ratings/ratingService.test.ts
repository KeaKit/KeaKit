
interface RatingCreateRequest {
  revieweeId: number;
  kitId: number;
  score: number;
  comment?: string;
}

interface RatingResponse {
  id: number;
  reviewerId: number;
  reviewerName: string;
  revieweeId: number;
  revieweeName: string;
  kitId: number;
  kitName: string;
  score: number;
  comment: string | null;
  type: 'RENTER_TO_OWNER' | 'OWNER_TO_RENTER';
  createdAt: string;
}

const BASE = 'http://localhost:8080';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const ct = res.headers.get('content-type');
      msg = ct?.includes('application/json')
        ? (await res.json()).message || msg
        : await res.text();
    } catch { /* keep default */ }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

async function createRating(data: RatingCreateRequest, token: string): Promise<RatingResponse> {
  return handleResponse(await fetch(`${BASE}/api/ratings`, {
    method: 'POST', headers: authHeaders(token), body: JSON.stringify(data),
  }));
}

async function getRatingsForUser(userId: number, token: string): Promise<RatingResponse[]> {
  return handleResponse(await fetch(`${BASE}/api/ratings/user/${userId}`, {
    method: 'GET', headers: authHeaders(token),
  }));
}

async function deleteRating(id: number, token: string): Promise<void> {
  const res = await fetch(`${BASE}/api/ratings/${id}`, {
    method: 'DELETE', headers: authHeaders(token),
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const ct = res.headers.get('content-type');
      msg = ct?.includes('application/json')
        ? (await res.json()).message || msg
        : await res.text();
    } catch { /* keep default */ }
    throw new Error(msg);
  }
}

function validateScore(score: number): string | null {
  if (score === 0) return 'Por favor, selecciona una puntuación';
  if (score < 1 || score > 5) return 'La puntuación debe estar entre 1 y 5';
  return null;
}

function buildPayload(revieweeId: number, kitId: number, score: number, comment: string): RatingCreateRequest {
  return { revieweeId, kitId, score, comment: comment.trim() || undefined };
}

function computeAverage(ratings: RatingResponse[]): number {
  if (!ratings.length) return 0;
  return ratings.reduce((s, r) => s + r.score, 0) / ratings.length;
}

function getTypeLabel(type: string): string {
  return type === 'RENTER_TO_OWNER' ? 'Valoración enviada' : 'Valoración recibida';
}

function ratingsCountLabel(n: number): string {
  return `(${n} ${n === 1 ? 'valoración' : 'valoraciones'})`;
}

const mockFetch = jest.fn() as jest.Mock;
(globalThis as any).fetch = mockFetch;

const TOKEN = 'fake-jwt';

const MOCK: RatingResponse = {
  id: 1, reviewerId: 10, reviewerName: 'Ana', revieweeId: 20, revieweeName: 'Carlos',
  kitId: 100, kitName: 'Kit Test', score: 5, comment: 'Excelente', type: 'RENTER_TO_OWNER',
  createdAt: '2026-03-15T14:30:00',
};

function ok(body: unknown, status = 200): Response {
  return {
    ok: status < 400, status,
    headers: { get: (k: string) => k === 'content-type' ? 'application/json' : null },
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

beforeEach(() => mockFetch.mockReset());

describe('createRating', () => {
  it('envía POST con body y headers correctos', async () => {
    mockFetch.mockResolvedValueOnce(ok(MOCK, 201));
    await createRating({ revieweeId: 20, kitId: 100, score: 5 }, TOKEN);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe(`${BASE}/api/ratings`);
    expect(opts.method).toBe('POST');
    expect(opts.headers.Authorization).toBe(`Bearer ${TOKEN}`);
  });

  it('devuelve el RatingResponse del servidor', async () => {
    mockFetch.mockResolvedValueOnce(ok(MOCK, 201));
    expect(await createRating({ revieweeId: 20, kitId: 100, score: 5 }, TOKEN)).toEqual(MOCK);
  });

  it('lanza error en 409 (duplicado)', async () => {
    mockFetch.mockResolvedValueOnce(ok({ message: 'Ya has valorado a este usuario' }, 409));
    await expect(createRating({ revieweeId: 20, kitId: 100, score: 5 }, TOKEN))
      .rejects.toThrow('Ya has valorado');
  });

  it('lanza error en 400 (auto-valoración)', async () => {
    mockFetch.mockResolvedValueOnce(ok({ message: 'You cannot rate yourself' }, 400));
    await expect(createRating({ revieweeId: 10, kitId: 100, score: 5 }, TOKEN))
      .rejects.toThrow('You cannot rate yourself');
  });
});

describe('getRatingsForUser', () => {
  it('llama a /api/ratings/user/:id y devuelve la lista', async () => {
    mockFetch.mockResolvedValueOnce(ok([MOCK]));
    const result = await getRatingsForUser(20, TOKEN);
    expect(mockFetch.mock.calls[0][0]).toContain('/api/ratings/user/20');
    expect(result).toHaveLength(1);
  });

  it('devuelve lista vacía si no hay valoraciones', async () => {
    mockFetch.mockResolvedValueOnce(ok([]));
    expect(await getRatingsForUser(99, TOKEN)).toEqual([]);
  });

  it('lanza error en 401 por token inválido', async () => {
    mockFetch.mockResolvedValueOnce(ok({ message: 'Token no válido' }, 401));
    await expect(getRatingsForUser(20, 'bad')).rejects.toThrow('Token no válido');
  });
});

describe('deleteRating', () => {
  it('envía DELETE y resuelve sin valor si es exitoso', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, headers: { get: () => null } } as unknown as Response);
    await expect(deleteRating(1, TOKEN)).resolves.toBeUndefined();
    expect(mockFetch.mock.calls[0][1].method).toBe('DELETE');
  });

  it('lanza error en 404 si el rating no existe', async () => {
    mockFetch.mockResolvedValueOnce(ok({ message: 'Rating not found with id: 999' }, 404));
    await expect(deleteRating(999, TOKEN)).rejects.toThrow('Rating not found');
  });

  it('lanza error en 400 si no es el autor', async () => {
    mockFetch.mockResolvedValueOnce(ok({ message: 'You are not authorized to delete this rating' }, 400));
    await expect(deleteRating(1, TOKEN)).rejects.toThrow('You are not authorized');
  });
});

describe('validateScore', () => {
  it('rechaza 0 con mensaje', () => expect(validateScore(0)).toBe('Por favor, selecciona una puntuación'));
  it('rechaza valores fuera de rango', () => expect(validateScore(6)).not.toBeNull());
  it('acepta 1–5', () => [1, 2, 3, 4, 5].forEach(s => expect(validateScore(s)).toBeNull()));
});

describe('buildPayload', () => {
  it('omite comment si está vacío o es solo espacios', () => {
    expect(buildPayload(20, 100, 5, '').comment).toBeUndefined();
    expect(buildPayload(20, 100, 5, '   ').comment).toBeUndefined();
  });
  it('hace trim al comentario', () => {
    expect(buildPayload(20, 100, 5, '  Bien  ').comment).toBe('Bien');
  });
});

describe('computeAverage', () => {
  it('devuelve 0 para lista vacía', () => expect(computeAverage([])).toBe(0));
  it('calcula la media correctamente', () => {
    const ratings = [4, 2, 3].map((score, id) => ({ ...MOCK, id, score }));
    expect(computeAverage(ratings)).toBe(3);
  });
});

describe('getTypeLabel', () => {
  it('RENTER_TO_OWNER → "Valoración enviada"', () => expect(getTypeLabel('RENTER_TO_OWNER')).toBe('Valoración enviada'));
  it('OWNER_TO_RENTER → "Valoración recibida"', () => expect(getTypeLabel('OWNER_TO_RENTER')).toBe('Valoración recibida'));
});

describe('ratingsCountLabel', () => {
  it('singular para 1', () => expect(ratingsCountLabel(1)).toBe('(1 valoración)'));
  it('plural para 0 y más de 1', () => {
    expect(ratingsCountLabel(0)).toBe('(0 valoraciones)');
    expect(ratingsCountLabel(5)).toBe('(5 valoraciones)');
  });
});