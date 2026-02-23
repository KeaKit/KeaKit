# Plan de Gestión de Riesgos
**Proyecto:** KeaKit  
**Fecha de actualización:** 23/02/2026  

## 1. Introducción y Objetivo
El presente documento establece el marco de trabajo para la identificación, evaluación, mitigación y monitorización de los riesgos asociados al proyecto KeaKit. Involucra tanto los aspectos tecnológicos (desarrollo, infraestructura) como los organizativos (gestión de los 4 subgrupos, marketing y usuarios piloto).

## 2. Metodología de Evaluación
La recopilación de riesgos se ha realizado mediante sesiones conjuntas entre el equipo técnico (Arquitectura, Backend, Frontend) y el equipo de negocio/marketing. 

Cada riesgo identificado se clasifica utilizando una escala cualitativa basada en los siguientes criterios:

* **Impacto (Alcance, Tiempo, Calidad):**
    * **Alto (8-10):** Compromete los Casos de Uso Core, retrasa el Sprint más de 3 días o provoca un suspenso en la evaluación.
    * **Medio (5-7):** Afecta a funcionalidades secundarias, retrasa tareas específicas o degrada la experiencia de usuario sin bloquearla.
    * **Bajo (1-4):** Alteraciones menores absorbibles dentro del margen del Sprint.
* **Probabilidad:**
    * **Alta (8-10):** Muy probable que ocurra dadas las condiciones actuales del equipo o mercado.
    * **Media (5-7):** Posible, sujeto a factores externos o picos de estrés (ej. época de exámenes).
    * **Baja (1-4):** Escasa probabilidad de ocurrencia bajo condiciones normales.
* **Prioridad:** Determinada por la combinación del impacto general y la probabilidad. Dicta la urgencia de aplicar planes de respuesta.

## 3. Estrategia de Respuesta
Para todos los riesgos con **Prioridad Alta y Media**, el equipo está obligado a definir:
1.  **Plan de Mitigación (Preventivo):** Acciones a realizar *antes* de que ocurra el riesgo para reducir su probabilidad o impacto.
2.  **Plan de Contingencia (Reactivo):** Acciones a ejecutar *una vez* el riesgo se ha materializado.
3.  **Métricas de Efectividad:**Crear Documento de Gestión de Riesgo
Recopilar información sobre posibles riesgos con el equipo técnico y de negocio.
Clasificar cada riesgo según su Impacto (Alto, Medio, Bajo) en alcance, tiempo y calidad.
Clasificar cada riesgo según la Probabilidad (Alta, Media, Baja).
Asignar una prioridad a cada riesgo
Definir un plan de mitigación y un plan de contingencia para los riesgos de prioridad alta y media.
Diseñar métricas de efectividad para los planes de contingencia definidos KPIs objetivos para evaluar si el plan de contingencia ha devuelto el proyecto a la normalidad.

## 4. Roles y Responsabilidades
* **Coordinador General:** Responsable de la monitorización de riesgos transversales (dependencias entre Sprints, integración, feedback de presentaciones).
* **Coordinadores de Equipo (Subgrupos 1-4):** Responsables del seguimiento a nivel micro (Clockify, bloqueos de código, bajas temporales).
* **Equipo de Marketing:** Monitorización exclusiva de riesgos vinculados a Usuarios Piloto.
* **Arquitecto de Software:** Responsable de riesgos de infraestructura, BD (cuotas) y despliegue (CI/CD).