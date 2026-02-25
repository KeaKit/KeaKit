# Registro de Incidencias y Riesgos - Proyecto KeaKit

Este documento detalla las incidencias reales detectadas durante el desarrollo, vinculándolas con el Plan de Gestión de Riesgos y las acciones correctivas aplicadas.

---

## 1. Desfase en el desglose de Historias de Usuario
* **Problema/incidencia:** Se identificaron historias de usuario asignadas que no tenían tareas técnicas creadas ni estimadas, lo que impedía el seguimiento del progreso real.
* **Riesgo asociado:** **R17 – Estimación y Planificación (Prioridad Alta).** Incumplimiento de dependencias críticas en el roadmap.
* **Plan de contingencia:** Asignación temporal de recursos para desatascar el cuello de botella organizativo.
* **Acciones correctivas:** División inmediata dichas *issues* para recuperar el equilibrio del Sprint.

---

## 2. Bloqueo de peticiones POST en Backend (Error 403)
* **Problema/incidencia:** Spring Boot devolvía error 403 al intentar realizar peticiones POST debido a la falta de una configuración de seguridad compatible con el estado actual del registro de usuarios.
* **Riesgo asociado:** **R1 – Técnico (Prioridad Media).** Función demasiado compleja o configuración bloqueante del stack elegido.
* **Plan de contingencia:** Refactorización técnica urgente. La resolución tomó aproximadamente **40 minutos**.
* **Acciones correctivas:** Creación de `SecurityConfig` deshabilitando CSRF.
    * Implementación de `permitAll()` para permitir el flujo de datos mientras se integra correctamente la autenticación de Spring.

---

## 3. Fallo en entorno de desarrollo (DevContainer) y CI
* **Problema/incidencia:** El DevContainer falló críticamente y el flujo de CI no se ejecutaba por errores en la estructura del proyecto.
* **Riesgo asociado:** **R2 – Técnico (Prioridad Media).** Incompatibilidad en herramientas de desarrollo o despliegue.
* **Plan de contingencia:** Búsqueda y migración a configuraciones alternativas compatibles.
* **Acciones correctivas:** Ajuste de los flujos de CI de GitHub para adaptarse a la estructura jerárquica del proyecto.
    * Creación de instrucciones detalladas de instalación manual en GitHub como respaldo ante fallos del contenedor.

---

## 4. Complejidad en la infraestructura de despliegue
* **Problema/incidencia:** Necesidad técnica de gestionar tres instancias independientes (Servidor API, Frontend Web y App Móvil) para el funcionamiento correcto del ecosistema.
* **Riesgo asociado:** **R5 – Técnico (Prioridad Alta).** Riesgos de infraestructura o caída de servidores cloud por complejidad de despliegue.
* **Plan de contingencia:** Resolución técnica iterativa y soporte directo para asegurar la disponibilidad.
* **Acciones correctivas:** Configuración y despliegue de servidores por separado.
    * Documentación técnica de la infraestructura para facilitar futuras intervenciones.

---

## 5. Reestructuración de Casos de Uso (Core / No Core)
* **Problema/incidencia:** Durante el Sprint 1 se identificó que la clasificación inicial de casos de uso core y no core no reflejaba correctamente el valor funcional ni las dependencias técnicas, lo que obligó a reestructurar, unificar y añadir nuevos casos de uso.
* **Riesgo asociado:** **R17 – Estimación y Planificación (Prioridad Alta).** Incumplimiento de dependencias críticas en el roadmap.
* **Plan de contingencia:** Revisión extraordinaria del Product Backlog y replanificación interna del Sprint.
* **Acciones correctivas:** Refinamiento completo del backlog.
    * Actualización de la documentación pertinente.
    * Redefinición de prioridades según su criticidad funcional (Core vs No Core).

---

## Resumen de Impacto

| Incidencia | Categoría | Prioridad | Estado |
| :--- | :--- | :--- | :--- |
| Gestión de HUs | Estimación (EP) | Alta | Solucionado |
| Error 403 Spring | Técnico (TE) | Media | Solucionado |
| Fallo DevContainer | Técnico (TE) | Media | Solucionado |
| Despliegue Triple | Técnico (TE) | Alta | Solucionado / Documentado |
| Reestructuración Casos de Uso | Estimación (EP) | Alta | Solucionado |

---


## Historial de Versiones

| Versión | Fecha       | Descripción                   | Autor(es)       |
|---------|------------|--------------------------------|------------|
| 1.0.0 | 25/02/2026 | Versión inicial con registros principales | Paula Rosa González Páez |
| 1.1.0 | 25/02/2026 | Añadidos nuevos registros e historial de versiones | Ángel Amo Sánchez |

---

**Redactado por:** Paula Rosa González Páez y Ángel Amo Sánchez
**Fecha de redacción:** 25/02/2026  
**Versión:** 1.1.0
