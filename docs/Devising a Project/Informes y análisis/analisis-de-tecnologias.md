# Análisis de Tecnologías / Frameworks

# Índice del documento

1. [Backend](#1-backend)  
   1.1. [Spring Boot](#11-spring-boot)  
   1.2. [Django REST framework](#12-django-rest-framework)  
   1.3. [NestJS](#13-nestjs)  

2. [Frontend](#2-frontend)  
   2.1. [Vue](#21-vue)  
   2.2. [React](#22-react)  
   2.3. [Angular](#23-angular)  
   2.4. [Flutter](#24-flutter)  
   2.5. [React Native](#25-react-native)  

3. [Base de datos](#3-base-de-datos)  
   3.1. [MariaDB](#31-mariadb)  
   3.2. [PostgreSQL](#32-postgresql)  

4. [Plataformas de despliegue](#4-plataformas-de-despliegue)  
   4.1. [Despliegue Backend](#41-despliegue-backend)  
       4.1.1. [Render](#411-render)  
       4.1.2. [Railway](#412-railway)  
       4.1.3. [GCloud](#413-gcloud)  
   4.2. [Despliegue Frontend](#42-despliegue-frontend)  
       4.2.1. [Expo Application Services](#421-expo-application-services)  
       4.2.2. [GCloud](#422-gcloud)  
   4.3. [Despliegue Base de Datos](#43-despliegue-base-de-datos)  
       4.3.1. [Neon.tech](#431-neontech)  
       4.3.2. [Supabase](#432-supabase)  
       4.3.3. [Render](#433-render)  
       4.3.4. [GCloud](#434-gcloud)  

5. [Pasarela de pago](#5-pasarela-de-pago)  
   5.1. [Stripe](#51-stripe)  
   5.2. [Braintree](#52-braintree)  

6. [Tecnologías escogidas](#6-tecnologias-escogidas)  
   6.1. [Desarrollo](#61-desarrollo)  
   6.2. [Despliegue](#62-despliegue)  
   6.3. [CI/CD](#63-cicd)  
   6.4. [Gestión](#64-gestion)  
   6.5. [Comunicación](#65-comunicacion)  
   6.6. [Inteligencia Artificial](#66-inteligencia-artificial)  
   6.7. [Pasarela de pago](#67-pasarela-de-pago)  

7. [Analisis de viabilidad y quota](#7-analisis-de-viabilidad-y-quota)  
   7.1. [GCloud](#71-gcloud)  
   7.2. [Cloudinary](#72-cloudinary)  
   7.3. [Conclusiones](#73-conclusiones)  

8. [Analisis de riesgos y plan de contingencia](#8-analisis-de-riesgos-y-plan-de-contingencia)  

9. [Historial de versiones](#9-historial-de-versiones)




## 1. Backend
### 1.1. Spring Boot
<div style="text-align: center;">
  <img src="img/technologies/spring-boot.png" width="500" height="auto" style="object-fit: cover;" alt="Spring Boot logo">
</div>

**Lenguaje:** Compatible con Kotlin y Java

​ **Documentación:**  
🔗​ Springboot Java: https://docs.spring.io/spring-boot/api/java/index.html  
🔗​ Kotlin: https://kotlinlang.org/docs/home.html  
🔗​ Java: https://docs.oracle.com/en/java/

✅ **Ventajas:**  
- Todos los miembros del equipo tienen conocimiento previo de ella.  
- Fuertemente documentada.
- Backend y frontend separadas, se puede reutilizar el código del backend.

❌ **Desventajas:**  
- Cold starts más lentos.
- Consume más RAM y CPU que otros frameworks backend. 

---
### 1.2. Django REST framework

<div style="text-align: center;">
  <img src="img/technologies/django-rest-framework.png" width="500" height="auto" style="object-fit: cover;" alt="Django REST framework logo">
</div>

**Lenguaje:** Python

**Documentación:**  
🔗​ Django REST framework https://www.django-rest-framework.org/  
🔗​ Django https://docs.djangoproject.com/es/6.0/

​✅​ **Ventajas:**  
- Todos los miembros del equipo tienen conocimientos previos de Django. 
- Desarrollo rápido.
- Seguridad sólida: Soporte nativo para autenticación por sesiones, tokens, JWT, permisos y rate limiting.
- Panel de administración.
- Backend y frontend separadas, se puede reutilizar el codigo del backend.

❌ **Desventajas:**  
-  Incluye mucho stack por defecto. Puede ser demasiado pesado.
-  Necesario aprender Django REST.
---
### 1.3. NestJS

<div style="text-align: center;">
  <img src="img/technologies/NestJS.svg" width="500" height="auto" style="object-fit: cover;" alt="NestJS logo">
</div>

*Framework para Node.js.*

**Lenguaje:** Compatible con TypeScript y JavaScript.

**Documentación:**  
🔗​ https://docs.nestjs.com/

​✅​ **Ventajas:**  
- Conocimiento parcial de la tecnología. Anteriormente se trabajó con Express.js.
- La herramienta de línea de comandos facilita generar componentes y módulos de proyectos.
- Mismo lenguaje de programación que la mayoría de frameworks frontend. 

❌ **Desventajas:**  
- Comunidad más pequeña que frameworks más antiguos.
- El uso intensivo de decoradores y capas puede dificultar el debugging.
- Curva de aprendizaje moderada.

## 2. Frontend
### 2.1. Vue

<div style="text-align: center;">
  <img src="img/technologies/vuejs.png" width="500" height="auto" style="object-fit: cover;" alt="Vue logo">
</div>

**Lenguaje:**  JavaScript o TypeScript

**Documentación:**  
🔗​ https://es.vuejs.org/v2/guide/

​✅​ **Ventajas:**  
- Documentacion en español.
- Compatible con Capacitor.
- JavaScript o TypeScript son muy cómodos para hacer frontend, el equipo está familiarizado con ello.

❌ **Desventajas:**
- Comunidad y adopción menor que React y Angular.  
- Integración de ecosistema por módulos: Hay que agregar módulos como el enrutador o el gestor de estado.   
- Demanda laboral menor. 

---

### 2.2. React

<div style="text-align: center;">
  <img src="img/technologies/react.png" width="500" height="auto" style="object-fit: cover;" alt="React logo">
</div>

**Lenguaje:**  JavaScript o TypeScript

**Documentación:**  
🔗​ https://react.dev/learn

​✅​ **Ventajas:**  
- Documentacion en español.
- Compatible con Capacitor.
- Anteriormente utilizada por el equipo.
- Tenemos proyectos que podemos utilizar como base y, por tanto, adelantar mucho el desarrollo.
- Tiene librerías como MaterialUI que nos ayuda a crear botones y no hacerlo todo desde cero.

❌ **Desventajas:**  
- SEO limitado. 
- Si hay muchos estados baja el rendimiento. (Luis Emmanuel tiene experiencia personal optimizando Skullking en DP1)

---
### 2.3. Angular

<div style="text-align: center;">
  <img src="img/technologies/angular.svg" width="500" height="auto" style="object-fit: cover;" alt="Angular logo">
</div>

**Lenguaje:** TypeScript (o JavaScript, pero es menos común)

**Documentación:**  
🔗​ Principal: https://angular.dev/  
🔗​ En español: https://docs.angular.lat/

​✅​ **Ventajas:**  
- Framework completo y estructurado (enrutamiento, inyección de dependencias, formularios reactivos, CLI poderosa).
- Compatible con Capacitor.
- Tiene soluciones oficiales para internacionalización (i18n).

❌ **Desventajas:**  
- Curva de aprendizaje pronunciada.  
- Menor flexibilidad: Angular impone más su ecosistema estructurado, no da tanta libertad para el uso de librerías.   
- Más archivos y configuraciones necesarias que otros frameworks.

---
### 2.4. Flutter

<div style="text-align: center;">
  <img src="img/technologies/flutter.png" width="500" height="auto" style="object-fit: cover;" alt="Flutter logo">
</div>

**Lenguaje:** Dart

**Documentación:**  
🔗​ https://docs.flutter.dev

​✅​ **Ventajas:**  
- Sirve para Android, iOS, página web y aplicación de escritorio.
- El lenguaje es similar a C# o Java.
- Se reutiliza el código para las distintas interfaces.

❌ **Desventajas:**  
- Curva de aprendizaje para Dart.
- Menos utilizado, por tanto, menor comunidad.
- Ecosistema bastante más pequeño en comparación con las otras alternativas.

---
### 2.5. React Native

<div style="text-align: center;">
  <img src="img/technologies/react-native-logo.png" width="500" height="auto" style="object-fit: cover;" alt="React Native logo">
</div>

**Lenguaje:**  JavaScript / TypeScript

**Documentación:**  
🔗​ https://reactnative.dev/

​✅​ **Ventajas:**  
- Desarrollo multiplataforma (Android, iOS, macOS, Windows, Web, etc.) con un único código.
- Al conocer React, la curva de aprendizaje es corta.
- Gran comunidad y ecosistema. Hay muchas bibliotecas y soluciones de terceros que facilitan tareas comunes.
- Al usar componentes nativos (en lugar de WebView) aumenta el redimiento.

❌ **Desventajas:**  
- Ecosistema de bibliotecas con calidad variable. Muchas soluciones útiles dependen de la comunidad.  
- Necesita incorporar React Native Web para la plataforma web.

## 3. Base de datos

### 3.1. MariaDB

<div style="text-align: center;">
  <img src="img/technologies/mariadb-logo.png" width="500" height="auto" style="object-fit: cover;" alt="MariaDB logo">
</div>

**Lenguaje:** SQL

**Documentación:**  
🔗​ https://mariadb.org/documentation/

​✅​ **Ventajas:**  
- Todos los miembros del equipo tienen conocimientos previos en MariaDB.
- Muy eficiente en consultas simples y lecturas frecuentes.
- Fácil de usar y administrar. Hay mucha documentación y tiene una curva de aprendizaje baja.
- Buen soporte en hosting y cloud. Compatible con Azure, Docker, Kubernetes, Google Cloud SQL y AWS RDS.
- Bajo consumo de recursos.

❌ **Desventajas:**  
-  Menor robustez en integridad de datos complejos.
-  Escalabilidad compleja en arquitecturas muy grandes.
---
### 3.2. PostgreSQL

<div style="text-align: center;">
  <img src="img/technologies/postgre.png" width="500" height="auto" style="object-fit: cover;" alt="PostgreSQL logo">
</div>

**Lenguaje:** SQL

**Documentación:**  
🔗​ https://www.postgresql.org/docs/

​✅​ **Ventajas:**  
- Alta robustez y fiabilidad.
- Alto rendimiento en consultas complejas.
- Alta capacidad de escalabilidad.
- Mejor soporte para geolocalización.
- Mejor concurrencia. Gestiona de manera eficiente miles de usuarios concurrentes.
- Soporte avanzado para JSON y datos semi-estructurados.
- Extension de Postgis para guardar ubicaciones en forma de geometry.

❌ **Desventajas:**  
-  Mayor consumo de recursos.
-  La configuración inicial puede ser compleja.
---

## 4. Plataforma(s) de despliegue
### 4.1. Despliegue Backend
La elección de una plataforma de despliegue para el backend es fundamental para garantizar que la lógica de negocio desarrollada en Java con Spring Boot esté disponible de forma permanente y segura. A continuación se exponen las diferentes plataformas para su despliegue.

#### 4.1.1. Render

<div style="text-align: center;">
  <img src="img/technologies/render.png" width="500" height="auto" style="object-fit: cover;" alt="Render logo">
</div>

**Documentación:**  
🔗​ https://render.com/docs

✅ **Ventajas:**
- Plan gratuito disponible.
- Despliegue sencillo. Se puede desplegar directamente desde repositorios GitHub o desde Docker.
- Soporte nativo para aplicaciones Java Spring Boot.
- Gestión automática de certificados SSL.
- No requiere administración de servidores.
- Interfaz sencilla y curva de aprendizaje baja.
- Entorno famiiar para los integrantes.

❌ **Desventajas:**
- El plan gratuito entra en modo reposo tras periodos de inactividad.
- Recursos limitados.
- La escalabilidad avanzada requiere plan de pago.
---

#### 4.1.2. Railway

<div style="text-align: center;">
  <img src="img/technologies/railway.png" width="500" height="auto" style="object-fit: cover;" alt="Railway logo">
</div>

**Documentación:**  
🔗​ https://docs.railway.com/

✅ **Ventajas:**
- Plan gratuito con créditos mensuales.
- Despliegue muy sencillo desde GitHub.
- Configuración automática de variables de entorno.
- Interfaz muy intuitiva.

❌ **Desventajas:**
- Límite de uso mensual en el plan gratuito.
- Escalabilidad limitada sin plan de pago.
- Dependencia de proveedor externo.
---

#### 4.1.3 GCloud 

<div style="text-align: center;">
  <img src="img/technologies/Google-Cloud-Logo.png" width="500" height="auto" style="object-fit: cover;" alt="Render logo">
</div>

**Documentación:**  
🔗 https://docs.cloud.google.com/docs

✅ **Ventajas:**
- Todo el despliegue se hace en una sola plataforma
- 300$ Gratuitos por parte de la universidad
- Los miembros del equipo estan familiarizados con esta tecnología

❌ **Desventajas:**
- El despliegue de la base de datos no es gratuito
- Se cobra por hora de uso
- Los 300$ si no se gastan en 3 meses se pierden 
---



### 4.2 Despliegue Frontend
En cuanto al frontend, el despliegue en una arquitectura de React Native con TypeScript consiste en gestionar la compilación y distribución de los binarios para dispositivos móviles. Es imperativo elegir una plataforma de servicios de compilación porque centraliza la transformación del código TypeScript en una aplicación funcional para Android o iOS. Una infraestructura de despliegue adecuada permite que el equipo trabaje sobre una base de código tipada y coherente, facilitando que cualquier usuario o evaluador pueda instalar la aplicación en su terminal físico mediante un flujo de distribución controlado y profesional. Se proponen tres plataformas:

#### 4.2.1. Expo Application Services

<div style="text-align: center;">
  <img src="img/technologies/expo.png" width="500" height="auto" style="object-fit: cover;" alt="Expo EAS logo">
</div>

**Documentación:**  
🔗​ https://docs.expo.dev/eas/

✅ **Ventajas:**
- Plan gratuito disponible. 
- Permite generar builds de la aplicación sin necesidad de instalar Android Studio o Xcode localmente.
- Gestiona las dependencias y la compilación de TS a JS nativo.
- Simplifica el proceso de despliegue y compilación de aplicaciones React Native. Integración sencilla.
- Compatible con Android y iOS desde una única base de código.
- Permite probar la aplicación directamente en dispositivos móviles mediante Expo Go.
- Reduce la complejidad de configuración del entorno de desarrollo.
- Facilita la distribución de versiones de prueba.

❌ **Desventajas:**
- Algunas funcionalidades avanzadas requieren suscripción de pago.
- Dependencia de la infraestructura de Expo.
- Menor control sobre configuraciones nativas avanzadas.
- Puede requerir configuración adicional para publicar en tiendas oficiales.
---

#### 4.2.2 GCloud 

<div style="text-align: center;">
  <img src="img/technologies/Google-Cloud-Logo.png" width="500" height="auto" style="object-fit: cover;" alt="Render logo">
</div>

**Documentación:**  
🔗 https://docs.cloud.google.com/docs

✅ **Ventajas:**
- Todo el despliegue se hace en una sola plataforma
- 300$ Gratuitos por parte de la universidad
- Los miembros del equipo estan familiarizados con esta tecnología

❌ **Desventajas:**
- La configuración de planes es complicada
- Los 300$ si no se gastan en 3 meses se pierden 
---


### 4.3 Despliegue Base de Datos
Por último, desplegar la base de datos PostgreSQL de forma independiente es el pilar que garantiza la persistencia y la integridad de la información del proyecto. Se han analizado las siguientes opciones:

#### 4.3.1. Neon.tech

<div style="text-align: center;">
  <img src="img/technologies/neon.png" width="500" height="auto" style="object-fit: cover;" alt="Neon logo">
</div>

**Documentación:**  
🔗​ https://neon.com/docs/introduction

✅ **Ventajas:**
- PostgreSQL totalmente gestionado, sin necesidad de administración manual.
- Arquitectura serverless, con escalado automático según el uso.
- Copias de seguridad automáticas integradas.
- Alta disponibilidad y fiabilidad.
- Integración sencilla con aplicaciones Spring Boot.
- No requiere configuración de infraestructura propia.

❌ **Desventajas:**
- Limitaciones de recursos en el plan gratuito.
- Dependencia de un proveedor externo.
- Puede entrar en estado inactivo tras periodos sin uso.
- Algunas funcionalidades avanzadas están limitadas a planes de pago.
---

#### 4.3.2. Supabase

<div style="text-align: center;">
  <img src="img/technologies/supabase.png" width="500" height="auto" style="object-fit: cover;" alt="Supabase logo">
</div>

**Documentación:**  
🔗​ https://supabase.com/docs

✅ **Ventajas:**
- Plan gratuito disponible.
- PostgreSQL completamente gestionado.
- No requiere administración manual del servidor.
- Interfaz web intuitiva para la gestión de la base de datos.
- Copias de seguridad automáticas.
- Integración sencilla con aplicaciones backend y frontend.

❌ **Desventajas:**
- Limitaciones de uso en el plan gratuito.
- Dependencia de proveedor externo.
- Algunas funcionalidades avanzadas requieren plan de pago.
- Puede incluir servicios adicionales no necesarios para el proyecto.
---

#### 4.3.3. Render

<div style="text-align: center;">
  <img src="img/technologies/render.png" width="500" height="auto" style="object-fit: cover;" alt="Render logo">
</div>

**Documentación:**  
🔗​ https://render.com/docs

✅ **Ventajas:**
- PostgreSQL completamente gestionado.
- Integración sencilla con aplicaciones desplegadas en Render.
- No requiere administración manual.
- Configuración sencilla mediante interfaz web.
- Copias de seguridad automáticas.

❌ **Desventajas:**
- El plan gratuito tiene limitaciones importantes.
- La base de datos puede eliminarse tras periodos de inactividad en el plan gratuito.
- Menores recursos disponibles en comparación con planes de pago.
- Dependencia de la infraestructura de Render.
---

#### 4.3.4 GCloud 

<div style="text-align: center;">
  <img src="img/technologies/Google-Cloud-Logo.png" width="500" height="auto" style="object-fit: cover;" alt="Render logo">
</div>

**Documentación:**  
🔗 https://docs.cloud.google.com/docs

✅ **Ventajas:**
- Todo el despliegue se hace en una sola plataforma
- 300$ Gratuitos por parte de la universidad
- Los miembros del equipo estan familiarizados con esta tecnología

❌ **Desventajas:**
- El despliegue de la base de datos no es gratuito
- Se cobra por hora de uso
- Los 300$ si no se gastan en 3 meses se pierden 
---


# 5. Pasarela de pago

### 5.1 Stripe

<div style="text-align: center;">
  <img src="img/technologies/Stripe-Logo.png" width="500" height="auto" style="object-fit: cover;" alt="Render logo">
</div> 

**Documentación:**  
🔗​ https://docs.stripe.com/api

✅ **Ventajas:**
- SDK oficial para Java (Spring Boot) y React Native
- Muy buena documentación
- Muy fácil de integrar
- Comisiones bajas
- Anteriormente utilizada por el equipo

❌ **Desventajas:**
- No esta disponible en todos los paises
- Posible retencion de fondos por falsa detección de fraude automatica

### 5.2 Braintree

<div style="text-align: center;">
  <img src="img/technologies/Braintree-Logo.png" width="500" height="auto" style="object-fit: cover;" alt="Render logo">
</div> 

**Documentación:**  
🔗​ https://developer.paypal.com/braintree/docs/

✅ **Ventajas:**
- Pertenece a PayPal por lo que los clientes se sienten mas seguros
- Permite tarjetas, PayPal, Google Pay, Apple Pay
- MBuen soporte para apps móviles

❌ **Desventajas:**
- Configuración más compleja que Stripe
- Comunidad y documentación más pequeñas
- Comisiones más altas


# 6. Tecnologías escogidas
Tras realizar un análisis exhaustivo de ventajas y desventajas sobre todas las tecnologías propuestas, se han escogido las siguientes opciones.

## 6.1 Desarrollo

- 🍃 **Spring Boot con Java** para el desarrollo backend.
- ⚛️ **React Native con TypeScript** para el desarrollo frontend.
- 🐘 **PostgreSQL** como base de datos.
- 🐳 **Docker y WSL** para dev containers.
- ☁️ **Cloudinary** para el almacenamiento de imagenes.

## 6.2 Despliegue
- ☁️ **GCloud** para el despliegue del backend.
- 📱 **Expo Application Services** para la compilación del apk e ipa, y despliegue de la página web.
- 📲 **Uptodown, Aptoide, F-Droid** como tiendas para la descarga de la aplicación.
- 🐳 **Docker** para los contenedores.

## 6.3 CI/CD
- 🐙 **Github Actions:** Utilizaremos un sistema de workflows similares a los anteriormente desarrollados en la asignatura de EGC para el despliegue y la integración.
- 📡 **SonarQube:** Para el análisis estático de código.
- 📏 **CheckStyle:** Revisa el estilo de código de Java.
- 🧹 **PMD:** Revisa malas prácticas y diseño del código principalmente enfocado en Java.
- 🐛 **SpotBugs:** Busca posibles bugs en la aplicación.
- 🟦 **TypeScript Compiler:** Para pruebas de tipado de TypeScript.
- 🔍 **ESLint:** Para el lint del código.
- 🃏 **Jest:** Para testing unitario del frontend.
- ☕ **JUnit:** Para testing del backend.
- 🎭 **Mockito:** Para realizar los mocks del testing de backend.
- ⚙️ **Mave** Para la gestion de dependencias.

## 6.4 Gestión
- ⏱️ **Clockify** para la gestión del tiempo y vigilancia de cumplimiento del Commitment Agreement.
- 📋 **GitHub Projects** para observar la progresión de las tareas mediante el kanban del equipo.

## 6.5 Comunicación
- 💬 **Microsoft Teams** como herramienta principal de comunicación.
- 📗 **Microsoft Excel** como Base de Conocimiento compartida con otros equipos.

## 6.6 Inteligencia Artificial
- 🤖 **Microsoft Copilot** para desarrollo de código o consultas.
- ✨ **Gemini** para consultas y generación de imágenes.

## 6.7 Pasarela de pago
- 💳 **Stripe** Para gestionar los pagos en la aplicación.

# 7 Analisis de viabilidad y quota

## 7.1 GCloud

GCloud ofrece a parte de un tier gratuito con ciertas limitaciones, tambien se pueden reclamar 300$ de forma gratuita para que si en cuyo caso nos pasamos del limite se cobren a los 300$, una vez finalizados si supondria un costo directo a nuestro equipo.  

Por tanto haremos un estudio de las diferentes limitaciones que podemos llegar a tener tanto en el despliegue backend/frontend como en la base de datos


**Backend/Frontend:** la aplicación será desplegada haciendo uso de la herramienta de cloud run, esta en el plan gratuito nos da las siguientes restricciones:

- 2 millones de solicitudes por mes: Actualmente contamos con un total de 22 usuarios piloto, si cada uno hiciera 50 peticiones todos los dias apenas llegariamos a unos 33000 peticiones al mes, incluso si duplicaramos o triplicaramos la cantidad de usuarios piloto estariamos muy lejos de llegar al limite.

- 360000 GB second de memoria: Esta es una quota calculada y se explica de la siguiente manera si el servicio usa 500 mb (0.5 GB) y se ejecuta durante 1 segundo consumimos 0.5GB second, con esto aclarado haremos algunas suposiciones, como por ejemplo que nuestro servicio usa 0.5 GB cada segundo, esto nos daria un total de 200 horas de ejecucion total, que aunque parezca poco debemos recordar que el servicio se apaga, e incluso aunque no lo hiciera, con solo usar 10$ de los 300$ que disponemos se suman un total de 4 millones de GB second que equivaldrian a unas 2.222 horas o 92 dias seguidos funcionando, por tanto aunque existe el riesgo de superar el limite gratuito, debido a que podemos hacer uso de creditos obtenidos gratuitamente tampoco se considera un riesgo real.

- 180000 vCPU seconds: Esta es una quota similar a la anterior pero con CPU, debido a la dificultad de saber cuanto puede consumir en cpu nuestra aplicación por segundo se han utilizado datos horientativos obtenidos mediante inteligencia artificial para una aplicacion de nuestro tipo, para esto se hicieron calculos con 50-200 usuarios diarios y con 1000-5000 usuarios diarios, para el primer caso se estima un uso entre 20.000 a 80.000 vCPU second al mes y para el segundo caso se estima 200.000 - 800.000 al mes, quedando muy lejos de los 180.000 vCPU second que tenemos gratuitos al mes

**Base de datos:** en el caso de la base de datos utiliza otro tipo de servicio con otras quotas distintas, vabe recalcar que la base de datos no entra dentro del plan gratuito asi que se utilizaran parte de los 300$ para su uso.

- CPU y memoria: Esta se cobra por la simple existencia de de la base de datos, siendo en la version db-1f-micro 0.0150$ la hora, este ofrece aproximadamente 0,6GB de RAM, esto significaria en un precio de 11.16$ al mes.

- Almacenamiento: en el almacenamiento este cuesta  0.040$ por GB al mes, por lo que si alquilamos 25GB esto costaria es aproximadamente 1$ adicional al mes.

Esto implica que en la base de datos no estaria costando aproximadamente 12.16$ al mes dejandonos lejos de los 300$ que disponemos, incluso si tenemos mas gastos por superacion de quotas un mes especifico aun asi seria muy complicado llegar a los 300$ en 3 meses.

## 7.3 Cloudinary

**Espacio de almacenamiento** Cloudnary en su version gratuita cuenta con un espacio de 25GB de almacienamiento y permite subir imagenes de hasta 10 MB, por tanto si suponemos que tenemos 50 usuarios pilotos y cada uno sube al menos un articulo con 3 imagenes del tamaño maximo cada uno llegariamos a un total de 1.5 GB utilizados, nuevamente bastante alejado del limite de cloudinary por se considera que supone un riesgo bajo

## 7.4 Conclusiones

Como podemos observar es viable el uso de las herramientas seleccionadas en este proyecto debido por una parte al volumen de usuarios iniciales previstos y por otro lado a la duracion del mismo, incluso frente a un aumento importante en la carga del proyecto todas las herramientas permiten mejorar el plan y por tanto la quota maxima, en otras palabras, incluso con un gran crecimiento inesperado existe la posibilidad de escalabilidad por cada una de las herramientas

# 8. Análisis de riesgos y plan de contingencia
| ID | Riesgo | Prioridad | Impacto en alcance | Impacto en tiempo/costes | Impacto en calidad | Probabilidad | Responsables de seguimiento | Responsables de respuesta | Plan de contingencia |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Alguna función es demasiado compleja de realizar con las herramientas escogidas | 🟡7 | 🔴9 | 🟢4 | 🔴8 | 🟡5 | Coordinador de equipo | Coordinador | Refactorización o uso de nuevas librerías que permitan el desarrollo de dicha funcionalidad. | 
| 2 | Problemas de compatibilidad o disponibilidad en herramientas de desarrollo y plataformas de despliegue | 🟡7 | 🟢3 | 🟢2 | 🟢2 | 🟡5 | Coordinador | Coordinador | Búsqueda y propuesta de herramientas alternativas con la misma funcionalidad y compatibles entre sí. |
| 3 | Licencias o herramientas de software insuficientes | 🟢2 | 🟡5 | 🟡6 | 🟢2 | 🟡5 | Coordinador | Coordinador | Búsqueda y propuesta de herramientas gratuitas para cubrir esas necesidades |
| 4 | Brechas de seguridad o pérdida de información | 🔴8 | 🟢2 | 🟢4 | 🔴9 | 🟢2 | Coordinador | Coordinador | Copias de seguridad frecuentes y protocolos de seguridad |
| 5 | Falta de disponibilidad de hardware o infraestructura | 🔴8 | 🟡6 | 🟡7 | 🟡5 | 🟢2 | Coordinador | Coordinador | Uso de máquinas virtuales o solicitud de terminales a otras personas. |
| 6 | Falta de conocimiento sobre las herramientas | 🟡6 | 🟢2 | 🔴9 | 🟡7 | 🟡6 | Coordinador de equipo | Coordinador de equipo | Realización de formación mediante tutoriales de YouTube o cursos online. |
| 7 | Indisponibilidad temporal de uno o mas miembros del equipo | 🟢4 | 🟢2 | 🟢2 | 🟢1 | 🔴8 | Coordinador de equipo | Coordinador de equipo | Redistribución y equilibrio de tareas |
| 8 | Documentación pobre o mal redactada | 🟡5 | 🟢2 | 🟢1 | 🟡7 | 🟡5 | Coordinador de equipo | Coordinador de equipo | Redistribución y equilibrio de tareas |
| 9 | Problemas con la base de datos (fin de quota) | 🔴9 | 🟡5 | 🔴9 | 🟡7 | 🟡6 | Coordinador | Coordinador | Ampliación de plan |
| 10 | Fallo del build con expo | 🟡5 | 🟡7 | 🟡7 | 🟡5 | 🟡5 | Coordinador de equipo | Coordinador | Realizar el build del apk con el propio React Native |
| 11 | Un miembro no cumple con los estandares de calidad minimos establecidos a lo largo de la carrera | 🟢2 | 🟢1 | 🟢1 | 🟢2 | 🟢2 | Coordinador de equipo | Coordinador de equipo | Pair programming con otro miembro mejor tecnicamente |
| 12 | Mal recibimiento de la idea por parte de los usuarios pilotos | 🟢4 | 🟢3 | 🟢3 | 🟢4 | 🟢4 | Coordinador | Coordinador | Recopilar mejoras propuestas por los usuarios piloto, analizarlas e implementarlas |
| 13 | Baja productividad de los miembros del equipo por cercania con exámenes de otras asignaturas | 🟢4 | 🟢2 | 🟢2 | 🟢4 | 🔴9 | Coordinador de equipo | Coordinador | Ligero aumento de los puntos de historia antes de dichas fechas y disminucion en fecha de examenes |
| 14 | Perdida de dias de feedback por factores externos (ej. medioambientales) | 🟡5 | 🟢4 | 🟡6 | 🟡5 | 🟡7 | Coordinador | Coordinador | Comunicación de dudas mediante correo electrónico a los profesores de la asignatura |

*Nota: El "coordinador" se refiere al coordinador del equipo 6 en su totalidad, mientras que el "coordinador de equipo" se refiere al coordinador del subgrupo afectado por el suceso del riesgo.*

*semaforo de riesgos:*
🟢1-4 Bajo
🟡5-7 medio
🔴8-10 Alto


## 9. Historial de versiones

| Versión | Fecha       | Descripción                   | Autor(es)       |
|---------|------------|--------------------------------|------------|
| 1.0.0   | 08/02/2026 | Análisis inicial de tecnologías para backend (Spring Boot, Django REST, NestJS) y frontend (Vue, React, Angular, Flutter, React Native) | Luis Emmanuel Chavez Malave, Lucía Ponce García de Sola |
| 1.1.0   | 12/02/2026 | Análisis inicial de tecnologías para base de datos (MariaDB, PostgreSQL) y plataformas de despliegue. | Marta de la Calle González |
| 2.0.0 | 15/02/2026 | Decisión final de tecnologías escogidas para desarrollo, despliegue, integración continua, gestión, comunicación e IA. Adición de análisis de riesgos y plan de contingencia. Reorganización de la numeración de secciones. | Luis Emmanuel Chavez Malave, Lucía Ponce García de Sola, Marta de la Calle González |
| 2.0.1 | 17/02/2026 | Arreglo de imagenes no subidas o borradas y agregar emojis para volver el documento mas visual | Luis Emmanuel Chavez Malave |
| 2.0.2 | 17/02/2026 | Pie de foto de las imágenes | Marta de la Calle González |
| 2.1.0 | 18/02/2026 | Revision de Análisis de riesgos | Luis Emmanuel Chavez Malave |
| 2.1.1 | 18/02/2026 | Corrección referencias obsoletas a imágenes | Rosa María Espinosa Martínez |
| 3.0.0 | 25/02/2026 | se añadieron herramientas adicionales y el estudio de viabilidad de uso | Luis Emmanuel Chavez Malave |
| 3.1.0 | 4/03/2026 | Se agrego Gcloud y se cambio la viabilidad de las herramientas escogidas | Luis Emmanuel Chavez Malave |
---
**Redactado por:** Luis Emmanuel Chavez Malave
**Fecha de redacción:** 4/03/2026  
**Versión:** 3.0.1
