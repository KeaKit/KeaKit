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
| 10     | HU   | HU-ARRENDADOR-09   | Como arrendador, quiero registrarme como proveedor de objetos, para poder ganar dinero con ellos. | M | - | Done |
| 30     | HU   | HU-ARRENDADOR-29   | Como arrendador, quiero valorar al arrendatario, para que otros propietarios sepan si es un usuario cuidadoso. | M | - | Done |
| 36     | HU   | HU-ARRENDADOR-35   | Como arrendador, quiero poder editar los datos de mi perfil de usuario, para poder actualizarlos en caso de sufrir alguna modificación. | M | - | Done |
| 37     | HU   | HU-ARRENDATARIO-01 | Como arrendatario, quiero registrarme en la app, para poder crear y alquilar kits. | M | - | Done |
| 38     | HU   | HU-ARRENDATARIO-02 | Como arrendatario, quiero iniciar sesión fácilmente, para acceder a mis kits y pedidos. | M | - | Done |
| 39     | HU   | HU-ARRENDATARIO-03 | Como arrendatario, quiero indicar mis datos básicos, para que se gestionen correctamente pagos y envíos. | M | - | Done |
| 70     | HU   | HU-ARRENDATARIO-34 | Como arrendatario, quiero valorar y dejar un comentario sobre el kit y el arrendador tras la devolución, para ayudar a otros usuarios. | M | - | Done |
| 74     | HU   | HU-ARRENDATARIO-38 | Como arrendatario, quiero poder confirmar desde la app que el objeto recibido coincide con la descripción, imágenes y estado prometido, para validar que el servicio se ha cumplido correctamente. | M | - | Done |
| 75     | HU   | HU-ARRENDATARIO-39 | Como arrendatario, quiero poder indicar que el objeto no cumple con lo prometido, para que se revise el caso antes de liberar el pago completo al arrendador. | M | - | In Progress |
| 77     | HU   | HU-ARRENDATARIO-41 | Como arrendatario, quiero recibir una notificación cuando se procese la devolución de mi depósito, para saber que el proceso ha finalizado correctamente. | M | - | In Progress |
| 78     | HU   | HU-ARRENDATARIO-42 | Como arrendatario, quiero poder editar mis datos básicos, para que se gestionen correctamente pagos y envíos. | M | - | Done |
| 91     | HU   | HU-ADMIN-13        | Como administrador, quiero registrarme con un usuario específico con rol diferenciado, para gestionar la plataforma. | M | - | Done |

## 3. Desglose en tareas

*Cada PBI se descompone en tareas concretas y ejecutables.*

| PBIs asociados | ID Issue | Descripción | Dependencias técnicas | Prioridad | Estimación (SP) | Estimación (horas) | Estado | Responsable |
|----------------|----------|-------------|-----------------------|-----------|-----------------|--------------------|--------|-------------|
| 10, 37, 38, 91 | [156](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/156) | Backend de registro e inicio de sesión | - | Alta | 3 | 3h | Done | Rafael |
| 10, 37, 38, 91 | [157](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/157) | Frontend de registro e inicio de sesión | - | Alta | 4 | 4h | Done | Adrián |
| 36, 39, 78 | [164](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/164) | Backend de gestión de datos personales | - | Media | 2 | 2h | Done | Adrián, Marta |
| 36, 39, 78 | [165](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/165) | Frontend de gestión de datos personales | - | Media | 3 | 3h | Done | Adrián, Marta |
| 70 | [158](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/158) | Valorar y dejar un comentario por parte de los arrendatarios | - | Alta | 4 | 4h | Done | Rafael |
| 30 | [159](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/159) | Valorar y dejar un comentario por parte de los arrendadores | - | Alta | 4 | 4h | Done | Guillermo |
| 74 | [143](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/143) | Confirmar recepción | - | Alta | 3 | 3h | Done | Alejandro |
| 75 | [144](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/144) | Indicar que el objeto no cumple con los prometido | - | Media | 4 | 4h | In Progress | Alejandro |
| 77 | [145](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/145) | Recibir una notificación al procesar devolución de depósito | - | Media | 4 | 4h | In Progress | Alejandro |
| - | [#146](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/146) | Pantalla de inicio básica | - | Alta | 2 | 2h | Done | Rafael |
| - | [#148](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/148) | Sprint 1 Backlog - Squad 3 | - | Alta | 2 | 2h | Done | Alejandro |
| - | [#179](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/179) | Análisis del cumplimiento del Commitment Agreement | - | Alta | 2 | 2h | Done | Adrián |
| - | [#181](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/181) | Crear Documento 6-S1-dedication.xlsx | - | Alta | 1 | 0.5h | Done | Marta |
| - | [#182](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/182) | Crear Documento 6-S1-deliverable.pdf | - | Alta | 1 | 0.5h | Done | Marta |
| - | [#183](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/183) | Crear Documento 6-S1-slides.pdf | - | Alta | 1 | 0.5h | Done | Marta |
| - | [#184](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/184) | Crear Documento 6-S1-time-report.pdf | - | Alta | 1 | 0.5h | Done | Marta |
| - | [#201](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/201) | Información y Gestión de los Usuarios Piloto | - | Alta | 4 | 4h | Done | Marta |
| - | [#206](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/206) | Corrección de errores en despliegue | - | Alta | 4 | 4h | Done | Alejandro, Guillermo |
| - | [#207](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/207) | Despliegue | - | Alta | 5 | 5h | Done | Guillermo |
| - | [#208](https://app.zenhub.com/workspaces/keakit-6999a958ea1b41001cb6e269/issues/gh/keakit/keakit/208) | Configuración de entorno | - | Alta | 5 | 5h | Done | Guillermo |

## 4. Resumen carga de trabajo

| Responsable | Horas asignadas | Story Points asignados |
|-------------|-----------------|------------------------|
| Adrián      | 11h             | 11 SP                  |
| Alejandro   | 17h             | 17 SP                  |
| Guillermo   | 13h             | 13 SP                  |
| Marta       | 14h             | 14 SP                  |
| Rafael      | 9h              | 9 SP                   |
| **TOTAL SQUAD** | **64h**     | **64 SP**              |

## 5. Historial de versiones

| Versión | Fecha       | Descripción                    | Autor(es)                      |
|---------|-------------|--------------------------------|--------------------------------|
| 1.0.0   | 25/02/2026  | Versión inicial                |  Alejandro González Macías     |
| 1.0.1   | 03/04/2026  | Actualizar a final de Sprint   |  Alejandro González Macías     |

---
**Redactado por:** Alejandro González Macías
**Fecha de redacción:** 23/04/2026
**Versión:** 1.0.1