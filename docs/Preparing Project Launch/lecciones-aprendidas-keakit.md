# Lecciones Aprendidas — KeaKit

**Proyecto:** KeaKit — Plataforma de alquiler de kits
**Equipo:** 20 personas (originalmente 21)
**Sprint de referencia:** S3 y PPL
**Stack:** Java + Spring Boot · React Native + Expo (web via Metro) · PostgreSQL en Supabase · Digital Ocean + Nginx + Certbot + DuckDNS · Firebase Hosting

---

## Introducción

Este documento recoge las principales lecciones aprendidas a lo largo del proyecto, con el objetivo de demostrar la madurez reflexiva del equipo y justificar la evolución del proyecto. No se trata únicamente de un registro de errores, sino de un análisis honesto de qué funcionó, qué no, y por qué — tanto en el plano técnico como en el organizativo.

---

## 1. Gestión de un equipo grande

Trabajar con 20 personas en un proyecto de software es cualitativamente diferente a hacerlo con 4 o 5. No es solo "más gente haciendo lo mismo" — es un problema de coordinación, comunicación y alineación constante que consume una cantidad de energía desproporcionada si no se gestiona activamente.

Durante el proyecto se ha intentado llevar acabo medidas correctivas, que nos han permitido reducir y paliar algunos efectos negativos de esto.

### 1.1 La ilusión del trabajo distribuido

Con un equipo tan grande, la tentación es dividir el trabajo en tantas partes como personas haya y asumir que todo avanzará en paralelo. En la práctica, esto genera varios problemas:

- **Dependencias ocultas:** Dos personas pueden estar trabajando en módulos que parecen independientes pero que comparten un endpoint, una tabla de base de datos o una decisión de diseño. Si no hay comunicación previa, el resultado es una integración costosa al final del sprint. Esto puede verse en retrospectiva con otros sprints, donde existían de 2 a 5 DTOs del mismo objeto de la base de datos.
- **Calidad desigual:** Con 20 colaboradores, el nivel de experiencia, disponibilidad y compromiso varía inevitablemente. Esto hace que algunas partes del código o la documentación tengan una calidad muy superior a otras, lo que complica las revisiones y genera deuda técnica acumulada. Esto se ve acentuado todavía más por culpa del uso desmedido de la IA generativa para crear Boiler Plate que resulta ser código duplicado, por dar un ejemplo.
- **El abandono de un miembro:** La baja de un compañero a mitad del proyecto (pasando de 21 a 20 personas) evidenció que debemos poder anticiparnos a estas problemáticas, sobre todo derivadas, en este caso, de falta de compromiso.

### 1.2 Hacer cumplir los estándares es más difícil que definirlos

El equipo invirtió tiempo en establecer guidelines de contribución y convenciones de código. Sin embargo, hacer que 20 personas las apliquen de forma consistente es un reto diferente. Se detectaron casos en los que:

- Se hacían merges sin revisión suficiente por presión de tiempo.
- Los documentos de guidelines no se consultaban porque no estaba claro dónde encontrarlos o cuál era el más actualizado.

También cabe destacar aquí la introducción de los entornos de desarrollo o "DevEnvs", que a pesar de reducir mucho el tiempo para empezar a trabajar, resultaron ser problematicos a la hora de instalarlos y trabajar con ellos al principio, por desconocimiento de la herramienta.

**Lección:** Las normas necesitan ser fáciles de seguir, visibles y reforzadas activamente. Un documento bien escrito que nadie lee no tiene valor operativo.

---

## 2. El abuso de IA generativa en el desarrollo de código

Durante el proyecto, el uso de herramientas de IA generativa (para generación de código) fue relativamente extendido en el equipo. Esto tiene ventajas reales, pero también riesgos que se materializaron en distintos momentos del sprint.

### 2.1 Lo que funciona bien

La IA generativa es genuinamente útil para acelerar tareas repetitivas o bien definidas: generar boilerplate de endpoints en Spring Boot, escribir tests unitarios sobre funciones ya implementadas, o traducir lógica de negocio clara a código. En estos contextos, el ahorro de tiempo es real y el resultado, verificable.

### 2.2 Los problemas que aparecen

El problema surge cuando se usa la IA como sustituto del entendimiento, en lugar de como herramienta de apoyo. Se detectaron los siguientes patrones problemáticos:

- **Código generado que nadie entiende del todo:** Cuando un fragmento de código es producido por IA y quien lo introduce no lo comprende completamente, cualquier bug derivado de ese código se convierte en un problema muy difícil de depurar. El desarrollador no sabe por dónde empezar porque no escribió la lógica.
- **Inconsistencia de estilo y patrones:** La IA no conoce las convenciones internas del proyecto. El código generado a veces seguía patrones distintos a los ya establecidos (nombres de variables, estructura de servicios, manejo de errores), introduciendo inconsistencia que luego había que limpiar manualmente.
- **Falsa sensación de avance:** Es posible generar código que compila y pasa tests básicos pero que no encaja bien con el resto del sistema. Esto crea la sensación de que una tarea está terminada cuando en realidad solo está "funcionando en local bajo condiciones ideales".


### 2.3 La postura del equipo de cara al futuro

