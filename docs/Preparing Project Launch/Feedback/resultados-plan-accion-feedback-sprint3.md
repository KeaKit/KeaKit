# Resultados del plan de acción ante el feedback recibido en el PPL

Tras analizar el feedback recibido tanto por parte de los usuarios piloto como de los grupos **Rooma** y **Bookmerang** durante el Sprint 3, se han identificado todas las incidencias detectadas y se ha definido un plan de acción a ejecutar en el PPL.

El objetivo principal es corregir errores críticos, completar funcionalidades no validadas y mejorar la experiencia de usuario.

---

## Tabla comparativa: Problemas detectados vs estado tras PPL

| **Categoría**                    | **Problemas detectados (Sprint 3)**                                                                                                                                   | **Estado tras PPL**                                                                                                                                         |
|---------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **CU-GENERAL**                  | Error "Type definition error" al crear incidencia, error 400 por código promocional duplicado, descuento del 0% permitido, artículos y alquileres con fechas vigentes marcados como "finalizado" | ✔ Corregido error de incidencias <br>  ✔ Validación unicidad y rango de descuentos <br> ✔ Corregido el estado de artículos y alquileres  |
| **CU-ARRENDADOR**               | Sin validadores de título y unidades (panic error), error Stripe `balance_insufficient`, filtro de precios sin validación, bonificación por piloto no visible | ✔ Validaciones de título y unidades <br> ✔ Revisión integración Stripe <br> ✔ Validación del filtro de precios  <br> ✔ Mostrar bonificación explícita |
| **CU-ARRENDATARIO**             |   flujo de creación de kit poco intuitivo, pantalla de pago con baja confianza |   ✔ Mejoras en flujo de creación de kit <br> ✔ Mejora de pantalla de pago |
| **CU-ADMIN**                    | cambio de nombre por admin no reflejado en sesión del usuario| ✔ Sincronización de sesión en revisión  |
| **Datos de prueba**             | Seeders con artículos marcados como finalizados cuando sus fechas de disponibilidad aún están vigentes                                                                 | ✔ Seeders corregidos                                                                                                                                                      |
| **Usabilidad / UX**             | Vista de añadir artículos al kit demasiado pequeña, ausencia de buscador en creación de kit,  foto del artículo no visible en detalle del kit, botón del home confuso, selector de fecha en servicios poco eficiente |  ✔ Mejora visual de la aplicación  |
| **CU-ARRENDADOR (gestión)**     | Botones editar/borrar visibles aunque el artículo esté alquilado | ✔ Ocultación condicional de botones implementada |
| **CU-ARRENDATARIO (disponibilidad)** | Servicio no disponible aparece como seleccionable en la creación de kit | ✔ Filtrado de servicios no disponibles según fechas |
| **CU-ADMIN (categorías)**       | Inconsistencia: el admin puede crear una categoría con precio mínimo 0€ pero el owner no puede usarlo al crear un artículo | ✔ Validación unificada entre categorías y artículos |
| **CU-ADMIN (cobertura)**        | CU-ADMIN-05 (configuración modelo de negocio) y CU-ADMIN-06 (creación kits predeterminados) no pudieron ser probados por los grupos piloto | ✔ Pruebas planificadas y funcionalidades verificadas |
| **Cumplimiento normativo**      | Sin opción de borrado de datos sensibles (GDPR) | ✔ Implementada funcionalidad de borrado de cuenta y datos personales |

---

## Tabla comparativa: Problemas y soluciones aplicadas

| **Categoría del problema**           | **Problemas detectados**                                                                                           | **Solución planificada**                                                                                                               |
|--------------------------------------|-------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Errores funcionales críticos**     | Error "Type definition error" al crear incidencia; error Stripe `balance_insufficient` | Revisión del modelo de datos y mapeo de tipos en backend; revisión completa de la integración con Stripe (saldo, webhooks y manejo de excepciones)   |
| **Validaciones ausentes**            | Sin validación de título ni de número de unidades en subida/edición de artículos; filtro de precios sin validación | Añadir validaciones de longitud, tipo y rango en frontend y backend; limitar `totalUnits` a un rango razonable; validar campos del filtro de precios |
| **Lógica de estados incorrecta**     | Artículos y alquileres con fechas vigentes marcados como "finalizado"     | Unificación de la lógica de cálculo de estado entre arrendadores y arrendatarios;           |
| **Datos de prueba incoherentes**     | Seeders con estados de artículos inconsistentes respecto a sus rangos de disponibilidad                            | Corrección de seeders                                                    |
| **Usabilidad / UX del kit**          | Flujo de creación poco intuitivo, pantalla de pago sin promotores, ausencia de buscador, vista de artículos pequeña | Mejora de la interfaz de usuario|
| **Información insuficiente**         |  bonificación por piloto no visualizada |  mostrar descuento explícito          |
| **Descuentos y códigos promociónales** | Error 400 al crear código duplicado; descuento del 0% permitido| Añadir validación de unicidad; restringir rango de descuento a 1-100                  |
| **Sincronización de sesión**         | Cambio de nombre por admin no reflejado en sesión activa del usuario                                               | Implementar mecanismo de refresco de sesión; sincronizar datos del usuario logueado en cada carga de página                          |
| **Portal de incidencias**            | Fallo en envío del formulario (2 afectados); baja visibilidad del portal                                           | Depurar y corregir el endpoint de envío del formulario; mejorar el acceso al portal desde la interfaz principal                                      |
| **Navegación y nomenclatura**        | Botón del home confuso; confusión conceptual con la sección "Kits"; selector de fecha por scroll poco eficiente   | Revisar destino del botón o añadir texto explicativo; revisar nombre y descripción de la sección; sustituir scroll por selector de año/mes           |
| **Gestión de artículos (UX)**   | Botones de editar y borrar visibles aunque el artículo esté alquilado                                             | Implementar ocultación condicional de botones según el estado del artículo                                                                           |
| **Disponibilidad de servicios** | Servicio no disponible aparece como seleccionable durante la creación de un kit                                    | Filtrar servicios según disponibilidad de fechas; sincronizar estado con el mapa y el botón de compra                                               |
| **Consistencia de categorías**  | El admin puede fijar precio mínimo 0€ en una categoría, pero el owner no puede crear artículos con ese valor       | Unificar la validación de precio mínimo entre la gestión de categorías y la creación de artículos                                                    |
| **Cobertura de pruebas (admin)**| CU-ADMIN-05 y CU-ADMIN-06 no probados por ningún grupo piloto                                                     | Planificar y ejecutar pruebas específicas; verificar que comisiones y kits predeterminados funcionen correctamente                                    |
| **Cumplimiento normativo**      | Sin opción de borrado de datos sensibles del usuario (GDPR)                                                        | Implementar funcionalidad de borrado de cuenta o datos personales; revisar acceso, rectificación y supresión                                         |

