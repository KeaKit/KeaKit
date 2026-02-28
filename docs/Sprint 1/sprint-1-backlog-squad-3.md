# Sprint Backlog: Sprint 1 - Squad 3

## Índice del documento
1. [Sprint Goal](#1-sprint-goal)
2. [Ítems seleccionados del Product Backlog](#2-ítems-seleccionados-del-product-backlog)
3. [Desglose en tareas](#3-desglose-en-tareas)
4. [Resumen carga de trabajo](#4-resumen-carga-de-trabajo)
5. [Historial de versiones](#5-historial-de-versiones)

## 1. Sprint Goal

Implementar el registro y login de usuarios en la aplicación, la edición del perfil, creación de valoraciones por parte tanto de los arrendadores como de los arrendatarios, y confirmar la recepción de los objetos alquilados, así como indicar si el objeto no cumple con lo prometido y recibir notificación al procesar la devolución del depósito.

## 2. Ítems seleccionados del Product Backlog

| ID PBI | Tipo | ID                 | Descripción                                                                        | Prioridad | Estimación (SP) | Estado |
|--------|------|--------------------|------------------------------------------------------------------------------------|-----------|-----------------|--------|
| 10     | HU   | HU-ARRENDADOR-09   | Como arrendador, quiero registrarme como proveedor de objetos, para poder ganar dinero con ellos. | M | - | To Do |
| 30     | HU   | HU-ARRENDADOR-29   | Como arrendador, quiero valorar al arrendatario, para que otros propietarios sepan si es un usuario cuidadoso. | M | - | To Do |
| 36     | HU   | HU-ARRENDADOR-35   | Como arrendador, quiero poder editar los datos de mi perfil de usuario, para poder actualizarlos en caso de sufrir alguna modificación. | M | - | To Do |
| 37     | HU   | HU-ARRENDATARIO-01 | Como arrendatario, quiero registrarme en la app, para poder crear y alquilar kits. | M | - | To Do |
| 38     | HU   | HU-ARRENDATARIO-02 | Como arrendatario, quiero iniciar sesión fácilmente, para acceder a mis kits y pedidos. | M | - | To Do |
| 39     | HU   | HU-ARRENDATARIO-03 | Como arrendatario, quiero indicar mis datos básicos, para que se gestionen correctamente pagos y envíos. | M | - | To Do |
| 70     | HU   | HU-ARRENDATARIO-34 | Como arrendatario, quiero valorar y dejar un comentario sobre el kit y el arrendador tras la devolución, para ayudar a otros usuarios. | M | - | To Do |
| 74     | HU   | HU-ARRENDATARIO-38 | Como arrendatario, quiero poder confirmar desde la app que el objeto recibido coincide con la descripción, imágenes y estado prometido, para validar que el servicio se ha cumplido correctamente. | M | - | To Do |
| 75     | HU   | HU-ARRENDATARIO-39 | Como arrendatario, quiero poder indicar que el objeto no cumple con lo prometido, para que se revise el caso antes de liberar el pago completo al arrendador. | M | - | To Do |
| 77     | HU   | HU-ARRENDATARIO-41 | Como arrendatario, quiero recibir una notificación cuando se procese la devolución de mi depósito, para saber que el proceso ha finalizado correctamente. | M | - | To Do |
| 78     | HU   | HU-ARRENDATARIO-42 | Como arrendatario, quiero poder editar mis datos básicos, para que se gestionen correctamente pagos y envíos. | M | - | To Do |
| 91     | HU   | HU-ADMIN-13        | Como administrador, quiero registrarme con un usuario específico con rol diferenciado, para gestionar la plataforma. | M | - | To Do |

## 3. Desglose en tareas

*Cada PBI se descompone en tareas concretas y ejecutables.*

| PBIs asociados | ID Issue | Descripción | Dependencias técnicas | Prioridad | Estimación (SP) | Estimación (horas) | Estado | Responsable |
|----------------|----------|-------------|-----------------------|-----------|-----------------|--------------------|--------|-------------|
| 10, 37, 38, 91 | [156](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/156) | Backend de registro e inicio de sesión | - | Alta | 3 | 3h | Done | Rafael |
| 10, 37, 38, 91 | [157](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/157) | Frontend de registro e inicio de sesión | - | Alta | 4 | 4h | Done | Adrián |
| 36, 39, 78 | [164](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/164) | Backend de gestión de datos personales | - | Media | 2 | 2h | To Do | Adrián, Marta |
| 36, 39, 78 | [165](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/165) | Frontend de gestión de datos personales | - | Media | 3 | 3h | To Do | Adrián, Marta |
| 70 | [158](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/158) | Valorar y dejar un comentario por parte de los arrendatarios | - | Alta | 4 | 4h | To Do | Rafael |
| 30 | [159](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/159) | Valorar y dejar un comentario por parte de los arrendadores | - | Alta | 4 | 4h | To Do | Guillermo |
| 74 | [143](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/143) | Confirmar recepción | - | Alta | 3 | 3h | To Do | Alejandro |
| 75 | [144](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/144) | Indicar que el objeto no cumple con los prometido | - | Media | 4 | 4h | To Do | Alejandro |
| 77 | [145](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/145) | Recibir una notificación al procesar devolución de depósito | - | Media | 4 | 4h | To Do | Alejandro |
| - | [#148](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/148) | Sprint 1 Backlog - Squad 3 | - | Alta | 2 | 2h | Done | Alejandro |
| - | [#148](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/181) | Crear Documento 6-S1-dedication.xlsx | - | Alta | 1 | 0.5h | To Do | Marta |
| - | [#148](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/182) | Crear Documento 6-S1-deliverable.pdf | - | Alta | 1 | 0.5h | To Do | Marta |
| - | [#148](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/183) | Crear Documento 6-S1-slides.pdf | - | Alta | 1 | 0.5h | To Do | Marta |
| - | [#148](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/183) | Crear Documento 6-S1-time-report.pdf | - | Alta | 1 | 0.5h | To Do | Marta |

## 4. Resumen carga de trabajo

| Responsable | Horas asignadas | Story Points asignados |
|-------------|-----------------|------------------------|
| Adrián      | 9h              | 9 SP                   |
| Alejandro   | 12h             | 12 SP                  |
| Guillermo   | 4h              | 4 SP                   |
| Marta       | 7h              | 9 SP                   |
| Rafael      | 7h              | 7 SP                   |
| **TOTAL SQUAD** | **39h**     | **41 SP**              |

## 5. Historial de versiones

| Versión | Fecha       | Descripción                    | Autor(es)                      |
|---------|-------------|--------------------------------|--------------------------------|
| 1.0.0   | 25/02/2026  | Versión inicial                |  Alejandro González Macías     |

---
**Redactado por:** Alejandro González Macías
**Fecha de redacción:** 25/02/2026
**Versión:** 1.0.0