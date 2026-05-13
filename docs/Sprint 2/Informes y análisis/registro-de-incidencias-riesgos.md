# Registro de Incidencias y Riesgos - Proyecto KeaKit

Este documento detalla las incidencias reales detectadas durante el Sprint 2, vinculándolas con el Plan de Gestión de Riesgos y las acciones correctivas aplicadas.

## Índice
1. [Registro de incidencias y riesgos acontecidos](#1-registro-de-incidencias-y-riesgos-acontecidos)
   - 1.1. [Falta de conocimiento sobre Stripe](#11-falta-de-conocimiento-sobre-stripe)
   - 1.2. [Incompatibilidad de Stripe React Native con entorno web (React Native Web)](#12-incompatibilidad-de-stripe-react-native-con-entorno-web-react-native-web)
   - 1.3. [Migración de ZenHub a GitHub Projects y pérdida de funcionalidad de Burndown](#13-migración-de-zenhub-a-github-projects-y-pérdida-de-funcionalidad-de-burndown)
   - 1.4. [Insuficiencia de RAM en planes gratuitos de despliegue con Spring Boot](#14-insuficiencia-de-ram-en-planes-gratuitos-de-despliegue-con-spring-boot)
   - 1.5. [Bajo rendimiento y falta de compromiso de miembros del equipo](#15-bajo-rendimiento-y-falta-de-compromiso-de-miembros-del-equipo)
   - 1.6. [Registro incorrecto o fraudulento de horas](#16-registro-incorrecto-o-fraudulento-de-horas)
   - 1.7. [Mala asignación de puntos de historia](#17-mala-asignación-de-puntos-de-historia)
   - 1.8. [Incumplimiento de plazos en tareas críticas](#18-incumplimiento-de-plazos-en-tareas-críticas)
   - 1.9. [Desorganización en el despliegue y CD](#19-desorganización-en-el-despliegue-y-cd)
   - 1.10. [Exceso de tiempo en reuniones no productivas](#110-exceso-de-tiempo-en-reuniones-no-productivas)
   - 1.11. [Retrasos e inconsistencias funcionales entre módulos](#111-retrasos-e-inconsistencias-funcionales-entre-módulos)
2. [Resumen de Impacto](#2-resumen-de-impacto)
3. [Historial de Versiones](#3-historial-de-versiones)


## 1. Registro de incidencias y riesgos acontecidos

### 1.1. Falta de conocimiento sobre Stripe
* **Problema/incidencia:** Un miembro del equipo se encontró con una curva de aprendizaje significativa al trabajar con la pasarela de pagos Stripe, ya que no existía experiencia previa con dicha tecnología en el equipo. Este desconocimiento técnico inicial generó bloqueos en la implementación del módulo de pagos y retrasó el progreso de la Historia de Usuario asociada.
* **Riesgo asociado:** **R6 – Organizativo (Prioridad Media).** Falta de conocimiento técnico (skills gap) en el equipo.
* **Plan de contingencia:** Pausa temporal del desarrollo para investigación y onboarding autónomo sobre la integración de Stripe en el stack del proyecto.
* **Acciones correctivas:** Investigación de la documentación oficial de Stripe para el stack tecnológico utilizado.
    * Lección aprendida: Identificar previamente las tecnologías nuevas o desconocidas para el equipo, reservando tiempo de investigación técnica (*spike*) antes de iniciar el desarrollo.


### 1.2. Incompatibilidad de Stripe React Native con entorno web (React Native Web)
* **Problema/incidencia:** La librería oficial de Stripe para React Native (`stripe-react-native`) no es compatible con React Native Web. Esto impedía su uso en el entorno web de la aplicación, que comparte el mismo base de código con la versión para móvil. Fue necesario evaluar Stripe.js como alternativa multiplataforma.
* **Riesgo asociado:** **R1 – Técnico (Prioridad Media).** Función demasiado compleja para las herramientas escogidas / Configuración bloqueante del stack elegido.
* **Plan de contingencia:** Refactorización técnica para migrar a una solución de integración de Stripe compatible con ambos entornos (web y móvil).
* **Acciones correctivas:** Evaluación e integración de Stripe.js como alternativa, pendiente de validación de compatibilidad multiplataforma.
    * Lección aprendida: Verificar la compatibilidad de librerías de terceros con todos los entornos a utilizar en el proyecto (web, iOS, Android) antes de comprometerse con una implementación concreta.


### 1.3. Migración de ZenHub a GitHub Projects y pérdida de funcionalidad de Burndown
* **Problema/incidencia:** ZenHub alcanzó su límite de issues en el plan disponible (el gratuito). La prueba de plan Enterprise afectaba a todos los miembros del equipo, lo que obligó a migrar la gestión del proyecto a GitHub Projects. Sin embargo, GitHub Projects no ofrece funcionalidad nativa de burndown chart por puntos de historia, ni campos de puntos de historia por defecto, lo que impedía continuar con el seguimiento de los Sprints de la forma en la que lo realizabamos hasta el momento.
* **Riesgos asociados:**
    * **R9 – Externo (Prioridad Alta).** Límite de cuota superado en servicios de terceros.
    * **R17 – Estimación y Planificación (Prioridad Alta).** Incumplimiento de dependencias críticas en el roadmap por pérdida de trazabilidad del progreso del Sprint.
* **Plan de contingencia:** Desarrollo de una solución alternativa mediante scripts de automatización para recuperar la trazabilidad de los puntos de historia y la generación del burndown chart desde GitHub Projects.
* **Acciones correctivas:** Creación de campos personalizados en GitHub Projects para puntos de historia y para las fechas de cada estado de las tareas (To Do, In Progress, In Review, Done).
    * Desarrollo de scripts que leen los campos personalizados y generan un fichero Excel con los datos necesarios (nombre de tarea, fechas por estado) para construir el burndown chart.
    * Implementación de un script adicional que registra automáticamente la fecha actual en el campo del estado en que se encuentre la tarea al ejecutarse, sin sobreescribir fechas ya registradas.


### 1.4. Insuficiencia de RAM en planes gratuitos de despliegue con Spring Boot
* **Problema/incidencia:** Algunas llamadas al backend desde el frontend fallaban de forma intermitente, y el arranque de la máquina presentaba tiempos excesivamente altos. Tras investigación, se identificó que el peso de Spring Boot supera la RAM disponible en los planes gratuitos de los proveedores de despliegue utilizados, causando inestabilidad en el entorno de producción.
* **Riesgo asociado:** **R5 – Técnico (Prioridad Alta).** Caída de infraestructura o servidores cloud por recursos insuficientes en el entorno de despliegue.
* **Plan de contingencia:** Investigación y migración a una arquitectura de despliegue alternativa viable en planes gratuitos o de bajo coste, con recursos suficientes para Spring Boot.
* **Acciones correctivas:** Investigación de alternativas de despliegue basadas en Supabase + DigitalOcean/Oracle como solución más eficiente en recursos.
    * Evaluación de la viabilidad de migrar partes del backend a servicios gestionados para reducir la carga sobre la instancia principal.
    * Pendiente de validación e implantación de la nueva arquitectura de despliegue.


### 1.5. Bajo rendimiento y falta de compromiso de miembros del equipo
* **Problema/incidencia:** Se detectaron miembros del equipo sin actividad significativa durante varias semanas (ausencia de commits, contribuciones técnicas o registro de horas reales). Esta situación generó un desequilibrio en la carga de trabajo, afectando negativamente a la planificación del Sprint y aumentando la presión sobre los miembros activos.
* **Riesgo asociado:** **R11 – Organizativo (Prioridad Baja).** Rendimiento individual inferior al commitment agreement.
* **Plan de contingencia:** Comunicación directa con los miembros afectados y seguimiento continuo de su actividad para evaluar su reincorporación efectiva al ritmo del equipo.
* **Acciones correctivas:**
    * Establecimiento de mecanismos de control periódico del rendimiento individual (commits, PRs, horas reales).
    * Aplicación progresiva de medidas disciplinarias en caso de incumplimiento reiterado (advertencia → posible desvinculación del proyecto).
    * Refuerzo de la transparencia en la contribución individual dentro del equipo.


### 1.6. Registro incorrecto o fraudulento de horas
* **Problema/incidencia:** Se identificaron inconsistencias en el registro de horas en la herramienta de seguimiento (Clockify), incluyendo horas no asociadas a trabajo efectivo o registradas sin asistencia real a sesiones de trabajo, afectando a la fiabilidad de las métricas del proyecto.
* **Riesgo asociado:** **R14 – Organizativo (Prioridad Alta).** Falta de trazabilidad en el reporte de horas.
* **Plan de contingencia:** Auditoría interna de los registros de horas y revisión manual por parte de los responsables de subgrupo.
* **Acciones correctivas:**
    * Implantación de mecanismos de control de asistencia en sesiones presenciales.
    * Revisión y validación periódica de los registros de horas.
    * Eliminación o corrección de horas incorrectamente registradas.
    * Concienciación del equipo sobre la importancia de la trazabilidad real del esfuerzo.


### 1.7. Mala asignación de puntos de historia
* **Problema/incidencia:** Se detectó una asignación incoherente de puntos de historia, especialmente en tareas no técnicas o de bajo impacto, lo que generó una distorsión en la medición del esfuerzo real del Sprint y en la velocidad del equipo.
* **Riesgo asociado:** **R17 – Estimación y Planificación (Prioridad Alta).** Incumplimiento de dependencias críticas en el roadmap por estimaciones incorrectas.
* **Plan de contingencia:** Revisión del backlog y reestimación de tareas utilizando criterios homogéneos.
* **Acciones correctivas:**
    * Definición de criterios claros para la asignación de puntos de historia según complejidad técnica y esfuerzo real.
    * Separación de tareas técnicas y no técnicas en la estimación.
    * Validación de estimaciones por parte de perfiles con experiencia técnica antes de su aprobación.
    * Revisión periódica de la coherencia de la velocidad del equipo.


### 1.8. Incumplimiento de plazos en tareas críticas
* **Problema/incidencia:** Se produjeron retrasos en tareas clave del Sprint, lo que bloqueó dependencias críticas y afectó al flujo de trabajo de otros miembros del equipo, especialmente en fases previas a integración y despliegue.
* **Riesgo asociado:** **R17 – Estimación y Planificación (Prioridad Alta).** Incumplimiento de dependencias críticas en el roadmap.
* **Plan de contingencia:** Reasignación de tareas y redistribución de recursos para desbloquear el flujo de trabajo.
* **Acciones correctivas:**
    * Refuerzo del cumplimiento de deadlines definidos en planificación.
    * Ajuste del reparto de tareas en función de la disponibilidad real de los miembros.
    * Identificación temprana de bloqueos y comunicación proactiva.
    * Penalización en métricas de rendimiento en casos de incumplimiento injustificado.


### 1.9. Desorganización en el despliegue y CD
* **Problema/incidencia:** El proceso de despliegue se realizó de forma precipitada y sin planificación suficiente, lo que redujo el margen para pruebas y correcciones, afectando a la calidad del entregable y a la validación por parte de usuarios piloto.
* **Riesgo asociado:** **R10 – Técnico (Prioridad Media).** Fallos críticos en la build de producción.
* **Plan de contingencia:** Uso de rollback a versiones estables y ejecución manual del proceso de build en caso de fallo del pipeline automatizado.
* **Acciones correctivas:**
    * Definición clara de responsables del proceso de despliegue.
    * Planificación anticipada del CD dentro del Sprint.
    * Integración de fases de testing previas al despliegue.
    * Mejora de la documentación del proceso de release.


### 1.10. Exceso de tiempo en reuniones no productivas
* **Problema/incidencia:** Se detectó un uso excesivo de tiempo en reuniones poco estructuradas o con baja productividad, afectando a la disponibilidad real de horas para desarrollo.
* **Riesgo asociado:** **R12 – Organizativo (Prioridad Baja).** Caída de productividad por exceso de reuniones.
* **Plan de contingencia:** Reducción o eliminación de reuniones no críticas.
* **Acciones correctivas:**
    * Establecimiento de límites de tiempo estrictos para reuniones.
    * Definición previa de objetivos y agenda.
    * No contabilizar como horas productivas el tiempo que exceda lo planificado.
    * Fomento de comunicación asíncrona cuando sea posible.


### 1.11. Retrasos e inconsistencias funcionales entre módulos
* **Problema/incidencia:** Se detectaron inconsistencias funcionales entre distintas partes del sistema (por ejemplo, discrepancias en precios entre pantallas), así como retrasos en la implementación de funcionalidades interdependientes, evidenciando problemas de coordinación.
* **Riesgo asociado:** **R16 – Organizativo (Prioridad Alta).** Silos de información o fallos de coordinación interdepartamental.
* **Plan de contingencia:** Realización de reuniones de sincronización entre subgrupos para alinear criterios funcionales y técnicos.
* **Acciones correctivas:**
    * Refuerzo de la comunicación entre equipos (frontend, backend, QA).
    * Validación cruzada de funcionalidades antes de su integración.
    * Definición de criterios funcionales comunes (ej. lógica de precios).
    * Incremento de pruebas integradas para detectar inconsistencias tempranas.

## 2. Resumen de Impacto

| Nº | Incidencia | Categoría | Prioridad | Estado |
| :--- | :--- | :--- | :--- | :--- |
|1| Skills gap: Stripe | Organizativo (OR) | Media | Solucionado |
|2| Incompatibilidad Stripe React Native Web | Técnico (TE) | Media | En seguimiento |
|3| Migración ZenHub → GitHub Projects | Estimación (EP) / Externo (EX) | Alta | Solucionado |
|4| RAM insuficiente en despliegue Spring Boot | Técnico (TE) | Alta | En investigación |
|5| Bajo rendimiento | Organizativo (OR) | Baja | En seguimiento |
|6| Registro de horas | Organizativo (OR) | Alta | En seguimiento |
|7| Puntos de historia | Estimación (EP) | Alta | Solucionado |
|8| Incumplimiento plazos | Estimación (EP) | Alta | En seguimiento |
|9| Despliegue/CD | Técnico (TE) | Media | En mejora |
|10| Reuniones largas | Organizativo (OR) | Baja | En mejora |
|11| Inconsistencias funcionales | Organizativo (OR) | Alta | En seguimiento |



## 3. Historial de Versiones

| Versión | Fecha | Descripción | Autor(es) |
|---------|-------|-------------|-----------|
| 1.0.0 | 11/03/2026 | Versión inicial del registro de incidencias del Sprint 2 | Ángel Amo Sánchez|
| 1.1.0 | 25/03/2026 | Añadidas incidencias organizativas y de planificación detectadas posteriormente | Paula Rosa González Páez |


---

**Redactado por:**  Ángel Amo Sánchez y Paula Rosa González Páez
**Fecha de redacción:** 11/03/2026  
**Versión:** 1.1.0