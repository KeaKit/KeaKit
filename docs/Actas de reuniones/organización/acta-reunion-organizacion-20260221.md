# Acta de Reunión - Organización semana 5

## Información general

**Fecha:** 21/02/2026  
**Hora:** 12:08 - 13:20  
**Lugar:** Teams  
**Grupo convocado:** Subgrupo de Organización

## Participantes

### Asistentes

| Nombre     | Rol   |
|------------|-------|
| Guillermo Ciria González | Coordinador / Arquitecto software |
| Lucía Ponce García de Sola | Coordinadora Squad 1 |
| Guillermo García León | Coordinador Squad 2 |
| Samuel Tamayo Balogh | Suplente de coordinador Squad 2 |
| Alejandro González Macías | Coordinador Squad 3 |
| Cristina Fernández Chica | Coordinadora Squad 4 |
| Rosa María Espinosa Martínez | Coordinadora grupo de Marketing |
| Marta Aguilar Morcillo | Ponente |

### Ausentes

*No hubo ausencias.*

## Orden del día

1. Explicación sobre desarrollo con devcontainer
2. Aclararación sobre coordinadores de cada subgrupo y como manejar los cambios en el archivo participantes.md 
3. Reorganización y asignación de casos de uso a equipos
4. Subdividir los casos de uso en tareas 
5. Crear tareas para documentación de esta semana
6. Asignar puntos de historia a las tareas
7. Organizar las diapositivas de esta semana
8. Ruegos y preguntas

## Desarrollo de la reunión

### 1. Explicación sobre desarrollo con devcontainer
Guillermo Ciria presentó la configuración del devcontainer, que incluye extensiones predefinidas, Java, Node, Git, Docker in Docker y una imagen de PostgreSQL.

Se proporcionarán instrucciones de instalación tanto para Windows (WSL) como para Linux.

### 2. Aclararación sobre coordinadores de cada subgrupo y como manejar los cambios en el archivo participantes.md

Coordinadores por squad:
- **Squad 1:** Lucía Ponce García de Sola
- **Squad 2:** Guillermo García León
- **Squad 3:** Alejandro González Macías
- **Squad 4:** Cristina Fernández Chica

Para el control de cambios en el archivo [participantes.md](../../Devising%20a%20Project/Directrices/participantes.md) se reflejará el histórico de cambios en dicho archivo y se actualizará el versionado del documento.

### 3. Reorganización y asignación de casos de uso a equipos

Cristina agrupó los casos de uso core en 4 bloques, los cuales se asignaron aleatoriamente cada uno a un squad, según la siguiente tabla:

| Grupo 3            | Grupo 2            | Grupo 4             | Grupo 1
|-------------------|------------------------|----------------------|-------------------|
CU-GENERAL-01      | CU-ADMIN-01        | CU-ARRENDADOR-01    | CU-ARRENDATARIO-01
CU-GENERAL-02      | CU-ARRENDADOR-02   | CU-ARRENDADOR-03    | CU-ARRENDATARIO-02
CU-GENERAL-03      | CU-ARRENDADOR-04   | CU-ARRENDATARIO-05  | CU-ARRENDATARIO-03
CU-ARRENDATARIO-06 | CU-GENERAL-04      | CU-ADMIN-02         | CU-ARRENDATARIO-04

### 4. Subdividir los casos de uso en tareas

Cada subgrupo es responsable de desglosar sus casos de uso asignados en tareas individuales.

Guillermo Ciria creará una plantilla de issue en GitHub para estandarizar este proceso.

Se recomendó que cada subgrupo realice sus propias reuniones internas lo antes posible para finalizar este reparto.

### 5. Crear tareas para documentación de esta semana

Se decidió repartir los documentos obligatorios entre todos los grupos para equilibrar la carga de trabajo.

La asignación resultó de la siguiente manera:
- **Actualizar documentos:** Squad 1
- **Análisis de riesgos:** Squad 2
- **Documentos obligatorios para entrega (6-S1-deliverable.pdf, 6-S1-dedication.xlsx, etc.):** Squad 3
- **Revisión de [casos-de-uso-core.md](../../Devising%20a%20Project/Alcance%20del%20proyecto/casos-de-uso.md):** Cristina
- **Documentación sobre el feedback:** Marta Aguilar y Paula

El **análisis de riesgos** se identificó como una prioridad crítica (representa gran parte de la evaluación). Debe separarse del documento de stack tecnológico y ser actualizado con un plan de actuación.

En cuanto a los **informes de uso de Inteligencia Artificial**, se mantendrá un documento centralizado donde cada miembro registre el uso de herramientas (como ChatGPT, Gemini o Copilot), incluyendo enlaces o descripciones de las conversaciones, sin necesidad de incluir prompts y respuestas completas.

### 6. Asignar puntos de historia a las tareas

Se utilizará el sistema de puntos de historia (Planning Poker) para la estimación de tareas. Cada squad será responsable de estimar sus tareas asignadas.

