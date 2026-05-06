# Auditoría de Posicionamiento SEO y ASO - KeaKit

**Fecha de la auditoría:** Abril 2026
**Dominio analizado:** `keakitv1.web.app`

---

## Fase 1: Estado de Indexación y Visibilidad Actual
* **Resultado del análisis:** **Nulo (0 páginas indexadas).**
* **Diagnóstico:** Al realizar la consulta `site:keakitv1.web.app` en los motores de búsqueda, el resultado es vacío. Asimismo, el análisis del dominio en Ubersuggest confirma que actualmente la web no posiciona por ninguna palabra clave orgánica y tiene 0 tráfico detectado. Actualmente, la plataforma es completamente invisible para Google.
* **Causa principal del problema:** 
  1. **El alojamiento:** Se está utilizando el subdominio gratuito por defecto de Firebase (`.web.app`). Google suele tratar estos subdominios temporales con menor prioridad para la indexación.
  2. **Falta de aviso:** No se ha conectado la web a Google Search Console para enviar un Sitemap y forzar a los rastreadores a leer la página.

---

## Fase 2: Estudio de Palabras Clave (Keyword Research)
A partir de los reportes extraídos en Ubersuggest, se han detectado patrones de búsqueda muy claros que definen el interés del mercado y la dificultad de entrada:

* **Términos de oportunidad (Alta prioridad):**
  * *`alquiler de electrodomesticos`*: Volumen de 50 búsquedas mensuales con una Dificultad SEO (SD) de 20 (Fácil/Media).
  * *`renting electrodomesticos`*: Volumen de 30 búsquedas mensuales con una Dificultad SEO (SD) de 22. 
  * *Diagnóstico:* Estos son los nichos más accesibles actualmente. Existe demanda consciente del modelo de alquiler y la competencia orgánica no es extrema.

* **Términos de alta fricción (Competencia fuerte):**
  * *`comprar menaje barato`* y *`electrodomesticos pequeños baratos`*: Ambas tienen poco volumen exacto en la herramienta (10) pero una Dificultad SEO (SD) de 44. 
  * *Diagnóstico:* Intentar competir frontalmente por la palabra "comprar" será muy costoso a corto plazo debido a la presencia de grandes e-commerces.

* **Términos de "Long Tail" y Oferta (Baja dificultad):**
  * Palabras como *`app para alquilar cosas`* (Vol: 10, SD: 15) o las relacionadas con rentabilizar objetos (*`alquilar mis cosas`*, *`ganar dinero prestando cosas`*) muestran un volumen exacto bajo, pero una Dificultad SEO extremadamente baja (SD entre 4 y 12). Son vías de entrada perfectas para captar a los arrendadores sin gran esfuerzo técnico.

* **Causa principal de los problemas de dificultad:** El modelo de KeaKit es muy innovador. Como los usuarios aún no conocen esta solución de "Kits", buscan resolver su problema tradicionalmente ("comprar barato"). Al intentar posicionar ahí, se choca frontalmente contra la autoridad histórica de multinacionales como IKEA o Amazon.

---

## Fase 3: Análisis de la Competencia (Benchmarking)
Basado en las métricas de Autoridad de Dominio (DA) extraídas:

* **Grover.com:**
  * **Domain Authority (DA):** 53
  * **Backlinks:** 3.600 dominios enlazando.
  * **Keywords:** Posiciona por más de 2.100 palabras clave.
  * *Diagnóstico:* Es el gigante del sector tecnológico. Competir contra ellos por términos genéricos de tecnología será casi imposible a corto plazo.

* **Rentik.com:**
  * **Domain Authority (DA):** 36
  * **Backlinks:** 367 dominios enlazando.
  * *Diagnóstico:* Un competidor de nivel medio-alto, consolidado en España.

* **Causa principal de la brecha de autoridad:** Estos competidores llevan años en el mercado invirtiendo enormes presupuestos en Relaciones Públicas, notas de prensa y campañas de marketing, lo que les ha generado miles de menciones y enlaces (backlinks) desde periódicos y webs de tecnología. Google confía ciegamente en ellos para búsquedas genéricas.

---

