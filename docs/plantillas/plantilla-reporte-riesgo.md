# Reporte de Incidente y Análisis Post-Mortem
**ID del Reporte:** [Ej. INC-2026-001]
**Fecha del Incidente:** [DD/MM/AAAA]
**Fecha del Reporte:** [DD/MM/AAAA]
**Responsable del Reporte:** [Nombre y Cargo]
**Riesgo Materializado (ID del Risk Log):** [Ej. R15 - Churn rate alto de Usuarios Piloto]

---

## 1. Descripción del Incidente
*Describa de forma objetiva el suceso, el momento exacto de su detección y el impacto inicial generado en la operatividad o en el producto.*

* **Hora/Fecha de detección:** [Hora y fecha]
* **Detectado por:** [Persona, departamento o sistema de monitorización]
* **Descripción del problema:** [Ej. Durante el cierre de la iteración, 10 de los 15 usuarios piloto abandonaron la prueba, situando la tasa de retención por debajo del mínimo exigido].
* **Impacto real causado:** [Ej. Retraso de 2 días en la validación / Caída del servicio durante 4 horas / Desviación presupuestaria de X€].

---

## 2. Análisis del Plan de Mitigación (Prevención)
*¿Cuáles fueron las causas por las que las medidas preventivas no resultaron efectivas? Evalúe la ejecución del plan de mitigación definido previamente en el Registro de Riesgos.*

* **Plan de mitigación original:** [Describa las acciones preventivas estipuladas. Ej. Comunicación proactiva semanal y entrega de descuentos del 20%].
* **Nivel de ejecución:** [ ] Completo | [ ] Parcial | [ ] No se ejecutó
* **Motivo del fallo preventivo:** [Explique las razones por las que la mitigación fue insuficiente. Ej. Los correos de marketing se enviaron fuera de plazo y el descuento del 20% no supuso un incentivo competitivo frente a otras opciones].

---

## 3. Ejecución del Plan de Contingencia (Reacción)
*¿Cuáles son los pasos que se han tomado cuando se detectó el problema? Describa la ejecución del plan de contingencia.*

* **Plan de contingencia activado:** [Ej. Búsqueda masiva de nuevos leads (backup) y aumento del incentivo a 0% de comisión].
* **Tiempo de reacción:** [Tiempo transcurrido desde la detección del incidente hasta la activación oficial del plan de respuesta].
* **Acciones tomadas (Cronograma de ejecución):**
    * *[DD/MM - 10:00] Reunión de coordinación de los Team Leads.*
    * *[DD/MM - 12:00] Aprobación de presupuesto extraordinario para captación.*
    * *[DD/MM - 16:00] Lanzamiento de nueva campaña de contingencia.*

---

## 4. Evaluación de Contingencia y Métricas
*Evalúe la efectividad del plan de contingencia utilizando las métricas (KPIs/SLAs) establecidas en el Registro de Riesgos.*

| Métrica / KPI Objetivo | Valor Esperado (SLA) | Valor Real Obtenido | Estado |
| :--- | :--- | :--- | :--- |
| *[Ej. Tiempo de recuperación del servicio]* | *< 4 horas* | *6 horas* | *Fallido* |
| *[Ej. Tasa de conversión de los nuevos leads]* | *> 60%* | *75%* | *Éxito* |
| *[Añadir métrica...]* | *[Valor esperado]* | *[Valor real]* | [Estado] |

**Diagnóstico de la Contingencia:**
* **¿Cuál ha sido el grado de efectividad del plan implementado?** [Efectividad Completa / Efectividad Parcial / Nula]
* **Justificación de los resultados:** [Explique los motivos del éxito o fracaso de la reacción. Ej. El plan logró restaurar la métrica de conversión (75%), pero el SLA de tiempo de recuperación se incumplió debido a demoras operativas en la autorización del nuevo presupuesto].

---

## 5. Conclusiones y Lecciones Aprendidas
*Determine la causa raíz del incidente e identifique el aprendizaje derivado para la organización.*

1. **Causa Raíz:** [Ej. Subestimación de la barrera tecnológica para usuarios no digitales; el incentivo inicial no compensaba la curva de aprendizaje del software].
2. **Lección 1:** [Ej. Las medidas preventivas basadas en campañas de email requieren confirmación explícita de recepción y lectura].
3. **Lección 2:** [Ej. Es imperativo establecer un protocolo de autorización "fast-track" para liberación de fondos de emergencia].

---

## 6. Plan de Acción Correctiva (Next Steps)
*Defina las acciones correctivas a implementar en los próximos ciclos de trabajo para prevenir la recurrencia o mejorar la capacidad de respuesta operativa.*

| Tarea / Acción de Mejora | Responsable | Fecha Límite | Estado |
| :--- | :--- | :--- | :--- |
| *[Ej. Migrar a un proveedor de mailing corporativo con auditoría de entrega]* | *[Nombre]* | *[Fecha]* | *[Pendiente]* |
| *[Ej. Delegar un fondo de contingencia de aprobación directa al Team Lead]* | *[Nombre]* | *[Fecha]* | *[Pendiente]* |