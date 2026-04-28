# Estimación de Rentabilidad

## Modelo de negocio

La plataforma opera como un **marketplace de alquiler de equipamiento entre particulares**, actuando como intermediario de confianza entre quienes disponen de material infrautilizado (arrendadores) y quienes necesitan acceder a él de forma puntual (arrendatarios).

El modelo de ingresos es sencillo, escalable y no requiere inversión en inventario propio: la plataforma obtiene un **porcentaje de comisión sobre cada transacción completada**, lo que alinea los incentivos del negocio con los de sus usuarios.

### Propuesta de valor

- **Para el arrendador**: monetización de equipamiento parado sin esfuerzo de gestión.
- **Para el arrendatario**: acceso a material de calidad a una fracción del coste de compra.
- **Para la plataforma**: ingresos recurrentes sin necesidad de stock ni logística propia.

---

## Escenario inicial: usuarios piloto

En el momento del lanzamiento, la aplicación cuenta con un grupo inicial de **30 usuarios piloto**, lo que permite validar el modelo de negocio en condiciones reales.

Se asume un comportamiento inicial conservador:

- Cada usuario realiza entre **1 y 2 alquileres al mes**.
- Media estimada inicial: **40 alquileres en el primer mes**.

A partir de este punto, se plantea un **crecimiento progresivo**, impulsado por el efecto red, la confianza generada por los primeros alquileres, y el impacto de la estrategia de marketing.

---

## Estimación de crecimiento de usuarios

Partiendo de los **30 usuarios piloto**, se establece una hipótesis de crecimiento mensual del **20 %** en el número de usuarios activos. Este porcentaje está basado en benchmarks de plataformas de economía colaborativa en fase early-stage y se contrasta más adelante con datos reales del proyecto.

| Mes | Usuarios estimados |
|---|---:|
| Mes 1 | 30 |
| Mes 2 | 36 |
| Mes 3 | 43 |
| Mes 4 | 52 |
| Mes 5 | 62 |
| Mes 6 | 74 |

---
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

Además de las tareas de desarrollo, el proyecto requiere la participación de distintos roles de apoyo como gestión del proyecto, coordinación de equipos, DevOps, marketing y cumplimiento legal (protección de datos). En total, **650 horas del proyecto se destinan a estos roles adicionales**.

La siguiente tabla muestra la distribución de estas horas según el rol y el número de personas que lo desempeñan.

| Rol | Personas | Horas/persona | Total |
|---|---|---|---|
| Jefes de proyecto | 2 | 80 h | 160 h |
| Jefes de equipo | 5 | 60 h | 300 h |
| DevOps | 1 | 100 h | 100 h |
| Marketing | 2 | 35 h | 70 h |
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
| Marketing | 1.001 € |
| GDPR Officer | 756 € |
| **Total recursos humanos** | **68.234 €** |

Como puede observarse, el coste de recursos humanos representa la mayor parte del presupuesto del proyecto, lo cual es habitual en proyectos de desarrollo de software.

---

## Recursos no humanos

Además de los recursos humanos, el proyecto también requiere una serie de recursos materiales y servicios tecnológicos que generan costes adicionales. Estos costes se clasifican en **costes de capital** y **costes operativos**.

### Coste de capital

El coste de capital corresponde a la inversión en equipamiento informático necesario para el desarrollo del proyecto. En este caso se considera la adquisición de **21 portátiles**, uno para cada integrante del equipo.

Tomando como referencia un precio medio de **900 € por portátil**, el coste total del equipamiento sería:

21 × 60 €  

**= 1260 €**

Este gasto se considera una inversión amortizable, ya que los equipos pueden seguir utilizándose en proyectos futuros.

---
## Costes operativos recurrentes (OPEX)

El coste operativo incluye los gastos asociados al uso de herramientas y servicios necesarios para el desarrollo y despliegue de la aplicación.

En este proyecto se utilizan diversas herramientas de software, muchas de ellas gratuitas, mientras que otras requieren una suscripción de pago. Aunque en el contexto académico algunas de estas licencias pueden ser proporcionadas por la universidad, en este análisis se simula un escenario real de empresa.
Además, la aplicación genera costes mensuales necesarios para su funcionamiento. 

Se distingue entre el **OPEX base** (infraestructura y cumplimiento normativo) y el **OPEX de marketing** (presencia activa en redes sociales).

### OPEX base mensual

- **DigitalOcean**: 6,8 € × 4 meses = **27,20 €**

- Licencias de herramientas de desarrollo (equipo completo):  
  21 × 24 € = **504 €**
- GDPR Officer (10 h/mes × 37,80 €/h): **384,80 €/mes**

**Total licencias desarrollo = 916.00 €**

---

### OPEX de marketing mensual (post-lanzamiento)

Una vez finalizada la fase inicial de 6 meses, si se mantiene la actividad de marketing, los costes recurrentes serán:

| Concepto | Escenario optimista | Escenario pesimista |
|---|---|---|
| Community Manager | 500,00 €/mes | 500,00 €/mes |
|Infraestructura cloud (DigitalOcean)|6,8 €/mes| 6,8 €/mes|
|GDPR Officer (10 h/mes)|378 €/mes|384.80 €/mes|
| Campañas publicitarias | 150,00 €/mes | 500,00 €/mes |
| Herramientas de marketing | 25,00 €/mes | 25,00 €/mes |
| **Total OPEX** | **1059,80 €/mes** | **1.416,60 €/mes** |

---

## Proyección de ingresos (primeros 6 meses)

Para la proyección de ingresos se utilizan los dos escenarios diferenciados por la intensidad de la inversión en marketing. El escenario optimista asume una campaña ligera que apoya el crecimiento orgánico; el pesimista contempla una inversión más agresiva.

### Escenario optimista (OPEX mensual: 1.059,80 €)

| Mes | Kits alquilados | Ingresos brutos | OPEX mensual | Ingresos netos |
|---|---|---|---|---|
| Mes 1 | 40 | 1.920 € | 1.059,80 € | 860,20 € |
| Mes 2 | 70 | 3.360 € | 1.059,80 € | 2.300,20 € |
| Mes 3 | 120 | 5.760 € | 1.059,80 € | 4.700,20 € |
| Mes 4 | 180 | 8.640 € | 1.059,80 € | 7.580,20 € |
| Mes 5 | 250 | 12.000 € | 1.059,80 € | 10.940,20 € |
| Mes 6 | 350 | 16.800 € | 1.059,80 € | 15.740,20 € |
| **Total** | **1.010** | **48.480 €** | **6.358,80 €** | **42.121,20 €** |

### Escenario pesimista (OPEX mensual: 1.409,80 €)

| Mes | Kits alquilados | Ingresos brutos | OPEX mensual | Ingresos netos |
|---|---|---|---|---|
| Mes 1 | 30 | 1.440 € | 1.409,80 € | 30,20 € |
| Mes 2 | 50 | 2.400 € | 1.409,80 € | 990,20 € |
| Mes 3 | 80 | 3.840 € | 1.409,80 € | 2.430,20 € |
| Mes 4 | 120 | 5.760 € | 1.409,80 € | 4.350,20 € |
| Mes 5 | 170 | 8.160 € | 1.409,80 € | 6.750,20 € |
| Mes 6 | 230 | 11.040 € | 1.409,80 € | 9.630,20 € |
| **Total** | **680** | **32.640 €** | **8.458,80 €** | **24.181,20 €** |

---

## Ingresos acumulados (primeros 6 meses)

| Escenario | Ingresos netos acumulados |
|---|---|
| Optimista | 42.121,20 € |
| Pesimista | 24.181,20 € |

La diferencia entre escenarios ilustra el impacto directo de la cadencia de alquileres sobre la rentabilidad, más allá del nivel de gasto en marketing.

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
| **Subtotal sin marketing** | **70.025,2 €** |
| Costes de marketing – Escenario optimista | 1.444,6 € |
| **Coste total – Escenario optimista** | **71.469,80 €** |
| Costes de marketing – Escenario pesimista | + 1.801,4 € |
| **Coste total – Escenario pesimista** | **71.826,60 €** |

El coste de capital corresponde a la inversión en equipamiento informático amortizable. El coste operativo incluye los gastos de recursos humanos, licencias y la estrategia de marketing durante la fase de lanzamiento.

Adicionalmente, el proyecto presenta un **coste operativo recurrente mensual de 384,8 €** (base, sin marketing) necesario para mantener la aplicación en funcionamiento. Si se mantiene una presencia activa en redes sociales tras el lanzamiento, este coste se incrementaría con los costes del Community Manager y las herramientas de marketing.


## Punto de rentabilidad (Break-even)

El coste total del proyecto varía según el escenario de marketing aplicado:

| Escenario | Coste total del proyecto |
|---|---|
| Sin marketing | 70.025,20  € |
| Optimista | 71.469,80 € |
| Pesimista | 71.826,60 € |

Dado que el ingreso por comisión es de **48 € por alquiler** (plan Freemium), el número de alquileres necesarios para recuperar la inversión es:

| Escenario | Coste total | Alquileres para break-even |
|---|---|---|
| Sin marketing | 70.025,20 € | ≈ 1.459 kits |
| Optimista |  71.469,80 € | ≈ 1.489 kits |
| Pesimista | 71.826,60 € | ≈ 1.497 kits |

### Usuarios mínimos para cubrir costes (OPEX mensual)

Para que la plataforma sea autosuficiente mes a mes, los ingresos deben cubrir al menos el OPEX mensual. Dado un ratio de **~1,35 alquileres/usuario/mes** (media estimada en el primer semestre):