## Fase 4: Auditoría Técnica y On-Page
Los reportes de Google Lighthouse revelan un rendimiento excelente, pero con bloqueos técnicos graves que impiden el SEO.

* **Rendimiento General:** Excelente. Puntuaciones de Performance (98-99), Accesibilidad (92-96) y Best Practices (100)[cite: 1, 2]. El tiempo de carga principal (LCP) es de entre 0.8s y 1.2s[cite: 1, 2].
* **Bloqueos de Indexación (Errores SEO - Puntuación 82/83)[cite: 1, 2]:**
  * **Renderizado CSR:** Confirmado. La web se renderiza 100% en el lado del cliente (Client-Side Rendering), dejando a los bots de Google con un HTML vacío.
  * **Archivo robots.txt inválido:** Lighthouse detecta 35 errores de sintaxis en el `robots.txt`[cite: 1]. Esto ocurre porque el servidor de Firebase está devolviendo el código HTML de la aplicación en lugar de un archivo de texto plano, confundiendo por completo a los rastreadores[cite: 1].
  * **Falta de Meta Description:** La web carece de la etiqueta meta description, fundamental para los resultados de búsqueda[cite: 1].
* **Accesibilidad e Imágenes:** Faltan atributos legibles para lectores y buscadores. Faltan etiquetas `alt` descriptivas y existen problemas de contraste de color en algunos contenedores `div`[cite: 2].

* **Causa principal de los bloqueos técnicos:** La aplicación web está programada con Expo/React funcionando como una "Single Page Application" (SPA). Por defecto, este formato envía un contenedor web vacío al navegador y obliga a JavaScript a construir la interfaz, algo que los motores de búsqueda no procesan bien. Además, la configuración de enrutamiento ("rewrites") de Firebase está interceptando peticiones clave como el `robots.txt`, enviando HTML cuando debería enviar texto plano.

---

## Fase 5: Autoridad del Dominio (Off-Page)
* **Resultado del análisis:** **0 Backlinks.**
* **Diagnóstico:** Actualmente, ninguna página externa, blog o periódico enlaza a `keakitv1.web.app`. La autoridad de dominio es de 0. Sin enlaces externos que validen la confianza de la web, será muy difícil superar a rivales que parten con un DA de 36 o 53 en búsquedas de alta competencia.
* **Causa principal del problema:** Además de estar alojados en un subdominio temporal (`.web.app`) que no acumula autoridad propia, KeaKit es un proyecto recién lanzado. Aún no se ha ejecutado ninguna campaña proactiva de captación de enlaces (Link Building), relaciones públicas, ni alianzas estratégicas con blogs de nómadas digitales o universidades.

# Plan de acción y propuesta de mejora SEO/ASO - KeaKit

En este apartado se detallan las acciones estratégicas necesarias par arevertir la falta de indexación del sitio web y compenzar a captar tráfico de forma orgánica, pero evitando competir de forma directa con gigantes del sector, apostando por nuestros puntos fuertes.

Las propuestas se encuentran separadas por ámbito y prioridad, que puede ser crítica - alta - media - baja.

## Propuesta 1 Infraestructura  y desbloqueo técnico (Prioridad Crítica)
Como puede verse en el análisis, la web es invisible para los motores de busqueda, ya que el renderizado de la página se bloquea para ellos, pasa de igual forma con la configuración.

### Propuesta 1.1: Migración a un dominio propio (Dejar de lado firebase y su dominio .web.app)
* Motivación de la propuesta: Los subdominios de caracter gratuito como los de Firebase, son tratados por Google como entornos de prueba temporal, limitando severamente su capacidad para posicionar y generar confianza en el usuario
* Alternativas viables: 
  * Adquirir un dominio .com o .es y conectarlo directamente a Fireabse Hosting (ya que permite dominios personalizados gratuitos)
  * Migrar el frontend a plataformas como Vercel o Netlify, con integraciones nativas para SEO.

