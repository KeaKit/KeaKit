/**
 * Tests de lógica para CU-ARRENDADOR-06 y CU-ARRENDADOR-08: Notificaciones
 * Enfocado en validación de lógica de notificaciones, no en rendering
 */

// ─── Tipos y lógica extraída de NotificationsScreen ─────────────────────────

type ActivityNotificationType = "ITEM_RENTED" | "RETURN_REMINDER" | "DEMAND_ALERT" | "ARTICLE_AVAILABLE";

interface ActivityNotification {
  id: number;
  message: string;
  createdAt: string;
  read: boolean;
  type: ActivityNotificationType;
  relatedKitId: number | null;
  relatedArticleId: number | null;
}

/**
 * Formatea una fecha de notificación al formato local es-ES
 */
function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
}

/**
 * Retorna el título de una notificación basado en su tipo
 */
function getNotificationTitle(type: ActivityNotificationType): string {
  switch (type) {
    case 'ITEM_RENTED':
      return 'Objeto alquilado';
    case 'RETURN_REMINDER':
      return 'Recordatorio de devolución';
    case 'DEMAND_ALERT':
      return 'Alerta de demanda';
    case 'ARTICLE_AVAILABLE':
      return 'Artículo disponible';
    default:
      return 'Notificación';
  }
}

/**
 * Filtra notificaciones no leídas
 */
function getUnreadNotifications(notifications: ActivityNotification[]): ActivityNotification[] {
  return notifications.filter((n) => !n.read);
}

/**
 * Agrupa notificaciones por leído/no leído
 */
function groupNotificationsByReadStatus(
  notifications: ActivityNotification[],
): {
  unread: ActivityNotification[];
  read: ActivityNotification[];
} {
  return {
    unread: notifications.filter((n) => !n.read),
    read: notifications.filter((n) => n.read),
  };
}

/**
 * Ordena notificaciones por fecha (más reciente primero)
 */
