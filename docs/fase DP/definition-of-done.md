# Documento: Definición de Hecho (Definition of Done - DoD)
**Proyecto:** Plataforma de Alquiler de Kits 
**Versión:** 1.1 (Priorización Core vs Extras)

---

## 1. Criterios Generales de Desarrollo (CORE)
* **Funcionalidad Completa:** El código satisface los criterios de aceptación de la HU.
* **Validación de Entradas:** Formularios validan datos obligatorios (fotos, precios, ciudades y fechas).
* **Gestión de Errores:** Mensajes claros (ej. "Objeto no disponible").
* **Refactorización:** Código limpio y sin comentarios innecesarios.
* **Pruebas Completas:** Todas las pruebas unitarias y funcionales son correctas.
* **Documentación:** El código fuente está debidamente documentado.
* **Repositorio:** Los cambios están actualizados y subidos al repositorio correspondiente.
* **Compatibilidad:** Se han realizado las pruebas en los dispositivos y navegadores acordados.
* **Criterios de Aceptación:** Se cumplen todos los criterios de aceptación específicos de la historia de usuario.
* **Calidad de Texto:** La ortografía y gramática de la interfaz han sido revisadas.

## 2. Criterios Específicos por Rol (CORE)
* **Arrendatario:** Cálculo de precio total (inicio/fin) y flujo de pago con 20% de garantía.
* **Arrendador:** Bloqueo de edición/borrado de objetos alquilados y división de pago 50/50.
* **Administrador:** Gestión de categorías y rangos de precio operativos.

---

## 3. Pruebas y QA (Aseguramiento de Calidad)

### Nivel CORE 
* **Flujo E2E Crítico:** Registro -> Subir Objeto -> Armar Kit -> Pago -> Confirmación -> Devolución.
* **Seguridad de Datos:** Verificación de que un usuario no puede acceder a datos ajenos mediante manipulación de IDs en la URL.
* **Integración de Pagos:** Transacciones exitosas en *sandbox* validando el reparto 50/50 y la retención del 20%.
* **Estado de Inventario:** El objeto alquilado desaparece de las búsquedas y el calendario del arrendador queda bloqueado.
* **Casos de Límites (Edge Cases):** Bloqueo de fechas pasadas, alquileres de duración mínima y solapamiento de reservas.
* **Integridad de Base de Datos:** Verificación de que al borrar un usuario (cumpliendo condiciones), no queden registros "huérfanos".
* **Code Review:** Revisión por pares terminada y aprobación de arquitectura.

### Nivel EXTRAS (Mejoras de producto)
* **Persistencia de Borradores:** Recuperación del kit personalizado tras cierre de sesión o fallo de conexión.
* **Carga y Rendimiento:** Estabilidad de la búsqueda de artículos con carga de usuarios concurrentes.
* **Notificaciones Multi-canal:** Validación de que los triggers de email/push llegan en el tiempo exacto (HU23).
* **Usabilidad Avanzada:** Pruebas de navegación "sin salida" (asegurar botones de cancelar/atrás siempre visibles).
* **Compatibilidad:** Funcionamiento verificado en Chrome, Safari y Firefox.

---

## 4. Checklist Final de Entrega

### Bloque 1: Entregables CORE (Hitos de Negocio)
| Criterio | Descripción | Verificación |
| :--- | :--- | :---: |
| **Flujo de Pago 50/50** | El primer 50% llega al arrendador y el resto queda retenido por la plataforma. | [ ] |
| **Garantía (20%)** | La retención y devolución automática del depósito (HU40) funciona tras el OK. | [ ] |
| **Cálculo de Fechas** | El sistema calcula el precio exacto por días y bloquea el calendario de forma efectiva. | [ ] |
| **Gestión de Daños** | El reporte de daños (HU33/35) bloquea el pago al arrendador y la fianza al arrendatario. | [ ] |
| **Consistencia Local** | Los kits solo muestran objetos disponibles en la ciudad destino seleccionada (HU5). | [ ] |
| **Control Admin** | El admin puede modificar comisiones, rangos de precio y ver estadísticas reales. | [ ] |
| **Privacidad Core** | Encriptación de contraseñas y protección de datos sensibles de pago. | [ ] |
| **Despliegue** | Código mergeado y funcional en entorno de staging sin errores de consola. | [ ] |

### Bloque 2: Entregables EXTRAS (Mejoras de Experiencia)
| Criterio | Descripción | Verificación |
| :--- | :--- | :---: |
| **Sistema de Feedback** | Valoraciones (HU34 y HU30) visibles en el perfil del objeto y del usuario. | [ ] |
| **Logística Flexible** | Registro correcto de la elección entre mensajería o punto de encuentro (HU20). | [ ] |
| **Filtros Avanzados** | Búsqueda por categorías, "Ampliar búsqueda" (HU11) y avisos de costes extra. | [ ] |
| **Disponibilidad** | Botón "Avisarme" (HU10) y generación de alerta cuando hay nuevo stock. | [ ] |
| **Documentación** | Manual de uso rápido y documentación técnica del API/Base de datos. | [ ] |
| **UX de Error** | Pantallas de error personalizadas. | [ ] |

---

> **Aprobación:** Este documento actúa como contrato de calidad entre el equipo de desarrollo y los interesados del proyecto. El equipo se compromete a priorizar el **Bloque 1 (CORE)**. Los elementos del **Bloque 2 (EXTRAS)** se desarrollarán e integrarán solo si el cronograma lo permite, sin comprometer la estabilidad del núcleo del sistema.