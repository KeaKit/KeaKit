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
4. [Plataforma(s) de despliegue](#4-plataformas-de-despliegue)
5. [Tecnologías escogidas](#5-tecnologías-escogidas)
6. [Historial de versiones](#6-historial-de-versiones)



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

*(Por rellenar.)*

## 4. Plataforma(s) de despliegue

*(Por rellenar.)*
## 5. Tecnologías escogidas

*(Por rellenar.)*

## 6. Historial de versiones

| Versión | Fecha       | Descripción                   | Autor(es)       |
|---------|------------|-------------------------------|------------|
| 1.0.0   | 08/02/2026 | Análisis inicial de tecnologías para backend (Spring Boot, Django REST, NestJS) y frontend (Vue, React, Angular, Flutter, React Native) | Luis Emmanuel Chavez Malave, Lucía Ponce García de Sola |

---
**Redactado por:** Luis Emmanuel Chavez Malave y Lucía Ponce García de Sola  
**Fecha de redacción:** 08/02/2026  
**Versión:** 1.0.0