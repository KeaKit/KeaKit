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
| GDPR Officer | 29,07 €/h | 37,80 €/h |
| Community Manager (externo) | — | 500 €/mes (tarifa plana) |

Estos valores permiten calcular posteriormente el coste total de recursos humanos en función de las horas dedicadas por cada rol durante el desarrollo del proyecto.

---

## Horas totales del proyecto

El equipo de desarrollo está compuesto por **21 integrantes**, y cada uno de ellos dedica **150 horas de trabajo al proyecto**, lo que equivale aproximadamente a **6 créditos ECTS** dentro del marco académico en el que se desarrolla el proyecto.

Por tanto, el número total de horas invertidas en el desarrollo de la aplicación es el siguiente:

21 integrantes × 150 horas  

**= 3.150 horas totales de trabajo**

Estas horas se distribuyen entre diferentes roles y responsabilidades dentro del equipo.

---

## Distribución de horas por rol

La mayor parte del tiempo del proyecto se dedica a tareas relacionadas directamente con el desarrollo del producto, principalmente programación y testing. En total, entre todos los miembros del equipo se destinan **2.520 horas a estas actividades técnicas**.

La distribución de estas horas entre programación y testing se muestra en la siguiente tabla:

| Rol | Horas |
|---|---|
| Programación | 1.512 h |
| Testing | 1.008 h |

Además de las tareas de desarrollo, el proyecto requiere la participación de distintos roles de apoyo como gestión del proyecto, coordinación de equipos, DevOps, marketing y cumplimiento legal (protección de datos). En total, **650 horas del proyecto se destinan a estos roles adicionales**.

La siguiente tabla muestra la distribución de estas horas según el rol y el número de personas que lo desempeñan.

| Rol | Personas | Horas/persona | Total |
|---|---|---|---|
| Jefes de proyecto | 2 | 80 h | 160 h |
| Jefes de equipo | 5 | 60 h | 300 h |
| DevOps | 1 | 100 h | 100 h |
| Marketing junior | 2 | 35 h | 70 h |
| GDPR Officer | 1 | 20 h | 20 h |

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
| Marketing junior | 1.001 € |
| GDPR Officer | 756 € |
| **Total recursos humanos** | **68.234 €** |

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

En este proyecto se utilizan diversas herramientas de software, muchas de ellas gratuitas, mientras que otras requieren una suscripción de pago. Aunque en el contexto académico algunas de estas licencias pueden ser proporcionadas por la universidad, en este análisis se simula un escenario real de empresa.

#### Licencias software de pago (fase de desarrollo)

- **Google Workspace Business Starter**  
  6,8 € × 4 meses = **27,20 €**

- Licencias de herramientas de desarrollo (equipo completo):  
  21 × 24 € = **504 €**

**Total licencias desarrollo = 531,20 €**

---

#### Costes operativos recurrentes (post-lanzamiento)

Una vez desplegada la aplicación, existen costes que se mantienen durante toda la vida útil del sistema:

- Infraestructura cloud (Google Sites): **6,8 €/mes**
- GDPR Officer (10 h/mes): **378 €/mes**

**Coste operativo mensual base = 384,8 €/mes**  
**Coste operativo anual base ≈ 4.617,6 €**

Estos costes deben considerarse dentro del OPEX continuo del sistema.

---

## Costes de marketing

La estrategia de marketing tiene como objetivo acelerar la captación de usuarios, incrementar el alcance de la plataforma y posicionar la marca en el segmento objetivo. Para ello se contemplan tres tipos de costes: personal especializado en gestión de comunidad, campañas publicitarias en redes sociales y herramientas profesionales de apoyo.

### Coste de personal: Community Manager

Para la gestión de redes sociales, atención a la comunidad y creación de contenido se contempla la contratación de un **Community Manager externo**. Este perfil se diferencia del Marketing Junior ya incluido en el equipo de desarrollo: mientras que el Marketing Junior apoya durante la fase de construcción del producto, el Community Manager asume la presencia digital de la plataforma de cara al lanzamiento y los primeros meses de vida del producto.

Según tarifas actuales del mercado español, el coste mensual de este perfil oscila entre **250 € y 1.200 €/mes**, dependiendo de la experiencia, el volumen de contenido y las plataformas gestionadas. Para este proyecto se estima un servicio de nivel intermedio que incluye:

