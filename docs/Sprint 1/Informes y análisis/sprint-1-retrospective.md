# Sprint 1 Retrospective - keaKit

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
Para la realización de la retrospectiva se ha realizado una reunión de todos los miembros del equipo a través de Microsoft Teams. Se ha pedido a los participantes que comenten aspectos que creen que se han realizado bien, mal o de forma mejorable. A continuación, se han expuesto los distintos problemas que han surgido durante el milestone, también recogidos en el documento correspondiente, las soluciones dadas a los mismos, y lo bien o mal que han funcionado, proponiendo posibles mejoras o soluciones si aún no se ha encontrado una solución óptima. Por último, tras analizar los problemas y las soluciones, se ha desarrollado un plan de acción para el próximo sprint.

En este documento se describirá con más detalle lo mencionado anteriormente. 

## 3. Retrospectiva

### 3.1 Lo Bueno, Lo Malo, Lo Mejorable  

| Descripción     | Estado           | 
| ----------- | -------------- | 
|  Organización general |  Malo  |
|  Falta de trabajo continuo |  Malo    |
|  Gran cantidad de tarea entregadas al final del sprint   |   Malo |
|  Falta de comunicación entre miembros de los subequipos  |  Mejorable  |
|  Reparto inicial de tareas poco realista   |  Malo  |
|  Retraso en la realización de tareas por dependencia con otras tareas   | Malo   |
|  Seguimiento de la política de ramas una vez establecida    |  Mejorable  |
|  Movimiento de las tareas en los tableros Kanban  | Mejorable  |
|  Se ha alcanzado el objetivo del sprint  | Bueno   |
|  Reacción del equipo ante errores inesperados  | Bueno   |
|  Gestión de dependencias entre tareas  | Mejorable   |
|  Documentación final bien coordinada  | Bueno  |
|  Reparto de documentación de la primera semana no equitativo | Mal |
|  Reparto de casos de uso core bien dividido y repartido en subtareas| Bien |
|  No comprobación completa de la tarea antes de hacer merge a develop, provocando errores | Mal |
|  Versión de la aplicación desplegada con ligeras diferencias a la local | Mejorable |



### 3.2 Discusión y análisis

Durante este primer sprint, han surgido diversos problemas tanto en aspectos de desarrollo, como de entorno tecnológico y organización que han provocado retrasos en el desarrollo de las funcionalidades planeadas para este sprint.

Estos retrasos se pueden observar en el siguiente burndown, donde vemos el número de puntos de historia completados por día:

![Sprint 1 Burndown](./img/burndown.png)


Aquí vemos que durante la primera semana del sprint, el avance de tareas era casi inexistente, completando muy pocas tareas en relación a lo que se debería haber realizado.

Cada equipo tenía asignadas cuatro tareas de desarrollo de casos de uso core, de las cuales la mitad de ellas en cada equipo, deberían haber estado completadas para la primera semana del sprint. 

Debido a distintas incidencias surgidas en la primera semana como retrasos en la realización de tareas de las cuales se dependían para hacer otras, o fallos en el entorno de desarrollo (devcontainer) en diversos componentes del grupo, debido a la corta vida del mismo, pues aún no se había utilizado el entorno y estaba recién creado, lo que provocó muchos cambios en el mismo hasta conseguir cierta estabilidad en el mismo.

Analizando más en detalle el burndown, se puede observar lo mencionado anteriormente, hay un cuello de botella que se extiende durante toda la semana (20 a 27 de febrero). Este se empieza a aliviar tras la reunión mantenida por el equipo de organización el viernes 27, donde se pone un límite fijo (lunes 2 de marzo) para la finalización de las tareas de código, permitiendo así agilizar el despliegue de la aplicación y las pruebas de la misma por parte de los usuarios piloto para recibir feedback de cara a la mejora de la aplicación. Además, durante esta reunión se repartieron todos los documentos a realizar, actualizar o mejorar para la entrega del primer sprint, evitando de esta forma el error cometido durante la primera semana del mismo, donde quedaron varios documentos nuevos sin repartir de los que se encargaron algunos miembros de un solo equipo, llevándose una carga de trabajo mayor de forma innecesaria.

