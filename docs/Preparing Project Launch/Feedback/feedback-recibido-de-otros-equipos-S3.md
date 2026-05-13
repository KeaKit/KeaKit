# Análisis del feedback de otros grupos - Sprint 3

## Índice

- [Análisis del feedback de otros grupos - Sprint 3](#análisis-del-feedback-de-otros-grupos---sprint-3)
  - [Índice](#índice)
  - [1. Introducción](#1-introducción)
  - [2. Resumen General del Feedback](#2-resumen-general-del-feedback)
  - [3. Análisis detallado por caso de uso](#3-análisis-detallado-por-caso-de-uso)
    - [CU-GENERAL-04 – Soporte](#cu-general-04--soporte)
    - [CU-GENERAL-06 – Descuentos según nivel de usuario piloto](#cu-general-06--descuentos-según-nivel-de-usuario-piloto)
    - [CU-GENERAL-07 – Implementar GDPR](#cu-general-07--implementar-gdpr)
    - [CU-ARRENDADOR-01 – Subida de artículos](#cu-arrendador-01--subida-de-artículos)
    - [CU-ARRENDADOR-02 – Listado de artículos subidos](#cu-arrendador-02--listado-de-artículos-subidos)
    - [CU-ARRENDADOR-03 – Gestión de artículos subidos](#cu-arrendador-03--gestión-de-artículos-subidos)
    - [CU-ARRENDADOR-05 – Retirada de ingresos](#cu-arrendador-05--retirada-de-ingresos)
    - [CU-ARRENDADOR-10 – Historial de alquileres de un objeto](#cu-arrendador-10--historial-de-alquileres-de-un-objeto)
    - [CU-ARRENDADOR-11 – Descuento según nivel de usuario piloto](#cu-arrendador-11--descuento-según-nivel-de-usuario-piloto)
    - [CU-ARRENDATARIO-01 – Creación de kits](#cu-arrendatario-01--creación-de-kits)
    - [CU-ARRENDATARIO-04 – Pago del kit](#cu-arrendatario-04--pago-del-kit)
    - [CU-ARRENDATARIO-11 – Historial de alquileres](#cu-arrendatario-11--historial-de-alquileres)
    - [CU-ADMIN-01 – Gestión de categorías](#cu-admin-01--gestión-de-categorías)
    - [CU-ADMIN-04 – Gestión de usuarios](#cu-admin-04--gestión-de-usuarios)
    - [CU-ADMIN-05 – Configuración modelo negocio](#cu-admin-05--configuración-modelo-negocio)
    - [CU-ADMIN-06 – Creación kits predeterminados](#cu-admin-06--creación-kits-predeterminados)
  - [4. Clasificación de incidencias](#4-clasificación-de-incidencias)
  - [5. Priorización (MoSCoW) – Una fila por incidencia](#5-priorización-moscow--una-fila-por-incidencia)
  - [6. Plan de acción](#6-plan-de-acción)
  - [7. Historial de versiones](#7-historial-de-versiones)

## 1. Introducción

El presente documento recoge el análisis del feedback proporcionado por los grupos **Rooma** y **Bookmerang** tras actuar como usuarios piloto sobre la versión del Sprint 3 de la aplicación KeaKit.  
El objetivo es identificar los fallos, carencias y sugerencias de mejora para priorizar las correcciones en el siguiente ciclo de desarrollo.

## 2. Resumen General del Feedback

| Categoría CU    | Nº de incidencias | Severidad predominante | Comentarios generales                                                                                                     |
| --------------- | ----------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| CU-GENERAL      | 3                 | Media                  | Fallos en lógica de descuentos y GDPR, error en creación de incidencias                                                   |
| CU-ARRENDADOR   | 7                 | Alta                   | Validaciones ausentes (título, unidades, precios), errores con Stripe y estados incorrectos                               |
| CU-ARRENDATARIO | 3                 | Media/Alta             | Error en pago, selección de servicios no disponibles, fechas mal mostradas                                                |
| CU-ADMIN        | 4                 | Media/Baja             | Inconsistencias en validación de categorías, falta de actualización en tiempo real; CU-ADMIN-05 y CU-ADMIN-06 no probados |

## 3. Análisis detallado por caso de uso

A continuación se integran las incidencias reportadas por ambos grupos piloto.

### CU-GENERAL-04 – Soporte

**Incidencias reportadas:**

- **Rooma (T11):** Error “Type definition error: [simple type, class com.example.demo.model.Item]” al intentar crear una incidencia sobre un objeto dañado.
- **Rooma (Sugerencia):** Las incidencias pasan directamente de “abierta” a “resuelta” sin un estado “en progreso”. Sugieren usar WebSockets para actualizaciones en tiempo real.

**Impacto:**

- Funcionalidad de soporte inutilizable.
- Mala experiencia de usuario al no ver el progreso de su incidencia.

**Acciones propuestas:**

- Revisar el modelo de datos y el mapeo de tipos en el backend.
- Añadir estado “en progreso” al flujo de incidencias.

### CU-GENERAL-06 – Descuentos según nivel de usuario piloto

**Incidencias reportadas:**

- **Rooma (T13):** Error 400 al intentar crear un mismo código promocional.
- **Rooma (Sugerencia):** No debería permitirse un descuento del 0% (rango lógico 1-100).
- **Rooma (Sugerencia):** Los códigos de un solo uso deberían desaparecer de la lista del admin o mostrarse en gris como ya utilizados.

**Impacto:**

- Duplicidad de códigos.
- Posible confusión en la gestión de promociones.

**Acciones propuestas:**

- Añadir validación de unicidad del código en backend.
- Restringir valores de descuento entre 1 y 100.
- Marcar códigos usados en el listado de administración.

### CU-GENERAL-07 – Implementar GDPR

**Incidencias reportadas:**

- **Rooma (Sugerencia):** No se encuentra la posibilidad de borrar información sensible.

**Impacto:**

- Incumplimiento normativo.
- Riesgo legal.

**Acciones propuestas:**

- Implementar funcionalidad de borrado de cuenta o datos personales.
- Revisar el cumplimiento de acceso, rectificación y supresión.

### CU-ARRENDADOR-01 – Subida de artículos

**Incidencias reportadas:**

- **Rooma (T11):** No hay validador de caracteres en el título → panic error.
- **Rooma (T11):** No hay validador para el número de unidades (se permiten valores enormes como 1e+122) → panic error.
- **Bookmerang (T12):** Rango de precios indicado en la subida de artículo 0 euros.

**Revisión de reporte:**

- El precio mínimo del rango de precios de la subida de un artículo concuerda con el rango de precios de la categoría seleccionada, no es una inconsistencia, pues son rangos establecidos por los administradores. Se podría añadir una validación para el precio mínimo de los rangos.

**Impacto:**

- Funcionalidad crítica rota.
- Datos corruptos o caída del servidor.

**Acciones propuestas:**

- Añadir validaciones de longitud y tipo en frontend y backend.
- Limitar el campo `totalUnits` a un rango razonable (ej. 1-9999).
- Añadir validación de precio mínimo del rango de precios de una categoría.

### CU-ARRENDADOR-02 – Listado de artículos subidos

**Incidencias reportadas:**

- **Rooma (T13):** En el filtrado por rango de precios no hay validación: se permiten strings, números negativos o mínimo > máximo.
- **Bookmerang (T12):** Artículos listados como finalizados cuando el rango de disponibilidad termina en el futuro

**Revisión de reporte:**

- Los artículos cuyos estados presentan inconsistencias debido a sus rangos de disponibilidad se deben a los seeders, lo cual no significa que la funcionalidad no funcione de forma correcta.

**Impacto:**

- Búsquedas inconsistentes.
- Posibles errores en consultas.

**Acciones propuestas:**

- Validar que ambos campos sean numéricos y que mínimo ≤ máximo.
- Revisar y actualizar seeders para que contengan información coherente.

### CU-ARRENDADOR-03 – Gestión de artículos subidos

**Incidencias reportadas:**

- **Rooma (T11):** Mismos fallos de validación que en subida (título, unidades).
- **Rooma (Sugerencia):** Si un artículo está alquilado, ocultar los botones de editar y borrar.
- **Bookmerang (T12):** Al guardar un artículo sin cambios, error `availableFrom cannot be in the past` aunque las fechas son vigentes.

**Revisión de reporte:**

- Ese error no aparece al replicar los pasos seguidos (poniendo una fecha de disponibilidad correcta y al editar el artículo, guardar sin realizar cambios).

**Impacto:**

- Mala experiencia de usuario.

**Acciones propuestas:**

- Corregir la comprobación de fechas (posible problema con zona horaria o comparación).
- Implementar la ocultación condicional de botones.
- Reforzar validaciones en backend y frontend.

### CU-ARRENDADOR-05 – Retirada de ingresos

**Incidencias reportadas:**

- **Rooma (T11):** Error de Stripe `balance_insufficient` aunque se solicita una cantidad menor al saldo mostrado.
- **Rooma / Bookmerang (T12):** Los mensajes de error de Stripe se muestran directamente al usuario (no son comprensibles).

**Impacto:**

- Usuarios no pueden retirar su saldo.
- Mensajes técnicos confunden al usuario.

**Acciones propuestas:**

- Revisar la lógica de comprobación de saldo antes de llamar a Stripe.
- Traducir los mensajes de error de Stripe a textos amigables.

### CU-ARRENDADOR-10 – Historial de alquileres de un objeto

**Incidencias reportadas:**

- **Bookmerang (T12):** Objetos con fechas vigentes (14/04/2026 - 14/05/2026) aparecen como “finalizado”.

**Impacto:**

- Información incorrecta para el propietario.
- Posibles errores de gestión.

**Acciones propuestas:**

- Revisar y actualizar seeders para que contengan información coherente.

### CU-ARRENDADOR-11 – Descuento según nivel de usuario piloto

**Incidencias reportadas:**

- **Rooma (Sugerencia):** Se ha asignado una bonificación, pero no está claro dónde se aplica ni se visualiza.

**Impacto:**

- El usuario no percibe el beneficio.

**Acciones propuestas:**

- Mostrar de forma explícita el descuento aplicado en el resumen de publicación o comisión.
- Añadir mensajes de confirmación.

### CU-ARRENDATARIO-01 – Creación de kits

**Incidencias reportadas:**

- **Bookmerang (T12):** En la lista de adición de artículos aparece un servicio “Servicio Prueba” que ya se había comprado en ese rango, pero no está disponible (no aparece en el mapa y al comprar da error).

**Impacto:**

- Usuario puede intentar alquilar algo no disponible.
- Flujo roto.

**Acciones propuestas:**

- Filtrar servicios no disponibles según fechas.
- Sincronizar disponibilidad con el mapa y el botón de compra de los servicios.

### CU-ARRENDATARIO-04 – Pago del kit

**Incidencias reportadas:**

- **Rooma (T11):** Error de Stripe al tratar de pagar con tarjeta.

**Impacto:**

- Proceso de alquiler bloqueado.
- Pérdida de conversión.

**Acciones propuestas:**

- Revisar la integración con Stripe (claves, webhooks, manejo de excepciones).
- Añadir logs detallados para identificar el error concreto.

### CU-ARRENDATARIO-11 – Historial de alquileres

**Incidencias reportadas:**

- **Bookmerang (T12):** Un alquiler que finaliza el 18/05/2026 aparece como “finalizado” antes de tiempo.

**Impacto:**

- Confusión para el arrendatario.
- Similar al problema de CU-ARRENDADOR-10.

**Acciones propuestas:**

- Unificar la lógica de cálculo de estado entre arrendadores y arrendatarios.
- Revisar fechas y zona horaria.

### CU-ADMIN-01 – Gestión de categorías

**Incidencias reportadas:**

- **Bookmerang (T12):** El admin puede crear una categoría con precio mínimo 0 euros, pero luego el owner, al crear un artículo con esa categoría y su precio mínimo, no lo permite (inconsistencia).

**Impacto:**

- Bloqueo en la creación de artículos.
- Datos inconsistentes.

**Acciones propuestas:**

- Unificar la validación entre la creación de categorías y la creación de artículos.
- Si se permite mínimo 0, que el owner también pueda usar ese valor.

### CU-ADMIN-04 – Gestión de usuarios

**Incidencias reportadas:**

- **Bookmerang (T12):** Cuando el admin modifica el nombre de un usuario activo, el cambio no se refleja en su sesión (sigue viendo el nombre antiguo). En cambio, si el usuario se modifica a sí mismo, sí se actualiza.

**Impacto:**

- Inconsistencia de datos visuales.
- Mala experiencia para el usuario editado por admin.

**Acciones propuestas:**

- Implementar un mecanismo de refresco de sesión o notificación al usuario cuando el admin modifique sus datos.
- Sincronizar los datos del usuario logueado con la base de datos en cada carga de página.

### CU-ADMIN-05 – Configuración modelo negocio

**Incidencias reportadas:**

- **Rooma:** No se pudo probar (sin tiempo).
- **Bookmerang:** No se pudo probar.

**Impacto:**

- Falta de cobertura de pruebas sobre una funcionalidad crítica (comisión de la plataforma).

**Acciones propuestas:**

- Planificar pruebas específicas para el siguiente sprint.
- Revisar que los parámetros de comisión se apliquen correctamente en los cálculos de pago.

### CU-ADMIN-06 – Creación kits predeterminados

**Incidencias reportadas:**

- **Rooma:** No se pudo probar (sin tiempo).
- **Bookmerang:** No se pudo probar.

**Impacto:**

- Funcionalidad no validada. Podría contener errores o no estar alineada con la lógica de creación de kits por parte del arrendatario.

**Acciones propuestas:**

- Planificar pruebas de creación de kits predeterminados y su visibilidad para arrendatarios.
- Asegurar consistencia con CU-ARRENDATARIO-01.

## 4. Clasificación de incidencias

| Tipo de incidencia            | Nº  | Ejemplos                                                                                                                               |
| ----------------------------- | --- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Validación de datos           | 7   | Título, unidades, rangos de precio (filtro), descuento 0%, código duplicado                                                            |
| Integración con Stripe        | 2   | Balance insuficiente, errores de pago                                                                                                  |
| Lógica de negocio / estados   | 5   | Incidencias sin “en progreso”, alquileres finalizados antes de tiempo, disponibilidad inconsistente, falta de cobertura en admin 05/06 |
| UX / Interfaz                 | 3   | Mensajes técnicos de Stripe, bonificaciones no visibles, botones visibles cuando no deben                                              |
| Cumplimiento normativo        | 1   | Falta opción de borrado GDPR                                                                                                           |
| Sincronización en tiempo real | 1   | Cambio de nombre por admin no se refleja                                                                                               |

## 5. Priorización (MoSCoW) – Una fila por incidencia

| Prioridad         | Incidencia                                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Must**          | [CU-GENERAL-04] Error “Type definition error” al crear incidencia (500)                                              |
| **Must**          | [CU-ARRENDADOR-01] Sin validador de título → panic error                                                             |
| **Must**          | [CU-ARRENDADOR-01] Sin validador de número de unidades (valores enormes) → panic error                               |
| **Must**          | [CU-ARRENDADOR-05] Stripe error `balance_insufficient` aunque saldo suficiente                                       |
| **Must**          | [CU-ARRENDATARIO-04] Error de Stripe al pagar con tarjeta                                                            |
| **Must**          | [CU-GENERAL-06] Error 400 al crear un mismo código promocional (duplicado)                                           |
| **Must**          | [CU-ARRENDADOR-02] Artículos listados como finalizados cuando están vigentes (seeders incorrectos)                   |
| **Must**          | [CU-ARRENDADOR-10] Objetos con fechas vigentes aparecen como “finalizado”                                            |
| **Must**          | [CU-ARRENDATARIO-11] Alquiler que finaliza en futuro aparece como “finalizado”                                       |
| **Should**        | [CU-GENERAL-04] Falta estado “en progreso” en incidencias                                                            |
| **Should**        | [CU-GENERAL-06] Se permite descuento del 0% (debería ser 1-100)                                                      |
| **Should**        | [CU-ARRENDADOR-02] Filtro de precios sin validación (strings, negativos, min>max)                                    |
| **Should**        | [CU-ARRENDADOR-03] Botones editar/borrar visibles aunque artículo esté alquilado                                     |
| **Should**        | [CU-ARRENDADOR-05] Mensajes de error de Stripe no comprensibles para el usuario                                      |
| **Should**        | [CU-ARRENDATARIO-01] Servicio “Prueba” aparece como seleccionable pero no disponible                                 |
| **Should**        | [CU-ADMIN-04] Cambio de nombre por admin no se refleja en sesión del usuario                                         |
| **Should**        | [CU-ARRENDADOR-11] Bonificación por piloto no se visualiza claramente                                                |
| **Should**        | [CU-ADMIN-01] Inconsistencia: admin permite precio mínimo 0, owner no puede usarlo                                   |
| **Could**         | [CU-GENERAL-06] Códigos de un solo uso usados deberían ocultarse o mostrarse en gris                                 |
| **Could**         | [CU-ARRENDADOR-01] Añadir validación de precio mínimo del rango de categoría                                         |
| **Could**         | [CU-ARRENDADOR-03] Error “availableFrom cannot be in the past” al editar sin cambios (no reproducible, pero revisar) |
| **Could**         | [CU-GENERAL-07] Falta opción de borrado de datos sensibles (GDPR)                                                    |
| **Won’t (ahora)** | [CU-GENERAL-04] WebSockets para incidencias en tiempo real (se hará con polling)                                     |
| **Won’t (ahora)** | [CU-ADMIN-05] Funcionalidad no probada (configuración modelo negocio) – planificar pruebas                           |
| **Won’t (ahora)** | [CU-ADMIN-06] Funcionalidad no probada (creación kits predeterminados) – planificar pruebas                          |

## 6. Plan de acción

| Tarea                                                                                                                           | Responsable               | Fecha estimada | Estado    |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | -------------- | --------- |
| [BUG] Error “Type definition error” al crear incidencia - CU-GENERAL-04                                                         | Equipo backend            | 00/00/2026     | TO DO     |
| [BUG] Error 400 al crear código promocional duplicado - CU-GENERAL-06                                                           | Equipo backend            | 00/00/2026     | TO DO     |
| [BUG] Falta opción de borrado de datos sensibles (GDPR) - CU-GENERAL-07                                                         | Equipo backend            | 00/00/2026     | TO DO     |
| [BUG] Sin validador de título y unidades disponibles - CU-ARRENDADOR-01 y CU-ARRENDADOR-03                                      | Equipo backend + frontend | 00/00/2026     | TO DO     |
| [BUG] No deja crear un artículo con el precio mínimo de la categoría - CU-ARRENDADOR-01                                         | Equipo 3                  | 24/04/2026     | Done      |
| [BUG] Filtro de precios sin validación - CU-ARRENDADOR-02                                                                       | Equipo frontend           | 00/00/2026     | TO DO     |
| [BUG] Inconsistencia en los datos del seeder para artículos alquilados - CU-ARRENDADOR-02                                       | Equipo 3                  | 22/05/2026     | Done      |
| [BUG] Stripe error balance_insufficient - CU-ARRENDADOR-05                                                                      | Equipo pagos              | 00/00/2026     | TO DO     |
| [BUG] Bonificación por piloto no se visualiza - CU-ARRENDADOR-11                                                                | Equipo frontend           | 00/00/2026     | Pendiente |
| [BUG] Disponibilidad inconsistente entre lista y mapa - CU-ARRENDATARIO-01                                                      | Equipo backend            | 00/00/2026     | Pendiente |
| [BUG] Si el admin modifica los datos de un usuario activo, los cambios no se reflejan en la sesión de ese usuario - CU-ADMIN-04 | Equipo 3                  | 29/04/2026     | In review |
| [BUG] Validación de formato en porcentaje de comisión                                                                           | Equipo 3                  | 29/04/2026     | In review |
| [BUG] Procesar el pago devuelve error en la consola de Artículo no encontrado con servicio                                      | Equipo frontend           | 28/04/2026     | TO DO     |

## 7. Historial de versiones

| Versión | Fecha      | Descripción                                                         | Autor(es)                         |
| ------- | ---------- | ------------------------------------------------------------------- | --------------------------------- |
| 1.0.0   | 29/04/2026 | Creación del análisis de feedback del Sprint 3 (Rooma y Bookmerang) | Candela Jazmín Gutiérrez González |

**Redactado por:** Candela Jazmín Gutiérrez González  
**Fecha de redacción:** 29/04/2026  
**Versión:** 1.0.0
