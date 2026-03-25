# Sprint Backlog: Sprint 1 - Squad 2

## Índice del documento
1. [Sprint Goal](#1-sprint-goal)
2. [Ítems seleccionados del Product Backlog](#2-ítems-seleccionados-del-product-backlog)
3. [Desglose en tareas](#3-desglose-en-tareas)
4. [Historial de versiones](#4-historial-de-versiones)

## 1. Sprint Goal

Establecer la base administrativa del catálogo (gestión de categorías y precios), proporcionar a los arrendadores las herramientas para visualizar 
sus artículos y gestionar el fin del alquiler de estos, e implementar un sistema inicial de reporte de incidencias y soporte.

## 2. Ítems seleccionados del Product Backlog

| ID PBI | Tipo | ID                 | Descripción                                                                        | Prioridad | Estimación (SP) | Estado |
|--------|------|--------------------|------------------------------------------------------------------------------------|-----------|-----------------|--------|
| 01     | HU   | HU‑GENERAL‑01      | Como usuario, quiero enviar incidencias desde un formulario, para recibir soporte. | S | - | To Do |
| 69     | HU   | HU-ARRENDATARIO-33 | Como arrendatario, quiero reportar un objeto dañado al recibirlo, para que no se me culpe por desperfectos previos. | M | - | To Do |
| 05     | HU   | HU-ARRENDADOR-04   | Como arrendador, quiero ver todos los objetos que tengo en alquiler y hasta cuándo estarán alquilados, así como los que están disponibles, para tener control sobre ellos. | M | - | To Do |
| 20     | HU   | HU-ARRENDADOR-19   | Como arrendador, quiero ver todos los objetos que he subido en "Mis artículos", para gestionarlos fácilmente. | M | - | To Do |
| 34     | HU   | HU-ARRENDADOR-33   | Como arrendador, quiero confirmar desde la app que he recibido mi objeto de vuelta y que está en buen estado, para que se libere la devolución de la garantía. | M | - | To Do |
| 35     | HU   | HU-ARRENDADOR-34   | Como arrendador, quiero indicar si el objeto ha sido devuelto con daños o problemas, para que se retenga total o parcialmente la garantía. | M | - | To Do |
| 76     | HU   | HU-ARRENDATARIO-40 | Como arrendatario, quiero recibir automáticamente el reembolso del depósito cuando finalice el alquiler y el arrendador confirme que el objeto ha sido devuelto en buen estado, para recuperar mi dinero sin gestiones adicionales. | M | - | To Do |
| 79     | HU   | HU-ADMIN-01        | Como administrador, quiero crear nuevas categorías de objetos, para organizar correctamente los artículos dentro de la plataforma. | S | - | To Do |
| 80     | HU   | HU-ADMIN-02        | Como administrador, quiero editar las categorías existentes, para mantener su información actualizada. | S | - | To Do |
| 81     | HU   | HU-ADMIN-03        | Como administrador, quiero eliminar categorías, para depurar o reorganizar el catálogo. | S | - | To Do |
| 87     | HU   | HU-ADMIN-09        | Como administrador, quiero establecer un rango de precios mínimo y máximo para cada tipo de objeto, para controlar que los precios definidos por los arrendadores se mantengan dentro de valores razonables. | S | - | To Do |
| 88     | HU   | HU-ADMIN-10        | Como administrador, quiero editar el rango de precios de un tipo de objeto, para ajustarlo según cambios del mercado o del negocio. | S | - | To Do |

## 3. Desglose en tareas

*Cada PBI se descompone en tareas concretas y ejecutables.*

| PBI asociado | ID Issue | Descripción | Dependencias técnicas | Estimación (horas) | Estado | Responsable |
|--------------|----------|-------------|-----------------------|--------------------|--------|-------------|
| 01, 69 | [#107](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/107) | Diseñar apartado de Soporte y Formulario de Incidencias | | 2h |To Do| Samuel |
| 01, 69 | [#108](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/108) | Frontend apartado de Soporte y Formulario de Incidencias| #107 | 3h |To Do| Samuel |
| 01, 69 | [#109](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/109) | Backend apartado de Soporte y Formulario de Incidencias | #107 | 3h |To Do| Ismael |
| 01, 69 | [#110](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/110) | Testing apartado de Soporte y Formulario de Incidencias | | 2h |To Do| Ismael |
| 05, 20 | [#111](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/111) | Backend Listado de artículos subidos | | 3h |To Do| Germán |
| 05, 20 | [#112](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/112) | Frontend Listado de artículos subidos | | 3h |To Do| Rosa |
| 05, 20 | [#113](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/113) | Testing Listado de artículos subidos | | 2h |To Do| Germán |
| 79, 80, 81, 87, 88 | [#114](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/114) | Backend Gestión de categorías | | 3h |To Do| Ismael |
| 79, 80, 81, 87, 88 | [#115](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/115) | Frontend Gestión de categorías | | 3h |To Do| Guillermo García |
| 79, 80, 81, 87, 88 | [#116](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/116) | Testing Gestión de categorías | | 2h |To Do| Guillermo García |
| 34, 35, 76 | [#117](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/117) | Backend Gestión de fin de alquiler | | 3h |To Do| Germán |
| 34, 35, 76 | [#118](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/118) | Frontend Gestión de fin de alquiler | | 3h |To Do| Samuel |
| 34, 35, 76 | [#119](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/119) | Testing Gestión de fin de alquiler | | 2h |To Do| Rosa |

## 4. Historial de versiones

| Versión | Fecha       | Descripción                    | Autor(es)       |
|---------|-------------|--------------------------------|-----------------|
| 1.0.0   | 25/02/2026  | Primera versión del documento  | Guillermo García León |
| 1.2.0   | 02/03/2026  | Cambio de tareas  | Guillermo García León |
---
**Redactado por:** [Guillermo García León]  
**Fecha de redacción:** [25/02/2026]  
**Versión:** [1.2.0 ]
