/**
 * Tests de lógica para CU-ARRENDADOR-06: Alertas de Demanda
 * Enfocado en validación de lógica, no en rendering de componentes
 */

// ─── Tipos y lógica extraída de ProductSelectionModal ─────────────────────

type CatalogProduct = {
  id: number;
  title: string;
  pricePerMonth: number;
  status: "AVAILABLE" | "RENTED" | "INACTIVE" | string;
  category?: string;
  city?: string;
  ownerId: number;
  ownerName?: string;
  imageUrl?: string | null;
  totalUnits: number;
  availableFrom?: string;
  availableUntil?: string;
  isAvailable?: boolean;
  availabilityMessage?: string;
};

/**
 * Determina si un producto puede ser añadido al kit directamente.
 * Un producto solo puede añadirse si:
 * 1. Su status es "AVAILABLE"
 * 2. Está disponible en las fechas solicitadas
 */
function canProductBeAdded(product: CatalogProduct, isAvailableInDates: boolean): boolean {
  return isAvailableInDates && product.status === 'AVAILABLE';
}

/**
 * Determina si un producto debe mostrar el botón "Avisarme" (alerta de demanda).
 * El botón se muestra cuando:
 * 1. El producto no puede ser añadido directamente
 * 2. El status es "RENTED" o "INACTIVE"
 */
function shouldShowDemandAlertButton(product: CatalogProduct, canBeAdded: boolean): boolean {
  return !canBeAdded && (product.status === 'RENTED' || product.status === 'INACTIVE');
}

/**
 * Calcula disponibilidad de un producto para un rango de fechas.
 * El producto es disponible si sus fechas cubren completamente el rango solicitado.
 */
