# Acta de Reunión - Revisión Sprint 1

## Información general

- **Fecha**: 27/02/2026
- **Hora**: 16:05 – 18:24
- **Lugar**: Microsoft Teams
- **Grupo convocado**: Equipo de Organización del Proyecto

## Participantes

### Asistentes

| Nombre              | Rol                                 |
| ------------------- | ----------------------------------- |
| Guillermo Ciria     | Organización / Backend / Despliegue |
| Marta Aguilar       | Organización / Backend / Frontend   |
| Lucía Ponce         | Organización / Frontend             |
| Cristina Fernández  | Organización / Backend / Frontend   |
| Rosa María Espinosa | Organización / Marketing / Backend  |
| Guillermo García    | Organización / Backend / Testing    |
| Paula Rosa González | Organización / Backend / Frontend   |
| Alejandro           | Organización / Backend / Frontend   |

### Ausentes

- Samuel Tamayo

## Orden del día

1. Revisión del estado del desarrollo (backend, frontend, testing).

2. Reparto de tareas pendientes para finalizar el Sprint 1.

3. Problemas detectados.

4. Planificación de documentación, presentación y demo.

5. Ruegos y preguntas.

## Desarrollo de la reunión

### 1. Revisión del estado del desarrollo (backend, frontend, testing)

- Se expresa y confirma un retraso generalizado en las tareas a realizar, en gran parte debido a dependencias entre tareas.

- El frontend es casi inexistente en varios grupos. Al no avanzar backend, no se ha podido realizar frontend.

- Backend avanzado en algunos subgrupos, pero con problemas de instalación del entorno en varios miembros.

- Se fija como objetivo crítico tener el core completo como máximo para el lunes, de forma que se pueda desplegar y grabar el vídeo demo de la aplicación para la entrega y presentación.

- Se mencionan algunas complicaciones que han tenido miembros de algunos equipos para la instalación del entorno (devcontainer), aunque el equipo considera que hay personas que están inflando las horas en relación a la instalación, pues la persona responsable no ha recibido mensajes de dudas o errores en relación a la instalación del entorno por parte de estas personas.

- Se comenta el uso de la IA para la redacción de algunos documentos. Se propone poner a personas que revisen los documentos para evitar el exceso de IA en los mismos.

### 2. Reparto de tareas pendientes para finalizar el Sprint 1

- Se priorizan las tareas de código para asegurar la realización del despliegue.

- Se propone que cada equipo continúe con las tareas que se asignaron al principio del sprint, reorganizando la asignación de las tareas en función de la disponibilidad de los miembros de cada equipo.

- Se expone que en caso de comprobar que exista un posible retraso en la realización de las tareas de código del grupo, se deberá avisar como muy tarde el domingo, para tener un margen de reasignación y realización de tareas entre el resto de equipos, de forma que puedan estar todas completas el lunes a lo sumo.

- Emmanuel pasará temporalmente al grupo de Guillermo Ciria para trabajar en los pagos junto a su equipo, que tiene buena parte de esta tarea.

- Marta expone que no solo realizará el listado de usuarios para los usuarios administradores, realizará toda la gestión de usuarios por parte del administrador de la aplicación, ya que ha empezado a hacerlo y considera que estará finalizado para la fecha límite.

### 3. Problemas detectados

Se identifican algunos problemas generales:

#### a) Falta de comunicación

Se expone que hay varios miembros que no responden a los mensajes, a pesar de contactar con ellos a través del grupo de su equipo, ni actualizan el Kanban del proyecto.

Se acuerda que cada líder de los subgrupos debe avisar el domingo a las 16:00 si alguien no está cumpliendo con sus tareas, para de esta forma poder poner una solución a las tareas que queden incompletas.

#### b) Horas de más en Clockify

Se detectan casos de horas injustificadas.

Se acuerda establecer una medida objetiva de cumplimiento de trabajo realizado, tanto para la presentación, como internamente:

- Gráficos anónimos con horas + puntos de historia.
- Señalar internamente a aquellos que no cumplan con lo establecido.

#### c) Carga desigual de trabajo

Hay miembros del equipo que están asumiendo más cantidad de tareas, mientras que otros aportan muy poco o nada, sin que exista una verdadera consecuencia.

Se propone que el trabajo de los miembros no solo se mida por horas, si no por puntos de historia, y que estos puntos de historia se asignen en base al criterio del equipo de organización, en lugar de los propios subgrupos.

#### d) Documentación no asignada

En la semana anterior, varios documentos quedaron sin repartir entre los equipos, lo que provocó que se hiciesen entre 4 miembros de un solo equipo, con muy poco margen de cara a la presentación, quedándose hasta altas horas de la noche para evitar la no entrega de ese documento y parte de la presentación.

Se acuerda que toda la documentación que se tenga que entregar en la semana se asigne explícitamente en las issues del tablero, creando todas las tareas a realizar en el momento de hacer el reparto.

### 4. Planificación de documentación, presentación y demo.

Se hace un reparto de la documentación obligatoria a realizar, corregir o completar.

