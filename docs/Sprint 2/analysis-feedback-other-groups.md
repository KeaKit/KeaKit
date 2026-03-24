# Análisis del feedback de otros grupos

## Índice

- [Análisis del feedback de otros grupos](#análisis-del-feedback-de-otros-grupos)
  - [Índice](#índice)
  - [1. Introducción](#1-introducción)
  - [2. Resumen General del Feedback](#2-resumen-general-del-feedback)
  - [3. Análisis detallado por caso de uso](#3-análisis-detallado-por-caso-de-uso)
    - [CU-GENERAL-01 – Registro e inicio de sesión](#cu-general-01--registro-e-inicio-de-sesión)
    - [CU-GENERAL-02 – Gestión de datos personales](#cu-general-02--gestión-de-datos-personales)
    - [CU-GENERAL-03 – Valoraciones](#cu-general-03--valoraciones)
    - [CU-GENERAL-04 – Soporte](#cu-general-04--soporte)
    - [CU-ARRENDADOR-01 – Subida de artículos](#cu-arrendador-01--subida-de-artículos)
    - [CU-ARRENDADOR-02 – Listado de artículos subidos](#cu-arrendador-02--listado-de-artículos-subidos)
    - [CU-ARRENDADOR-03 – Gestión de artículos subidos](#cu-arrendador-03--gestión-de-artículos-subidos)
    - [CU-ADMIN-01 – Gestión de categorías](#cu-admin-01--gestión-de-categorías)
  - [4. Clasificación de incidencias](#4-clasificación-de-incidencias)
  - [5. Priorización (MoSCoW)](#5-priorización-moscow)
  - [6. Plan de acción](#6-plan-de-acción)
  - [7. Historial de versiones](#7-historial-de-versiones)

## 1. Introducción

En este documento se va a realizar un análisis en profundidad del feedback aprotado por otros grupos ejerciendo de usuarios piloto. Este feedback se ha realizado sobre la primera versión desplegada de la aplicación, aquella que tiene la primera versión de las funcionalidades core del sistema.

El feedback ha sido proporcionado por dos grupos: **1 - RoomA** y **8 - Bookmerang**.

Con este análisis se pretende corregir los fallos más claros de la aplicación y mejorar la misma con posibles sugerencias de los usurios piloto.

## 2. Resumen General del Feedback

A continuación se muestra una tabla resumen de las incidencias reportadas por ambos grupos:

| Categoría CU     | Nº de incidencias | Severidad predominante | Comentarios generales |
|------------------|-------------------|-------------------------|------------------------|
| CU-GENERAL       | 8                 | Media/Alta              | Fallos de fetch, lentitud, validaciones insuficientes |
| CU-ARRENDADOR    | 7                 | Media/Alta              | Problemas de carga, validaciones, flujos rotos |
| CU-ADMIN         | 2                 | Alta                    | Falta de restricciones por roles, validaciones incorrectas |

## 3. Análisis detallado por caso de uso

A continuación se integran las incidencias reportadas por ambos grupos.

### CU-GENERAL-01 – Registro e inicio de sesión

**Incidencias reportadas:**  
- T-13: Falta de validación en campo teléfono.  
- T-13: Falta de validación en campo dirección.  
- T-10: Fallos de fetch incluso cuando la aplicación lleva un rato encendida.  
- Los campos de ciudad tardan mucho en cargar tras seleccionar país.

**Impacto:**  
- Riesgo de datos inconsistentes.  
- Posible mal funcionamiento en funcionalidades dependientes.  
- Posibles errores silenciosos o flujos rotos.  
- Mala experiencia de usuario.

**Causa probable:**  
- Validaciones insuficientes en frontend/backend.  
- Posible suspensión del backend o timeouts.

**Acciones propuestas:**  
- Añadir validación numérica para teléfono.  
- Añadir validación de formato para dirección.  
- Optimizar carga de ciudades o precargar datos.  
- Implementar mensajes de error claros.  
- Revisar estabilidad del despliegue del backend para evitar fallos de fetch.

### CU-GENERAL-02 – Gestión de datos personales

**Incidencias reportadas:**  
- T-13: Falta de validación en teléfono (se permiten letras, símbolos, longitudes incorrectas).  
- T-13: Falta de validación en dirección.  
- Sugerencia: permitir o no números/símbolos en nombre según política.  
- Sugerencia: dividir dirección en campos o validar mediante API.

**Impacto:**  
- Riesgo de datos inconsistentes.  
- Posibles errores en funcionalidades dependientes.

**Causa probable:**  
- Parte del sistema entra en suspensión, lo que hace que no se puedan obtener las categorías.  
- Fallo en el endpoint de carga de categorías.

**Acciones propuestas:**  
- Revisar carga de categorías.  
- Validar que el usuario tenga permisos correctos.  
- Añadir fallback si no hay categorías disponibles.  
- Buscar alternativas de despliegue, pues el equipo es consciente de que existen problemas con la entrada en suspensión automática de parte del sistema.
- Añadir mensajes de error junto a los campos.  
- Estructurar dirección o integrar API de validación.

### CU-GENERAL-03 – Valoraciones

**Incidencias reportadas:**  
- T-12: No se ha podido probar la funcionalidad.

**Impacto:**  
- Caso de uso incompleto.  
- Imposibilidad de validar comportamiento esperado.

**Acciones propuestas:**  
- Implementar lógica completa de creación y gestión de valoraciones.  
- Añadir tests funcionales.

### CU-GENERAL-04 – Soporte

**Incidencias reportadas:**  
- T-12: Error “Type Definition Error” al crear una incidencia relacionada con un artículo.

**Impacto:**  
- Funcionalidad inutilizable.  
- Riesgo de errores graves.

**Acciones propuestas:**  
- Revisar tipados y modelos en backend.  
- Validar payloads antes de enviarlos.

---

### CU-ARRENDADOR-01 – Subida de artículos

**Incidencias reportadas:**  
- T‑12: No permite elegir categoría, lo que bloquea creación del artículo.  
- T‑13: Se permiten fechas pasadas sin validación.  
- T‑13: Se permiten caracteres especiales en ciudad, descripción y nombre.  
- T‑10: Las categorías tardan mucho en cargar o no cargan.  
- Fallos de fetch frecuentes.

**Impacto:**  
- Funcionalidad crítica inutilizable.  
- Datos corruptos.  
- Mala experiencia de usuario.

**Causa probable:**  
- Parte del sistema entra en suspensión, lo que hace que no se puedan obtener las categorías.
- Fallo en el endpoint de carga de categorías.  
- Validaciones insuficientes.

**Acciones propuestas:**  
- Revisar carga de categorías.  
- Añadir fallback si no hay categorías disponibles.  
- Validar campos de texto y fechas, añadiendo incluso un calendario para mejorar la experiencia de usuario.
- Añadir desplegable de ciudades según país.  
- Revisar despliegue.

### CU-ARRENDADOR-02 – Listado de artículos subidos

**Incidencias reportadas:**  
- Todo correcto.

### CU-ARRENDADOR-03 – Gestión de artículos subidos

**Incidencias reportadas:**  
- T13: Fechas inválidas aceptadas.  
- T13: URL inválida aceptada.  
- T13: Ciudad con formato incorrecto aceptada.  
- T12: Botón “volver” redirige a la misma pantalla.  
- T12: No se pueden editar categorías.  
- T13: Validaciones insuficientes en campos de texto.  
- A veces el botón de editar no responde.

**Impacto:**  
- Flujos bloqueados.  
- Datos corruptos.  
- Riesgo de errores en búsquedas o filtros.

**Causa probable:**
- Falta de validaciones en backend/frontend.

**Acciones propuestas:**  
- Revisar navegación y rutas.  
- Corregir carga de categorías en edición.  
- Validación estricta de fechas (DD/MM/YYYY), añadiendo un calendario para mejorar la experiencia del usuario.
- Validación de URL con reglas adecuadas.
- Implementación de desplegable para elegir el país y la ciudad.
- Mostrar mensajes de error claros.

### CU-ADMIN-01 – Gestión de categorías

**Incidencias reportadas:**  
- T‑14: Cualquier usuario puede gestionar categorías.  
- Validación incorrecta: permite precio mínimo > máximo.  
- Sugerencia: corregir alineado.

**Impacto:**  
- Riesgo de seguridad.  
- Pérdida de integridad en la base de datos.  
- Bloqueo de creación de artículos.

**Acciones propuestas:**  
- Implementar validación de roles.  
- Añadir tests de autorización.  
- Validar rangos de precios.  
- Revisar endpoints expuestos.  
- Quitar enlaces directos desde frontend.

## 4. Clasificación de incidencias

| Tipo de incidencia       | Nº | Ejemplos |
|--------------------------|----|----------|
| Validación de datos      | 12 | Teléfono, dirección, fechas, URL, rangos de precio |
| Permisos / Seguridad     | 2  | Gestión de categorías |
| UX / Flujo roto          | 3  | Botón volver, redirecciones inesperadas |
| Errores silenciosos      | 6  | Fallos de fetch, cargas incompletas |
| Funcionalidad incompleta | 3  | Valoraciones, listado de usuarios, soporte |

## 5. Priorización (MoSCoW)

| Prioridad | Incidencias |
|-----------|-------------|
| **Must**  | Validaciones críticas, permisos admin, fallos de fetch, bloqueo en subida/edición de artículos |
| **Should**| Mensajes de error, validaciones de ciudad, optimización de cargas |
| **Could** | Mejoras de UX, ajustes visuales |
| **Won’t** | - |

## 6. Plan de acción

| Tarea | Responsable | Fecha estimada | Estado |
|-------|-------------|----------------|--------|
| Refactorizar-CU-ADMIN-01: Gestión de categorías | Grupo 2  | 10/03/2026 | Done |
| Refactorizar - CU-GENERAL-04 - Soporte | Grupo 2 | 10/03/2026 | Done |
| Refactorizar home - ARRENDADOR - ARRENDATARIO | Grupo 4 | 10/03/2026 | Done |
| Servicios - Backend | Grupo 4 | 10/03/2026 | Done |
| Refactorizar artículos frontend | Grupo 4 | 10/03/2026 | Done |
| Refactorizar - CU-Arrendador-02 - Listado de artículos subidos | Grupo 2 | 18/03/2026 | Done |
| Refactorización del backend de kits | Grupo 1 | 13/03/2026  | Done |
| Refactorización del frontend de kits | Grupo 1 | 13/03/2026  | Done |
| Refactorizar - CU-ARENDADOR-04 - Gestión de fin de alquiler | Grupo 2  | 19/03/2026 | Done |
| Estudio de viabilidad de despliegue alternativo usando supabase y DigitalOcean | Grupo 4 | 17/03/2026 | Done |
| Servicios - Frontend | Grupo 4 | 12/03/2026 | Done |
| Servicios - Test | Grupo 4 | 16/03/2026 | Done |
| Refactorización del backend de pagos | Grupo 1 | 14/03/2026 | Done |
| Refactorización del frontend de pagos | Grupo 1 | 18/03/2026 | Done |
| Refactorizar valoraciones | Grupo 3 | 23/03/2026 | Done |
| Refactorizar autenticación y gestión del perfil| Grupo 3 | 10/03/2026 | Done |

## 7. Historial de versiones

| Versión | Fecha       | Descripción                                               | Autor(es)                             |
|---------|-------------|-----------------------------------------------------------|----------------------------------------|
| 1.0.0   | 11/03/2026  | Integración del análisis del feedback del grupo 1 - RoomA | Cristina Fernández Chica               |
| 1.1.0   | 12/03/2026  | Integración del feedback del grupo 8 - Bookmerang         | Candela Jazmín Gutiérrez González      |
| 2.0.0   | 24/03/2026  | Actualización de estado de las tareas del plan de acción  | Candela Jazmín Gutiérrez González      |

**Redactado por:** Cristina Fernández Chica y Candela Jazmín Gutiérrez González  
**Fecha de redacción:** 12/03/2026  
**Versión:** 2.0.0
