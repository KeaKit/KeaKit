# Bugs encontrados por el equipo – PPL

El presente documento recoge los bugs detectados de forma interna por el equipo durante el PPL. Se indica el estado actual de cada uno y su nivel de prioridad.

---

## ✅ Done – Finalizados

La gran mayoría de los bugs técnicos detectados han sido ya resueltos durante el sprint.

### 🔴 Prioridad Alta

| Issue | Descripción |
|-------|-------------|
| #653 | Usuario congelado si el token expira durante la actualización de política de privacidad |
| #730 | No se devuelve la garantía al marcar un objeto devuelto como dañado |
| #741 | Pantalla de pago accesible con datos inválidos desde un kit en draft |
| #822 | El dinero no llega correctamente si el alquiler abarca meses con decimales |
| #831 | Se pueden alquilar kits en draft con fechas de inicio y fin en el pasado |

### 🟡 Prioridad Media

| Issue | Descripción |
|-------|-------------|
| #695 | Error "Tracking Not Found" en el seguimiento del pedido |
| #691 | Posibilidad de valorar la devolución de artículos que no han sido alquilados |
| #719 | El estado "Tu pedido llega hoy" permanece fijo en alquileres activos e idioma incorrecto en `KitDetails` |
| #729 | Se puede evaluar la misma devolución varias veces |
| #821 | No se indica al usuario que se le cobra comisión |
| #824 | Posibilidad de crear un kit en draft sin objetos, lo que impide el pago posterior |
| #827 | Desglose de precio incorrecto en el correo electrónico |

### 🔵 Prioridad Baja / Interfaz

| Issue | Descripción |
|-------|-------------|
| #655 | No se pueden crear artículos con el precio mínimo exacto de su categoría |
| #656 | Los cambios realizados por el admin en datos de un usuario no se reflejan en su sesión activa |
| #662 | Falta de validación de formato en el campo de porcentaje de comisión |
| #668 | El scroll no funciona en la pantalla de edición de usuarios del admin |
| #679 | Error 400 al intentar crear un código promocional con nombre duplicado |
| #683 | La bonificación por usuario piloto no se visualiza en la interfaz |
| #703 | El formulario de edición de artículos carga la ciudad pero no el país |
| #717 | La campana de notificaciones provoca la desaparición de la navbar |
| #765 | El artículo "Macbook" aparece como disponible mientras está siendo alquilado |

---

## 🔄 In Progress – En curso

Bugs en los que el equipo está trabajando actualmente.

| Issue | Prioridad | Descripción |
|-------|-----------|-------------|
| #805 | 🔴 Alta | Devolución de garantía que nunca ha sido cobrada |
| #673 | 🔴 Alta | Error en consola "Artículo no encontrado" al procesar el pago con servicio |
| #808 | 🔴 Alta | Disponibilidad errónea tras una evaluación prematura |

---

## 🔍 In Review – En revisión

Bugs con solución propuesta pendientes de aprobación final (PR abierta).

| Issue | Prioridad | Descripción |
|-------|-----------|-------------|
| #682 | 🔴 Alta | Stripe error `balance_insufficient` al intentar retirar ingresos (CU-ARRENDADOR-05) |
| #728 | 🔵 Baja | Los kits recién alquilados aparecen al final de la lista en lugar de al principio |
| #820 | 🔵 Baja | Las flechas de "volver atrás" son visualmente inconsistentes entre pantallas |

---

## ⚪ Todo – Pendientes de iniciar

Tareas identificadas que aún no han sido comenzadas.

| Issue | Prioridad | Descripción |
|-------|-----------|-------------|
| #718 | 🔵 Baja | Problemas de idioma en la sección Wallet y mejora del desglose de precio |
| #726 | 🔵 Baja | Presencia de funciones marcadas como "próximamente" en el panel de administración |
| #803 | 🟡 Media | Mensaje de devolución de garantía enviado al usuario incorrecto |

---

## Resumen

| Estado | Nº de bugs |
|--------|-----------|
| ✅ Done | 21 |
| 🔄 In Progress | 3 |
| 🔍 In Review | 3 |
| ⚪ Todo | 3 |
| **Total** | **30** |


---

# Historial de versiones

| Versión | Fecha | Descripción | Autor |
|--------|--------|-------------|--------|
| 1.0.0 | 12/05/2026 | Análisis final con correcciones | Paula Rosa González Páez |

**Redactado por:** Paula Rosa González Páez
**Fecha de redacción:** 12/05/2026  
**Versión:** 1.0.0