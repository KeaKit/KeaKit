import {
  fetchAllDefaultKits,
  fetchDefaultKitById,
  createDefaultKit,
  updateDefaultKit,
  deleteDefaultKit,
} from '../../src/services/defaultKitService';

(globalThis as any).fetch = jest.fn();

describe('defaultKitService', () => {
  const fakeToken = 'fake-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Pruebas globales (Timeout y errores de handleResponse) ─────────────

  it('Lanza un error de timeout si la petición es abortada (AbortError)', async () => {
    const abortError = new Error('AbortError');
    abortError.name = 'AbortError';

    ((globalThis as any).fetch as jest.Mock).mockRejectedValueOnce(abortError);

    await expect(fetchAllDefaultKits(fakeToken)).rejects.toThrow(
      'Tiempo de espera agotado al conectar con el servidor.',
    );
  });

  it('Lanza un error genérico si fetch falla por un problema de red', async () => {
    ((globalThis as any).fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

    await expect(fetchAllDefaultKits(fakeToken)).rejects.toThrow('Network Error');
  });

  it('Maneja correctamente un error del servidor que devuelve texto plano', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: async () => 'No tienes permisos para realizar esta acción',
    });

    await expect(fetchAllDefaultKits(fakeToken)).rejects.toThrow(
      'No tienes permisos para realizar esta acción',
    );
  });

  // ── fetchAllDefaultKits ────────────────────────────────────────────────

  it('fetchAllDefaultKits devuelve una lista de kits predeterminados', async () => {
    const mockKits = [
      { id: 1, name: 'Kit Mudanza', description: 'Desc', basePrice: 59.99, items: [] },
      { id: 2, name: 'Kit Cocina', description: 'Menaje', basePrice: 29.99, items: [] },
    ];

    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockKits,
    });

    const result = await fetchAllDefaultKits(fakeToken);

    expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockKits);
  });

  it('fetchAllDefaultKits lanza un error si la respuesta no es OK (JSON)', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Error interno del servidor' }),
    });

    await expect(fetchAllDefaultKits(fakeToken)).rejects.toThrow('Error interno del servidor');
  });

  it('fetchAllDefaultKits devuelve lista vacía cuando no hay kits', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => [],
    });

    const result = await fetchAllDefaultKits(fakeToken);

    expect(result).toEqual([]);
  });

  // ── fetchDefaultKitById ────────────────────────────────────────────────

  it('fetchDefaultKitById devuelve un kit predeterminado específico', async () => {
    const mockKit = { id: 1, name: 'Kit Mudanza', description: 'Desc', basePrice: 59.99, items: [] };

    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockKit,
    });

    const result = await fetchDefaultKitById(1, fakeToken);

    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      expect.stringContaining('/1'),
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result).toEqual(mockKit);
  });

  it('fetchDefaultKitById lanza un error si el kit no existe', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'No se ha encontrado el Kit Predeterminado con ID: 999' }),
    });

    await expect(fetchDefaultKitById(999, fakeToken)).rejects.toThrow(
      'No se ha encontrado el Kit Predeterminado con ID: 999',
    );
  });

  // ── createDefaultKit ──────────────────────────────────────────────────

  it('createDefaultKit crea y devuelve el nuevo kit predeterminado', async () => {
    const payload = { name: 'Kit Nuevo', description: 'Desc nueva', basePrice: 45.0, articleIds: [1, 2] };
    const mockCreatedKit = { id: 3, name: 'Kit Nuevo', description: 'Desc nueva', basePrice: 45.0, items: [] };

    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockCreatedKit,
    });

    const result = await createDefaultKit(payload, fakeToken);

    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    );
    expect(result).toEqual(mockCreatedKit);
  });

  it('createDefaultKit lanza un error si el usuario no es admin (403)', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'No tienes permiso para ver el siguiente contenido' }),
    });

    await expect(
      createDefaultKit({ name: 'Kit', description: 'Desc', basePrice: 10 }, fakeToken),
    ).rejects.toThrow('No tienes permiso');
  });

  it('createDefaultKit lanza un error si un artículo no existe (404)', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Artículo no encontrado con ID: 999' }),
    });

    await expect(
      createDefaultKit({ name: 'Kit', description: 'Desc', basePrice: 10, articleIds: [999] }, fakeToken),
    ).rejects.toThrow('Artículo no encontrado');
  });

  it('createDefaultKit envía el token de autorización', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ id: 1, name: 'Kit', description: 'D', basePrice: 10, items: [] }),
    });

    await createDefaultKit({ name: 'Kit', description: 'D', basePrice: 10 }, fakeToken);

    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${fakeToken}`,
        }),
      }),
    );
  });

  // ── updateDefaultKit ──────────────────────────────────────────────────

  it('updateDefaultKit actualiza y devuelve el kit modificado', async () => {
    const payload = { name: 'Kit Actualizado', description: 'Desc actualizada', basePrice: 79.99 };
    const mockUpdatedKit = { id: 1, ...payload, items: [] };

    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockUpdatedKit,
    });

    const result = await updateDefaultKit(1, payload, fakeToken);

    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      expect.stringContaining('/1'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    );
    expect(result).toEqual(mockUpdatedKit);
  });

  it('updateDefaultKit lanza un error si el kit no existe (404)', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'No se ha encontrado el Kit Predeterminado con ID: 999' }),
    });

    await expect(updateDefaultKit(999, { name: 'X' }, fakeToken)).rejects.toThrow(
      'No se ha encontrado el Kit Predeterminado',
    );
  });

  it('updateDefaultKit lanza un error si no es admin (403)', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'No tienes permiso' }),
    });

    await expect(updateDefaultKit(1, { name: 'X' }, fakeToken)).rejects.toThrow('No tienes permiso');
  });

  // ── deleteDefaultKit ──────────────────────────────────────────────────

  it('deleteDefaultKit elimina el kit correctamente', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: async () => '',
    });

    const result = await deleteDefaultKit(1, fakeToken);

    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      expect.stringContaining('/1'),
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result).toBe('');
  });

  it('deleteDefaultKit lanza un error si el kit no existe (404)', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'No se ha encontrado el Kit Predeterminado con ID: 999' }),
    });

    await expect(deleteDefaultKit(999, fakeToken)).rejects.toThrow(
      'No se ha encontrado el Kit Predeterminado',
    );
  });

  it('deleteDefaultKit lanza un error si no es admin (403)', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'No tienes permiso' }),
    });

    await expect(deleteDefaultKit(1, fakeToken)).rejects.toThrow('No tienes permiso');
  });
});
