interface ReturnRequest {
  condition: 'GOOD' | 'DAMAGED';
  comments: string;
}

interface ReturnResponse {
  articleId: number;
  tenantEmail: string;
  resolution: 'DEPOSIT_RETURNED' | 'DEPOSIT_RETAINED';
  amountProcessed: number;
  message: string;
}

interface ArticleRecordDTO {
  articleId: number;
  tenantName: string;
  status: string;
  startDate: string;
  endDate: string;
  city: string;
  country: string;
}

const BASE_URL = 'http://localhost:8080';

function processReturnUrl(id: number, ownerId: number): string {
  return `${BASE_URL}/api/article/${id}/return?ownerId=${ownerId}`;
}

async function processReturn(
  id: number,
  ownerId: number,
  token: string,
  payload: ReturnRequest,
): Promise<ReturnResponse> {
  const res = await fetch(processReturnUrl(id, ownerId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`;
    try {
      const ct = res.headers.get('content-type');
      if (ct && ct.includes('application/json')) {
        const data = await res.json();
        errorMessage = data.message || data.error || JSON.stringify(data);
      } else {
        errorMessage = await res.text();
      }
    } catch {}
    const lower = errorMessage.toLowerCase();
    if (lower.includes('article not found')) throw new Error('El artículo no existe.');
    throw new Error(errorMessage);
  }
  return res.json() as Promise<ReturnResponse>;
}

async function getArticleRecordLogic(articleId: number, token: string): Promise<ArticleRecordDTO[]> {
  const url = `${BASE_URL}/api/article/record/${articleId}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('No se pudo obtener el historial del artículo');
  }

  return await response.json();
}

(globalThis as any).fetch = jest.fn();

describe('articleService – processReturn (Gestión de fin de alquiler)', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // HU-ARRENDADOR-33: Confirmar devolución en buen estado
  it('processReturn con condición GOOD devuelve DEPOSIT_RETURNED', async () => {
    const mockResponse = {
      articleId: 1,
      tenantEmail: 'tenant@example.com',
      resolution: 'DEPOSIT_RETURNED',
      amountProcessed: 20.0,
      message: 'Artículo devuelto en buen estado. Se devuelve el 20% de garantía (20.0€) al arrendatario.',
    };

    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
    });

    const result = await processReturn(1, 100, 'fake-token', {
      condition: 'GOOD',
      comments: 'Todo perfecto',
    });

    expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);
    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      expect.stringContaining('/1/return?ownerId=100'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ condition: 'GOOD', comments: 'Todo perfecto' }),
      }),
    );
    expect(result.resolution).toBe('DEPOSIT_RETURNED');
    expect(result.amountProcessed).toBe(20.0);
    expect(result.tenantEmail).toBe('tenant@example.com');
    expect(result.articleId).toBe(1);
  });

  // HU-ARRENDADOR-34: Indicar daños
  it('processReturn con condición DAMAGED devuelve DEPOSIT_RETAINED', async () => {
    const mockResponse = {
      articleId: 2,
      tenantEmail: 'tenant2@example.com',
      resolution: 'DEPOSIT_RETAINED',
      amountProcessed: 40.0,
      message: 'Artículo con daños. Se retiene la garantía de 40.0€ al arrendatario.',
    };

    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
    });

    const result = await processReturn(2, 200, 'fake-token', {
      condition: 'DAMAGED',
      comments: 'Tiene arañazos',
    });

    expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);
    expect(result.resolution).toBe('DEPOSIT_RETAINED');
    expect(result.amountProcessed).toBe(40.0);
    expect(result.message).toContain('daños');
  });

  // HU-ARRENDATARIO-40: Reembolso automático al confirmar buen estado
  it('processReturn con buen estado incluye el monto de reembolso correcto', async () => {
    const mockResponse = {
      articleId: 3,
      tenantEmail: 'reembolso@example.com',
      resolution: 'DEPOSIT_RETURNED',
      amountProcessed: 10.0,
      message: 'Artículo devuelto en buen estado. Se devuelve el 20% de garantía (10.0€) al arrendatario.',
    };

    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
    });

    const result = await processReturn(3, 300, 'fake-token', {
      condition: 'GOOD',
      comments: '',
    });

    expect(result.resolution).toBe('DEPOSIT_RETURNED');
    expect(result.amountProcessed).toBeGreaterThan(0);
    expect(result.message).toContain('buen estado');
  });

  // Error: artículo no encontrado
  it('processReturn lanza error si el artículo no existe', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: async () => 'Article not found',
    });

    await expect(
      processReturn(99, 100, 'fake-token', { condition: 'GOOD', comments: '' }),
    ).rejects.toThrow('El artículo no existe.');
  });

  // Error: no es el propietario
  it('processReturn lanza error si no es el propietario', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: async () => 'Only the owner can confirm the return',
    });

    await expect(
      processReturn(1, 999, 'fake-token', { condition: 'GOOD', comments: '' }),
    ).rejects.toThrow('Only the owner can confirm the return');
  });

  // Error: artículo no alquilado
  it('processReturn lanza error si el artículo no está alquilado', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: async () => 'This article is not currently rented',
    });

    await expect(
      processReturn(1, 100, 'fake-token', { condition: 'GOOD', comments: '' }),
    ).rejects.toThrow('This article is not currently rented');
  });

  // Error: condición inválida
  it('processReturn lanza error si la condición es inválida', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: async () => 'Condición no válida. Usa GOOD o DAMAGED.',
    });

    await expect(
      processReturn(1, 100, 'fake-token', { condition: 'GOOD', comments: '' }),
    ).rejects.toThrow('Condición no válida');
  });
});

describe('getArticleRecordLogic', () => {
    it('obtiene el historial correctamente con los headers de seguridad', async () => {
      const mockData: ArticleRecordDTO[] = [{
        articleId: 1, tenantName: "Juan", status: "FINISHED",
        startDate: "2024-01-01", endDate: "2024-01-10", city: "Sevilla", country: "España"
      }];

      ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await getArticleRecordLogic(1, 'my-token');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/article/record/1'),
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer my-token',
            'Content-Type': 'application/json'
          }
        })
      );
      expect(result).toEqual(mockData);
    });

    it('lanza error genérico si la respuesta no es OK', async () => {
      ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

      await expect(getArticleRecordLogic(1, 'token'))
        .rejects.toThrow('No se pudo obtener el historial del artículo');
    });
  });
