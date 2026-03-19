/*
import {
  getCommissionConfig,
  updateCommissionConfig
} from '../../src/services/PlatformConfigService';

(globalThis as any).fetch = jest.fn();

describe('PlatformConfigService', () => {
  const fakeToken = 'fake-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── GET commission config ───────────────────────────────────────

  it('getCommissionConfig devuelve la comisión correctamente', async () => {
    const mockResponse = {
      id: 1,
      commissionRate: 0.2,
    };

    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await getCommissionConfig(fakeToken);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/config/commission'),
      expect.objectContaining({
        headers: { Authorization: `Bearer ${fakeToken}` },
      })
    );

    expect(result).toEqual(mockResponse);
  });

  it('getCommissionConfig lanza error si la respuesta no es OK', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    await expect(getCommissionConfig(fakeToken))
      .rejects
      .toThrow('No se pudo obtener la comisión');
  });

  it('getCommissionConfig lanza error si falla la red', async () => {
    ((globalThis as any).fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network Error'));

    await expect(getCommissionConfig(fakeToken))
      .rejects
      .toThrow('Network Error');
  });

  // ─── UPDATE commission config ────────────────────────────────────

  it('updateCommissionConfig actualiza y devuelve la comisión', async () => {
    const newRate = 0.35;

    const mockResponse = {
      id: 1,
      commissionRate: newRate,
    };

    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await updateCommissionConfig(fakeToken, newRate);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/config/commission'),
      expect.objectContaining({
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${fakeToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commissionRate: newRate }),
      })
    );

    expect(result).toEqual(mockResponse);
  });

  it('updateCommissionConfig lanza error si la respuesta no es OK', async () => {
    ((globalThis as any).fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    await expect(updateCommissionConfig(fakeToken, 0.5))
      .rejects
      .toThrow('No se pudo actualizar la comisión');
  });

  it('updateCommissionConfig lanza error si falla la red', async () => {
    ((globalThis as any).fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network Error'));

    await expect(updateCommissionConfig(fakeToken, 0.5))
      .rejects
      .toThrow('Network Error');
  });
});

*/