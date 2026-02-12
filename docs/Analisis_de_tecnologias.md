# Análisis de Tecnologías / Frameworks

## Índice del documento
1. [Desarrollo Backend](#1-backend)  
   1.1. [Spring Boot](#11-spring-boot)  
   1.2. [Django REST framework](#12-django-rest-framework)  
   1.3. [NestJS](#13-nestjs)  
2. [Desarrollo Frontend](#2-frontend)  
   2.1. [Vue](#21-vue)  
   2.2. [React](#22-react)  
   2.3. [Angular](#23-angular)  
   2.4. [Flutter](#24-flutter)  
   2.5. [React Native](#25-react-native)
3. [Base de datos](#3-base-de-datos)  
   3.1. [MariaDB](#31-mariadb)  
   3.2. [PostgreSQL](#32-postgresql)  
5. [Tecnologías escogidas](#4-tecnologías-escogidas) 
6. [Plataforma(s) de despliegue](#5-plataformas-de-despliegue)  
   5.1. [Despliegue Backend](#51-despliegue-backend)    
      5.1.1. [Render](#511-render)  
      5.1.2. [Railway](#512-railway)  
   5.2. [Despliegue Frontend](#52-despliegue-frontend)  
      5.2.1. [Expo Application Services](#521-expo-application-services)  
   5.3. [Despliegue Base de Datos](#53-despliegue-base-de-datos)  
      5.3.1. [Neon.tech](#531-neontech)  
      5.3.2. [Supabase](#532-supabase)  
      5.3.3. [Render](#533-render)  
7. [Historial de versiones](#6-historial-de-versiones)



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
  <img src="img/technologies/React.png" width="500" height="auto" style="object-fit: cover;" alt="React Native logo">
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
  <img src="img/technologies/mariadb.png" width="500" height="auto" style="object-fit: cover;" alt="Django REST framework logo">
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
  <img src="img/technologies/postgre.png" width="500" height="auto" style="object-fit: cover;" alt="Django REST framework logo">
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

❌ **Desventajas:**  
-  Mayor consumo de recursos.
-  La configuración inicial puede ser compleja.
---

## 4. Tecnologías escogidas

*(Por rellenar.)*

## 5. Plataforma(s) de despliegue
### 5.1. Despliegue Backend
La elección de una plataforma de despliegue para el backend es fundamental para garantizar que la lógica de negocio desarrollada en Java con Spring Boot esté disponible de forma permanente y segura. A continuación se exponen las diferentes plataformas para su despliegue.

#### 5.1.1. Render

<div style="text-align: center;">
  <img src="img/technologies/render.png" width="500" height="auto" style="object-fit: cover;" alt="Django REST framework logo">
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

#### 5.1.2. Railway

<div style="text-align: center;">
  <img src="img/technologies/railway.png" width="500" height="auto" style="object-fit: cover;" alt="Django REST framework logo">
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

### 5.2 Despliegue Frontend
En cuanto al frontend, el despliegue en una arquitectura de React Native con TypeScript consiste en gestionar la compilación y distribución de los binarios para dispositivos móviles. Es imperativo elegir una plataforma de servicios de compilación porque centraliza la transformación del código TypeScript en una aplicación funcional para Android o iOS. Una infraestructura de despliegue adecuada permite que el equipo trabaje sobre una base de código tipada y coherente, facilitando que cualquier usuario o evaluador pueda instalar la aplicación en su terminal físico mediante un flujo de distribución controlado y profesional. Se proponen tres plataformas:

#### 5.2.1. Expo Application Services

<div style="text-align: center;">
  <img src="img/technologies/expo.png" width="500" height="auto" style="object-fit: cover;" alt="Django REST framework logo">
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

### 5.3 Despliegue Base de Datos
Por último, desplegar la base de datos PostgreSQL de forma independiente es el pilar que garantiza la persistencia y la integridad de la información del proyecto. Se han analizado las siguientes opciones:

#### 5.3.1. Neon.tech

<div style="text-align: center;">
  <img src="img/technologies/neon.png" width="500" height="auto" style="object-fit: cover;" alt="Django REST framework logo">
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

#### 5.3.2. Supabase

<div style="text-align: center;">
  <img src="img/technologies/supabase.png" width="500" height="auto" style="object-fit: cover;" alt="Django REST framework logo">
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

#### 5.3.3. Render

<div style="text-align: center;">
  <img src="img/technologies/render.png" width="500" height="auto" style="object-fit: cover;" alt="Django REST framework logo">
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

## 6. Historial de versiones

| Versión | Fecha       | Descripción                   | Autor(es)       |
|---------|------------|-------------------------------|------------|
| 1.0.0   | 08/02/2026 | Análisis inicial de tecnologías para backend (Spring Boot, Django REST, NestJS) y frontend (Vue, React, Angular, Flutter, React Native) | Luis Emmanuel Chavez Malave, Lucía Ponce García de Sola |
| 1.1.0   | 12/02/2026 | Análisis inicial de tecnologías para base de datos (MariaDB, PostgreSQL) y plataformas de despliegue. | Marta de la Calle González |

---
**Redactado por:** Luis Emmanuel Chavez Malave, Lucía Ponce García de Sola y Marta de la Calle González  
**Fecha de redacción:** 12/02/2026  
**Versión:** 1.1.0
