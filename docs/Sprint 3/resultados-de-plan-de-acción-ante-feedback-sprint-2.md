# Resultados del plan de acción ante el feedback recibido en el Sprint 3

Tras analizar el feedback recibido por parte de otros grupos durante el Sprint 2, se han abordado todas las incidencias detectadas mediante un plan de acción ejecutado en el Sprint 3.

El objetivo principal ha sido corregir errores críticos, completar funcionalidades no implementadas y mejorar la experiencia de usuario.

---

## Tabla comparativa: Problemas detectados vs estado tras Sprint 3

| **Categoría**                    | **Problemas detectados (Sprint 2)**                                                                 | **Estado tras Sprint 3**                                                                 |
|---------------------------------|----------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| **CU-GENERAL**                  | Fallos visuales, valoraciones no accesibles, errores en incidencias                               | ✔ Corregidos errores visuales <br> ✔ Acceso a valoraciones habilitado <br> ✔ Flujo de incidencias corregido |
| **CU-ARRENDADOR**              | Error en retirada de ingresos (Stripe), falta de datos de prueba                                  | ✔ Integración con Stripe corregida <br> ✔ Datos de prueba completos                     |
| **CU-ARRENDATARIO**            | Creación de kits poco intuitiva, pago no verificable, funcionalidades incompletas                 | ✔ Flujo simplificado <br> ✔ Pago funcional con datos de prueba <br> ✔ Kits predeterminados implementados |
| **CU-ADMIN**                   | Kits predeterminados inexistentes, UX mejorable                                                    | ✔ CRUD completo de kits predeterminados <br> ✔ Mejoras de navegación y redirección      |
| **Datos de prueba**            | Insuficientes para validar funcionalidades                                                        | ✔ Seeders completos con múltiples estados                                                |
| **Usabilidad / UX**            | Flujos poco intuitivos                                                                            | ✔ Mejora global de navegación y claridad                                                 |
| **Búsqueda geográfica**        | Ubicación no actualizada en mapa                                                                  | ✔ Sincronización correcta de ubicación                                                   |

---

## Tabla comparativa: Problemas y soluciones aplicadas

| **Categoría del problema**       | **Problemas detectados**                                                                 | **Solución aplicada en Sprint 3**                                                                 |
|----------------------------------|------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| **Errores funcionales críticos** | Error en Stripe (retirada de ingresos)                                                   | Revisión completa de integración con Stripe Connect, sincronización de saldo y validaciones      |
| **Funcionalidades no implementadas** | Kits predeterminados, modificación de kits                                              | Implementación completa del CRUD de kits predeterminados y su uso en arrendatarios              |
| **Datos de prueba insuficientes** | Falta de datos para probar valoraciones, pagos y artículos                               | Creación de seeders con estados variados (alquilado, finalizado, disponible)                    |
| **Usabilidad / UX**              | Flujos complejos (kits, incidencias, alquiler)                                           | Simplificación de flujos, mensajes guía y mejoras visuales                                       |
| **Errores de validación**        | Formularios inconsistentes o con validaciones insuficientes                              | Validaciones reforzadas en frontend y backend                                                    |
| **Gestión de artículos**         | Eliminación de artículos en alquiler, estados inconsistentes                             | Control de estado antes de eliminar y validaciones adicionales                                   |
| **Geolocalización**              | Ubicación no reflejada en el mapa                                                        | Integración de selector de ubicación y sincronización con datos                                 |
| **Navegación**                   | Redirecciones incorrectas en panel admin                                                 | Corrección de rutas y redirecciones tras acciones                                                |

---

## Tabla: Tareas realizadas y mejoras obtenidas

| **Categoría**                    | **Tareas realizadas**                                                                 | **Mejoras conseguidas**                                                                 |
|---------------------------------|--------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| **Pagos (Stripe)**              | - Refactorización integración Stripe <br> - Revisión de balance disponible           | - Retirada de ingresos funcional <br> - Mayor fiabilidad en pagos                        |
| **Kits predeterminados**        | - Desarrollo CRUD admin <br> - Integración en flujo de creación de kits              | - Funcionalidad completa y reutilizable <br> - Mejora en experiencia de usuario          |
| **Datos de prueba**             | - Implementación de seeders completos                                                | - Posibilidad de probar todos los casos de uso                                           |
| **Gestión de artículos**        | - Validación de estados <br> - Control de eliminación                                | - Consistencia en datos <br> - Prevención de errores críticos                            |
| **Valoraciones**                | - Ajuste de lógica de visibilidad <br> - Acceso a historial                          | - Funcionalidad accesible y comprobable                                                  |
| **Portal de incidencias**       | - Corrección de formularios <br> - Mejora de flujo                                   | - Envío correcto <br> - Mejor experiencia de usuario                                     |
| **Geolocalización**             | - Integración de mapa y selección de ubicación                                       | - Ubicación coherente en artículos                                                       |
| **UX / Navegación**             | - Rediseño de flujos <br> - Mejora de mensajes e iconos                              | - Aplicación más intuitiva <br> - Reducción de errores de uso                            |

---

## Conclusión

El Sprint 3 ha permitido:

- Resolver **todas las incidencias detectadas en el Sprint 2**.  
- Completar funcionalidades críticas que bloqueaban casos de uso importantes.  
- Mejorar significativamente la **calidad del producto y la experiencia de usuario**.  

El sistema se encuentra ahora en un estado mucho más **estable, usable y testeable**, permitiendo validar correctamente todos los flujos principales de la aplicación.