La IA generativa es una herramienta legítima y poderosa, pero requiere un uso crítico. La regla práctica que se extrae de la experiencia es: **si no puedes explicar el código que estás introduciendo, no deberías introducirlo**. El uso de IA debería ser siempre un punto de partida para revisar y adaptar, nunca un resultado final sin revisión.

---

## 3. Las dificultades del despliegue con recursos limitados

El stack de despliegue del proyecto — una máquina virtual en Digital Ocean, Nginx como reverse proxy, Certbot para SSL, DuckDNS como dominio dinámico y Firebase para el frontend — es funcionalmente válido, pero introduce una complejidad significativa que en un entorno con recursos ilimitados simplemente no existiría.

### 3.1 La cadena de dependencias del despliegue

Cada componente del stack es una pieza más que puede fallar de forma independiente:

- **DuckDNS + Certbot:** La renovación de certificados SSL depende de que el dominio dinámico apunte correctamente a la IP de la VM en el momento de la renovación. Si la IP cambia (algo habitual en VMs sin IP estática contratada) y no se actualiza DuckDNS a tiempo, el certificado expira y la comunicación entre frontend y backend se rompe por completo. Esto no es un bug de código — es una falla de infraestructura que bloquea toda la aplicación y que puede tardar en diagnosticarse si el equipo no está familiarizado con la cadena.
- **Nginx como reverse proxy:** Cualquier cambio en los endpoints del backend o en la configuración de puertos requiere actualizar la configuración de Nginx manualmente en la VM. Un error en este archivo puede tumbar todos los servicios simultáneamente. Con un equipo de 20 personas, no todo el mundo tiene acceso ni experiencia para intervenir en la VM, lo que crea un cuello de botella cuando surge un problema de infraestructura.
- **Separación Firebase / Digital Ocean:** El frontend se despliega en Firebase y el backend en Digital Ocean. Esto implica gestionar CORS correctamente y asegurarse de que las URLs de los endpoints están siempre actualizadas en el frontend. En cada nuevo despliegue hay que verificar esta coherencia manualmente, lo que es una fuente de errores silenciosos difíciles de detectar.
- **Supabase como base de datos gestionada:** Aunque Supabase simplifica la gestión de PostgreSQL, introduce una dependencia externa que el equipo no controla. Cambios en los planes gratuitos, límites de conexiones simultáneas o tiempos de inactividad de la plataforma afectan directamente a la aplicación sin que el equipo pueda intervenir.

### 3.2 El coste oculto de la configuración manual

En un entorno profesional con presupuesto, muchos de estos problemas se resuelven con servicios gestionados (bases de datos con failover automático, dominios con IP estática). Con recursos limitados, cada uno de estos pasos es manual, propenso a errores humanos y dependiente de que la persona que lo configuró esté disponible para arreglarlo cuando algo falla. Esto tiene un impacto directo en la velocidad de desarrollo: **el tiempo que el equipo dedica a mantener la infraestructura es tiempo que no se dedica a construir funcionalidades**.

### 3.3 Lo que se haría diferente

Con la perspectiva que da el haber vivido estos problemas, las decisiones de infraestructura que se tomarían en un segundo ciclo serían:

- Usar un dominio real desde el inicio (como se hizo con `keakit.net`) para evitar los problemas de DuckDNS.
- Documentar exhaustivamente el proceso de despliegue paso a paso, incluyendo los puntos de fallo conocidos, de modo que cualquier miembro del equipo pueda intervenir en caso de incidencia.
- Establecer un entorno de staging separado del de producción para poder probar despliegues sin riesgo.

---

## 4. Organización del repositorio y documentación

### 4.1 El README como primera impresión

El README de un proyecto es el primer documento que lee cualquier persona ajena al equipo: un evaluador, un colaborador nuevo o alguien que quiere entender de qué va el proyecto. Durante el S3 se identificó que el README no reflejaba fielmente el estado actual del proyecto ni ofrecía una guía clara para arrancar el entorno de desarrollo o entender la arquitectura.

Un README descuidado transmite, aunque sea injustamente, que el proyecto en su conjunto está descuidado. **La documentación es parte del producto.**

### 4.2 La coherencia del repositorio

Con 20 personas contribuyendo, la estructura del repositorio puede degradarse progresivamente: carpetas creadas sin consenso, archivos de configuración duplicados, ramas que nunca se mergean ni se borran, y documentos de versiones anteriores mezclados con los actuales. Esto dificulta la navegación y genera confusión sobre qué es lo que está vigente.

La lección aprendida es que la organización del repositorio necesita revisiones periódicas activas — no es suficiente con definir una estructura al inicio y esperar que se mantenga sola.

---

## Conclusión

Las lecciones de este sprint no son solo técnicas. Son lecciones sobre cómo se construye software en condiciones reales: con gente, con restricciones, con herramientas imperfectas y con la presión del tiempo. Haberlas identificado, articulado y documentado es, en sí mismo, una parte importante del aprendizaje que este proyecto tenía que generar.

El equipo sale del S3 y del PPL con un producto más maduro, una infraestructura más estable y — sobre todo — con un criterio más afinado sobre qué decisiones tomar y cuáles evitar en el futuro.