# Análisis del feedback de otros grupos

## Índice

## 1. Introducción

En este documento se va a realizar un análisis en profundidad del feedback aprotado por otros grupos ejerciendo de usuarios piloto. Este feedback se ha realizado sobre la primera versión desplegada de la aplicación, aquella que tiene la primera versión de las funcionalidades core del sistema.

El feedback ha sido proporcionado por dos grupos: **1 - RoomA** y **8 - Bookmerang**.

Con este análisis se pretende corregir los fallos más claros de la aplicación y mejorar la misma con posibles sugerencias de los usurios piloto.

---

## 2. Resumen General del Feedback

A continuación podemos ver una tabla resumen de las incidencias que han reportado los usuarios piloto.

| Categoría CU | Nº de incidencias | Severidad predominante | Comentarios generales |
|----------|-------------------|-------------------------|------------------------|
| CU-GENERAL | 4 | Media | Falta de validaciones |
| CU-ARRENDADOR | 4 | Media | Fallos de conexión con la base de datos y falta de validaciones |
| CU-ADMIN | 1 | Alta | Falta de restricciones por roles |


## 3. Análisis detallado por caso de uso

### ### CU-GENERAL-01 – Registro e inicio de sesión  

**Incidencias reportadas:**  
- T-13: Falta de validación en campo teléfono  
- T-13: Falta de validación en campo dirección  

**Impacto:**  
- Riesgo de datos inconsistentes.  
- Posible mal funcionamiento en funcionalidades dependientes.  

**Causa probable:**  
- Validaciones insuficientes en frontend/backend.  

**Acciones propuestas:**  
- Añadir validación numérica para teléfono.  
- Añadir validación de formato para dirección.  
- Implementar mensajes de error claros.



### CU-GENERAL-02 – Gestión de datos personales  

**Incidencias reportadas:**  
- T-13: Falta de validación en campo teléfono.
- T-13: Falta de validación en campo dirección.  

**Impacto:**  
- Riesgo de datos incosistentes.

**Causa probable:**  
- Validaciones insuficientes en frontend/backend.  

**Acciones propuestas:**  
- Implemetar validaciones para todos los campos que sea necesario.
- Añadir mensajes de error junto a los campos cundo salten las validaciones.


### CU-ARRENDADOR-01 – Subida de artículos  

**Incidencia:**  
- T12: No permite elegir categoría lo que bloquea la creación del artículo.

**Impacto:**  
- Funcionalidad crítica inutilizable.  

**Causa probable:**  
- Parte del sistema entra en suspensión, lo que hace que no se puedan obtener las categorías.
- Fallo en el endpoint de carga de categorías.

**Acciones propuestas:**  
- Revisar carga de categorías. 
- Validar que el usuario tenga permisos correctos.
- Añadir fallback si no hay categorías disponibles.
- Buscar alternativas de despliegue, pues el equipo es consciente de que existen problemas con la entrada en suspensión automática de parte del sistema.  

### CU-ARRENDADOR-03 – Gestión de artículos subidos  

**Incidencias:**  
- T13: Fechas inválidas aceptadas.
- T13: URL inválida aceptada.
- T13: Ciudad con formato incorrecto aceptada.

**Impacto:**  
- Datos corruptos.  
- Riesgo de errores en búsquedas o filtros  

**Causa probable:**  
- Falta de validaciones en backend/frontend.

**Acciones propuestas:**  
- Validación estricta de fechas (DD/MM/YYYY).
- Validación de URL con reglas adecuadas.  
- Implementación de desplegable para elegir el país y la ciudad.  
- Mostrar mensajes de error claros.  

### CU-ADMIN-01 – Gestión de categorías  

**Incidencia:**  
- T14: Cualquier usuario puede gestionar categorías. 

**Impacto:**  
- Riesgo de seguridad.
- Pérdida de integridad en la base de datos.  

**Acciones propuestas:**  
- Implementar validación de roles.
- Añadir tests de autorización.
- Revisar endpoints expuestos.
- Quitar enlaces directos desde frontend.

## 4. Clasificación de incidencias

| Tipo de incidencia | Nº | Ejemplos |
|--------------------|----|----------|
| Validación de datos | 7 | Teléfono, dirección, fechas, URL |
| Permisos / Seguridad | 1 | Gestión de categorías |
| UX / Flujo roto | 1 | No poder seleccionar categoría |

## 5. Priorización (MoSCoW)

| Prioridad | Incidencias |
|-----------|-------------|
| **Must** | Validaciones críticas, permisos admin, bloqueo en subida de artículos |
| **Should** | Mensajes de error, validaciones de ciudad |
| **Could** | Mejoras de UX |
| **Won’t** | - |


## 6. Plan de acción

| Tarea | Responsable | Fecha estimada | Estado |
|-------|-------------|----------------|--------|
| Refactorizar-CU-ADMIN-01: Gestión de categorías | Grupo 2  | 10/03/2026 | Done |
| Refactorizar - CU-GENERAL-04 - Soporte | Grupo 2 | 10/03/2026 | Done |
| Refactorizar home - ARRENDADOR - ARRENDATARIO | Grupo 4 | 10/03/2026 | Done |
| Servicios - Backend | Grupo 4 | 10/03/2026 | Done |
| Refactorizar artículos frontend | Grupo 4 | 10/03/2026 | Done |
| Refactorización del backend de kits | Grupo 1 |  | In Review |
| Refactorización del fronend | Grupo 1 |  | In Review |
| Refactorizar - CU-ARENDADOR-04 - Gestión de fin de alquiler | Grupo 2  | 10/03/2026 | In review |
| Estudio de viabilidad de despliegue alternativo usando supabase y DigitalOcean | Grupo 4 | 11/03/2026 | In Review |
| Servicios - Frontend | Grupo 4 | 11/03/2026 | In Review |
| Refactorizar - CU-ARRENDADOR-02 - Listado de artículos subidos | Grupo 2 | 10/03/2026 | In Progress |
| Servicios - Test | Grupo 4 | 11/03/2026 | In Progress |
| Refactorización del backend de pagos | Grupo 1 |  | In Progress |
| Refactorizar valoraciones| Grupo 3 | 10/03/2026 | Done |
| Refactorizar autenticación y gestión del perfil| Grupo 3 | 10/03/2026 | Done |
| | Grupo 3 | 10/03/2026 | Done |

## 7. Historial de versiones

| Versión | Fecha       | Descripción                    | Autor(es)                  |
|---------|-------------|--------------------------------|----------------------------|
| 1.0.0   | 11/03/2026  |  Incluido el análisis del feedback del grupo 1 - RoomA              | Cristina Fernández Chica |


---
**Redactado por:** Cristina Fernández Chica
**Fecha de redacción:** 11/03/2026  
**Versión:** 1.0.0


