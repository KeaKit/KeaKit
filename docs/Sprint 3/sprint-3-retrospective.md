# Sprint 3 Retrospective - KeaKit

## Índice

1. [Componentes](#componentes)
2. [Introducción](#introducción)
3. [Retrospectiva](#retrospectiva)
   - 3.1 [Lo Bueno, Lo Malo, Lo Mejorable](#lo-bueno-lo-malo-lo-mejorable)
   - 3.2 [Discusión y análisis](#discusión-y-análisis)
   - 3.3 [Plan de acción](#plan-de-acción)
4. [Conclusiones](#conclusiones)
5. [Historial de versiones](#historial-de-versiones)

## 1. Componentes

|           |           | 
|-----------|-----------|
| Marta Aguilar Morcillo    | Cristina Fernández Chica   |
| Miguel Álvarez Raya    | Guillermo García León    |
| Ángel Amo Sánchez    | Alejandro González Macías   |
| Enrique Nicolae Barac Polae    | Paula Rosa González Páez |
| Ismael Carrasco Mkhazni  | Candela Jazmín Gutiérrez González |
| Adrián Miguel Chabrera Rubio  | Rafael Harana López  |
| Luis Emmanuel Chávez Malavé   | José Luis Moraza Vergara  |
| Guillermo Ciria González  | Germán Ojeda Garrido   |
| Marta de la Calle González   | Lucía Ponce García de Sola  |
| Salma El Hakimy Ettirabi  | Samuel Tamayo Balogh  |
| Rosa María Espinosa Martínez |     | 



## 2. Introducción

El objetivo del sprint estaba centrado en la finalización del desarrollo de todas las funcionalidades de la aplicación, con las correcciones de errores necesarias para reducir al mínimo el número de errores en la aplicación.

La retrospectiva del tercer sprint se ha centrado en tratar los distintos problemas que han continuado desde sprints anteriores, sobre todo en relación al rendimiento de algunos miembros del equipo y su impacto en el proyecto y en el resto de miembros. De nuevo, a pesar de las nuevas advertencias en términos de horas trabajadas y completitud de tareas, ha habido varios miembros que han continuado con su mínimo o nulo trabajo, por lo que se han tomado medidas más drásticas que se comentarán a lo largo de este documento. Todas estas medidas, son con el fin de poner fin a la inactividad de estos miembros o, en caso contrario, que se refleje en las calificaciones de las personas en cuestión.

Este documento recoge los hallazgos, análisis y medidas acordadas para mejorar el rendimiento del equipo en las príximas etapas del proyecto.

---

## 3. Retrospectiva

### 3.1 Lo Bueno, Lo Malo, Lo Mejorable  

| Descripción | Estado |
| :--- | :--- |
| **Compromiso (extra) y actividad real de parte de algunos miembros del grupo** | **Bueno** |
| **Falta de compromiso por parte de algunos miembros** | **Malo** |
| **Falsificación de los registros de horas (Clockify)** | **Malo** |
| **Inflamiento de horas invertidas para llegar al mínimo (Clockify)** | **Malo** |
| **Coherencia en la estimación de Puntos de Historia** | **Malo** |
| **Cumplimiento de fechas límite para despliegue** | **Malo** |
| **Cumplimiento de fechas límite para finalización de tareas** | **Malo** |
| **Reparación de bugs en el menor tiempo posible** | **Bueno** |
| **Gestión del Despliegue / CD** | **Bueno** |
| **Gestión de dependencias entre tareas**  | **Mejorable**   |
| **Miembros con 0 horas/commits durante semanas** | **Malo** |
| **Miembros que trabajan a última hora para "cubrir" sus horas** | **Malo** |
| **Merges a develop con errores en CI** | **Malo** |




### 3.2 Discusión y análisis


Durante el tercer sprint, los problemas que se detectaron durante el anterior sprint anterior no solo no han mejorado, si no que han empeorado a pesar de las medidas dispuestas para su mejora o resolución. Algunos de estos problemas han sido los siguientes:

* **Falta de compromiso de ciertos miembros:** A pesar de haber comentado de forma extensa la falta de trabajo de varios miembros del grupo, señalando medidas estrictas que se tomarían sobre los porcentajes de rendimiento si volvía a ocurrir esta situación y no se corregía la falta de trabajo del sprint anterior, con especial enfoque en aquellos miembros que fueron señalados específicamente en el anterior sprint, son más miembros los que ahora muestran falta de compromiso con el trabajo. De los miembros señalados anteriormente, ninguno mostró mejora ni recuperó las no trabajadas durante el sprint anterior como se propuso como medida para la recuperación de horas y trabajo. demás miembros que anteriormente cumplían con su trabajo, durante este sprint han desaparecido por completo hasta el último día. Por tanto, estos miembros verán afectado su porcentaje de rendimiento como quedó acordado en el sprint 2.

* **Irregularidades en los registros de horas:** Se comunicó a los equipos que las irregularidades serían revisadas desde organización para evitar la imputación fraudulenta de horas y tenerlas en cuenta a la hora de medir el rendimiento al final del sprint. Sin embargo, de nuevo se han detectado imputaciones de horas de clase sin asistencia a la misma, sumatorio de horas que no son trabajo real del proyecto, horas infladas para la realización de determinadas tareas, etc. 

* **Fechas límite de finalización de tareas:** Se dispuso una fecha límite para la realización de nuevas funcionalidades con el fin de realizar el despliegue y corregir todos aquellos bugs que se detectasen con la aplicación desplegada. Varios miembros inclumpieron esta fecha, lo que retrasó el despliegue para pruebas una vez más, llevando a algunos miembros a la corrección de errores de forma precipitada, sobrepasando sus horas de forma considerable.


Estos problemas tuvieron un impacto directo en el desarrollo del proyecto, entre ellos:
   - Sobrecarga de miembros comprometidos, lo que lleva al aumento de conflictos entre miembros del equipo.
   - Retrasos en el despliegue de la aplicación.
   - Riesgos para la calidad de la aplicación por imposibilidad de solucionar los bugs detectados en el tiempo restante.


En el siguiente Burndown vemos como ha sido la evolución de trabajo del equipo durante este tercer sprint:

![Sprint 3 Burndown](./img/burndown_sprint3.png)

Se puede observar que ha habido una gran acumulación de trabajo, durante todo el sprint que se ha completado de forma abrupta hacia el final del sprint. Esto también refleja los problemas comentados anteriormente.


### 3.3 Plan de acción

Durante el desarrollo del sprint se han ido tomando medidas sobre estos problemas aunque no han dado resultados positivos. Algunas de ellas son:
- Advertencias sobre las horas tras detectar irregularidades.
- Advertencias sobre el respeto de la fecha de finalización de tareas.
- Revisión continua del trabajo realizado por los miembros.

De cara a próximas etapas del trabajo se proponen puntos clave de mejora en varios aspectos.

#### Control y transparencia del trabajo
A partir de este sprint, todas las horas registradas deberán tener asociadas al menos una de estas evidencias:
- Commit asociado, con su correspondiente Pull Request en GitHub.
- Movimiento de tareas en tablero Kanban con comentarios y pruebas visuales en la tarea que demuestren el trabajo realizado.
- Documento o trabajo entregado.

Las horas que no tengan ninguna de estas evidencias, no serán tomadas en cuenta en la medición del rendimiento final. Para ello se realizará la revisión semanal de estas evidencias por parte de los representantes de cada uno de los grupos, además de existir un revisor/a general. Se revisarán commits, estado de las tareas en el Kanban y horas registradas, comunicando de forma inmediata a los mimbros correspondientes la presencia de irregularidades en su trabajo, exigiendo una corrección lo más rápida posible.

#### Gestión de responsabilidades y rendimiento

Si un miembro no avanza en sus tareas, se reasignará automáticamente tras 48 horas sin recibir actualizaciones sobre el estado de la tarea. Esto se tendrán en cuenta en la medición del rendimiento. Se evitará que el trabajo recaiga siempre sobre los mismos miembros. Las tareas se repartirán entre quienes no cumplan con las horas establecidas y se tomarán medidas en caso de incumplimiento.

#### Comunicación y coordinación

Cada miembro representante de grupo deberá comunicar al resto de representantes la completitud de cada una de sus tareas asignadas en el momento en que se hace merge a develop o se da por finalizada la tarea en el tablero Kanban del equipo. En caso de detectar problemas de cualquier tipo dentro de su grupo, deberá comunicarlo inmediatamente al resto para tomar una decisión al respecto y comunicarla al resto del grupo de la forma más inmediata posible.

#### Medidas disciplinarias claras

Se establecen consecuencias escalonadas para aquellos miembros que continúan con su falta de compromiso:

| Falta | Consecuencia |
| ------|--------------|
|1ª vez | Advertencia formal |
|2ª vez | Penalización de rendimiento |
|3ª vez | Retirada de tareas críticas |
|4ª vez | Propuesta de expulsión |

Todo esto con el fin de evitar que más miembros se sumen a la falta de compromiso.

## 4. Conclusiones

En este tercer sprint, se ha confirmado la incapacidad del equipo para solucionar los problemas derivados de la falta de trabajo de determinados miembros, que han generado mal ambiente entre ciertos miembros del equipo. A pesar de ello, el equipo continua sus intentos para remediar la situación y continuar sacando el proyecto hacia delante.



## 5. Historial de versiones

| Versión | Fecha       | Descripción                    | Autor(es)                      |
|---------|-------------|--------------------------------|--------------------------------|
| 1.0.0   | 15/04/2026  | Añadida la retrospectiva prácticamente completa  (falta el burndown)          |  Cristina Fernández Chica    |

---
**Redactado por:** Cristina Fernández Chica
**Fecha de redacción:** 15/04/2026
**Versión:** 1.0.0