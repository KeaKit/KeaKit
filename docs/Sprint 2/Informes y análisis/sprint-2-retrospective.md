# Sprint 2 Retrospective - keaKit

## Índice

1. [Componentes](#1-componentes)
2. [Introducción](#2-introducción)
3. [Retrospectiva](#3-retrospectiva)
   - 3.1 [Lo Bueno, Lo Malo, Lo Mejorable](#31-lo-bueno-lo-malo-lo-mejorable)
   - 3.2 [Discusión y análisis](#32-discusión-y-análisis)
   - 3.3 [Plan de acción](#33-plan-de-acción)
4. [Conclusiones](#4-conclusiones)
5. [Historial de versiones](#5-historial-de-versiones)

---

## 1. Componentes

| | | 
|-----------|-----------|
| Marta Aguilar Morcillo | Cristina Fernández Chica |
| Guillermo García León |Ángel Amo Sánchez |
| Paula Rosa González Páez |Candela Jazmín Gutiérrez González |
| Adrián Miguel Chabrera Rubio |  José Luis Moraza Vergara |
| Guillermo Ciria González | Lucía Ponce García de Sola |
 

---

## 2. Introducción
La retrospectiva del segundo sprint se ha centrado en abordar problemas críticos de rendimiento y compromiso que no han mejorado tras el primer milestone. A pesar de las advertencias previas, el equipo de organización ha detectado una falta de equidad en el trabajo y graves deficiencias en el registro de horas y cumplimiento de plazos. En esta reunión se han planteado medidas drásticas para evitar que el desinterés de ciertos miembros comprometa el éxito final del proyecto.

---

## 3. Retrospectiva

### 3.1 Lo Bueno, Lo Malo, Lo Mejorable

| Descripción | Estado |
| :--- | :--- |
| Compromiso y actividad real de la mayoría | Bueno |
| Finalización de tareas funcionales core | Bueno |
| **Gente con 0 horas/commits durante semanas** | **Malo** |
| **Veracidad en el registro de horas (Clockify)** | **Malo** |
| **Coherencia en la estimación de Puntos de Historia** | **Malo** |
| **Cumplimiento de fechas límite para despliegue** | **Malo** |
| **Consistencia lógica entre pantallas (ej. discrepancia de precios)** | **Mejorable** |
| Gestión del Despliegue / CD | **Mejorable** |

---

### 3.2 Discusión y análisis

Durante el Sprint 2, se han identificado varios cuellos de botella y conflictos internos que requieren atención inmediata:

* **Falta de compromiso extremo:** Se ha señalado la existencia de miembros del equipo que acumulan hasta 3 semanas sin realizar ninguna hora de trabajo ni ningún commit. Existe un consenso en el grupo de no permitir que se beneficie a personas que se desentienden del proyecto.
* **Irregularidades en el registro de horas:** Se ha detectado el reporte de horas fraudulentas (imputación de horas de clase sin asistencia o reuniones que no generan valor). Se recalca que el mínimo son **10 horas de trabajo real**. Los responsables han verificado que el rendimiento no se está evaluando al 100% si estas horas no son efectivas.
* **Inflación de Puntos de Historia:** Se ha detectado una mala práctica en la métrica: tareas de gestión o redes sociales (posts de Instagram) están recibiendo 2 o 4 puntos, una carga similar o superior a tareas de desarrollo de código, lo que desvirtúa la realidad del esfuerzo técnico.
* **Gestión del Despliegue y Pruebas:** El despliegue de la última iteración se realizó con prisas, lo que impidió que los usuarios piloto pudieran testear la aplicación correctamente. Existe incertidumbre sobre quién liderará el proceso de CD para garantizar margen de corrección.
* **Inconsistencias funcionales:** Se han detectado fallos de lógica entre pantallas, como el hecho de que el precio de creación de un kit sea distinto al mostrado en la pantalla de pago, lo que denota una falta de revisión final y pruebas integrales.

---

### 3.3 Plan de acción

Se establecen las siguientes medidas de ejecución obligatoria para el próximo sprint:

#### Gestión de Personal y Horas
* **Propuesta de expulsión:** Se solicitará la salida oficial de aquellos miembros con inactividad total prolongada (0 horas/commits en 3 semanas).
* **Control de presencia:** Se pasará lista en clase de forma obligatoria. Las horas de Clockify que no correspondan a la asistencia real serán eliminadas manualmente.
* **Ajuste de rendimiento:** Quien no llegue a las 10 horas de trabajo real verá su índice de rendimiento penalizado proporcionalmente en las métricas del proyecto.

#### Organización y Deadlines
* **Re-estimación de tareas:** Los Puntos de Historia se ajustarán para que las tareas de gestión no tengan un peso superior al desarrollo de código.
* **Cumplimiento de límites:** Los plazos de entrega son inamovibles. Si una tarea no se entrega a tiempo, se eliminará la funcionalidad para el sprint y se bajará el rendimiento del responsable.
* **Reuniones eficaces:** Se establece un límite de tiempo para las reuniones. Las horas que excedan este límite por falta de enfoque no podrán ser computadas en Clockify.

#### Calidad y Despliegue
* **Responsable de Despliegue:** Se definirá un responsable fijo para asegurar que el despliegue esté operativo con tiempo suficiente para los usuarios piloto.
* **Corrección de Incongruencias:** Antes de cada merge a `develop`, será obligatorio verificar la consistencia de datos (precios, etiquetas, flujos) entre las diferentes pantallas del sistema.

---

## 4. Conclusiones
El Sprint 2 ha servido para evidenciar que la falta de compromiso está afectando la moral y la operatividad del equipo. La adopción de estas medidas de control estricto es necesaria para garantizar que el trabajo sea equitativo y que la calidad de la aplicación keaKit cumpla con los estándares exigidos.

---

## 5. Historial de versiones

| Versión | Fecha | Descripción | Autor(es) |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 24/03/2026 | Versión inicial (Sprint 2) | Paula Rosa González Páez |


---
**Redactado por:** Paula Rosa González Páez
**Fecha de redacción:** 24/03/2026  
**Versión:** 1.0.0