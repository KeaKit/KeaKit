# Gestión de Costes y Presupuesto del Proyecto

## Cálculo del coste por hora de cada rol

Para estimar el coste total del proyecto se ha calculado previamente el coste por hora de cada uno de los roles implicados en el desarrollo. Estos valores se han obtenido a partir de salarios medios del sector tecnológico en España y posteriormente se ha aplicado un incremento del **30 % correspondiente a las cotizaciones empresariales a la Seguridad Social**, con el objetivo de reflejar el coste real que asumiría una empresa por cada trabajador.

La siguiente tabla muestra el salario base estimado para cada rol y su correspondiente coste empresa tras aplicar dicho incremento.

| Rol | Salario base | Coste empresa (+30%) |
|---|---|---|
| Ingeniero de testing | 15 €/h | 19,50 €/h |
| Programador junior | 14,10 €/h | 18,33 €/h |
| Jefe de proyecto | 28 €/h | 36,40 €/h |
| Jefe de equipo | 28 €/h | 36,40 €/h |
| Marketing junior | 11 €/h | 14,30 €/h |
| Ingeniero DevOps junior | 18,23 €/h | 23,70 €/h |

Estos valores permiten calcular posteriormente el coste total de recursos humanos en función de las horas dedicadas por cada rol durante el desarrollo del proyecto.

---

## Horas totales del proyecto

El equipo de desarrollo está compuesto por **21 integrantes**, y cada uno de ellos dedica **150 horas de trabajo al proyecto**, lo que equivale aproximadamente a **6 créditos ECTS** dentro del marco académico en el que se desarrolla el proyecto.

Por tanto, el número total de horas invertidas en el desarrollo de la aplicación es el siguiente:

21 integrantes × 150 horas  

**= 3150 horas totales de trabajo**

Estas horas se distribuyen entre diferentes roles y responsabilidades dentro del equipo.

---

## Distribución de horas por rol

La mayor parte del tiempo del proyecto se dedica a tareas relacionadas directamente con el desarrollo del producto, principalmente programación y testing. En total, entre todos los miembros del equipo se destinan **2520 horas a estas actividades técnicas**.

La distribución de estas horas entre programación y testing se muestra en la siguiente tabla:

| Rol | Horas |
|---|---|
| Programación | 1512 h |
| Testing | 1008 h |

Además de las tareas de desarrollo, el proyecto requiere la participación de distintos roles de apoyo como gestión del proyecto, coordinación de equipos, DevOps y marketing. En total, **630 horas del proyecto se destinan a estos roles adicionales**.

La siguiente tabla muestra la distribución de estas horas según el rol y el número de personas que lo desempeñan.

| Rol | Personas | Horas/persona | Total |
|---|---|---|---|
| Jefes de proyecto | 2 | 80 h | 160 h |
| Jefes de equipo | 5 | 60 h | 300 h |
| DevOps | 1 | 100 h | 100 h |
| Marketing | 2 | 35 h | 70 h |

---

## Coste de recursos humanos

A partir del coste por hora de cada rol y de la distribución de horas previamente definida, se puede calcular el coste total asociado a los recursos humanos del proyecto.

| Rol | Coste |
|---|---|
| Programación | 27.707 € |
| Testing | 19.656 € |
| Jefes de proyecto | 5.824 € |
| Jefes de equipo | 10.920 € |
| DevOps | 2.370 € |
| Marketing | 1.001 € |
| **Total recursos humanos** | **67.478 €** |

Como puede observarse, el coste de recursos humanos representa la mayor parte del presupuesto del proyecto, lo cual es habitual en proyectos de desarrollo de software.

---

## Recursos no humanos

Además de los recursos humanos, el proyecto también requiere una serie de recursos materiales y servicios tecnológicos que generan costes adicionales. Estos costes se clasifican en **costes de capital** y **costes operativos**.

### Coste de capital

El coste de capital corresponde a la inversión en equipamiento informático necesario para el desarrollo del proyecto. En este caso se considera la adquisición de **21 portátiles**, uno para cada integrante del equipo.

Tomando como referencia un precio medio de **900 € por portátil**, el coste total del equipamiento sería:

21 × 900 €  

**= 18.900 €**

Este gasto se considera una inversión amortizable, ya que los equipos pueden seguir utilizándose en proyectos futuros.

---

### Coste operativo

El coste operativo incluye los gastos asociados al uso de herramientas y servicios necesarios para el desarrollo y despliegue de la aplicación.

En este proyecto se utilizan diversas herramientas de software, muchas de ellas gratuitas, mientras que otras requieren una suscripción de pago. Aunque en el contexto académico algunas de estas licencias son proporcionadas por la **:contentReference[oaicite:0]{index=0}**, en este análisis se simula el escenario real de una empresa, por lo que se incluyen sus costes correspondientes.

#### Licencias software de pago

La primera licencia considerada es la correspondiente al servicio **Google Workspace Business Starter**, utilizado para desplegar la aplicación mediante **Google Sites**. Durante la fase de desarrollo del proyecto se utilizará esta licencia durante **4 meses**, con un coste mensual de **6,8 €**.

El coste correspondiente al periodo de desarrollo sería:

6,8 € × 4 meses  

**= 27,20 €**

Es importante destacar que este gasto **no se limita únicamente a la fase de desarrollo**, sino que se trata de un **coste recurrente mensual necesario para mantener la aplicación desplegada y operativa en la nube una vez que el producto se encuentre en el mercado**.

La segunda licencia de pago utilizada durante el desarrollo es **:contentReference[oaicite:1]{index=1}**, empleada como herramienta de apoyo en tareas de desarrollo y generación de código. Esta licencia se utiliza únicamente durante los **4 meses de desarrollo** y debe estar disponible para todos los miembros del equipo.

Cada licencia tiene un coste de:

(4 € × 2 meses) + (8 € × 2 meses)  

**= 24 € por usuario**

Dado que el equipo está compuesto por **21 integrantes**, el coste total sería:

21 × 24 €  

**= 504 €**

Por tanto, el coste total en licencias durante el desarrollo del proyecto es:

27,20 € + 504 €  

**= 531,20 €**

---

## Presupuesto total del proyecto

Una vez calculados todos los costes asociados al proyecto, se puede obtener el presupuesto total necesario para llevar a cabo su desarrollo.

| Tipo de coste | Importe |
|---|---|
| Coste de capital | 18.900 € |
| Coste operativo | 68.009,20 € |
| **Coste total del proyecto** | **86.909,20 €** |

El coste de capital corresponde a la inversión en equipamiento informático, mientras que el coste operativo incluye los gastos asociados a recursos humanos y licencias de software necesarias para el desarrollo de la aplicación.