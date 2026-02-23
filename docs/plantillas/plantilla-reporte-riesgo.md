# Reporte de Incidente y Análisis Post-Mortem
**ID del Reporte:** [Ej. INC-2026-001]
**Fecha del Incidente:** [DD/MM/AAAA]
**Fecha del Reporte:** [DD/MM/AAAA]
**Responsable del Reporte:** [Nombre y Cargo]
**Riesgo Materializado (ID del Risk Log):** [Ej. R15 - Churn rate alto de Usuarios Piloto]

---

## 1. Descripción del Incidente
*Describe de forma clara y objetiva qué ha ocurrido, cuándo se detectó y cuál fue el impacto inicial en el negocio o producto.*

* **Hora/Fecha de detección:** [Hora y fecha]
* **Detectado por:** [Persona, departamento o sistema de monitorización]
* **Descripción del problema:** [Ej. Durante el cierre de la iteración, 10 de los 15 usuarios piloto abandonaron la prueba, dejando la tasa de retención muy por debajo del mínimo exigido por los stakeholders].
* **Impacto real causado:** [Ej. Retraso de 2 días en la validación / Caída del servidor durante 4 horas / Pérdida de X€].

---

## 2. Análisis del Plan de Mitigación (Prevención)
*¿Por qué no pudimos evitar que este riesgo se materializara? Evalúa las acciones preventivas que se habían definido en el Registro de Riesgos.*

* **Plan de mitigación original:** [Describe qué se suponía que debíamos hacer para evitarlo. Ej. Comunicación proactiva semanal y entrega de descuentos del 20%].
* **Nivel de ejecución:** [ ] Completo | [ ] Parcial | [ ] No se ejecutó
* **Motivo del fallo preventivo:** [Explica por qué la mitigación no fue suficiente. Ej. Los correos de marketing se enviaron tarde y cayeron en SPAM. El descuento del 20% no fue un incentivo lo suficientemente agresivo frente a las alternativas del mercado].

---

## 3. Ejecución del Plan de Contingencia (Reacción)
*¿Qué hicimos cuando el problema estalló? Describe los pasos tomados para apagar el "incendio".*

* **Plan de contingencia activado:** [Ej. Búsqueda masiva de nuevos leads (backup) y aumento del incentivo a 0% de comisión].
* **Tiempo de reacción:** [Cuánto tardamos en activar el plan desde que se detectó el problema].
* **Acciones tomadas (Timeline temporal):**
    * *[DD/MM - 10:00] Reunión de emergencia de los Leads.*
    * *[DD/MM - 12:00] Aprobación de presupuesto extra para captación.*
    * *[DD/MM - 16:00] Lanzamiento de nueva campaña con agresividad alta.*

---

## 4. Evaluación de Contingencia y Métricas
*Evalúa el rendimiento del plan de contingencia basándote en las métricas (KPIs/SLAs) definidas previamente en el plan de gestión de riesgos.*

| Métrica / KPI Objetivo | Valor Esperado (SLA) | Valor Real Obtenido | Estado |
| :--- | :--- | :--- | :--- |
| *[Ej. Tiempo de recuperación del servicio]* | *< 4 horas* | *6 horas* | 🔴 *Fallido* |
| *[Ej. Tasa de conversión de los nuevos leads]* | *> 60%* | *75%* | 🟢 *Éxito* |
| *[Añadir métrica...]* | *[Valor esperado]* | *[Valor real]* | [Estado] |

**Diagnóstico de la Contingencia:**
* **¿Fue efectivo el plan?** [Sí / Parcialmente / No]
* **¿Por qué triunfó o falló la contingencia?** [Ej. El plan de contingencia salvó la métrica final de conversión (75%), pero falló en el tiempo de respuesta porque el departamento financiero tardó 2 días en aprobar la subida del coste de adquisición (CAC), lo que retrasó la campaña de rescate].

---

## 5. Conclusiones y Lecciones Aprendidas
*Reflexión del equipo sobre el incidente. ¿Cuál fue la causa raíz real? (Uso de técnica de los 5 Porqués, si es necesario).*

1. **Causa Raíz:** [Ej. Subestimamos el valor de la fricción tecnológica para usuarios no digitales; el incentivo monetario no compensaba el esfuerzo técnico de usar la app].
2. **Lección 1:** [Ej. Los planes de mitigación no pueden depender de correos masivos sin confirmación de lectura].
3. **Lección 2:** [Ej. Para autorizar planes de contingencia críticos, necesitamos un flujo de aprobación "fast-track" con Dirección].

---

## 6. Plan de Acción Correctiva (Next Steps)
*Tareas a incorporar en el próximo Sprint para evitar que esto se repita o para mejorar la contingencia futura.*

| Tarea / Acción de Mejora | Responsable | Fecha Límite | Estado |
| :--- | :--- | :--- | :--- |
| *[Ej. Cambiar proveedor de envío de correos por uno anti-spam]* | *[Nombre]* | *[Fecha]* | *[Pendiente]* |
| *[Ej. Delegar presupuesto de emergencia mensual al Team Lead]* | *[Nombre]* | *[Fecha]* | *[Pendiente]* |