# Registro de Incidencias y Riesgos - Proyecto KeaKit

Este documento detalla las incidencias reales detectadas durante el desarrollo, vinculándolas con el Plan de Gestión de Riesgos y las acciones correctivas aplicadas.

## Índice
1. [Registro de incidencias y riesgos acontecidos](#1-registro-de-incidencias-y-riesgos-acontecidos)
   - 1.1. [Desfase en el desglose de Historias de Usuario](#11-desfase-en-el-desglose-de-historias-de-usuario)
   - 1.2. [Bloqueo de peticiones POST en Backend (Error 403)](#12-bloqueo-de-peticiones-post-en-backend-error-403)
   - 1.3. [Fallo en entorno de desarrollo (DevContainer) y CI](#13-fallo-en-entorno-de-desarrollo-devcontainer-y-ci)
   - 1.4. [Complejidad en la infraestructura de despliegue](#14-complejidad-en-la-infraestructura-de-despliegue)
   - 1.5. [Reestructuración de Casos de Uso (Core / No Core)](#15-reestructuración-de-casos-de-uso-core--no-core)
   - 1.6. [Fallo en la carga dinámica de variables de entorno](#16-fallo-en-la-carga-dinámica-de-variables-de-entorno)
   - 1.7. [Cuello de botella por concentración de trabajo en una sola persona](#17-cuello-de-botella-por-concentración-de-trabajo-en-una-sola-persona)
   - 1.8. [Ausencia imprevista del responsable de tarea crítica](#18-ausencia-imprevista-del-responsable-de-tarea-crítica)
2. [Resumen de Impacto](#2-resumen-de-impacto)
3. [Historial de Versiones](#3-historial-de-versiones)


## 1. Registro de incidencias y riesgos acontecidos

### 1.1. Desfase en el desglose de Historias de Usuario
* **Problema/incidencia:** Se identificaron historias de usuario asignadas que no tenían tareas técnicas creadas ni estimadas, lo que impedía el seguimiento del progreso real.
* **Riesgo asociado:** **R17 – Estimación y Planificación (Prioridad Alta).** Incumplimiento de dependencias críticas en el roadmap.
* **Plan de contingencia:** Asignación temporal de recursos para desatascar el cuello de botella organizativo.
* **Acciones correctivas:** División inmediata dichas *issues* para recuperar el equilibrio del Sprint.


### 1.2. Bloqueo de peticiones POST en Backend (Error 403)
* **Problema/incidencia:** Spring Boot devolvía error 403 al intentar realizar peticiones POST debido a la falta de una configuración de seguridad compatible con el estado actual del registro de usuarios.
* **Riesgo asociado:** **R1 – Técnico (Prioridad Media).** Función demasiado compleja o configuración bloqueante del stack elegido.
* **Plan de contingencia:** Refactorización técnica urgente. La resolución tomó aproximadamente **40 minutos**.
* **Acciones correctivas:** Creación de `SecurityConfig` deshabilitando CSRF.
    * Implementación de `permitAll()` para permitir el flujo de datos mientras se integra correctamente la autenticación de Spring.


### 1.3. Fallo en entorno de desarrollo (DevContainer) y CI
* **Problema/incidencia:** El DevContainer falló críticamente y el flujo de CI no se ejecutaba por errores en la estructura del proyecto.
* **Riesgo asociado:** **R2 – Técnico (Prioridad Media).** Incompatibilidad en herramientas de desarrollo o despliegue.
* **Plan de contingencia:** Búsqueda y migración a configuraciones alternativas compatibles.
* **Acciones correctivas:** Ajuste de los flujos de CI de GitHub para adaptarse a la estructura jerárquica del proyecto.
    * Creación de instrucciones detalladas de instalación manual en GitHub como respaldo ante fallos del contenedor.


### 1.4. Complejidad en la infraestructura de despliegue
* **Problema/incidencia:** Necesidad técnica de gestionar tres instancias independientes (Servidor API, Frontend Web y App Móvil) para el funcionamiento correcto del ecosistema.
* **Riesgo asociado:** **R5 – Técnico (Prioridad Alta).** Riesgos de infraestructura o caída de servidores cloud por complejidad de despliegue.
* **Plan de contingencia:** Resolución técnica iterativa y soporte directo para asegurar la disponibilidad.
* **Acciones correctivas:** Configuración y despliegue de servidores por separado.
    * Documentación técnica de la infraestructura para facilitar futuras intervenciones.


### 1.5. Reestructuración de Casos de Uso (Core / No Core)
* **Problema/incidencia:** Durante el Sprint 1 se identificó que la clasificación inicial de casos de uso core y no core no reflejaba correctamente el valor funcional ni las dependencias técnicas, lo que obligó a reestructurar, unificar y añadir nuevos casos de uso.
* **Riesgo asociado:** **R17 – Estimación y Planificación (Prioridad Alta).** Incumplimiento de dependencias críticas en el roadmap.
* **Plan de contingencia:** Revisión extraordinaria del Product Backlog y replanificación interna del Sprint.
* **Acciones correctivas:** Refinamiento completo del backlog.
    * Actualización de la documentación pertinente.
    * Redefinición de prioridades según su criticidad funcional (Core vs No Core).


### 1.6. Fallo en la carga dinámica de variables de entorno
* **Problema/incidencia:** Tras incorporar la configuración de autenticación JWT, las variables de entorno definidas en el archivo `.env` no se recargaban automáticamente al reiniciar Spring Boot. Esto provocaba que `JWT_SECRET` mantuviera un valor obsoleto o demasiado corto, causando excepciones de seguridad y bloqueando el correcto funcionamiento del sistema.
* **Riesgo asociado:** **R1 – Técnico (Prioridad Media).** Configuración bloqueante del stack elegido.
* **Plan de contingencia:** Migración de la dependencia `dotenv-java` (que requiere carga manual en código) a `spring-dotenv` (`me.paulschwarz`), que integra automáticamente la lectura del archivo `.env` en el ciclo de vida de Spring Boot.
* **Acciones correctivas:** 
    * Integración de `spring-dotenv` para automatizar la carga de variables sin intervención manual en `main()`.
    * Validación del correcto funcionamiento. 


### 1.7. Cuello de botella por concentración de trabajo en una sola persona
* **Problema/Incidencia:** Se asignó una issue de alta complejidad técnica a un único desarrollador, sin división previa en subtareas (backend, frontend, testing). Esto provocó un retraso significativo en el desarrollo y en la integración a `develop`, bloqueando el inicio de tareas dependientes y afectando el flujo de trabajo del equipo.
* **Riesgo asociado:** **R17 – Estimación y Planificación (Prioridad Alta).** Falta de paralelización y dependencias críticas mal gestionadas.
* **Plan de contingencia:** Asignación temporal de recursos adicionales de otros subgrupos para desbloquear la tarea crítica.
* **Acciones correctivas:**
    * Al encontrarse la tarea en fase avanzada, se completó sin intervención externa.
    * Lección aprendida: Establecer descomposición obligatoria de issues complejas en subtareas independientes desde la planificación.
    * Definición de criterios de división para futuras historias de usuario de alta complejidad.


### 1.8. Ausencia imprevista del responsable de tarea crítica
* **Problema/Incidencia:** El desarrollador asignado a una tarea crítica del Sprint se ausentó por motivos justificados e inevitables. Esto generó un retraso en cascada que afectó el inicio de tareas dependientes y comprometió temporalmente el cumplimiento del Sprint Goal.
* **Riesgo asociado:** **R8 – Humano (Prioridad Media).** Ausencia de miembros clave del equipo sin plan de respaldo inmediato.
* **Plan de contingencia:** Activación del protocolo de respaldo: reasignación inmediata de la tarea a otro miembro con conocimiento del contexto técnico.
* **Acciones correctivas:**
    * Relevación efectiva por parte de otro desarrollador del mismo subgrupo, minimizando el impacto.
    * Refuerzo de prácticas de Clean Code para garantizar que cualquier desarrollador del equipo pueda comprender y continuar el trabajo sin necesidad de transferencias extensas.
    * Propuesta de implementar pair programming en tareas críticas para garantizar redundancia de conocimiento.


## 2. Resumen de Impacto

| Nº | Incidencia | Categoría | Prioridad | Estado |
| :--- | :--- | :--- | :--- | :--- |
|1| Gestión de HUs | Estimación (EP) | Alta | Solucionado |
|2| Error 403 Spring | Técnico (TE) | Media | Solucionado |
|3| Fallo DevContainer | Técnico (TE) | Media | Solucionado |
|4| Despliegue Triple | Técnico (TE) | Alta | Solucionado / Documentado |
|5| Reestructuración Casos de Uso | Estimación (EP) | Alta | Solucionado |
|6| Carga Variables de Entorno | Técnico (TE) | Alta | Solucionado |
|7| Cuello de Botella por Asignación | Estimación (EP) | Alta | Solucionado |
|8| Ausencia Responsable Crítico | Humano (HU) | Media | Solucionado |


## 3. Historial de Versiones

| Versión | Fecha       | Descripción                   | Autor(es)       |
|---------|------------|--------------------------------|------------|
| 1.0.0 | 25/02/2026 | Versión inicial con registros principales | Paula Rosa González Páez |
| 1.1.0 | 25/02/2026 | Añadidos nuevos registros e historial de versiones | Ángel Amo Sánchez |
| 1.2.0 | 01/03/2026 | Añadidas incidencias 6, 7 y 8, ocurridas durante el Sprint 1. <br> Añadido índice y cambios en el formato. | Lucía Ponce García de Sola |

---

**Redactado por:** Paula Rosa González Páez, Ángel Amo Sánchez y Lucía Ponce García de Sola  
**Fecha de redacción:** 01/03/2026  
**Versión:** 1.2.0
