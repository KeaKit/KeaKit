# Estimación de Rentabilidad

## Modelo de ingresos de la aplicación

El modelo de negocio de la aplicación se basa en la obtención de una **comisión del 20 % sobre cada kit alquilado dentro de la plataforma**. Los arrendadores publican los objetos disponibles para alquiler y los arrendatarios pagan por utilizarlos, mientras que la plataforma obtiene ingresos por intermediación.

Según el análisis realizado del mercado, el precio medio de un kit de alquiler se sitúa aproximadamente en **240 €**, tomando como referencia productos similares como el **Kit Quick Muv**.

A partir de este valor se puede calcular el ingreso por alquiler:

240 € × 0,20  

**= 48 € de comisión por cada kit alquilado**

Este valor será la base para estimar los ingresos de la plataforma.

---

## Escenario inicial: usuarios piloto

En el momento del lanzamiento, la aplicación cuenta con un grupo inicial de **30 usuarios piloto**, lo que permite validar el modelo de negocio en condiciones reales.

Se asume un comportamiento inicial conservador:

- Cada usuario realiza entre **1 y 2 alquileres al mes**
- Media estimada inicial: **40 alquileres en el primer mes**

A partir de este punto, se plantea un escenario de **crecimiento optimista**, impulsado por:
- El efecto red entre usuarios
- Recomendaciones y confianza en la plataforma
- Incremento progresivo de la visibilidad

---

## Estimación de crecimiento de usuarios

Partiendo de un escenario inicial de **30 usuarios piloto**, se establece una hipótesis de crecimiento progresivo de la base de usuarios durante los primeros meses tras el lanzamiento.

Para la estimación financiera se asume un **crecimiento mensual del 20 %** en el número de usuarios activos, impulsado por:

- El efecto red entre usuarios
- La confianza generada por los primeros alquileres
- La recomendación boca a boca
- La mejora de la visibilidad de la aplicación

La evolución estimada sería la siguiente:

| Mes | Usuarios estimados |
|---|---:|
| Mes 1 | 30 |
| Mes 2 | 36 |
| Mes 3 | 43 |
| Mes 4 | 52 |
| Mes 5 | 62 |
| Mes 6 | 74 |

Esta hipótesis de crecimiento sirve como referencia para contrastar posteriormente la evolución real del proyecto durante la fase de validación.

A partir de este punto, se plantea un escenario de **crecimiento optimista**, impulsado por:

- El efecto red entre usuarios
- Recomendaciones y confianza en la plataforma
- Incremento progresivo de la visibilidad

---

## Costes operativos recurrentes (OPEX)

Tras el lanzamiento, la aplicación genera costes mensuales fijos necesarios para su funcionamiento:

### Infraestructura cloud
- Google Sites: **6,8 €/mes**

### Cumplimiento legal (GDPR Officer)
- 10 horas/mes × 37,80 €/h = **378 €/mes**

### Coste total mensual

6,8 € + 378 €  

**= 384,8 €/mes**

Este coste debe restarse de los ingresos para obtener la rentabilidad real del sistema.

---

## Proyección de ingresos (primeros 6 meses)

| Mes tras lanzamiento | Kits alquilados | Ingresos brutos | OPEX mensual | Ingresos netos |
|---|---|---|---|---|
| Mes 1 | 40 | 1.920 € | 384,8 € | 1.535,20 € |
| Mes 2 | 70 | 3.360 € | 384,8 € | 2.975,20 € |
| Mes 3 | 120 | 5.760 € | 384,8 € | 5.375,20 € |
| Mes 4 | 180 | 8.640 € | 384,8 € | 8.255,20 € |
| Mes 5 | 250 | 12.000 € | 384,8 € | 11.615,20 € |
| Mes 6 | 350 | 16.800 € | 384,8 € | 16.415,20 € |

---

## Ingresos acumulados

El total de ingresos netos acumulados durante los seis primeros meses es:

**46.171,20 €**

Esta cifra refleja una estimación más realista al incluir los costes operativos recurrentes del sistema.

---

## Punto de rentabilidad (Break-even)

El coste total del proyecto asciende a:

**87.665,20 €**

Dado que el ingreso por cada alquiler es de **48 €**, el número de alquileres necesarios para recuperar la inversión es:

87.665 ÷ 48  

**≈ 1.826 kits alquilados**

---

## Estimación de recuperación de la inversión

Si se mantiene el crecimiento estimado en el número de alquileres, se puede proyectar el momento en el que se recuperará la inversión inicial.

| Mes | Ingresos acumulados |
|---|---|
| 6 meses | 46.171 € |
| 8 meses | ~74.000 € |
| 9 meses | ~89.000 € |

Según esta estimación, el proyecto alcanzaría el **punto de equilibrio entre el mes 9 y el mes 10 tras su lanzamiento**.

---

## Evolución de la estimación de obtención de usuarios con respecto a la realidad

Con el objetivo de validar la hipótesis inicial de crecimiento planteada en la estimación financiera, se ha realizado una comparación entre la evolución prevista de usuarios piloto y el crecimiento real observado durante el desarrollo del proyecto.

La estimación inicial asumía un **crecimiento mensual del 20 %** en la base de usuarios activos, partiendo de **30 usuarios piloto** como escenario de referencia.

Tomando como **marco temporal de análisis la evolución desde el Sprint 2 hasta la situación actual del proyecto**, se observa que el número de usuarios piloto ha pasado de **17 a 19 usuarios**, lo que supone un incremento real de:

**((19 - 17) / 17) × 100 = 11,76 %**

Por tanto, el crecimiento real registrado hasta el momento es del **11,76 %**, valor que se sitúa por debajo de la hipótesis optimista inicial del 20 % mensual.

No obstante, esta evolución confirma una **tendencia positiva en la captación de usuarios piloto**, validando parcialmente la viabilidad del modelo de crecimiento planteado. La diferencia entre la previsión inicial y la evolución real permite ajustar futuras proyecciones económicas con datos más cercanos al comportamiento real del mercado durante la fase de validación.

Este contraste entre estimación y realidad aporta mayor solidez al análisis de rentabilidad, al basar las siguientes iteraciones del modelo financiero en métricas obtenidas durante la ejecución real del proyecto.

---

## Conclusión económica

El coste total del proyecto se ha estimado en **87.665,20 €**, incluyendo tanto el desarrollo como los costes asociados al cumplimiento normativo.

A diferencia de una estimación simplificada, este análisis incorpora **costes operativos recurrentes**, como la infraestructura cloud y el rol de GDPR Officer, lo que permite obtener una visión más realista de la rentabilidad.

Partiendo de un escenario inicial con **30 usuarios piloto** y asumiendo un crecimiento progresivo de la actividad, la aplicación presenta:

- Un modelo de ingresos escalable
- Un punto de equilibrio alcanzable en menos de un año
- Capacidad de generar beneficios sostenidos tras el break-even

A partir del momento en que se recupera la inversión inicial, los ingresos generados por la plataforma pasan a constituir **beneficio neto**, permitiendo reinvertir en mejoras, marketing y expansión del producto.