### Propuesta 1.2: Cambio de renderizado CSR (Client-Sid Rendering) a SSG (Static Site Generation)
* Motivación de la propuesta: El CSR envía una página en blanco que requiere JavaScript para mostrar el contenido. Los bots de Google encargados del análisis a menudo no ejecutan este código, por lo que ven la web vacía. Cambiar a Static Site Generation pre-construye la spáginas en el servidor, entregando HTML puro y legible para los bots.
* Alternativas de solución:
  * Implementación de SSG con Expo
  * Si la implementación anterior resultase muy complicada a corto plazo, puede implementarse de forma alternativa Server-Side Rendering (SSR).
  * Usar un servicio de "prerendering" (por ejemplo, prerender.io), que detecta si el visitante es un bot de Google y sirve una versión estática de la web de forma automática.

### Propuesta 1.3: Corrección de archivos de rastreo y metadatos
* Motivación de la propuesta: Actualmente el archivo robots.txt devuelve errores y no existe sitemap.xml. Sin estos documentos, Google no sabe qué páginas existen ni cuáles debe leer. Además, faltan etiquetas esenciales como descipciones e imágenes con texto alternativo (alt), vitales para accesibilidad y el SEO de las imágenes.
* Alternativas viables: 
    * Crear un sitemap.xml dinámico, alojado en la carpeta raíz pública.
    * Corregir relgas de enrutamiento para que no se intercepte archivos de texto.
    * Establecer reglas estrictas para que ninguna imagen se suba sin su atributo alt optimizado y, si es posible, en formato webp.

## Propuesta 2 Estrategia de contenidos y arquitectura (Prioridad Alta)
Competir en el ámbito de "comprar electrodomésticos" es un error frente a gigantes como IKEA. Debemos atacar la intención de búsqueda de nuestro público objetivo.

### Propuesta 2.1: Creación de Landing Pages por "Kits" y casos de uso
* Motivación de la propuesta: Nuestra fortaleza no es vender un producto aislado (vease vender un microondas suelto), sino solucionar el problema integral de las mudanzas temporales. Crear páginas específicas nos permite posicoinar en nichos de baja competencia y alta conversión.
* Alternativas viables: 
    * En lugar de segmentar solo por público, se puede segmentar por instancia a través de los kits predeterminados, posicionando algunos como "anuncios" en un escaparate.

### Propuesta 2.2: Rediseño de la propuesta de valor de encabezados (H1 y H2)
* Motivación de la propuesta: Lo primero que lee Google y el usuario son los títulos. Cambiar mensajes genéricos por textos claros ayuda a resolver dudas de confianza al arrendador y posiciona palabras clave secundarias de baja dificultad.
* Alternativas viables: 
    * Realizar tests A/B con dos enfoques de H1: uno centrado en el ahorro económico y otro centrado en la comunidad/sostenibilidad.

### Propuesta 2.3: lanzamiento de un Blog Educacional (Long Tail)
* Motivación de la propuesta: Busquedas similares a "app para alquilar cosas" o "ganar dinero prestando cosas" tienen muy baja dificultad. Escribir artículos transaccionales (por ejemplo "Cómo equipar tu piso de alquiler temporal sin comprar muebles") capta usuarios en fase de investigación y los dirige a la app.
* Alternativas viables:
    * Creación de un blog como el descrito.
    * Si mantener el blog requiere demasiados recursos, se puede optar por una sección de "Preguntas Frecuentes (FAQ)" estructurada con datos enriquecidos (Schema Markup) para aparecer en los fragmentos destacados de Google.

## Propuesta 3 Generación de autoridad off-page (Prioridad Media)
Con un Domain Authority de 0, necesitamos que otras webs confien en KeaKit para que Google también lo haga.

### propuesta 3.1 Alianzas Universitarias y de Nómadas Digitales
* Motivación de la propuesta: Conseguir enlaces (backlinks) desde dominios de universidades (.edu) o blogs reconocidos de expatriados transferirá una autoridad masiva a KeaKit, acortando la brecha con competidores como Rentik o Grover.
* Alternativas viables:
    * Lanzar campañas de Relaciones Públicas locales, contactando con medios ya sean profesionales o particulares (vease, el boletín de la US).
    * Ofrecer descuentos exclusivos a asociaciones de estudiantes a cambio de un enlace en sus portales.

