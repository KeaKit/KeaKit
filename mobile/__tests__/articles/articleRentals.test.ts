// ArticleRentals.test.ts

export enum KitStatus {
  ACTIVE = 'ACTIVE',
  PAID = 'PAID',
  FINISHED = 'FINISHED',
}

export interface ArticleRecordDTO {
  articleId: number;
  tenantName: string;
  status: KitStatus | string;
  startDate: string;
  endDate: string;
  city: string;
  country: string;
}

// --- LÓGICA EXTRAÍDA DEL COMPONENTE ---

function computeSections(rentals: ArticleRecordDTO[]) {
  const active = rentals.filter(r => r.status !== KitStatus.FINISHED);
  const past = rentals.filter(r => r.status === KitStatus.FINISHED);

  return [
    { title: 'Alquileres Actuales', data: active },
    { title: 'Historial Pasado', data: past },
  ];
}

function getStatusConfig(status: string | KitStatus) {
  switch (status) {
    case 'ACTIVE':
    case KitStatus.ACTIVE:
      return { label: 'ACTIVO', color: '#28a745', bg: '#eafaf1' };
    case 'PAID':
      return { label: 'PAGADO', color: '#007bff', bg: '#e7f1ff' };
    case 'FINISHED':
    case KitStatus.FINISHED:
      return { label: 'FINALIZADO', color: '#6c757d', bg: '#f8f9fa' };
    default:
      return { label: status, color: '#999', bg: '#f0f0f0' };
  }
}

const formatDate = (date: string) => new Date(date).toLocaleDateString('es-ES');

// ==========================================
// DATA DE PRUEBA (MOCKS)
// ==========================================

const mockRentals: ArticleRecordDTO[] = [
  {
    articleId: 101,
    tenantName: "Carlos Pérez",
    status: KitStatus.ACTIVE,
    startDate: "2024-03-01T10:00:00Z",
    endDate: "2024-03-31T10:00:00Z",
    city: "Sevilla",
    country: "España"
  },
  {
    articleId: 101,
    tenantName: "Ana López",
    status: KitStatus.FINISHED,
    startDate: "2024-01-01T10:00:00Z",
    endDate: "2024-01-15T10:00:00Z",
    city: "Madrid",
    country: "España"
  }
];

describe("ArticleRentals Logic Tests", () => {

  describe("computeSections (Distribución en SectionList)", () => {
    it("debería clasificar correctamente un alquiler ACTIVO en la primera sección", () => {
      const sections = computeSections([mockRentals[0]]);
      expect(sections[0].title).toBe('Alquileres Actuales');
      expect(sections[0].data).toContain(mockRentals[0]);
      expect(sections[1].data).toHaveLength(0);
    });

    it("debería clasificar correctamente un alquiler FINALIZADO en la segunda sección", () => {
      const sections = computeSections([mockRentals[1]]);
      expect(sections[1].title).toBe('Historial Pasado');
      expect(sections[1].data).toContain(mockRentals[1]);
      expect(sections[0].data).toHaveLength(0);
    });

    it("un alquiler con estado 'PAID' debe aparecer en 'Alquileres Actuales'", () => {
      const paidItem = { ...mockRentals[0], status: 'PAID' };
      const sections = computeSections([paidItem]);
      expect(sections[0].data).toHaveLength(1);
      expect(sections[0].data[0].status).toBe('PAID');
    });

    it("si la lista está vacía, ambas secciones deben estar vacías", () => {
      const sections = computeSections([]);
      expect(sections[0].data).toHaveLength(0);
      expect(sections[1].data).toHaveLength(0);
    });
  });

  describe("getStatusConfig (Lógica de Badges/UI)", () => {
    it("retorna verde para el estado ACTIVE", () => {
      const config = getStatusConfig(KitStatus.ACTIVE);
      expect(config.color).toBe('#28a745');
      expect(config.label).toBe('ACTIVO');
    });

    it("retorna gris para el estado FINISHED", () => {
      const config = getStatusConfig(KitStatus.FINISHED);
      expect(config.color).toBe('#6c757d');
      expect(config.label).toBe('FINALIZADO');
    });

    it("retorna configuración por defecto para estados no mapeados", () => {
      const config = getStatusConfig("CANCELLED");
      expect(config.label).toBe("CANCELLED");
      expect(config.color).toBe('#999');
    });
  });

  describe("formatDate (Localización)", () => {
    it("formatea correctamente una cadena ISO a formato español", () => {
      const formatted = formatDate("2024-05-15T12:00:00Z");
      expect(formatted).toContain("15/5/2024");
    });
  });

  describe("RN-REC-03: Integridad de datos en la tarjeta", () => {
    it("debe mantener la coherencia entre el nombre del inquilino y su ubicación", () => {
      const item = mockRentals[0];
      const displayString = `${item.tenantName} de ${item.city}`;
      expect(displayString).toBe("Carlos Pérez de Sevilla");
    });
  });

});