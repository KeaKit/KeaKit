# Registro de Incidencias y Riesgos - Proyecto KeaKit

Este documento detalla las incidencias reales detectadas durante el Sprint 2, vinculándolas con el Plan de Gestión de Riesgos y las acciones correctivas aplicadas.

---

## Índice
1. [Registro de incidencias y riesgos acontecidos](#1-registro-de-incidencias-y-riesgos-acontecidos)
   - 1.1. [Descoordinación en el ritmo de exposición durante presentaciones](#11-descoordinación-en-el-ritmo-de-exposición-durante-presentaciones)
   - 1.2. [Bajo rendimiento y falta de compromiso de miembros del equipo](#12-bajo-rendimiento-y-falta-de-compromiso-de-miembros-del-equipo)
   - 1.3. [Registro incorrecto o fraudulento de horas](#13-registro-incorrecto-o-fraudulento-de-horas)
   - 1.4. [Mala asignación de puntos de historia](#14-mala-asignación-de-puntos-de-historia)
   - 1.5. [Retrasos e inconsistencias funcionales entre módulos](#15-retrasos-e-inconsistencias-funcionales-entre-módulos)
2. [Resumen de Impacto](#2-resumen-de-impacto)
3. [Historial de Versiones](#3-historial-de-versiones)

---

## 1. Registro de incidencias y riesgos acontecidos

### 1.1. Descoordinación en el ritmo de exposición durante presentaciones

* **Problema/incidencia:** Durante la preparación de presentaciones se detectó una falta de sincronización en el ritmo de exposición entre distintos miembros del equipo, provocando desequilibrios en el tiempo asignado (exposición demasiado rápida o demasiado lenta según el presentador).
* **Riesgo asociado:**  
  * **R16 – Organizativo (Prioridad Alta).** Fallos de coordinación.  
  * **R12 – Organizativo (Prioridad Baja).** Caída de productividad por desajustes en la gestión del tiempo.
* **Plan de contingencia:** Supervisión en tiempo real del ritmo de presentación mediante apoyo externo del equipo.
* **Acciones correctivas:**  
  * Desarrollo de una herramienta interna basada en un **cronómetro visual** accesible durante la presentación.  
  * Implementación de un sistema de señalización en tiempo real mediante códigos de color:  
    * 🔴 Reducir velocidad  
    * 🟢 Aumentar velocidad  
    * ⚪ Ritmo adecuado  
  * Visualización simultánea de la hora actual para facilitar la gestión del tiempo restante.  
  * Coordinación activa del equipo durante la presentación para ajustar el ritmo sin interrumpir al presentador.  
  * **Lección aprendida:** La coordinación en presentaciones debe planificarse y apoyarse con herramientas en tiempo real para evitar desviaciones de tiempo.

---

### 1.2. Bajo rendimiento y falta de compromiso de miembros del equipo

* **Problema/incidencia:** Se detectaron miembros del equipo sin actividad significativa durante varias semanas (ausencia de commits, contribuciones técnicas o registro de horas reales). Esta situación generó un desequilibrio en la carga de trabajo, afectando negativamente a la planificación del Sprint y aumentando la presión sobre los miembros activos.
* **Riesgo asociado:** **R11 – Organizativo (Prioridad Baja).** Rendimiento individual inferior al commitment agreement.
* **Plan de contingencia:** Comunicación directa con los miembros afectados y seguimiento continuo de su actividad para evaluar su reincorporación efectiva al ritmo del equipo.
* **Acciones correctivas:**
    * Establecimiento de mecanismos de control periódico del rendimiento individual (commits, PRs, horas reales).
    * Aplicación progresiva de medidas disciplinarias en caso de incumplimiento reiterado (advertencia → posible desvinculación del proyecto).
    * Refuerzo de la transparencia en la contribución individual dentro del equipo.
    * **Lección aprendida:** Es clave monitorizar el rendimiento desde fases tempranas del Sprint para evitar acumulación de carga en miembros activos.

---

### 1.3. Registro incorrecto o fraudulento de horas

* **Problema/incidencia:** Se identificaron inconsistencias en el registro de horas en la herramienta de seguimiento (Clockify), incluyendo horas no asociadas a trabajo efectivo o registradas sin asistencia real a sesiones de trabajo, afectando a la fiabilidad de las métricas del proyecto.
* **Riesgo asociado:** **R14 – Organizativo (Prioridad Alta).** Falta de trazabilidad en el reporte de horas.
* **Plan de contingencia:** Auditoría interna de los registros de horas tras asignar el rol de **“Policía de las horas”**.
* **Acciones correctivas:**
    * Revisión y validación periódica de los registros de horas por parte del nuevo rol asignado.
    * Eliminación o corrección de horas incorrectamente registradas.
    * Concienciación del equipo sobre la importancia de la trazabilidad real del esfuerzo.
    * **Lección aprendida:** La trazabilidad del esfuerzo debe estar controlada mediante roles definidos y validación continua.

---

### 1.4. Mala asignación de puntos de historia

* **Problema/incidencia:** Se detectó una asignación incoherente de puntos de historia, especialmente en tareas no técnicas o de bajo impacto, lo que generó una distorsión en la medición del esfuerzo real del Sprint y en la velocidad del equipo.
* **Riesgo asociado:** **R17 – Estimación y Planificación (Prioridad Alta).** Incumplimiento de dependencias críticas en el roadmap por estimaciones incorrectas.
* **Plan de contingencia:** Revisión del backlog y reestimación de tareas utilizando criterios homogéneos.
* **Acciones correctivas:**
    * Definición de criterios claros para la asignación de puntos de historia según complejidad técnica y esfuerzo real.
    * Separación de tareas técnicas y no técnicas en la estimación.
    * Validación de estimaciones por parte de perfiles con experiencia técnica antes de su aprobación.
    * Revisión periódica de la coherencia de la velocidad del equipo.
    * **Lección aprendida:** Las estimaciones deben basarse en criterios objetivos y ser validadas colectivamente.

---

### 1.5. Retrasos e inconsistencias funcionales entre módulos

* **Problema/incidencia:** Se detectaron inconsistencias funcionales entre distintas partes del sistema (por ejemplo, discrepancias en precios entre pantallas), así como retrasos en la implementación de funcionalidades interdependientes, evidenciando problemas de coordinación.
* **Riesgo asociado:** **R16 – Organizativo (Prioridad Alta).** Silos de información o fallos de coordinación interdepartamental.
* **Plan de contingencia:** Realización de reuniones de sincronización entre subgrupos para alinear criterios funcionales y técnicos.
* **Acciones correctivas:**
    * Refuerzo de la comunicación entre equipos (frontend, backend, QA).
    * Validación cruzada de funcionalidades antes de su integración.
    * Definición de criterios funcionales comunes (ej. lógica de precios).
    * Incremento de pruebas integradas para detectar inconsistencias tempranas.
    * **Lección aprendida:** La coordinación entre módulos es crítica y debe apoyarse en validaciones cruzadas y criterios unificados.

---

## 2. Resumen de Impacto

| Nº | Incidencia | Categoría | Prioridad | Estado |
| :--- | :--- | :--- | :--- | :--- |
|1| Descoordinación en presentaciones | Organizativo (OR) | Media | Solucionado |
|2| Bajo rendimiento | Organizativo (OR) | Baja | En seguimiento |
|3| Registro de horas | Organizativo (OR) | Alta | En seguimiento |
|4| Puntos de historia | Estimación (EP) | Alta | En seguimiento |
|5| Inconsistencias funcionales | Organizativo (OR) | Alta | Solucionado |

---


## 3. Historial de Versiones

| Versión | Fecha | Descripción | Autor(es) |
|---------|-------|-------------|-----------|
| 1.0.0 | 15/03/2026 | Versión final del registro de incidencias del Sprint 3 | Ángel Amo Sánchez|


---

**Redactado por:**  Ángel Amo Sánchez
**Fecha de redacción:** 15/03/2026  
**Versión:** 1.0.0