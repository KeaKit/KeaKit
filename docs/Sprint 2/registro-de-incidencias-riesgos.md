# Registro de Incidencias y Riesgos - Proyecto KeaKit

Este documento detalla las incidencias reales detectadas durante el Sprint 2, vinculándolas con el Plan de Gestión de Riesgos y las acciones correctivas aplicadas.

## Índice
1. [Registro de incidencias y riesgos acontecidos](#1-registro-de-incidencias-y-riesgos-acontecidos)
   - 1.1. [Falta de conocimiento sobre Stripe](#11-falta-de-conocimiento-sobre-stripe)
   - 1.2. [Incompatibilidad de Stripe React Native con entorno web (React Native Web)](#12-incompatibilidad-de-stripe-react-native-con-entorno-web-react-native-web)
   - 1.3. [Migración de ZenHub a GitHub Projects y pérdida de funcionalidad de Burndown](#13-migración-de-zenhub-a-github-projects-y-pérdida-de-funcionalidad-de-burndown)
   - 1.4. [Insuficiencia de RAM en planes gratuitos de despliegue con Spring Boot](#14-insuficiencia-de-ram-en-planes-gratuitos-de-despliegue-con-spring-boot)
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


## 2. Resumen de Impacto

| Nº | Incidencia | Categoría | Prioridad | Estado |
| :--- | :--- | :--- | :--- | :--- |
|1| Skills gap: Stripe | Organizativo (OR) | Media | Solucionado |
|2| Incompatibilidad Stripe React Native Web | Técnico (TE) | Media | En seguimiento |
|3| Migración ZenHub → GitHub Projects | Estimación (EP) / Externo (EX) | Alta | Solucionado |
|4| RAM insuficiente en despliegue Spring Boot | Técnico (TE) | Alta | En investigación |


## 3. Historial de Versiones

| Versión | Fecha | Descripción | Autor(es) |
|---------|-------|-------------|-----------|
| 1.0.0 | 11/03/2026 | Versión inicial del registro de incidencias del Sprint 2 | Ángel Amo Sánchez|

---

**Redactado por:**  Ángel Amo Sánchez
**Fecha de redacción:** 11/03/2026  
**Versión:** 1.0.0