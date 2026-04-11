const BASE_URL = 'http://localhost:8080';

export interface KitConfirmResponse {
  message: string;
}

export async function confirmKitStatus(
  kitId: number,
  token: string
): Promise<KitConfirmResponse> {
  const url = `${BASE_URL}/api/kits/confirm/${kitId}`;
  
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
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
    } catch {
    }

    const lower = errorMessage.toLowerCase();
    if (res.status === 404 || lower.includes('not found')) {
      throw new Error('El kit no existe.');
    }
    if (lower.includes('must be in paid status')) {
      throw new Error('El kit debe estar pagado para ser confirmado.');
    }
    
    throw new Error(errorMessage);
  }

  try {
    return await res.json() as KitConfirmResponse;
  } catch {
    return { message: 'Kit status confirmed succesfully' } as KitConfirmResponse;
  }
}

(globalThis as any).fetch = jest.fn();

describe('kitService – confirmKitStatus (Confirmación de Recepción)', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe confirmar el kit correctamente con status 200 y headers de seguridad', async () => {
    const mockResponse = { message: 'Kit status confirmed succesfully' };

    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
    });

    const result = await confirmKitStatus(500, 'fake-token');

    expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);
    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      `${BASE_URL}/api/kits/confirm/500`,
      expect.objectContaining({
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer fake-token',
          'Content-Type': 'application/json'
        },
      })
    );
    expect(result.message).toBe('Kit status confirmed succesfully');
  });

  it('debe lanzar un error amigable si el kit no existe (404)', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: async () => 'Kit not found',
    });

    await expect(confirmKitStatus(999, 'token'))
      .rejects.toThrow('El kit no existe.');
  });

  it('debe lanzar error si el kit no está en estado PAID', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Kit must be in PAID status to be confirmed' }),
    });

    await expect(confirmKitStatus(1, 'token'))
      .rejects.toThrow('El kit debe estar pagado para ser confirmado.');
  });

  it('debe lanzar el mensaje original del servidor si es un error no mapeado (ej. 401)', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: async () => 'Unauthorized access',
    });

    await expect(confirmKitStatus(1, 'invalid-token'))
      .rejects.toThrow('Unauthorized access');
  });

  it('debe manejar correctamente respuestas 200 con cuerpo no-JSON', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'text/plain' }),
      json: () => Promise.reject(new Error('No JSON')),
      text: async () => 'Success String',
    });

    const result = await confirmKitStatus(1, 'token');
    expect(result.message).toBe('Kit status confirmed succesfully');
  });
});