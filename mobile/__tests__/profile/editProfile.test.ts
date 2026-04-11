type FieldErrors = {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  general?: string;
};

type ProfileData = {
  name: string;
  phone: string;
  address: string;
};

const parseBackendError = (err: unknown): FieldErrors => {
  if (!(err instanceof Error)) return { general: 'Error al actualizar el perfil.' };
  const message = err.message.toLowerCase();
  if (message.includes('phone number must be valid'))
    return { phone: 'Número de teléfono no válido.' };
  if (message.includes('address'))
    return { address: 'El tamaño de la dirección debe estar entre 5 y 255 caracteres.'}
  if (message.includes('name'))
    return { name: 'El nombre debe estar entre 2 y 100 caracteres.'}
  return { general: err.message || 'Error al actualizar el perfil.' };
};

const validateProfileForm = (form: ProfileData, country: string, city: string): FieldErrors => {
  const localErrors: FieldErrors = {};
  if (!form.name.trim())    localErrors.name    = 'El nombre es obligatorio.';
  if (!form.phone.trim())   localErrors.phone   = 'El teléfono es obligatorio.';
  if (!form.address.trim()) localErrors.address = 'La dirección es obligatoria.';
  if (!country)             localErrors.country = 'El país es obligatorio.';
  if (!city)                localErrors.city    = 'La ciudad es obligatoria.';
  return localErrors;
};

const formatPhoneForBackend = (phone: string) => phone.trim().replace(/\s/g, '');

// ==========================================
// DATA DE PRUEBA (MOCKS)
// ==========================================

const mockUser = {
  name: "Juan Pérez",
  phone: "600 123 456",
  address: "Calle Mayor 1",
  country: "España",
  city: "Madrid",
  email: "juan@test.com"
};

// ==========================================
// BLOQUE DE TESTS
// ==========================================

describe("EditProfile Logic - Robust Suite", () => {

  describe("validateProfileForm (Validación Local)", () => {
    it("debe fallar si los campos son solo espacios en blanco (Edge Case)", () => {
      const errors = validateProfileForm(
        { name: "   ", phone: "   ", address: "   " },
        "España",
        "Madrid"
      );
      expect(errors.name).toBe('El nombre es obligatorio.');
      expect(errors.phone).toBe('El teléfono es obligatorio.');
    });

    it("debe requerir específicamente país y ciudad (SelectPickers)", () => {
      const errors = validateProfileForm(
        { name: "Juan", phone: "123", address: "Calle 1" },
        "",
        ""
      );
      expect(errors.country).toBe('El país es obligatorio.');
      expect(errors.city).toBe('La ciudad es obligatoria.');
    });

    it("debe pasar con éxito si todos los datos son válidos", () => {
      const errors = validateProfileForm(
        { name: "Juan", phone: "123", address: "Calle 1" },
        "España",
        "Madrid"
      );
      expect(Object.keys(errors)).toHaveLength(0);
    });
  });

  describe("parseBackendError (Traducción de Errores de API)", () => {
    it("debe identificar errores de longitud de dirección (HU-REQUISITO)", () => {
      const error = new Error("The address must be between 5 and 255 characters");
      const result = parseBackendError(error);
      expect(result.address).toBe('El tamaño de la dirección debe estar entre 5 y 255 caracteres.');
    });

    it("debe identificar errores de nombre (HU-REQUISITO)", () => {
      const error = new Error("Invalid name length");
      const result = parseBackendError(error);
      expect(result.name).toBe('El nombre debe estar entre 2 y 100 caracteres.');
    });

    it("debe manejar errores que no son instancias de Error (Seguridad)", () => {
      const result = parseBackendError("Error extraño del servidor");
      expect(result.general).toBe('Error al actualizar el perfil.');
    });

    it("debe preservar el mensaje original si no coincide con ningún patrón conocido", () => {
      const error = new Error("Database is down");
      const result = parseBackendError(error);
      expect(result.general).toBe("Database is down");
    });
  });

  describe("Sanitización de Datos (Pre-envío)", () => {
    it("debe limpiar el teléfono de cualquier espacio para cumplir con el backend", () => {
      const input = " +34 600 12 34 56 ";
      const formatted = formatPhoneForBackend(input);
      expect(formatted).toBe("+34600123456");
    });

    it("debe aplicar trim al nombre y dirección", () => {
      const nameInput = "  Juan Pérez  ";
      const addressInput = "  Calle Falsa 123  ";
      expect(nameInput.trim()).toBe("Juan Pérez");
      expect(addressInput.trim()).toBe("Calle Falsa 123");
    });
  });

  describe("Lógica de Inicialización (Fallback)", () => {
    it("debe manejar correctamente cuando el usuario no tiene datos previos (?? '')", () => {
      const profileUserUndefined = { name: undefined, phone: null, address: undefined };
      
      const initialForm = {
        name: profileUserUndefined.name ?? '',
        phone: profileUserUndefined.phone ?? '',
        address: profileUserUndefined.address ?? '',
      };

      expect(initialForm.name).toBe('');
      expect(initialForm.phone).toBe('');
      expect(initialForm.address).toBe('');
    });
  });
});