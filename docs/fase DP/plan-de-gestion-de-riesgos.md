# Plan de Gestión de Riesgos Corporativos
**Proyecto:** KeaKit  
**Fecha de actualización:** 23/02/2026  

## 1. Introducción y Objetivo
El presente documento establece el marco de trabajo para la identificación, evaluación, mitigación y monitorización de los riesgos asociados al desarrollo y lanzamiento del producto KeaKit. Involucra tanto los aspectos tecnológicos (desarrollo, infraestructura) como los organizativos (gestión de los equipos, marketing y validación en mercado con Usuarios Piloto).

## 2. Categorización de Riesgos
Para facilitar la asignación de responsabilidades y el enfoque de las soluciones, los riesgos se clasifican en las siguientes categorías:

* **Técnico (TE):** Riesgos relacionados con el stack tecnológico elegido, la infraestructura en la nube, la seguridad, la arquitectura de software y los flujos de CI/CD.
* **Organizativo (OR):** Riesgos derivados de la dinámica operativa de la empresa, comunicación entre departamentos, falta de *know-how*, rotación de personal, y cumplimiento de procesos internos (reportes de horas y documentación).
* **Estimación y Planificación (EP):** Riesgos asociados a la mala medición de tiempos (Story Points), cuellos de botella en el flujo de valor o mala gestión de dependencias en el roadmap.
* **Externo (EX):** Factores ajenos al control directo de la empresa, como cambios en normativas legales, indisponibilidad de proveedores/stakeholders críticos o fluctuaciones en los costes de servicios de terceros (APIs, Cloud).
* **Negocio y Mercado (NM):** Riesgos vinculados a la viabilidad del modelo de negocio, coste de adquisición de clientes (CAC), retención de usuarios piloto y la recepción general de los inversores o el mercado final.

## 3. Metodología de Evaluación
La recopilación de riesgos se ha realizado mediante sesiones conjuntas entre el departamento técnico (CTO, Leads) y el departamento de negocio/marketing. 

Cada riesgo identificado se clasifica utilizando una escala cualitativa basada en los siguientes criterios:

* **Impacto (Alcance, Tiempo, Calidad):**
    * **Alto (8-10):** Compromete las funcionalidades Core (MVP), retrasa un hito crítico (Milestone) del roadmap más de 3 días o provoca el rechazo por parte de los inversores/stakeholders clave.
    * **Medio (5-7):** Afecta a funcionalidades secundarias, retrasa tareas específicas o degrada la experiencia de usuario sin bloquear el uso de la plataforma.
    * **Bajo (1-4):** Alteraciones menores absorbibles dentro del margen de contingencia del Sprint.
* **Probabilidad:**
    * **Alta (8-10):** Muy probable que ocurra dadas las condiciones actuales del mercado o del equipo.
    * **Media (5-7):** Posible, sujeto a factores externos, cierres de trimestre o picos de carga de trabajo.
    * **Baja (1-4):** Escasa probabilidad de ocurrencia bajo condiciones operativas normales.
* **Prioridad:** Determinada por la combinación del impacto general y la probabilidad.

## 4. Estrategia de Respuesta
Para todos los riesgos con **Prioridad Alta y Media**, la organización está obligada a definir:
1.  **Plan de Mitigación (Preventivo):** Acciones a realizar *antes* de que ocurra el riesgo para reducir su probabilidad o impacto.
2.  **Plan de Contingencia (Reactivo):** Acciones a ejecutar *una vez* el riesgo se ha materializado.
3.  **Métricas de Efectividad:** KPIs objetivos (SLAs, Tiempos de recuperación, Tasas de retención) para evaluar si el plan de contingencia ha devuelto el proyecto a la normalidad.

## 5. Roles y Responsabilidades
* **Project Manager / Coordinador General:** Monitorización de riesgos de Estimación/Planificación y Organizativos transversales.
* **Team Leads (Subgrupos 1-4):** Seguimiento de riesgos Organizativos a nivel operativo (reporte de horas, bloqueos, bajas de personal).
* **Product Manager / Marketing:** Monitorización exclusiva de riesgos de Negocio y Mercado (tracción, Usuarios Piloto).
* **CTO / Arquitecto de Software:** Responsable principal de la monitorización de riesgos Técnicos y Externos (Infraestructura, DevOps).