- Gestión activa de redes sociales (Instagram, X/Twitter y LinkedIn).
- Publicación periódica de contenido orgánico (stories, posts, reels).
- Respuesta a comentarios y mensajes de la comunidad.
- Coordinación con el equipo de marketing interno.
- Seguimiento de métricas de engagement y alcance.

**Estimación para 6 meses:**

500 €/mes × 6 meses = **3.000 €**

---

### Coste de campañas publicitarias en redes sociales

Las campañas en redes sociales permiten aumentar el alcance de forma acelerada y atraer usuarios más allá del entorno orgánico. El objetivo principal es la captación de nuevos arrendadores y arrendatarios durante la fase de lanzamiento.

Los precios habituales de campañas básicas gestionadas por un profesional parten de **300 € por campaña**, pudiendo escalar según la inversión en anuncios, la segmentación de la audiencia y la complejidad de la estrategia. Se distinguen dos niveles de inversión mensual en función del escenario:

| Escenario | Inversión mensual | Alcance estimado | Duración | Total |
|---|---|---|---|---|
| Optimista | 150 €/mes | Pequeño, muy segmentado | 6 meses | 900 € |
| Pesimista | 500 €/mes | Amplio, múltiples campañas | 6 meses | 3.000 € |

El escenario **optimista** corresponde a una estrategia enfocada en un nicho concreto con anuncios de bajo presupuesto pero alta segmentación, maximizando el retorno por euro invertido. El escenario **pesimista** contempla una inversión más agresiva en publicidad paga, adecuada si el crecimiento orgánico no alcanza los objetivos previstos.

Las plataformas de inversión contempladas son:

- **Meta Ads** (Instagram y Facebook): canal principal por su capacidad de segmentación demográfica y por perfil de intereses.
- **LinkedIn Ads**: orientado a potenciales usuarios profesionales o empresas que puedan necesitar el servicio.
- **X (Twitter) Ads**: apoyo puntual para campañas de lanzamiento y difusión de eventos.

---

### Coste de herramientas de marketing digital

Los Community Managers profesionales requieren herramientas especializadas de programación, diseño y analítica para operar con eficiencia. Estas herramientas forman parte del servicio y justifican parte de su tarifa, pero en este análisis se desglosan de forma independiente para mayor transparencia.

Las herramientas contempladas son:

- **Programación de publicaciones**: Metricool o Hootsuite (plan básico).
- **Diseño de contenido visual**: Canva Pro o Adobe Express.
- **Bancos de imágenes y vídeos**: recursos libres de derechos o suscripciones básicas.
- **Analítica de redes**: métricas nativas de plataforma + panel centralizado.

**Estimación para 6 meses:**

25 €/mes × 6 meses = **150 €**

---

### Resumen de costes de marketing

| Concepto | Escenario optimista | Escenario pesimista |
|---|---|---|
| Community Manager (6 meses) | 3.000 € | 3.000 € |
| Campañas publicitarias (6 meses) | 900 € | 3.000 € |
| Herramientas de marketing (6 meses) | 150 € | 150 € |
| **Total costes de marketing** | **4.050 €** | **6.150 €** |

Los costes de marketing suponen entre un **4,4 % y un 6,5 %** del presupuesto total del proyecto, lo cual se considera una proporción razonable para una plataforma en fase de lanzamiento.

---

## Presupuesto total del proyecto

Una vez calculados todos los costes asociados al proyecto, se puede obtener el presupuesto total necesario para llevar a cabo su desarrollo, considerando los dos escenarios de marketing.

| Tipo de coste | Importe |
|---|---|
| Coste de capital (equipamiento) | 18.900 € |
| Recursos humanos | 68.234 € |
| Licencias software (desarrollo) | 531,20 € |
| **Subtotal sin marketing** | **87.665,20 €** |
| Costes de marketing – Escenario optimista | + 4.050 € |
| **Coste total – Escenario optimista** | **91.715,20 €** |
| Costes de marketing – Escenario pesimista | + 6.150 € |
| **Coste total – Escenario pesimista** | **93.815,20 €** |

El coste de capital corresponde a la inversión en equipamiento informático amortizable. El coste operativo incluye los gastos de recursos humanos, licencias y la estrategia de marketing durante la fase de lanzamiento.

Adicionalmente, el proyecto presenta un **coste operativo recurrente mensual de 384,8 €** (base, sin marketing) necesario para mantener la aplicación en funcionamiento. Si se mantiene una presencia activa en redes sociales tras el lanzamiento, este coste se incrementaría con los costes del Community Manager y las herramientas de marketing.
