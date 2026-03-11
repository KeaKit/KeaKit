import { 
  fetchAllCategories, 
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchArticleCountByCategory,
  fetchLatestArticlesByCategory
} from '../../src/services/categoryService';

(globalThis as any).fetch = jest.fn();

describe('categoryService', () => {
  const fakeToken = 'fake-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- PRUEBAS GLOBALES (Timeout y Errores de handleResponse) ---

  it('Lanza un error de timeout si la petición es abortada (AbortError)', async () => {
    const abortError = new Error('AbortError');
    abortError.name = 'AbortError';
    
    ((globalThis as any).fetch as jest.Mock).mockRejectedValueOnce(abortError);

    await expect(fetchAllCategories(fakeToken)).rejects.toThrow('Tiempo de espera agotado al conectar con el servidor.');
  });

  it('Lanza un error genérico si fetch falla por un problema de red', async () => {
    ((globalThis as any).fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

    await expect(fetchAllCategories(fakeToken)).rejects.toThrow('Network Error');
  });

  it('Maneja correctamente un error del servidor que devuelve texto plano en lugar de JSON', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: async () => 'No tienes permisos para realizar esta acción'
    });

    await expect(fetchAllCategories(fakeToken)).rejects.toThrow('No tienes permisos para realizar esta acción');
  });

  // --- fetchAllCategories ---

  it('fetchAllCategories devuelve una lista de categorías', async () => {
    const mockCategories = [
      { id: 1, name: 'Electrónica', status: 'ACTIVE' },
      { id: 2, name: 'Hogar', status: 'DRAFT' }
    ];

    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }), 
      json: async () => mockCategories,
    });

    const result = await fetchAllCategories(fakeToken);

    expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockCategories);
  });

  it('fetchAllCategories lanza un error si la respuesta no es OK (JSON)', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Error interno' })
    });

    await expect(fetchAllCategories(fakeToken)).rejects.toThrow('Error interno');
  });

  // --- fetchCategoryById ---

  it('fetchCategoryById devuelve una categoría específica', async () => {
    const mockCategory = { id: 1, name: 'Electrónica', status: 'ACTIVE' };

    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockCategory,
    });

    const result = await fetchCategoryById(1, fakeToken);

    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      expect.stringContaining('/1'), 
      expect.objectContaining({ method: 'GET' })
    );
    expect(result).toEqual(mockCategory);
  });

  // --- createCategory ---

  it('createCategory crea y devuelve la nueva categoría', async () => {
    const payload = { name: 'Nueva Categoría' };
    const mockCreatedCategory = { id: 3, ...payload, status: 'DRAFT' };

    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockCreatedCategory,
    });

    const result = await createCategory(payload, fakeToken);

    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload)
      })
    );
    expect(result).toEqual(mockCreatedCategory);
  });

  // --- updateCategory ---

  it('updateCategory actualiza y devuelve la categoría modificada', async () => {
    const payload = { name: 'Categoría Actualizada' };
    const mockUpdatedCategory = { id: 1, ...payload, status: 'ACTIVE' };

    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockUpdatedCategory,
    });

    const result = await updateCategory(1, payload, fakeToken);

    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      expect.stringContaining('/1'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(payload)
      })
    );
    expect(result).toEqual(mockUpdatedCategory);
  });

  // --- deleteCategory ---

  it('deleteCategory funciona correctamente y devuelve un mensaje', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: async () => 'Category deleted successfully'
    });

    const result = await deleteCategory(1, fakeToken);

    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      expect.stringContaining('/1'), 
      expect.objectContaining({ method: 'DELETE' })
    );
    expect(result).toBe('Category deleted successfully');
  });

  it('deleteCategory lanza un error si falla la eliminación', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Categoría no encontrada' })
    });

    await expect(deleteCategory(99, fakeToken)).rejects.toThrow('Categoría no encontrada');
  });

  // --- fetchArticleCountByCategory ---

  it('fetchArticleCountByCategory devuelve el número de artículos', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => 42,
    });

    const result = await fetchArticleCountByCategory(1, fakeToken);

    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      expect.any(String), 
      expect.objectContaining({ method: 'GET' })
    );
    expect(result).toBe(42);
  });

  // --- fetchLatestArticlesByCategory ---

  it('fetchLatestArticlesByCategory devuelve una lista de artículos recientes', async () => {
    const mockArticles = [
      { id: 101, title: 'Cámara Sony', categoryId: 1 },
      { id: 102, title: 'Lente 50mm', categoryId: 1 }
    ];

    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockArticles,
    });

    const result = await fetchLatestArticlesByCategory(1, fakeToken);

    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      expect.any(String), 
      expect.objectContaining({ method: 'GET' })
    );
    expect(result).toEqual(mockArticles);
  });
});