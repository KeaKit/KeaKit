const BASE_URL = 'http://localhost:8080';

async function updateProfile(
  userId: string,
  data: { name: string; phone: string; address: string; city: string; country: string },
  token: string
) {
  const url = `${BASE_URL}/api/users/${userId}/profile`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al actualizar');
  }
  return res.json();
}

(globalThis as any).fetch = jest.fn();

describe('userService – updateProfile', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe realizar la petición PUT con los datos y token correctos', async () => {
    const mockUserResponse = { id: '1', name: 'Juan Editado' };
    
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserResponse,
    });

    const updateData = {
      name: 'Juan Editado',
      phone: '123456789',
      address: 'Calle Nueva',
      city: 'Sevilla',
      country: 'España'
    };

    const result = await updateProfile('1', updateData, 'token-valido');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/1/profile'),
      expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token-valido'
        },
        body: JSON.stringify(updateData)
      })
    );
    expect(result.name).toBe('Juan Editado');
  });

  it('debe lanzar error cuando el backend responde con 400 o 500', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Phone number must be valid' }),
    });

    await expect(updateProfile('1', {} as any, 'token'))
      .rejects.toThrow('Phone number must be valid');
  });

  it('maneja errores de red o JSON inválido', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => { throw new Error(); },
    });

    await expect(updateProfile('1', {} as any, 'token'))
      .rejects.toThrow('Error al actualizar');
  });
});