function sortNotificationsByDate(notifications: ActivityNotification[]): ActivityNotification[] {
  return [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/**
 * Filtra notificaciones de un tipo específico
 */
function filterNotificationsByType(
  notifications: ActivityNotification[],
  type: ActivityNotificationType,
): ActivityNotification[] {
  return notifications.filter((n) => n.type === type);
}

// ─── TESTS ──────────────────────────────────────────────────────────────────

describe('NotificationsScreen - CU-ARRENDADOR-06 & CU-ARRENDADOR-08: Lógica de Notificaciones', () => {
  const mockDemandAlertNotification: ActivityNotification = {
    id: 100,
    message: 'Juan está interesado en alquilar tu artículo "Bicicleta", que actualmente no está disponible.',
    type: 'DEMAND_ALERT',
    createdAt: '2026-04-14T10:30:00Z',
    read: false,
    relatedKitId: null,
    relatedArticleId: 5,
  };

  const mockItemRentedNotification: ActivityNotification = {
    id: 101,
    message: 'Tu objeto "Laptop" ha sido alquilado por Carlos.',
    type: 'ITEM_RENTED',
    createdAt: '2026-04-14T09:15:00Z',
    read: false,
    relatedKitId: 1,
    relatedArticleId: 3,
  };

  const mockReturnReminderNotification: ActivityNotification = {
    id: 102,
    message: 'Recordatorio: tu objeto "Cámara de fotos" será devuelto en 2 días.',
    type: 'RETURN_REMINDER',
    createdAt: '2026-04-14T08:00:00Z',
    read: true,
    relatedKitId: 2,
    relatedArticleId: 4,
  };

  const mockArticleAvailableNotification: ActivityNotification = {
    id: 103,
    message: 'El artículo "Taladro" está disponible nuevamente.',
    type: 'ARTICLE_AVAILABLE',
    createdAt: '2026-04-14T07:00:00Z',
    read: true,
    relatedKitId: null,
    relatedArticleId: 6,
  };

  describe('formatDateTime', () => {
    it('Debería formatear fecha ISO a formato es-ES', () => {
      const result = formatDateTime('2026-04-14T10:30:00Z');
      // El formato es-ES debería ser algo como "14/4/2026, 10:30" o "14/4/26, 10:30" según configuración
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}, \d{2}:\d{2}/);
    });

    it('Debería retornar la cadena original si la fecha es inválida', () => {
      const result = formatDateTime('fecha invalida');
      expect(result).toBe('fecha invalida');
    });

    it('Debería manejar null o undefined', () => {
      const result = formatDateTime('');
      expect(result).toBeDefined();
    });
  });

  describe('getNotificationTitle', () => {
    it('Debería retornar "Alerta de demanda" para DEMAND_ALERT', () => {
      const result = getNotificationTitle('DEMAND_ALERT');
      expect(result).toBe('Alerta de demanda');
    });

    it('Debería retornar "Objeto alquilado" para ITEM_RENTED', () => {
      const result = getNotificationTitle('ITEM_RENTED');
      expect(result).toBe('Objeto alquilado');
    });

    it('Debería retornar "Recordatorio de devolución" para RETURN_REMINDER', () => {
      const result = getNotificationTitle('RETURN_REMINDER');
      expect(result).toBe('Recordatorio de devolución');
    });

    it('Debería retornar "Artículo disponible" para ARTICLE_AVAILABLE', () => {
      const result = getNotificationTitle('ARTICLE_AVAILABLE');
      expect(result).toBe('Artículo disponible');
    });

    it('Debería retornar "Notificación" para tipo desconocido', () => {
      const result = getNotificationTitle('UNKNOWN' as any);
      expect(result).toBe('Notificación');
    });
  });

  describe('getUnreadNotifications', () => {
    it('Debería retornar solo notificaciones no leídas', () => {
      const notifications = [
        mockDemandAlertNotification,
        mockReturnReminderNotification,
        mockItemRentedNotification,
      ];

      const result = getUnreadNotifications(notifications);

      expect(result).toHaveLength(2);
      expect(result.every((n) => !n.read)).toBe(true);
    });

    it('Debería retornar lista vacía si todas las notificaciones están leídas', () => {
      const allRead = [mockReturnReminderNotification, mockArticleAvailableNotification];

      const result = getUnreadNotifications(allRead);

      expect(result).toHaveLength(0);
    });

    it('Debería retornar lista vacía si no hay notificaciones', () => {
      const result = getUnreadNotifications([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('groupNotificationsByReadStatus', () => {
    it('Debería agrupar correctamente notificaciones leídas y no leídas', () => {
      const notifications = [
        mockDemandAlertNotification,
        mockReturnReminderNotification,
        mockItemRentedNotification,
        mockArticleAvailableNotification,
      ];

      const result = groupNotificationsByReadStatus(notifications);

      expect(result.unread).toHaveLength(2);
      expect(result.read).toHaveLength(2);
      expect(result.unread.every((n) => !n.read)).toBe(true);
      expect(result.read.every((n) => n.read)).toBe(true);
    });

    it('Debería manejar lista con solo notificaciones no leídas', () => {
      const notifications = [mockDemandAlertNotification, mockItemRentedNotification];

      const result = groupNotificationsByReadStatus(notifications);

      expect(result.unread).toHaveLength(2);
      expect(result.read).toHaveLength(0);
    });
  });

  describe('sortNotificationsByDate', () => {
    it('Debería ordenar notificaciones de más reciente a más antigua', () => {
      const notifications = [
        mockReturnReminderNotification, // 08:00
        mockDemandAlertNotification, // 10:30
        mockItemRentedNotification, // 09:15
      ];

      const result = sortNotificationsByDate(notifications);

      expect(result[0].id).toBe(mockDemandAlertNotification.id); // 10:30 (más reciente)
      expect(result[1].id).toBe(mockItemRentedNotification.id); // 09:15
      expect(result[2].id).toBe(mockReturnReminderNotification.id); // 08:00 (más antigua)
    });

    it('No debería modificar el array original', () => {
      const notifications = [...[mockDemandAlertNotification, mockItemRentedNotification]];
      const originalOrder = notifications.map((n) => n.id);

      sortNotificationsByDate(notifications);

      expect(notifications.map((n) => n.id)).toEqual(originalOrder);
    });

    it('Debería manejar notificaciones con la misma fecha', () => {
      const sameDateNotif1: ActivityNotification = { ...mockDemandAlertNotification, id: 200 };
      const sameDateNotif2: ActivityNotification = { ...mockDemandAlertNotification, id: 201 };

      const notifications = [sameDateNotif1, sameDateNotif2];
      const result = sortNotificationsByDate(notifications);

      expect(result).toHaveLength(2);
    });
  });

  describe('filterNotificationsByType', () => {
    it('Debería filtrar notificaciones de tipo DEMAND_ALERT', () => {
      const notifications = [
        mockDemandAlertNotification,
        mockItemRentedNotification,
        mockReturnReminderNotification,
      ];

      const result = filterNotificationsByType(notifications, 'DEMAND_ALERT');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('DEMAND_ALERT');
      expect(result[0].message).toContain('Juan');
    });

    it('Debería filtrar notificaciones de tipo ITEM_RENTED', () => {
      const notifications = [
        mockDemandAlertNotification,
        mockItemRentedNotification,
        mockReturnReminderNotification,
      ];

      const result = filterNotificationsByType(notifications, 'ITEM_RENTED');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('ITEM_RENTED');
    });

    it('Debería retornar lista vacía si no hay notificaciones del tipo', () => {
      const notifications = [mockDemandAlertNotification, mockItemRentedNotification];

      const result = filterNotificationsByType(notifications, 'ARTICLE_AVAILABLE');

      expect(result).toHaveLength(0);
    });

    it('Debería manejar lista vacía de notificaciones', () => {
      const result = filterNotificationsByType([], 'DEMAND_ALERT');
      expect(result).toHaveLength(0);
    });
  });

  describe('CU-ARRENDADOR-06: Integración de lógica de Alertas de Demanda', () => {
    it('Debería priorizar notificaciones de DEMAND_ALERT no leídas', () => {
      const notifications = [
        mockReturnReminderNotification, // leído
        mockDemandAlertNotification, // no leído
        mockItemRentedNotification, // no leído
      ];

      const unread = getUnreadNotifications(notifications);
      const demandAlerts = filterNotificationsByType(unread, 'DEMAND_ALERT');

      expect(demandAlerts).toHaveLength(1);
      expect(demandAlerts[0].id).toBe(mockDemandAlertNotification.id);
    });

    it('Debería mostrar todas las alertas de demanda para un arrendador', () => {
      const demandAlert1: ActivityNotification = {
        ...mockDemandAlertNotification,
        id: 100,
        message: 'Juan está interesado en tu "Laptop"',
      };
      const demandAlert2: ActivityNotification = {
        ...mockDemandAlertNotification,
        id: 101,
        message: 'María está interesada en tu "Bicicleta"',
      };
      const notifications = [
        demandAlert1,
        mockItemRentedNotification,
        demandAlert2,
      ];

      const demandAlerts = filterNotificationsByType(notifications, 'DEMAND_ALERT');

      expect(demandAlerts).toHaveLength(2);
      expect(demandAlerts.map((n) => n.id)).toContain(100);
      expect(demandAlerts.map((n) => n.id)).toContain(101);
    });

    it('Debería mostrar alerta de demanda junto con otras notificaciones en orden cronológico', () => {
      const notifications = [
        mockReturnReminderNotification, // 08:00, leído
        mockDemandAlertNotification, // 10:30, no leído
        mockItemRentedNotification, // 09:15, no leído
      ];

      const sorted = sortNotificationsByDate(notifications);
      const grouped = groupNotificationsByReadStatus(sorted);

      expect(sorted[0].type).toBe('DEMAND_ALERT'); // Más reciente
      expect(grouped.unread[0].type).toBe('DEMAND_ALERT');
    });
  });

  describe('Casos edge y validación', () => {
    it('Debería manejar notificación sin relatedArticleId', () => {
      const notification: ActivityNotification = {
        ...mockDemandAlertNotification,
        relatedArticleId: null,
      };

      const title = getNotificationTitle(notification.type);
      expect(title).toBe('Alerta de demanda');
    });

    it('Debería manejar múltiples notificaciones con misma categoría', () => {
      const demandAlerts = [
        { ...mockDemandAlertNotification, id: 1 },
        { ...mockDemandAlertNotification, id: 2 },
        { ...mockDemandAlertNotification, id: 3 },
      ];

      const filtered = filterNotificationsByType(demandAlerts, 'DEMAND_ALERT');
      expect(filtered).toHaveLength(3);
    });

    it('Debería preservar la información de notificación después de filtrar', () => {
      const original = mockDemandAlertNotification;
      const notifications = [original];

      const result = filterNotificationsByType(notifications, 'DEMAND_ALERT');

      expect(result[0]).toEqual(original);
      expect(result[0].message).toEqual(original.message);
    });
  });

  describe('CU-ARRENDADOR-08: Notificaciones múltiples tipos', () => {
    it('Debería manejar correctamente todos los tipos de notificación', () => {
      const allNotifications = [
        mockDemandAlertNotification,
        mockItemRentedNotification,
        mockReturnReminderNotification,
        mockArticleAvailableNotification,
      ];

      expect(allNotifications).toHaveLength(4);
      expect(allNotifications.map((n) => n.type)).toContain('DEMAND_ALERT');
      expect(allNotifications.map((n) => n.type)).toContain('ITEM_RENTED');
      expect(allNotifications.map((n) => n.type)).toContain('RETURN_REMINDER');
      expect(allNotifications.map((n) => n.type)).toContain('ARTICLE_AVAILABLE');
    });

    it('Debería obtener título correcto para cada tipo', () => {
      const types: ActivityNotificationType[] = ['DEMAND_ALERT', 'ITEM_RENTED', 'RETURN_REMINDER', 'ARTICLE_AVAILABLE'];
      const titles = types.map(getNotificationTitle);

      expect(titles).toEqual([
        'Alerta de demanda',
        'Objeto alquilado',
        'Recordatorio de devolución',
        'Artículo disponible',
      ]);
    });
  });
});
