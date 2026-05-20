# Actualización de Posicionamiento SEO - KeaKit

**Fecha de actualización:** Mayo 2026
**Dominio anterior:** `keakitv3.web.app` → **Dominio actual:** `keakit.net`

---

> Este documento recoge los avances conseguidos desde la auditoría de Abril 2026, reflejando las mejoras implementadas y el estado actual del posicionamiento orgánico de KeaKit.

---

## Resumen ejecutivo de mejoras

Desde la auditoría inicial, en la que el sitio presentaba **0 páginas indexadas**, **0 backlinks** y era completamente invisible para Google, se han implementado con éxito las acciones de prioridad crítica del plan de mejora. El resultado más destacado: **KeaKit ya aparece indexado en Google**, ocupando **3 de los 5 primeros resultados visibles** al buscar "keakit" en el buscador.

---

## Fase 1: Indexación y Visibilidad — RESUELTA

* **Estado anterior:** 0 páginas indexadas. Invisible para Google.
* **Estado actual:** El dominio `keakit.net` aparece indexado y visible en los resultados de búsqueda de Google.
* **Evidencia:** Al realizar la búsqueda "keakit" en Google, KeaKit ocupa **3 de las 5 posiciones señaladas**, con presencia a través de:
  * `keakit.net` — Resultado web principal con descripción: *"Alquila kits que incluyen electrodomésticos, menaje, y mucho más de forma flexible con KeaKit. Alternativa económica al comprar barato. Gana dinero alquilando"*
  * **LinkedIn** — Perfil de empresa indexado: *"Kea Kit - Servicio de alquiler de kits (proyecto de estudiantes de la Universidad de Sevilla)"*
  * **TikTok** — Perfil `@keakit_` indexado y visible en resultados

* **Acción que lo hizo posible:** Migración del subdominio gratuito de Firebase (`keakitv1.web.app`) al dominio propio `keakit.net` en cloudflare, tal y como se propuso en la **Propuesta 1.1** del plan de acción.

---

## Fase 2: Infraestructura Técnica — PARCIALMENTE RESUELTA

### Dominio propio — COMPLETADO
* Se ha adquirido y conectado el dominio `keakit.net` a Firebase Hosting.
* Esto elimina el tratamiento de "entorno de prueba temporal" que Google aplicaba al subdominio `.web.app`, permitiendo la acumulación de autoridad de dominio real.

### Frontend y renderizado — CAMBIADO RESPECTO A PLANNING 
* Según el plan de acción (Propuesta 1.2), se está trabajando en la migración del renderizado CSR a SSG o SSR para mejorar la lectura del contenido por parte de los bots de Google, al final se optó por usar el servicio de Prerender.io para servir la página web sin tener que cambiar la arquitectura.

### Archivos de rastreo (robots.txt / sitemap.xml) — PARCIAL
* Se creó un sitemap.xml y un robots.txt pero algunos servicios de google no detectan ambos a la vez, probablemente por no servirse la página directamente de forma estática.

---

## Fase 3: Métricas Técnicas — Google Lighthouse (Mayo 2026)

Los datos más recientes de Google Lighthouse reflejan el estado actual de rendimiento del sitio:

| Métrica | Puntuación | Estado |
|---|---|---|
| **Rendimiento** | 65 | 🟠 Mejorable |
| **Accesibilidad** | 92 | 🟢 Bueno |
| **Recomendaciones** | 96 | 🟢 Muy bueno |
| **SEO** | 92 | 🟢 Bueno |

* **Puntuación SEO de 92:** Un avance muy significativo respecto al 82-83 registrado en la auditoría anterior. Refleja directamente las mejoras de infraestructura implementadas (dominio propio, correcciones parciales de metadatos).
* **Rendimiento en 65:** Es el principal punto de atención técnica. La bajada respecto a los 98-99 anteriores puede deberse a cambios en el entorno de medición o a la carga adicional que introduce la nueva configuración de dominio. Se recomienda investigar y optimizar el LCP (Largest Contentful Paint) y otros Core Web Vitals.
* **Accesibilidad (92) y Recomendaciones (96):** Se mantienen en niveles excelentes, lo que indica que las correcciones de etiquetas `alt` y contraste de color están en buen camino.

---

## Fase 4: Autoridad del Dominio (Off-Page) — EN CONSTRUCCIÓN

* **Estado anterior:** 0 backlinks, DA 0.
* **Estado actual:** El dominio `keakit.net` está comenzando a acumular autoridad propia. La presencia indexada en LinkedIn y TikTok contribuye a la visibilidad de marca, aunque aún no se han ejecutado campañas formales de link building.
* **Próximos pasos recomendados** (Propuesta 3.1): Iniciar alianzas con la Universidad de Sevilla y blogs de nómadas digitales para conseguir los primeros backlinks de calidad.

---

## Resumen de estado por propuesta

| Propuesta | Descripción | Estado |
|---|---|---|
| **1.1** | Migración a dominio propio (`keakit.net`) | Completado |
| **1.2** | Cambio de CSR a SSG/SSR | Cambio en el planning |
| **1.3** | Corrección robots.txt y sitemap.xml | Parcial |
| **2.1** | Landing pages por Kits y casos de uso | Pendiente |
| **2.2** | Rediseño de H1 y H2 | Completado |
| **2.3** | Blog educacional o sección FAQ | Pendiente |
| **3.1** | Alianzas universitarias y link building | Pendiente |

---

## Conclusión

El hito más importante está conseguido: **KeaKit es visible en Google**. La migración al dominio `keakit.net` ha sido la palanca crítica que ha desbloqueado la indexación y ha permitido que el proyecto comience a existir en el ecosistema digital. Con una puntuación SEO de 92 en Lighthouse y presencia en tres canales indexados (web, LinkedIn, TikTok), la base está sentada.

El siguiente ciclo de trabajo debe enfocarse en resolver el rendimiento (Lighthouse 65), completar la corrección técnica del `robots.txt` y `sitemap.xml`, y comenzar a construir autoridad de dominio mediante las alianzas y el contenido propuestos en las fases 2 y 3.