Para visualizar el progreso, se utilizará ZenHub y se trabajará con diagramas de Burn down, entre otros.

### 7. Organizar las diapositivas de esta semana

Guillermo Ciria y Marta Aguilar liderarán la elaboración de las diapositivas, basándose en la información proporcionada por los squads.

Orden aproximado del contenido de la presentación:
- Killer opener
- Idea del proyecto
- Stack tecnológico (haciendo énfasis en el devcontainer)
- Riesgos analizados y ocurridos
- Soluciones aplicadas y métricas sobre la efectividad de las mismas
- Cumplimiento del [Commitment Agreement](../../Plantillas/ISPP2526-commitment-agreement.pdf)

Se comentó que resultó útil que los responsables de cada sección dejaran notas claras en las diapositivas para facilitar la presentación.

Rosa María se comprometió a revisar las diapositivas como parte de sus labores de marketing.

### 8. Ruegos y Preguntas

#### 8.1. Política de commits
Se acordó por mayoría simple no utilizar emojis en los mensajes de commit, manteniendo la política establecida hasta el momento.

#### 8.2. Definición del sistema de soporte
Se aclaró que el punto de "soporte" se refiere a la gestión de incidencias (como problemas con los envíos). Se acordó implementar un formulario o cuestionario para que los usuarios reporten estas dudas o problemas.

#### 8.3. Balance de carga de trabajo y registro de horas
Se debatió sobre la necesidad de equilibrar las horas de organización de los coordinadores con las de desarrollo para no exceder la jornada. Además, surgió una preocupación por la posible "inflación de horas" en el reporte de algunos miembros para justificar el tiempo de trabajo.

#### 8.4. Gestión de cambios por feedback
Se planteó la necesidad de crear plantillas de issues específicas para cuando los usuarios pilotos envíen feedback más adelante en el proyecto.

## Resumen de acuerdos y decisiones

| # | Acuerdo/Decisión | Responsable(s) |
|---|------------------|----------------|
| 1 | Los cambios de coordinación se anotarán al final del archivo para mantener un histórico de roles por semana. | Coordinadores de subgrupo |
| 2 | Decisión por mayoría simple de prohibir el uso de emojis en los mensajes de los commits | Todos los coordinadores | 
| 3 | Distribución de los cuatro bloques de funcionalidades entre los squads | Todos los coordinadores |
| 4 | El Análisis de Riesgos se tratará como documento crítico y separado del stack tecnológico, incluyendo planes de actuación. | Todos los coordinadores |
| 6 | Obligación de registrar el uso de IA: enlaces para ChatGPT y descripciones detalladas para Copilot. | Todos los coordinadores |
| 7 | Uso de la herramienta Zenhub para realizar el Planning Poker (puntos de historia) y generar métricas. | Todos los coordinadores |


## Tareas asignadas

| # | Descripción breve | Responsable(s) | Fecha límite |
|---|------------------|----------------|--------------|
| 1 | Creación de una plantilla de issue en GitHub para que todos los grupos desglosen sus tareas de la misma forma. | Guillermo Ciria | 26/02/2026 |
| 2 | Realizar reuniones de coordinación internas para cada subgrupo lo antes posible. | Coordinadores de squad | 25/02/2026 |
| 3 | Elaboración de instrucciones de instalación para el devcontainer | Guillermo Ciria | 23/02/2026 |
| 4 | Desglose de casos de uso asignados en tareas individuales | Squads | 23/02/2026 |
| 5 | Actualizar documentos ([Análisis de tecnologías](../../Devising%20a%20Project/Informes%20y%20análisis/analisis-de-tecnologias.md), [participantes](../../Devising%20a%20Project/Directrices/participantes.md), etc.)| Squad 1 | 26/02/2026 |
| 6 | Análisis de riesgos | Squad 2 | 25/02/2026 |
| 7 | Crear documentos obligatorios de la entrega | Squad 3 | 04/03/2026 |
| 8 | Revisión de [casos-de-uso-core.md](../../Devising%20a%20Project/Alcance%20del%20proyecto/casos-de-uso.md) | Cristina Fernández | 23/02/2026 |
| 9 | Documentación sobre el feedback y aportaciones a la [Base de Conocimiento Común](https://uses0-my.sharepoint.com/:x:/g/personal/alereyper_alum_us_es/IQCT5FMXpD2HTYXddK6Er3KwATUqaO9z2soT8Vu6Uwl-nxs?e=20UbB6) | Marta Aguilar y Paula Rosa González | 26/02/2026 |

## Próxima reunión

**Fecha:** 23/02/2026  
**Hora:** 20:00  
**Lugar:** Teams  

**Temas a tratar:**

- Resolución de dudas
- Seguimiento de tareas pendientes

---

**Acta redactada por:** Lucía Ponce García de Sola  
**Fecha de redacción:** 23/02/2026