---

## Tabla: Tareas planificadas y mejoras esperadas

| **Categoría**                    | **Tareas planificadas**                                                                                  | **Mejoras esperadas**                                                                                    |
|---------------------------------|----------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| **Incidencias (soporte)**       | - Corrección error "Type definition error" en backend| - Funcionalidad de soporte operativa <br> - Mejor visibilidad del progreso de incidencias               |
| **Pagos (Stripe)**              | - Revisión lógica de saldo antes de llamar a Stripe <br> - Corrección del error de pago al alquilar kit <br> - Mensajes de error amigables para el usuario | - Retirada de ingresos funcional <br> - Pago de kits sin errores <br> - Mejor experiencia ante fallos  |
| **Validaciones de artículos**   | - Validación de longitud de título y rango de unidades <br> - Validación del filtro de precios          | - Prevención de panic errors y datos corruptos <br> - Búsquedas consistentes                            |
| **Flujo de creación de kit**    |  - Implementación de buscador/filtro <br> - Indicación de stock disponible <br> - Mejora de la pantalla de pago | - Flujo más intuitivo y completo <br> - Mayor confianza en el proceso de compra                         |
| **Lógica de estados**           | - Artículos y alquileres con fechas vigentes marcados como "finalizado" | - Información coherente    |
| **Información visual**          |- Mostrar bonificación por piloto explícitamente       | - Beneficio percibido por usuarios piloto       |
| **Datos de prueba**             | - Corrección de seeders con estados coherentes                                                           | - Estados de artículos y alquileres consistentes                                                        |
| **Descuentos / Promociones**    | - Validación de unicidad y rango de descuento               | - Gestión de promociones sin errores               |
| **Sincronización de sesión**    |  Mecanismo de refresco de sesión al modificar datos desde admin                                         | - Consistencia de datos visuales para el usuario editado                                                |
| **Portal de incidencias**       | - Depuración del endpoint de envío <br> - Mejora de visibilidad del acceso al portal                    | - Formulario funcional para todos los usuarios <br> - Mayor tasa de reporte de incidencias              |
| **UX / Navegación**             | - Selector de fecha por año/mes en servicios <br> - Revisión nomenclatura "Kits" <br> - Ajuste botón home | - Menor confusión conceptual <br> - Interacciones más rápidas y claras                                 |
| **Gestión de artículos (UX)**   | - Ocultación de botones editar/borrar cuando el artículo está alquilado                                   | - Mejor experiencia de usuario <br> - Prevención de acciones no permitidas                             |
| **Disponibilidad de servicios** | - Filtrado de servicios no disponibles en la creación de kits                                             | - Flujo de creación de kit sin bloqueos <br> - Sincronización correcta con el mapa                     |
| **Consistencia de categorías**  | - Unificación de validación de precio mínimo entre admin y owner                                          | - Datos coherentes <br> - Eliminación de bloqueo al crear artículos                                    |
| **Cobertura admin**             | - Pruebas de CU-ADMIN-05 (modelo de negocio) y CU-ADMIN-06 (kits predeterminados)                        | - Validación completa de funcionalidades críticas del administrador                                     |
| **Cumplimiento normativo**      | - Implementación de borrado de cuenta y datos personales (GDPR)                                           | - Cumplimiento normativo garantizado <br> - Eliminación de riesgo legal                                |

---

## Conclusión

El análisis del feedback del Sprint 3, procedente tanto de los usuarios piloto como de los grupos **Rooma** y **Bookmerang**, ha permitido identificar un conjunto de incidencias prioritarias que serán abordadas en el PPL:

- Resolver **errores críticos** que bloquean funcionalidades clave: formulario de incidencias, pagos con Stripe y validaciones ausentes en la subida de artículos.
- Completar y mejorar el **flujo de creación de kits**, que es la funcionalidad central del producto y ha presentado la mayor cantidad de feedback negativo.
- Corregir **inconsistencias en la lógica de estados** de artículos y alquileres para garantizar información coherente en todos los roles.

El sistema se encuentra en un estado funcional con áreas de mejora claras y bien priorizadas, lo que permitirá avanzar hacia un producto más **estable, completo y satisfactorio** para todos los perfiles de usuario.