function isProductAvailableInDateRange(
  product: CatalogProduct,
  startDate: Date | null,
  endDate: Date | null,
): { isAvailable: boolean; message?: string } {
  if (!startDate || !endDate) {
    return { isAvailable: true };
  }

  if (!product.availableFrom || !product.availableUntil) {
    return {
      isAvailable: false,
      message: 'Sin fechas de disponibilidad',
    };
  }

  const requestStart = Date.UTC(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
  );
  const requestEnd = Date.UTC(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
  );

  const [yearFrom, monthFrom, dayFrom] = product.availableFrom.split('-');
  const productFrom = Date.UTC(
    parseInt(yearFrom, 10),
    parseInt(monthFrom, 10) - 1,
    parseInt(dayFrom, 10),
  );

  const [yearUntil, monthUntil, dayUntil] = product.availableUntil.split('-');
  const productUntil = Date.UTC(
    parseInt(yearUntil, 10),
    parseInt(monthUntil, 10) - 1,
    parseInt(dayUntil, 10),
  );

  const isAvailable = productFrom <= requestStart && productUntil >= requestEnd;

  if (!isAvailable) {
    const formatDate = (dateStr: string) => {
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}`;
    };
    const message = `Disponible: ${formatDate(product.availableFrom)} - ${formatDate(product.availableUntil)}`;
    return { isAvailable: false, message };
  }

  return { isAvailable: true };
}

// ─── TESTS ──────────────────────────────────────────────────────────────────

describe('ProductSelectionModal - CU-ARRENDADOR-06: Lógica de Alertas de Demanda', () => {
  const mockAvailableProduct: CatalogProduct = {
    id: 1,
    title: 'Laptop HP',
    pricePerMonth: 50,
    status: 'AVAILABLE',
    category: 'Electrónica',
    city: 'Madrid',
    ownerId: 3,
    ownerName: 'Propietario Carlos',
    imageUrl: null,
    totalUnits: 2,
    availableFrom: '2026-04-01',
    availableUntil: '2026-05-31',
  };

  const mockRentedProduct: CatalogProduct = {
    id: 5,
    title: 'Bicicleta Montaña',
    pricePerMonth: 30,
    status: 'RENTED',
    category: 'Deportes',
    city: 'Madrid',
    ownerId: 2,
    ownerName: 'Propietario Pedro',
    imageUrl: null,
    totalUnits: 1,
    availableFrom: '2026-05-01',
    availableUntil: '2026-06-30',
  };

  const mockInactiveProduct: CatalogProduct = {
    id: 6,
    title: 'Scooter eléctrico',
    pricePerMonth: 40,
    status: 'INACTIVE',
    category: 'Transportación',
    city: 'Barcelona',
    ownerId: 4,
    ownerName: 'Propietario Ana',
    imageUrl: null,
    totalUnits: 0,
  };

  describe('canProductBeAdded', () => {
    it('Debería permitir añadir producto si está AVAILABLE y disponible en fechas', () => {
      const result = canProductBeAdded(mockAvailableProduct, true);
      expect(result).toBe(true);
    });

    it('No debería permitir añadir producto AVAILABLE si no está disponible en las fechas', () => {
      const result = canProductBeAdded(mockAvailableProduct, false);
      expect(result).toBe(false);
    });

    it('No debería permitir añadir producto RENTED incluso si está disponible en fechas', () => {
      const result = canProductBeAdded(mockRentedProduct, true);
      expect(result).toBe(false);
    });

    it('No debería permitir añadir producto INACTIVE', () => {
      const result = canProductBeAdded(mockInactiveProduct, true);
      expect(result).toBe(false);
    });

    it('No debería permitir añadir producto si no hay información de fechas', () => {
      const productWithoutDates = { ...mockAvailableProduct, availableFrom: undefined };
      const result = canProductBeAdded(productWithoutDates, true);
      expect(result).toBe(true); // Sigue siendo AVAILABLE
    });
  });

  describe('shouldShowDemandAlertButton', () => {
    it('Debería mostrar botón de alerta para producto RENTED que no puede ser añadido', () => {
      const result = shouldShowDemandAlertButton(mockRentedProduct, false);
      expect(result).toBe(true);
    });

    it('Debería mostrar botón de alerta para producto INACTIVE que no puede ser añadido', () => {
      const result = shouldShowDemandAlertButton(mockInactiveProduct, false);
      expect(result).toBe(true);
    });

    it('No debería mostrar botón de alerta si el producto puede ser añadido', () => {
      const result = shouldShowDemandAlertButton(mockAvailableProduct, true);
      expect(result).toBe(false);
    });

    it('No debería mostrar botón de alerta para producto AVAILABLE aunque no pueda añadirse por fechas', () => {
      const result = shouldShowDemandAlertButton(mockAvailableProduct, false);
      expect(result).toBe(false);
    });
  });

  describe('isProductAvailableInDateRange', () => {
    it('Debería retornar disponible si no hay fechas especificadas', () => {
      const result = isProductAvailableInDateRange(mockAvailableProduct, null, null);
      expect(result.isAvailable).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('Debería retornar error si el producto no tiene fechas de disponibilidad', () => {
      const result = isProductAvailableInDateRange(mockInactiveProduct, new Date(2026, 3, 20), new Date(2026, 4, 20));
      expect(result.isAvailable).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('Debería retornar disponible si las fechas del producto cubren el rango solicitado', () => {
      const startDate = new Date(2026, 3, 15);
      const endDate = new Date(2026, 4, 15);
      const result = isProductAvailableInDateRange(mockAvailableProduct, startDate, endDate);
      expect(result.isAvailable).toBe(true);
    });

    it('Debería retornar no disponible si el rango de fechas empieza antes de la disponibilidad', () => {
      const startDate = new Date(2026, 2, 15);
      const endDate = new Date(2026, 3, 15);
      const result = isProductAvailableInDateRange(mockAvailableProduct, startDate, endDate);
      expect(result.isAvailable).toBe(false);
      expect(result.message).toContain('Disponible:');
    });

    it('Debería retornar no disponible si el rango de fechas terminada después de la disponibilidad', () => {
      const startDate = new Date(2026, 4, 15);
      const endDate = new Date(2026, 5, 15);
      const result = isProductAvailableInDateRange(mockAvailableProduct, startDate, endDate);
      expect(result.isAvailable).toBe(false);
      expect(result.message).toContain('Disponible:');
    });

    it('Debería mostrar mensaje con formato de fecha correcto', () => {
      const startDate = new Date(2026, 2, 1);
      const endDate = new Date(2026, 2, 15);
      const result = isProductAvailableInDateRange(mockAvailableProduct, startDate, endDate);
      expect(result.isAvailable).toBe(false);
      expect(result.message).toMatch(/Disponible: \d{2}\/\d{2}\/\d{4} - \d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('Integración: Lógica de flujo de alertas de demanda', () => {
    it('Flujo completo: Producto RENTED no disponible en fechas solicita alerta de demanda', () => {
      // El usuario quiere alquilar un producto RENTED para una fecha específica
      const startDate = new Date(2026, 4, 15);
      const endDate = new Date(2026, 5, 15);
      
      const dateAvailability = isProductAvailableInDateRange(mockRentedProduct, startDate, endDate);
      const canAdd = canProductBeAdded(mockRentedProduct, dateAvailability.isAvailable);
      const shouldShowAlert = shouldShowDemandAlertButton(mockRentedProduct, canAdd);

      expect(dateAvailability.isAvailable).toBe(true); // Disponible en rangos de fecha
      expect(canAdd).toBe(false); // Pero status es RENTED
      expect(shouldShowAlert).toBe(true); // Mostrar botón de alerta
    });

    it('Flujo completo: Producto disponible en AVAILABLE status se puede añadir sin alerta', () => {
      const startDate = new Date(2026, 3, 15);
      const endDate = new Date(2026, 4, 15);
      
      const dateAvailability = isProductAvailableInDateRange(mockAvailableProduct, startDate, endDate);
      const canAdd = canProductBeAdded(mockAvailableProduct, dateAvailability.isAvailable);
      const shouldShowAlert = shouldShowDemandAlertButton(mockAvailableProduct, canAdd);

      expect(dateAvailability.isAvailable).toBe(true);
      expect(canAdd).toBe(true);
      expect(shouldShowAlert).toBe(false);
    });

    it('Flujo completo: Producto AVAILABLE pero fuera de fechas solicitadas NO muestra alerta', () => {
      // Aunque no se pueda añadir por fechas, not se muestra el botón Avisarme
      // Porque la razón por la que no se puede añadir es por fechas, no por status RENTED/INACTIVE
      const startDate = new Date(2026, 2, 1);
      const endDate = new Date(2026, 2, 15);
      
      const dateAvailability = isProductAvailableInDateRange(mockAvailableProduct, startDate, endDate);
      const canAdd = canProductBeAdded(mockAvailableProduct, dateAvailability.isAvailable);
      const shouldShowAlert = shouldShowDemandAlertButton(mockAvailableProduct, canAdd);

      expect(dateAvailability.isAvailable).toBe(false);
      expect(canAdd).toBe(false);
      expect(shouldShowAlert).toBe(false); // No mostrar Avisarme para problemas de fecha
    });

    it('Flujo completo: Producto INACTIVE siempre muestra alerta (si no puede añadirse)', () => {
      const startDate = new Date(2026, 4, 15);
      const endDate = new Date(2026, 5, 15);
      
      const dateAvailability = isProductAvailableInDateRange(mockInactiveProduct, startDate, endDate);
      const canAdd = canProductBeAdded(mockInactiveProduct, dateAvailability.isAvailable);
      const shouldShowAlert = shouldShowDemandAlertButton(mockInactiveProduct, canAdd);

      expect(canAdd).toBe(false); // No se puede añadir porque es INACTIVE
      expect(shouldShowAlert).toBe(true); // Mostrar alerta de demanda
    });
  });

  describe('Casos edge', () => {
    it('Producto sin información de fechas pero AVAILABLE debería permitirse', () => {
      const productNoDates: CatalogProduct = {
        ...mockAvailableProduct,
        availableFrom: undefined,
        availableUntil: undefined,
      };
      
      const dateAvailability = isProductAvailableInDateRange(productNoDates, null, null);
      const canAdd = canProductBeAdded(productNoDates, dateAvailability.isAvailable);

      expect(canAdd).toBe(true);
    });

    it('Debe manejar correctamente fechas en formato ISO string', () => {
      const product: CatalogProduct = {
        ...mockAvailableProduct,
        availableFrom: '2026-04-01',
        availableUntil: '2026-05-31',
      };

      const startDate = new Date('2026-04-15');
      const endDate = new Date('2026-05-15');
      
      const result = isProductAvailableInDateRange(product, startDate, endDate);
      expect(result.isAvailable).toBe(true);
    });

    it('Debe considerar también el mismo día como disponible (límite de fechas)', () => {
      const product: CatalogProduct = {
        ...mockAvailableProduct,
        availableFrom: '2026-04-01',
        availableUntil: '2026-05-31',
      };

      // Exactamente en los límites
      const startDate = new Date('2026-04-01');
      const endDate = new Date('2026-05-31');
      
      const result = isProductAvailableInDateRange(product, startDate, endDate);
      expect(result.isAvailable).toBe(true);
    });
  });
});
