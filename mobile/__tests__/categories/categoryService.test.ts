import { 
  fetchAllCategories, 
  deleteCategory 
} from '../../src/services/categoryService';

(globalThis as any).fetch = jest.fn();

describe('categoryService', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

    const result = await fetchAllCategories('fake-token');

    expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockCategories);
    expect(result.length).toBe(2);
  });

  it('fetchAllCategories lanza un error si la respuesta no es OK', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Error interno' })
    });

    await expect(fetchAllCategories('fake-token')).rejects.toThrow('Error interno');
  });

  it('deleteCategory funciona correctamente', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: async () => 'Category deleted successfully'
    });

    const result = await deleteCategory(1, 'fake-token');

    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      expect.stringContaining('/1'), 
      expect.objectContaining({ method: 'DELETE' })
    );
    expect(result).toBe('Category deleted successfully');
  });
});