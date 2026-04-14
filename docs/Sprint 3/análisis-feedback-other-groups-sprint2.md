# Análisis del feedback de otros grupos – Sprint 2

## Índice

- [Análisis del feedback de otros grupos – Sprint 2](#análisis-del-feedback-de-otros-grupos--sprint-2)
  - [Índice](#índice)
  - [1. Introducción](#1-introducción)
  - [2. Resumen General del Feedback](#2-resumen-general-del-feedback)
  - [3. Análisis detallado por caso de uso](#3-análisis-detallado-por-caso-de-uso)
    - [CU-GENERAL-01 – Inicio de sesión y registro](#cu-general-01--inicio-de-sesión-y-registro)
    - [CU-GENERAL-03 – Valoraciones](#cu-general-03--valoraciones)
    - [CU-GENERAL-04 – Creación de incidencias](#cu-general-04--creación-de-incidencias)
    - [CU-ARRENDADOR-03 – Gestión de artículos subidos](#cu-arrendador-03--gestión-de-artículos-subidos)
    - [CU-ARRENDADOR-05 – Retirada de ingresos](#cu-arrendador-05--retirada-de-ingresos)
    - [CU-ARRENDATARIO-01 – Creación de kits](#cu-arrendatario-01--creación-de-kits)
    - [CU-ARRENDATARIO-04 – Pago del kit](#cu-arrendatario-04--pago-del-kit)
    - [CU-ARRENDATARIO-07 – Modificar kits predeterminados](#cu-arrendatario-07--modificar-kits-predeterminados)
    - [CU-ARRENDATARIO-10 – Ampliación de búsqueda geográfica](#cu-arrendatario-10--ampliación-de-búsqueda-geográfica)
    - [CU-ADMIN-05 – Configuración modelo negocio](#cu-admin-05--configuración-modelo-negocio)
    - [CU-ADMIN-06 – Creación kits predeterminados](#cu-admin-06--creación-kits-predeterminados)
  - [4. Clasificación de incidencias](#4-clasificación-de-incidencias)
  - [5. Priorización (MoSCoW)](#5-priorización-moscow)
  - [6. Plan de acción](#6-plan-de-acción)
  - [7. Historial de versiones](#7-historial-de-versiones)

## 1. Introducción

En este documento se va a realizar un análisis en profundidad del feedback aprotado por otros grupos ejerciendo de usuarios piloto. Este feedback se ha realizado sobre la segunda versión desplegada de la aplicación, aquella que tiene la segunda versión de las funcionalidades core del sistema.

El feedback ha sido proporcionado por dos grupos: **1 - RoomA** y **8 - Bookmerang**.

El objetivo es identificar problemas residuales, funcionalidades no implementadas y áreas de mejora en la experiencia de usuario.

## 2. Resumen General del Feedback

| Categoría CU       | Nº de incidencias | Severidad predominante | Comentarios generales |
|--------------------|------------------|------------------------|------------------------|
| CU-GENERAL         | 3 | Media / Baja           | Fallos visuales, falta de datos de prueba, errores de estado |
| CU-ARRENDADOR      | 2                | Alta / Media           | Error en Stripe, falta de datos de prueba |
| CU-ARRENDATARIO    | 4 | Media / Alta           | Poca intuición, funcionalidades no operativas |
| CU-ADMIN           | 3                | Baja / Media           | UX mejorable, kits predeterminados ausentes |

## 3. Análisis detallado por caso de uso

### CU-GENERAL-01 – Inicio de sesión y registro

**Incidencias reportadas:**
- **Bookmerang**: Pegar un texto en los inputs de 'contraseña' y 'repetir contraseña' hace que el 'ojo' que permite ver lo escrito, se duplique.

**Revisión de reporte:**
- Se han seguido los pasos descritos tanto desde un móvil como desde un ordenador, y no se encuentra el fallo.

**Impacto:**
- Bajo (funcionalidad existente pero mejorable).

**Causa probable:**
- Caso no evaluado con duplicación de ícono.

**Acciones propuestas:**
- Revisar código.

### CU-GENERAL-03 – Valoraciones

**Incidencias reportadas:**
- **T-12 Grupo Bookmerang y RooMa**: No se encuentra la opción para valorar a un usuario. 

**Revisión de reporte:**
- La opción de valorar aparece únicamente cuando el estado de un kit es "finalizado". No obstante, en los datos de prueba, los productos del kit que aparece como finalizado ya han sido valorados, y por ello, no aparece la opción 'Valorar'.

**Impacto:**
- Falta de prueba de la funcionalidad
- Falta de acceso a valoraciones.

**Causa probable:**
- Datos de prueba incompletos.

**Acciones propuestas:**
- Poder valorar un artículo con datos de prueba
- Permitir acceso a las valoracione que he hecho desde 'Mis valoraciones'

### CU-GENERAL-04 – Creación de incidencias

**Incidencias reportadas:**
- **Grupo RooMa**: Cambio de tipo de incidencia guarda el objeto indicado previamente en la incidencia tipo 'Objeto dañado'. 

**Impacto:**
- Experiencia de usuario

**Causa probable:**
- Datos de prueba incompletos.

**Acciones propuestas:**
- Añadir la barra de búsqueda sin guardar el articulo seleccionado al seleccionar 'Objeto dañado'.

### CU-ARRENDADOR-03 – Gestión de artículos subidos

**Incidencias reportadas:**
- **Grupo RooMa**: No hay suficientes datos de prueba. El flujo para crear y alquilar un artículo desde cero es poco intuitivo.
- **T-14 Grupo Bookmearang**: Etiqueta de búsqueda de país al editar un artículo aparece vacío. Eliminación de un producto que está en alquiler

**Impacto:**
- Dificultad para validar la lógica de borrado de artículos alquilados.
- Posible error si se permite borrar artículos en alquiler.

**Causa probable:**
- Falta de datos semilla (seeders) con estados mixtos.
- Flujo de alquiler no lo suficientemente guiado.

**Acciones propuestas:**
- Crear datos de prueba con artículos alquilados y no alquilados.
- Ofrecer más indicaciones para aclarar el flujo de alquiler de kit.
- Verificar estado del artículo antes de eliminarlo.


### CU-ARRENDADOR-05 – Retirada de ingresos

**Incidencias reportadas:**
- **T-12 (Bookmerang y RooMa)**: Error de Stripe: “no hay suficientes fondos” a pesar de tener dinero en el monedero.

**Impacto:**
- Funcionalidad crítica de pago inutilizable.
- Pérdida de confianza del usuario.

**Causa probable:**
- Desincronización entre el balance mostrado en frontend y el saldo real en Stripe Connect.
- Posible error en la unidad monetaria (centavos vs euros).

**Acciones propuestas:**
- Revisar integración con Stripe Connect (saldo disponible vs saldo pendiente).
- Verificar que el balance mostrado corresponda exactamente al saldo transferible.
- Añadir logs de depuración en la llamada a la API de retirada.

### CU-ARRENDATARIO-01 – Creación de kits

**Incidencias reportadas:**
- **Grupo Mañana**: Funcionalidad poco intuitiva.

**Impacto:**
- Abandono del flujo por parte del usuario.
- Posible infrautilización de la funcionalidad de kits.

**Acciones propuestas:**
- Simplificar el flujo de creación de kits (menos pasos, previsualización clara).
- Añadir ejemplos o plantillas de kits predeterminados (ver CU-ADMIN-06).

### CU-ARRENDATARIO-04 – Pago del kit

**Incidencias reportadas:**
- **Grupo RooMA**: Entienden que el sistema no está preparado para recibir dinero en el monedero tras la finalización del alquiler.

**Impacto:**
- No posibilidad de prueba del recibo del dinero en el monedero tras el alquiler.

**Acciones propuestas:**
- Completar un test o datos de prueba que permitan probar el caso de uso.

### CU-ARRENDATARIO-07 – Modificar kits predeterminados

**Incidencias reportadas:**
- **T-12 (Bookmerang)**: Funcionalidad no probada debido a la inexistencia de kits predeterminados.

**Impacto:**
- Imposibilidad de probar el caso de uso.

**Acciones propuestas:**
- Incorporar datos de prueba de kits predeterminados.

### CU-ARRENDATARIO-10 – Ampliación de búsqueda geográfica

**Incidencias reportadas:**
- **T-12 (Bookmerang)**: En artículos creados no se actualiza su ubicación en el mapa.

**Impacto:**
- Funcionalidad no operativa.

**Acciones propuestas:**
- Añadir selector de ubicación en el mapa o a partir de los datos introducidos buscar la ubicación.


### CU-ADMIN-05 – Configuración modelo negocio

**Incidencias reportadas:**
- **Grupo Bookmerang**: Tras la modificación del porcentaje de comisión no se devuelve a la pantalla de inicio.

**Impacto:**
- Bajo (funcionalidad existente pero mejorable).

**Acciones propuestas:**
- Tras el cambio, devolver al usuario a la pantalla de inicio.


### CU-ADMIN-06 – Creación kits predeterminados

**Incidencias reportadas:**
- **T-12 (Bookmerang)**: No existe. Enlace muestra “próximamente”.

**Impacto:**
- Bloquea CU-ARRENDATARIO-07.
- Reduce el valor de la funcionalidad de kits.

**Acciones propuestas:**
- Implementar CRUD de kits predeterminados en panel de administración.
- Prioridad **Must** para el sprint 3.

## 4. Clasificación de incidencias

| Tipo de incidencia       | Nº | Ejemplos |
|--------------------------|----|----------|
| Funcionalidad no implementada | 2 | Kits predeterminados, modificar kits predeterminados |
| Error en integración externa | 1 | Stripe (retirada de ingresos) |
| Usabilidad / Intuición   | 4 | Flujo de alquiler, creación de kits, valoraciones, creación de incidencias |
| Datos de prueba insuficientes | 3 | Artículos alquilados, valoraciones, pago del kit |
| Mejora de funcionalidad existente | 3 | Configuración modelo negocio, registro, gestión artículos |

## 5. Priorización (MoSCoW)

| Prioridad | Incidencias |
|-----------|-------------|
| **Must**  | Retirada de ingresos (Stripe) – Error crítico que bloquea la salida de dinero. |
| **Must**  | Kits predeterminados (admin) – Bloquea funcionalidad de arrrendatario. |
| **Must**  | Prohibir eliminación de artículos en alquiler. |
| **Should**  | Búsqueda geográfica – Funcionalidad no operativa. |
| **Should**| Datos de prueba suficientes (artículos alquilados, valoraciones, pago). |
| **Should**| Mejorar intuición de flujos (creación de kits, alquiler, incidencias). |
| **Could** | Mejora de UX menor (duplicación ojo, redirección admin, etiqueta país). |
| **Won’t** | - |

## 6. Plan de acción

| Tarea | Responsable | Fecha de finalizacion | Estado |
|-------|-------------|----------------|--------|
| Refactorización frontend de kits predeterminados | Equipo 1 | 13/04/2026 | Done |
| [BUG] No permite pago con wallet  | Equipo 3 | 13/04/2026 | Done |
| [BUG] Alquiler de artículos ya alquilados  | Equipo 2 | 14/04/2026 | Done |
| [BUG] Valoración única de un artículo del kit  | Equipo 4 | 14/04/2026 | Done |
| [BUG] Al crear un artículo, este aparece en el listado de productos para crear un kit, pero no en el mapa  | Equipo 4 | 14/04/2026 | Done |

## 7. Historial de versiones

| Versión | Fecha       | Descripción                                               | Autor(es)                             |
|---------|-------------|-----------------------------------------------------------|----------------------------------------|
| 1.0.0   | 12/04/2026  | Análisis del feedback del sprint 2 (Bookmerang + RooMA)  | Candela Jazmín Gutiérrez González                |
| 2.0.0   | 14/04/2026  | Actualización de estados de tareas  | Candela Jazmín Gutiérrez González               |

**Redactado por:** Candela Jazmín Gutiérrez González  
**Fecha de redacción:** 14/04/2026  
**Versión:** 2.1.0