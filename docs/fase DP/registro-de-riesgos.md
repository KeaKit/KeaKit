# Registro de Riesgos (Risk Log)


| ID | Categoría | Descripción del Riesgo | Probabilidad | Imp. Alcance | Imp. Tiempo | Imp. Calidad | Prioridad | Plan de Mitigación (Preventivo) | Plan de Contingencia (Reactivo) | Métrica de Efectividad (Contingencia) |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| **R1** | Técnico | Función demasiado compleja para las herramientas escogidas. | Media | Alto | Bajo | Alto | **Medio** | Investigación técnica antes de iniciar el Sprint. | Refactorización. | Tiempo de bloqueo del equipo de desarrollo < 48 horas. |
| **R2** | Técnico | Incompatibilidad en herramientas de desarrollo/despliegue. | Media | Bajo | Bajo | Bajo | **Medio** | Uso estricto de DevContainers y Docker para estandarizar el entorno. | Búsqueda y migración a herramientas alternativas compatibles en el mercado. | Entorno de desarrollo restaurado para toda la plantilla en < 24h. |
| **R3** | Técnico | Licencias/software corporativo insuficientes. | Media | Medio | Medio | Bajo | **Bajo** | - | Aprobación de presupuesto de emergencia para nuevas licencias o uso de alternativas Open Source. | - |
| **R4** | Técnico | Brechas de seguridad o pérdida de información confidencial. | Baja | Bajo | Bajo | Alto | **Alto** | Configurar roles estrictos en BD, ocultar variables de entorno y proteger ramas principales. | Revisar seguridad de la información alamcenada en sistemas públicos. | - |
| **R5** | Técnico | Caída de infraestructura o servidores cloud. | Baja | Medio | Medio | Medio | **Alto** | Utilización de sistemas fiables y monitorización frecuente. | Desplegar backups en proveedores cloud secundarios (Multi-cloud fallback). | Tiempo de caída del entorno (Downtime) < 12 horas. |
| **R6** | Organizativo | Falta de conocimiento técnico (skills gap) en el equipo. | Media | Bajo | Alto | Medio | **Medio** | Fomentar Pair Programming y documentar procesos internos. | Pausar desarrollo temporalmente para *onboarding* intensivo o mentoría externa. | Tasa de rechazo en QA o Pull Requests < 20% tras la nivelación técnica. |
| **R7** | Organizativo | Baja laboral o rotación imprevista de personal clave. | Alta | Bajo | Bajo | Bajo | **Bajo** | - | Redistribución y equilibrio de tareas (Cross-training preventivo). | - |
| **R8** | Organizativo | Deuda técnica por documentación pobre o procesos no estandarizados. | Media | Bajo | Bajo | Medio | **Medio** | Establecer la plantilla `Definition of Done (DoD)` como paso bloqueante. | Corrección en bloque reasignando sprints exclusivamente a mantenimiento y QA. | Cero errores graves al revisar el trabajo. |
| **R9** | Externo | Límite de cuota superado en servicios de terceros. | Media | Medio | Alto | Medio | **Alto** | Monitorizar alertas de facturación y consumo (FinOps). | Escalamiento inmediato a planes enterprise o purga temporal de logs innecesarios. | Restauración de las operaciones del servicio en < 4 horas. |
| **R10** | Técnico | Fallos críticos en la build de producción (Mobile). | Media | Medio | Medio | Medio | **Medio** | Despliegue continuo | Rollback a la versión estable anterior y build manual en local si falla el CI. | Release disponible 24h antes de la fecha límite. |
| **R11** | Organizativo | Rendimiento individual inferior a lo estipulado en el commitment agreement. | Baja | Bajo | Bajo | Bajo | **Bajo** | - | Aviso al individuo y comunicación con el equipo. | Individuo cumple con el rendimiento estipulado en commitment agreeement. |
| **R12** | Organizativo | Caída de productividad por exceso de reuniones o carga operativa. | Alta | Bajo | Bajo | Bajo | **Bajo** | - | Cancelación de reuniones no críticas y ajuste de capacidad en la planificación. | - |
| **R13** | Externo | Trabajo realizado no aprobado por los "Stakeholders". | Media | Bajo | Medio | Medio | **Medio** | Solicitar feedback y aplicar medidas de ajuste. | Refactorizar el trabajo aplicando el feedback obtenido. | Entregable aprobado por "Stakeholders" |
| **R14** | Organizativo | Falta de trazabilidad en el reporte de horas (Clockify). | Alta | Medio | Alto | Medio | **Alto** | Monitorización y recordatorios frecuentes. | Intervención del organizador de lsubgrupo y bloqueo temporal de nuevas tareas hasta actualizar el registro. | 100% de la carga de trabajo registrada antes del cierre del Sprint. |
| **R15** | Negocio y Mercado | Falta de captación de Usuarios Piloto. | Alta | Alto | Medio | Alto | **Alto** | Estrategias de captación y despliegue del Plan de Incentivos. | Diseñar nuevas medidas de marketing, apra captación de usuarios piloto.| Lograr las métricas de tracción mínimas exigidas por el modelo de negocio. |
| **R16** | Organizativo | Silos de información o fallos de coordinación interdepartamental. | Media | Medio | Alto | Medio | **Alto** | Aplicación estricta de la matriz RACI y comunición constante entre subgrupos. | Reuniones de sincronización de emergencia entre los coordinadores de cada subgrupo. | 0 bloqueos funcionales por falta de comunicación. |
| **R17** | Estimación y Planificación | Incumplimiento de dependencias críticas en el roadmap. | Media | Alto | Alto | Medio | **Alto** | Identificar dependencias bloqueantes (Critical Path) en la fase de refinamiento. | Asignación temporal de recursos de otros subgrupos para desatascar el cuello de botella. | Desviación del cronograma proyectado < 2 días hábiles. |
| **R18** | Estimación y Planificación | Cuellos de botella entre Desarrollo (Back/Front) y QA. | Alta | Bajo | Medio | Alto | **Medio** | Integrar QA desde la fase de diseño. Obligatoriedad de revisar PRs antes de escribir nuevo código. | Delegar recursos al subgrupo afectado. | Tiempo medio de validación de código < 24 horas. |

---

## Historial de versiones

| Versión | Fecha       | Descripción                   | Autor(es)       |
|---------|------------|--------------------------------|------------|
| 1.0.0   | 23/02/2026 | Añade el Registro de Riesgos (Risk Log). Catálogo completo con 18 riesgos evaluados por prioridad, incluyendo planes de mitigación y contingencia con métricas de efectividad simplificadas. | Ismael Carrasco Mkhazni, Guillermo García León |


---
**Redactado por:** Ismael Carrasco Mkhazni y Guillermo García León
**Fecha de redacción:** 23/02/2026  
**Versión:** 1.0.0