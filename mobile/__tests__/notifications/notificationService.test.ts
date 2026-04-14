import {
  getUserNotifications,
  markNotificationRead,
  createDemandAlert,
} from '../../src/services/notificationService';

// Simulamos la función fetch nativa para no hacer llamadas reales a Internet
(globalThis as any).fetch = jest.fn();

describe('notificationService', () => {
  const fakeToken = 'fake-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- PRUEBAS GLOBALES (Timeout y Errores de handleResponse) ---

  it('Lanza un error de timeout si la petición es abortada (AbortError)', async () => {
    const abortError = new Error('AbortError');
    abortError.name = 'AbortError';
    
    ((globalThis as any).fetch as jest.Mock).mockRejectedValueOnce(abortError);

    await expect(getUserNotifications(1, fakeToken)).rejects.toThrow('Tiempo de espera agotado al conectar con el servidor.');
  });

  it('Lanza un error genérico si fetch falla por un problema de red', async () => {
    ((globalThis as any).fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

    await expect(getUserNotifications(1, fakeToken)).rejects.toThrow('Network Error');
  });

  it('Maneja correctamente un error del servidor que devuelve texto plano en lugar de JSON', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: async () => 'No tienes permisos para ver notificaciones'
    });

    await expect(getUserNotifications(1, fakeToken)).rejects.toThrow('No tienes permisos para ver notificaciones');
  });

  // --- getUserNotifications ---

  it('getUserNotifications devuelve una lista de notificaciones', async () => {
    const mockNotifications = [
      { id: 1, message: 'Tu objeto ha sido alquilado', type: 'ITEM_RENTED', read: false },
      { id: 2, message: 'Devolución próxima', type: 'RETURN_REMINDER', read: true }
    ];

    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }), 
      // LA CLAVE DEL ARREGLO: Simulamos res.text() y res.json() para cubrir utils.ts
      text: async () => JSON.stringify(mockNotifications),
      json: async () => mockNotifications,
    });

    const result = await getUserNotifications(1, fakeToken);

    expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);
    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/notifications/user/1'),
      expect.objectContaining({ method: 'GET' })
    );
    expect(result).toEqual(mockNotifications);
  });

  it('getUserNotifications lanza un error si la respuesta no es OK (JSON)', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Error interno del servidor' })
    });

    await expect(getUserNotifications(1, fakeToken)).rejects.toThrow('Error interno del servidor');
  });

  // --- markNotificationRead ---

  it('markNotificationRead funciona correctamente (devuelve void)', async () => {
    // Al ser un PATCH que devuelve OK vacío, simulamos el text en blanco
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'text/plain' }),
      text: async () => ''
    });

    await markNotificationRead(100, fakeToken);

    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/notifications/100/read'), 
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('markNotificationRead lanza un error si falla la actualización', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Notificación no encontrada' })
    });

    await expect(markNotificationRead(99, fakeToken)).rejects.toThrow('Notificación no encontrada');
  });

  // --- createDemandAlert (CU-ARRENDADOR-06) ---

  it('createDemandAlert crea una alerta de demanda exitosamente', async () => {
    const mockNotification = {
      id: 1,
      message: 'Juan está interesado en alquilar tu artículo "Bicicleta", que actualmente no está disponible.',
      type: 'DEMAND_ALERT',
      read: false
    };

    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify(mockNotification),
      json: async () => mockNotification,
    });

    const result = await createDemandAlert(5, 2, fakeToken);

    expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);
    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/notifications/demand-alert'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': `Bearer ${fakeToken}`
        }),
        body: JSON.stringify({ articleId: 5, requesterId: 2 })
      })
    );
    expect(result).toEqual(mockNotification);
  });

  it('createDemandAlert lanza un error si el artículo no está disponible según el servidor', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'El artículo ya está disponible para alquilar' })
    });

    await expect(createDemandAlert(5, 2, fakeToken)).rejects.toThrow('El artículo ya está disponible para alquilar');
  });

  it('createDemandAlert lanza un error si el artículo no se encuentra', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Article not found with id: 999' })
    });

    await expect(createDemandAlert(999, 2, fakeToken)).rejects.toThrow('Article not found with id: 999');
  });

  it('createDemandAlert lanza un error si el usuario no es propietario del artículo pero intenta crearlo', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'El propietario no puede solicitar su propio artículo' })
    });

    await expect(createDemandAlert(5, 1, fakeToken)).rejects.toThrow('El propietario no puede solicitar su propio artículo');
  });

  it('createDemandAlert lanza un error de timeout si la petición es lenta', async () => {
    const abortError = new Error('AbortError');
    abortError.name = 'AbortError';
    
    ((globalThis as any).fetch as jest.Mock).mockRejectedValueOnce(abortError);

    await expect(createDemandAlert(5, 2, fakeToken)).rejects.toThrow('Tiempo de espera agotado al conectar con el servidor.');
  });

  it('createDemandAlert lanza un error si hay problema de red', async () => {
    ((globalThis as any).fetch as jest.Mock).mockRejectedValueOnce(new Error('Network unavailable'));

    await expect(createDemandAlert(5, 2, fakeToken)).rejects.toThrow('Network unavailable');
  });

  it('createDemandAlert lanza un error 500 del servidor', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Error interno del servidor' })
    });

    await expect(createDemandAlert(5, 2, fakeToken)).rejects.toThrow('Error interno del servidor');
  });
});