| Escenario | OPEX mensual | Alquileres/mes necesarios | Usuarios mínimos activos |
|---|---|---|---|
| Optimista | 1.059,80 € | ≈ 23 | ≈ 17 usuarios |
| Pesimista | 1.409,80 € | ≈ 30 | ≈ 22 usuarios |

Esto confirma que la plataforma puede ser operativamente rentable con un **número muy reducido de usuarios activos**, lo que reduce significativamente el riesgo de negocio.

---

## Estimación de recuperación de la inversión

Calculamos el punto de equilibrio comparando el coste total de puesta en marcha (Desarrollo + Equipamiento + OPEX acumulado) frente a los ingresos netos previstos.

### Escenario Optimista
*Inversión total a recuperar: **91.715,20 €***

| Hito | Mes estimado |
|---|---|
| Ingresos netos acumulados > 50.000 € | Mes 7 |
| **Recuperación total de la inversión** | **Mes 9** |

### Escenario Pesimista
*Inversión total a recuperar: **93.815,20 €***

| Hito | Mes estimado |
|---|---|
| Ingresos netos acumulados > 50.000 € | Mes 10 |
| **Recuperación total de la inversión** | **Mes 13** |

---

## 2. Validación de Hipótesis: Usuarios Reales vs. Estimados

Se ha comparado el crecimiento teórico del modelo de negocio con la tracción real medida durante las fases de desarrollo (del Sprint 2 a la actualidad).

* **Hipótesis de crecimiento (Optimista):** 20,00 % mensual.
* **Crecimiento real observado:** De 17 a 19 usuarios piloto.
* **Cálculo real:** `((19 - 17) / 17) * 100` = **11,76 %**.

**Conclusión:** La realidad del mercado (11,76 %) se aproxima más a nuestro escenario conservador/pesimista. Esto valida que las proyecciones financieras no están infladas y que el escenario pesimista es una base sólida y realista para la toma de decisiones.

---

## 3. Estructura de Costes de Inversión (CAPEX y RRHH)

La inversión inicial se desglosa en los recursos necesarios para construir y lanzar la plataforma.

### Recursos Humanos (3.150 horas totales)
| Rol | Coste Total |
|---|---|
| Programación (1.512 h) | 27.707 € |
| Testing (1.008 h) | 19.656 € |
| Jefes de Equipo y Proyecto | 16.744 € |
| DevOps, Marketing y GDPR | 4.127 € |
| **Total Recursos Humanos** | **68.234 €** |

### Recursos Materiales y Operativos Iniciales
* **Equipamiento (21 portátiles):** 1.260 €
* **Software y Licencias (Desarrollo):** 916 €
* **OPEX de lanzamiento:** Incluido en el cálculo de los escenarios.

---

## 4. Modelo de Operación Post-Lanzamiento (OPEX)

Una vez la plataforma está en producción, el coste de mantenimiento mensual es extremadamente bajo, lo que reduce el riesgo de quiebra técnica.

| Concepto | Escenario Optimista | Escenario Pesimista |
|---|---|---|
| Marketing y Campañas | 175,00 € | 525,00 € |
| Gestión (CM, GDPR, Herramientas) | 878,00 € | 884,80 € |
| Infraestructura (Cloud) | 6,80 € | 6,80 € |
| **Total OPEX Mensual** | **1.059,80 €** | **1.416,60 €** |

**Punto de Supervivencia:** La plataforma solo necesita **entre 17 y 22 usuarios activos** al mes para cubrir sus propios costes operativos.

---

## 5. Resumen Ejecutivo para Inversores

### ¿Por qué invertir?
1.  **Modelo de Negocio Escalable:** Marketplace basado en comisiones (48 € de media por transacción) sin gestión de stock ni logística.
2.  **Rentabilidad Rápida:** Recuperación de la inversión en aproximadamente un año.
3.  **Eficiencia de Capital:** Con una inversión cercana a los 90.000 €, se genera una plataforma capaz de producir beneficios netos superiores a los 100.000 € en su primer año de operación comercial completa.
4.  **Bajo Riesgo Operativo:** Los costes fijos mensuales son mínimos, permitiendo pivotar o aguantar periodos de baja demanda sin grandes pérdidas.

### Proyección a 12 meses
| Indicador | Escenario Optimista | Escenario Pesimista |
|---|---|---|
| Alquileres totales | ~3.800 | ~2.500 |
| Ingresos Brutos (Comisiones) | ~182.400 € | ~120.000 € |
| Beneficio Neto Estimado (Año 1) | **~169.000 €** | **~103.000 €** |

---

## 6. Conclusión Económica

El proyecto es **financieramente viable y altamente atractivo**. Presenta una barrera de entrada técnica ya superada (coste de desarrollo de 68.234 € ejecutado) y una estructura de costes que favorece el crecimiento orgánico. La validación con los 19 usuarios actuales confirma que existe interés real, y el break-even en menos de 13 meses garantiza la seguridad del capital invertido.
