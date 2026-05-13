# Adaptaciones de la metodología Scrum en el proyecto

El desarrollo del proyecto se basa en la metodología ágil Scrum, la cual permite organizar el trabajo en iteraciones cortas (sprints), fomentar la colaboración entre los miembros del equipo y facilitar la adaptación a cambios durante el desarrollo.

No obstante, debido al tamaño del equipo y a la organización interna del proyecto, se han realizado una serie de adaptaciones propias sobre Scrum con el objetivo de mejorar la coordinación, optimizar la comunicación y facilitar la gestión del trabajo entre los distintos subgrupos.

A continuación se describen las principales adaptaciones aplicadas.

## 1. Adaptación del Sprint Planning

El Sprint Planning se realiza en dos niveles.

En primer lugar, se lleva a cabo una reunión entre los jefes de cada subgrupo y los jefes de proyecto. En esta reunión se analiza el sprint backlog y se decide qué tareas se asignan a cada subgrupo y en qué fechas deben completarse. Esta organización permite facilitar la comunicación y agilizar la toma de decisiones al reducir el número de participantes en la reunión.

Posteriormente, cada subgrupo realiza su propio Sprint Planning interno, en el que:

- Se estiman los puntos de historia de las tareas asignadas.
- El jefe de subgrupo distribuye las tareas entre los miembros del equipo.

De esta manera, cada grupo puede organizar su trabajo de forma más detallada y adaptada a sus necesidades.

## 2. Adaptación del Sprint Retrospective

El Sprint Retrospective también se realiza en dos fases.

Primero, cada subgrupo realiza una retrospectiva interna, donde los miembros del equipo analizan:

- qué aspectos han funcionado correctamente durante el sprint
- qué problemas o dificultades se han encontrado

El jefe de cada subgrupo recopila esta información y posteriormente participa en una retrospectiva global junto con los demás jefes de subgrupo y los jefes de proyecto.

En esta reunión se comparten las conclusiones de cada equipo y se acuerdan medidas de mejora aplicables a todos los grupos para el siguiente sprint.

## 3. Adaptación del Sprint Review

El Sprint Review se basa principalmente en el feedback obtenido durante las presentaciones de cada sprint.

Las observaciones y sugerencias recibidas durante dichas presentaciones se utilizan para evaluar el trabajo realizado y para identificar posibles mejoras o cambios que deberán incorporarse en los siguientes sprints.

## 4. Eliminación de las Daily Scrum

Debido al elevado número de integrantes del proyecto, se ha decidido eliminar las reuniones diarias (Daily Scrum) con el objetivo de evitar un exceso de reuniones que podría afectar a la productividad del equipo.

En su lugar, las reuniones se realizarán solo cuando sea necesario, por ejemplo:

- para resolver dudas importantes
- para coordinar cambios en el desarrollo
- para tratar problemas que afecten a varios miembros del equipo

De este modo se busca mantener la comunicación necesaria sin generar una sobrecarga de reuniones.

## 5. Uso de herramientas para seguimiento y control del trabajo

Para la gestión y seguimiento de las tareas se utilizan las herramientas:

- ZenHub
- Clockify

ZenHub permite gestionar el sprint backlog, asignar tareas y registrar los puntos de historia de cada una de ellas.

Por su parte, Clockify se utiliza para medir el tiempo invertido por cada miembro del equipo en la realización de sus tareas.

A partir de la relación entre puntos de historia y tiempo invertido, es posible analizar la eficiencia de cada integrante del equipo y comprobar si se está cumpliendo el Commitment Agreement, que establece aproximadamente **10 horas de dedicación semanal al proyecto**.

## 6. Sprint backlog global y sprint backlog por subgrupo

Aunque existe un Sprint Backlog general del proyecto, cada subgrupo dispone también de su propio sprint backlog.

Esto permite que cada equipo tenga una visión más clara de las tareas que le corresponden dentro del sprint y facilite la organización del trabajo interno.

## 7. Organización del equipo de desarrollo

Todos los integrantes del proyecto forman parte del equipo de desarrollo, incluyendo aquellos que desempeñan funciones de coordinación como los Scrum Masters o jefes de equipo.

Esto se debe a que todos los miembros del proyecto participan también en tareas relacionadas con el desarrollo del software, por lo que no existen roles exclusivamente dedicados a la gestión.

## 8. Adaptación de la política de ramas

En cuanto a la gestión del repositorio de código, durante la primera semana del Sprint 1 se utilizó inicialmente la estrategia Git Flow.

Sin embargo, a partir de la segunda semana del Sprint 1, se adoptará la estrategia **Golden Flow**, explicada en las píldoras teóricas de la asignatura, con el objetivo de simplificar la gestión de ramas y facilitar la integración del código.

Estas reglas se complementan con una política de commits basada en **Conventional Commits**, que establece un formato estandarizado para los mensajes de commit con el fin de mejorar la claridad y trazabilidad de los cambios realizados en el repositorio.