**1. Gantt detallado del Sprint 1 y planificación exhaustiva del Sprint 2**

- Responsables: Paula, Lucía y Cristina.
- Fecha límite: Martes 20:00

**2. Actualización del documento de problemas y contingencias**

- Responsable: Equipo de Guillermo García
- Importante: Añadir medidas de efectividad de cada solución.

**3. Actualización del presupuesto**

- Responsable: Marta
- Incluir CAPEX/OPEX, amortizaciones, seguridad social, salarios, etc.

**4. Documento de despliegue e integración continua**

- Responsable: Guillermo Ciria
- Incluir pipeline, forma de despliegue por Sprint y CI/CD.

**5. Medida de cumplimiento del Commitment Agreement**

- Responsable: Grupo 3
- Gráficos anónimos para la presentación, con detalles de puntos de historia y horas por persona.

**6. Retrospectiva del Sprint 1**

- Responsable: Cristina

**Presentación**

- Debe estar lista para el martes por la noche si se pretende hacer una revisión visual de la misma, para corregir detalles estéticos de la misma.
- Cada subgrupo debe preparar sus propias diapositivas y notas en la presentación, para de esta forma facilitar la presentación a los presentadores.

**Demo en vídeo**

- Debe grabarse entre martes y miércoles como muy tarde, a ser posible en cuanto esté desplegada la aplicación.
- Se propone buscar un voluntario a través del grupo general.
- Cristina se lo propone a un miembro de su equipo (José Luis), este acepta, por lo que finalmente se le asigna a él la tarea.
- Debe ser breve, clara y mostrar el MVP funcional.

### 5. Ruegos y preguntas

Se trataron dudas sobre:

- Flujo de pantallas del kit.
- Envío de recibos por email, se decide usar SendGrid ya que varias personas lo han utilizado anteriormente en proyectos.
- Uso de notificaciones en web: surge la duda sobre cómo se van a tratar las notificaciones en el formato web de la aplicación. Se propone que las notificaciones queden en un buzón de notificaciones al que podrá acceder el usuario para ver las mismas.
- Política de ramas: se plantea la cuestión sobre el borrado de ramas. Estas no se deben borrar, pues es la forma en la que queda el trabajo registrado.
- Diagrama UML: se acuerda realizar correcciones sobre él en función de lo que se vaya desarrollando, ya que no es viable adaptar todo el desarrollo al diagrama.
- Uso de ZenHub o GitHub Projects: se comenta el riesgo con el límite de issues en la plataforma ZenHub, por lo que se acuerda dejar ambos tableros por el momento, hasta comprobar la viabilidad de continuar usando ZenHub.

## Resumen de acuerdos y decisiones

| #   | Acuerdo/Decisión                                         | Responsable(s)                  |
| --- | -------------------------------------------------------- | ------------------------------- |
| 1   | Tareas de código completas para el lunes, como muy tarde | Todos los subgrupos             |
| 2   | Reorganización de tareas críticas                        | Todos los líderes de subgrupo   |
| 3   | Crear medidas objetivas de cumplimiento                  | Grupo 3                         |
| 4   | Actualizar documentos de problemas y contingencias       | Grupo Guillermo García          |
| 5   | Rehacer presupuesto con los nuevos aspectos              | Marta                           |
| 6   | Crear documento de despliegue + CI/CD                    | Guillermo Ciria                 |
| 7   | Gantt Sprint 1 + planificación Sprint 2                  | Paula, Lucía, Cristina          |
| 8   | Demo en vídeo antes del miércoles                        | Por asignar (posible José Luis) |
| 9   | Retrospectiva Sprint 1                                   | Cristina                        |
| 10  | Líderes deben avisar el domingo si alguien no cumple     | Todos los líderes de subgrupo   |

## Tareas asignadas

| #   | Descripción                      | Responsable(s)          | Fecha límite |
| --- | -------------------------------- | ----------------------- | ------------ |
| 1   | Código aplicación                | Todos los equipos       | 02/03/2026   |
| 2   | Documento de despliegue + CI/CD  | Aurora                  | 04/03/2026   |
| 3   | Presupuesto completo             | Marta                   | 04/03/2026   |
| 4   | Gantt Sprint 1 y Sprint 2        | Paula, Lucía, Cristina  | 03/03/2026   |
| 5   | Documento de problemas y medidas | Grupo de Guillermo G.L. | 03/03/2026   |
| 6   | Demo en vídeo                    | Por asignar             | 04/03/2026   |
| 7   | Retrospectiva Sprint 1           | Cristina                | 03/03/2026   |
| 8   | Acta de esta reunión             | Cristina                | 04/03/2026   |

## Próxima reunión

**Fecha:** 06/03/2026
**Hora:** Por definir
**Lugar:** Microsoft Teams

**Temas a tratar:**

- Reparto de tareas para el Sprint 2
- Aspectos a mejorar
- Seguimiento de tareas

---

**Acta redactada por:** Cristina Fernández Chica  
**Fecha de redacción:** 28/02/2026
