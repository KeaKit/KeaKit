# Definición de Hecho (Definition of Done - DoD)

## Índice del documento

1. [Introducción](#1-introducción)
2. [Funcionalidad implementada](#2-funcionalidad-implementada)
3. [Funcionalidad probada](#3-funcionalidad-probada)
4. [Código revisado](#4-código-revisado)
5. [Documentación completada y revisada](#5-documentación-completada-y-revisada)
6. [Funcionalidad integrada](#6-funcionalidad-integrada)
7. [Funcionalidad desplegada](#7-funcionalidad-desplegada)
8. [Funcionalidad aceptada](#8-funcionalidad-aceptada)
9. [Código refactorizado](#9-código-refactorizado)

## 1. Introducción

El presente documento define la Definición de Hecho (Definition of Done, DoD) del proyecto, estableciendo los criterios que debe cumplir una funcionalidad para considerarse finalizada y evitando ambigüedades sobre cuándo una tarea está completa.

Para ello, recoge los estándares mínimos de desarrollo, pruebas, revisión, documentación, integración, despliegue y aceptación.

Su aplicación permite mejorar la mantenibilidad del sistema, facilitar el trabajo en equipo y asegurar el cumplimiento de los requisitos establecidos.

## 2. Funcionalidad implementada

Una funcionalidad se considera implementada si...

- El código compila correctamente y no presenta fallos críticos que impidan su uso.
- El código satisface los criterios de aceptación de la HU.
- Los formularios validan los datos introducidos (obligatoriedad, tamaño, formato, etc.) y muestra mensajes claros en caso de error.
- La ortografía y gramática de la interfaz es correcta.
- El código es comprensible por los demás miembros del equipo.
- El código está correctamente formateado y no contiene comentarios innecesarios.
- El usuario no puede acceder a datos ajenos (excepto si es administrador).

## 3. Funcionalidad probada

Una funcionalidad se considera probada si...

- El código asociado tiene un 70% o más de cobertura mediante pruebas unitarias.
- Presenta el comportamiento esperado por su desarrollador.
- Cumple los criterios de aceptación tras su ejecución.

## 4. Código revisado

El código se considera revisado si...

- Pasa correctamente todas las pruebas.
- Ha sido revisado por al menos otro miembro del equipo.
- Se han aplicado las mejoras o correcciones propuestas durante la revisión.
- La funcionalidad cumple los requisitos definidos.
- La usabilidad es intuitiva para sus revisores.
- Pasa todos los workflows de integración continua.

## 5. Documentación completada y revisada

La documentación se considera completada y revisada si...

- Incluye todo el contenido esperado.
- Sigue la plantilla establecida (si procede) y está bien formateado.
- No tiene enlaces ni imágenes mal enlazados.
- No tiene faltas de ortografía ni errores gramaticales.
- Es clara y comprensible para los revisores.

## 6. Funcionalidad integrada

Una funcionalidad se considera integrada si...

- Se encuentra en la rama *develop*.
- No provoca fallos en otras funcionalidades.
- El sistema compila y se ejecuta correctamente tras la integración.
- La rama *develop* pasa todos los workflows de integración continua tras el merge.

## 7. Funcionalidad desplegada

Una funcionalidad se considera desplegada si...

- El código se encuentra desplegado en el entorno correspondiente.
- La funcionalidad es accesible públicamente desde internet.
- La funcionalidad está lista para ser probada por los usuarios piloto.

## 8. Funcionalidad aceptada

Una funcionalidad se considera aceptada si...

- Los usuarios piloto y el profesorado no detectan errores críticos ni comportamientos inesperados.
- Los usuarios piloto y el profesorado la consideran intuitiva y usable.

## 9. Código refactorizado

El código se considera refactorizado si...

- Compila correctamente y no presenta fallos críticos que impidan su uso.
- Pasa todas las pruebas y workflows de integración continua correctamente.
- Mejora la legibilidad, mantenibilidad o estructura respecto a la versión anterior.
- Es comprensible por los demás miembros del equipo.
- Está correctamente formateado.
- No contiene código duplicado ni comentarios innecesarios.

## 10. Historial de versiones

| Versión | Fecha      | Descripción                                              | Autor(es)                  |
| ------- | ---------- | -------------------------------------------------------- | -------------------------- |
| 1.0.0   | 10/02/2026 | Primera versión de la definición de hecho                | Paula Rosa González Páez   |
| 1.1.0   | 10/02/2026 | Priorización Core vs Extras                              | Paula Rosa González Páez   |
| 2.0.0   | 12/05/2026 | Cambio de "DoD del proyecto" a "DoD de tarea completada" | Lucía Ponce García de Sola |

---

**Redactado por:** Paula Rosa González Páez y Lucía Ponce García de Sola  
**Fecha:** 12/05/2026  
**Versión:** 2.0.0