Es por ello, que a partir del viernes 27, vemos una mejora considerable en la entrega de tareas, lo que permitió hacer el despliegue de la misma con las funcionalidades principales implementadas, pudiéndose grabar la vídeo demo con tiempo para mitigar posibles errores no encontrados anteriormente.

Durante los últimos días del sprint, la mayor parte del tiempo se dedicó a la realización de correcciones mínimas y la redacción, corrección o actualización de los documentos pertinentes, completando todas las tareas establecidas por el equipo de organización para el sprint.

La medición de completitud de tareas, y por tanto de rendimiento del equipo, se ha realizado a través de puntos de historia asignados a las tareas mediante planning poker. Cada equipo estimó las tareas de código que les correspondía, haciendo su propia división de las mismas para su realización. Y tras la primera semana, fue el equipo de organización el que estimó las tareas añadidas para la segunda semana.

En general, a pesar de las diversas incidencias surgidas durante el desarrollo de la aplicación en este primer sprint, cambios mínimos en el core, y algunos fallos en la organización del mismo, el equipo ha sabido reorganizarse y poner límites necesarios para la entrega de las funcionalidades esenciales de la aplicación.

En conjunto, los problemas iniciales de organización, dependencias y entorno generaron un retraso acumulado que marcó la primera mitad del sprint. Sin embargo, la capacidad del equipo para reorganizarse rápidamente y establecer límites claros permitió recuperar el ritmo y completar los objetivos esenciales. Aun así, persisten riesgos relacionados con la gestión de dependencias entre tareas y la estabilidad del entorno que deberán vigilarse de cerca en los próximos sprints.


### 3.3 Plan de acción

De cara a próximos sprints, se proponen puntos clave de mejora en varios aspectos.

#### Organización de los sprints
Para la organización de futuros sprints, los miembros de organización tendrán una checklist con todas las tareas a realizar durante el sprint, para facilitar el reparto de las mismas y evitar que algunas tareas queden sin repartir. Todas las tareas, recibirán una estimación con puntos de historia, que luego cada equipo tendrá la posibilidad de revisar a la hora de repartir las tareas entre sus miembros. Cada semana dentro de los sprints, los miembros del equipo de organización se reunirán para informar del avance de las tareas, para de esta forma poder hacer una reasignación si es necesario, además de repartir nuevas tareas que surjan durante el desarrollo del sprint.

#### Comunicación de incidencias
Cualquier tipo de incidencia detectada durante los sprints, se deberá comunicar a través del canal de incidencias creado en Teams para este propósito. Esto con el fin de mantener organizados los problemas que surjan y las soluciones que se les han dado a los mismos, para que todos podamos aplicar la solución en caso de ser necesario y facilitar el proceso de documentación de las mismas.

#### Reducción de entregas concentradas
El equipo tiende a concentrar la entrega de tareas hacia el final del sprint, lo que es un problema a la hora de solucionar posibles errores que surjan durante pruebas posteriores prácticas de la aplicación. Se propone establecer fechas límite cada semana para la entrega de las tareas, de forma que no se junten una gran parte de las tareas del sprint al final del mismo, provocando cuellos de botella y fallos inesperados derivados de la realización paralela de cambios en los mismos archivos.


## 4. Conclusiones

 Este primer sprint ha servido al equipo como punto de partida para identificar debilidades en distintos aspectos como la organización, comunicación y gestión del entorno técnico. A pesar de los retrasos iniciales, el equipo ha demostrado capacidad de adaptación y colaboración para cumplir los objetivos marcados. Las acciones propuestas permitirán afrontar el siguiente sprint con mayor claridad, estabilidad y coordinación.



## 5. Historial de versiones

| Versión | Fecha       | Descripción                    | Autor(es)                      |
|---------|-------------|--------------------------------|--------------------------------|
| 1.0.0   | 01/03/2026  | Versión inicial                |  Cristina Fernández Chica    |
| 2.0.0   | 03/03/2026  | Añadido el análisis y los planes de acción a futuro  |  Cristina Fernández Chica    |

---
**Redactado por:** Cristina Fernández Chica
**Fecha de redacción:** 03/03/2026
**Versión:** 2.0.0