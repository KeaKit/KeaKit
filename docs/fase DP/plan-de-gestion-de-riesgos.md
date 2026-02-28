# Plan de Gestión de Riesgos Corporativos

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
* **Cualquier integrante del equipo:** Monitorización de riesgos de Estimación/Planificación y Organizativos transversales.
* **Organizador del subgrupo (Subgrupos 1-4):** Seguimiento de riesgos Organizativos a nivel operativo (reporte de horas, bloqueos, bajas de personal).
* **Arquitecto de Software:** Responsable principal de la monitorización de riesgos Técnicos y Externos (Infraestructura, DevOps).

## 6. Historial de versiones

| Versión | Fecha       | Descripción                   | Autor(es)       |
|---------|------------|--------------------------------|------------|
| 1.0.0   | 23/02/2026 | Añade el Plan de Gestión de Riesgos. Define la metodología de evaluación, categorización (técnicos, organizativos, etc.) y los roles del equipo para monitorizar y responder a las amenazas del proyecto. | Ismael Carrasco Mkhazni, Guillermo García León |


---
**Redactado por:** Ismael Carrasco Mkhazni y Guillermo García León
**Fecha de redacción:** 23/02/2026  
**Versión:** 1.0.0
