# Plan de Pruebas

## 1. Introducción y Alcance

El propósito de este plan de pruebas es asegurar la calidad, funcionalidad, rendimiento y fiabilidad de la aplicación KeaKit. El alcance incluye la validación de la lógica de negocio, la integración de componentes, la validación de los flujos principales por parte del usuario y la respuesta del sistema bajo carga.

## 2. Estrategia: Orden de Ejecución y Prioridad

Para garantizar la estabilidad del sistema, las pruebas se ejecutarán siguiendo el orden y las prioridades descritas a continuación:

| Orden | Prioridad | Tipo de Prueba | Framework / Herramienta |
| :--- | :--- | :--- | :--- |
| 1º | **Crítica** | Unitarias | JUnit 5, Mockito (Back) / Jest (Front) |
| 2º | **Alta** | Integración | Spring Boot Test (Back) / React Native Testing Library (Front) |
| 3º | **Media** | Rendimiento | Locust |
| 4º | **Muy Alta** | Aceptación | Manual (Scripts UI) |

*Se prioriza la ejecución de pruebas de rendimiento (Locust) antes de las de aceptación para asegurar que los flujos de usuario se prueben sobre un entorno estable y capaz de soportar la concurrencia.*

## 3. Pruebas Unitarias

Las pruebas unitarias validarán el comportamiento de los componentes individuales (clases, métodos o funciones) de forma aislada. Repositorios y elementos externos al componente a testear son remplazados por mocks. Estas se realizan durante el desarrollo de cada funcionalidad. Estas están automatizadas en el flujo de CI/CD de la aplicación.

- **Alcance por Módulos**: Gestión de Usuarios (Auth/Perfil), Catálogo de Artículos e Items, Gestión de Kits, Cartera y Transacciones, y Gestión de Incidencias.

## 3.1 Backend

- **Herramientas**: JUnit 5, Mockito.
    
- **Alcance**:
	- Validan el funcionamiento correcto de los controladores y servicios.
	- Sirven para validar reglas de negocio y manejo de excepciones.
    - Validan la generación y validación de tokens JWT.
## 3.2 Frontend

- **Herramientas**: Jest.
- **Alcance**:
    - Prueba funciones que manipulan datos locales utilizados en la interfaz de usuario.
    - Pruebas las funciones que se encargan de comunicarse con el servidor, mockeando las respuestas de la API.

## 4. Pruebas de Integración

Las pruebas de integración verifican la correcta comunicación entre los diferentes módulos y la base de datos. Al igual que las pruebas unitarias, estas pruebas también se realizan durante el desarrollo de cada funcionalidad, y además, están automatizadas en el flujo de CI/CD de la aplicación.

- **Alcance por Módulos**: Comunicación Backend-Database (PostgreSQL/H2), Flujo de Persistencia de Artículos, y Endpoints de la API REST.

## 4.1 Backend

- **Herramientas**: Spring Boot Test, MockMvc.
- **Alcance**:
    - **Repositorios**: Verificar que las consultas personalizadas a la base de datos funcionan correctamente sobre una base de datos de prueba en memoria (H2).
    - **Controladores REST**: Usar `MockMvc` para realizar peticiones HTTP a los endpoints y verificar las respuestas, el mapeo de JSON (DTOs) y la correcta delegación a la capa de servicios.

## 5. Pruebas de Rendimiento 

El objetivo de este apartado es definir la estrategia para evaluar el comportamiento, la estabilidad y la escalabilidad del sistema bajo diferentes niveles de demanda. Para ello, se utilizará la herramienta de simulación **Locust**, la cual nos permitirá generar tráfico de usuarios y evaluar el rendimiento del backend de la aplicación.

- **Alcance por Módulos**: Principalmente los módulos de **Catálogo** (Búsquedas concurrentes) y **Alquiler/Pago** (Creación masiva de transacciones).
### 5.1. Test de Carga

- **Objetivo:** Validar que el sistema funciona correctamente y mantiene tiempos de respuesta aceptables bajo el volumen de tráfico esperado (menos de 200 usuarios)
    
- **Descripción:** Se probará el sistema **incrementando el número de usuarios concurrentes gradualmente** para observar la evolución del rendimiento de la aplicación. 
    
- **Criterios de Éxito:** El sistema debe superar estabilizando los tiempos de respuesta por debajo de los 2 segundos (2000 ms) y manteniendo una tasa de error inferior al 1%.
    
### 5.2. Test de Estrés

- **Objetivo:** Identificar el punto de ruptura de la infraestructura y del software.
    
- **Descripción:** A diferencia del test de carga, aquí se inyectará una cantidad extrema de tráfico que superará con creces las expectativas de uso normal. El propósito es **saber el número máximo absoluto de usuarios concurrentes** que la aplicación y la base de datos pueden soportar antes de colapsar, bloquearse o empezar a devolver errores constantes.
    
- **Criterios de Éxito:** Más que evitar la caída , el éxito reside en conocer el límite exacto del sistema actual, observar cómo se degrada el rendimiento y comprobar si el sistema es capaz de recuperarse adecuadamente una vez que cesa el ataque de estrés.

## 6. Pruebas de Aceptación

Validan que el sistema cumple con los requerimientos desde el punto de vista del usuario final, actualmente cubren las funcionalidades principales. Se redactan usando el formato Given-When-Then.
Se implementarán mediante el testing de interfaz de usuario, replicando el procedimiento de cada caso de prueba y grabandolo en scripts para poder ejecutar los tests de manera automatizada. 

- **Alcance por Módulos**: Todos los Casos de Uso (CU) descritos a continuación.

### 6.1 CU-GENERAL-01 - Registro

**Escenario:** Un usuario desea registrarse.

- **Dado:** El usuario se encuentra en la pantalla inicial de inicio de sesión sin autenticarse y pulsa sobre "¿No tienes cuenta? Regístrate" y hay un usuario existente en la base de datos con email "tenant@example.com".

- **Cuando:** Rellena el formulario con los datos de los casos de prueba y presiona el botón "Registrarse".

- **Entonces:** El sistema debe crear la cuenta de usuario con rol "USER", crear un monedero, iniciar sesión y redirigir al usuario a la página principal en caso de éxito, o mostrar un mensaje de error en caso contrario.

| **Caso de Prueba** | **Datos a introducir (Test Data)** | **Resultado Esperado** | **Reglas de Negocio Cubiertas** |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **P-01: Registro exitoso** | **Nombre completo:** "Peter Parker"<br><br>**Correo electrónico:** "peterparker@email.com"<br><br>**Teléfono:** "866434410"<br><br>**Dirección:** "Calle Ingram, 20"<br><br>**Contraseña:** "notspiderman1234"<br><br>**Repetir contraseña:** "notspiderman1234"<br><br>**País:** "Spain"<br><br>**Ciudad:** "Sevilla" | El sistema crea la cuenta de usuario con rol "USER", crea su monedero, inicia sesión y redirige al usuario a la página principal. | RN-USR-01<br>RN-USR-02<br>RN-USR-03<br>RN-USR-04<br>RN-USR-05<br>RN-USR-06<br>RN-USR-07<br>RN-USR-08<br>RN-USR-09<br>RN-USR-10<br>RN-USR-12<br>RN-USR-15<br>RN-SEG-01<br>RN-SEG-02<br>RN-SEG-06 |
| **P-02: Fallo - Campos vacíos** | Cada uno de los campos obligatorios: sin rellenar | El sistema impide el registro y muestra un error indicando que los campos obligatorios se deben rellenar. | RN-USR-02<br>RN-USR-03<br>RN-USR-04<br>RN-USR-05<br>RN-USR-06<br>RN-USR-07<br>RN-USR-08 |
| **P-03: Fallo - Email duplicado** | **Nombre completo:** "Bruce Wayne"<br><br>**Correo electrónico:** "tenant@example.com" (ya registrado)<br><br>**Teléfono:** "123456789"<br><br>**Dirección:** "Calle Gotham, 1"<br><br>**Contraseña:** "batman123"<br><br>**Repetir contraseña:** "batman123"<br><br>**País:** "Spain"<br><br>**Ciudad:** "Madrid" | El sistema impide el registro y muestra un error indicando que el email ya está en uso. | RN-USR-01 |
| **P-04: Fallo - Email con formato inválido** | **Nombre completo:** "Clark Kent"<br><br>**Correo electrónico:** "clarkkent@email.com"<br><br>**Teléfono:** "987654321"<br><br>**Dirección:** "Calle Metropolis, 10"<br><br>**Contraseña:** "superman123"<br><br>**Repetir contraseña:** "superman123"<br><br>**País:** "Spain"<br><br>**Ciudad:** "Barcelona" | El sistema impide el registro y muestra un error indicando que el formato del correo no es válido. | RN-USR-02 |
| **P-05: Fallo - Contraseña demasiado corta** | **Nombre completo:** "Diana Prince"<br><br>**Correo electrónico:** "diana@amazon.com"<br><br>**Teléfono:** "654321987"<br><br>**Dirección:** "Calle Themyscira, 8"<br><br>**Contraseña:** "123"<br><br>**Repetir contraseña:** "123"<br><br>**País:** "Spain"<br><br>**Ciudad:** "Valencia" | El sistema impide el registro y muestra un error indicando que la contraseña debe tener al menos 6 caracteres. | RN-USR-03 |

---

### 6.2 CU-GENERAL-01 - Inicio de sesión

**Escenario:** Un usuario desea iniciar sesión.

- **Dado:** El usuario se encuentra en la pantalla inicial de inicio de sesión y hay un usuario existente en la base de datos con email "tenant@example.com" y contraseña "password123".

- **Cuando:** Rellena el formulario con los datos de los casos de prueba y presiona el botón "Iniciar sesión".

- **Entonces:** El sistema debe iniciar sesión y redirigir al usuario a la página principal en caso de éxito, o mostrar un mensaje de error en caso contrario.

| **Caso de Prueba** | **Datos a introducir (Test Data)** | **Resultado Esperado** | **Reglas de Negocio Cubiertas** |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **P-01: Inicio de sesión exitoso** | **Correo electrónico:** "tenant@example.com"<br><br>**Contraseña:** "password123" | El sistema inicia sesión al usuario y le redirige a la página principal. | RN-USR-01<br>RN-USR-02<br>RN-USR-09<br>RN-SEG-01<br>RN-SEG-02<br>RN-SEG-03<br>RN-SEG-07 |
| **P-02: Fallo - Campos vacíos** | Cada uno de los campos obligatorios: sin rellenar | El sistema impide el inicio de sesión y muestra un error indicando que los campos obligatorios se deben rellenar. | RN-USR-02<br>RN-USR-09 |
| **P-03: Fallo - Correo no registrado** | **Correo electrónico:** "noexiste@email.com"<br><br>**Contraseña:** "password123" | El sistema impide el inicio de sesión y muestra un error indicando que no existe una cuenta con el correo indicado. | RN-USR-01<br>RN-USR-02<br>RN-SEG-01 |
| **P-04: Fallo - Contraseña incorrecta** | **Correo electrónico:** "tenant@example.com"<br><br>**Contraseña:** "wrongpassword" | El sistema impide el inicio de sesión y muestra un error indicando que la contraseña es incorrecta. | RN-USR-09<br>RN-SEG-01<br>RN-SEG-06 |

---

### 6.3 CU-GENERAL-02 - Edición de perfil

**Escenario:** Un usuario desea editar su perfil.

- **Dado:** El usuario se ha autenticado y se encuentra en la pantalla de "Editar perfil".

- **Cuando:** Rellena el formulario con los datos de los casos de prueba y presiona el botón "Guardar cambios".

- **Entonces:** El sistema debe modificar los datos del usuario y persistirlos en la base de datos en caso de éxito, o mostrar un mensaje de error en caso contrario.

| **Caso de Prueba** | **Datos a introducir (Test Data)** | **Resultado Esperado** | **Reglas de Negocio Cubiertas** |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **P-01: Edición exitosa** | **Nombre completo:** "Miles Morales"<br><br>**Teléfono:** "123456789"<br><br>**Dirección:** "Calle Graham, 10"<br><br>**País:** "United Kingdom"<br><br>**Ciudad:** "London" | El sistema modifica los datos del usuario y los persiste en la base de datos. | RN-USR-04<br>RN-USR-05<br>RN-USR-06<br>RN-USR-07<br>RN-USR-08<br>RN-USR-13 |
| **P-02: Fallo - Campos vacíos** | Cada uno de los campos obligatorios: sin rellenar | El sistema impide la edición del perfil y muestra un error indicando que los campos obligatorios se deben rellenar. | RN-USR-04<br>RN-USR-05<br>RN-USR-06<br>RN-USR-07<br>RN-USR-08<br>RN-USR-13 |

---

### 6.4 CU-GENERAL-03 - Crear valoración (arrendatario → arrendador)

**Escenario:** Un arrendatario desea crear una valoración sobre un arrendador tras participar en un kit.

- **Dado:** El usuario está autenticado, ha participado en un kit válido en estado "FINISHED" y accede a la pantalla de detalles del kit donde accede al apartado "Valorar kit".

- **Cuando:** Rellena el formulario con los datos de los casos de prueba y presiona el botón "Enviar Valoración".

- **Entonces:** El sistema debe registrar la valoración en caso de éxito, o mostrar un mensaje de error en caso contrario.

| **Caso de Prueba** | **Datos a introducir (Test Data)** | **Resultado Esperado** | **Reglas de Negocio Cubiertas** |
|----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| **P-01: Creación exitosa** | **Puntuación:** 5<br><br>**Comentario:** "Todo perfecto"<br><br>**Kit:** válido<br><br>**Reviewer:** arrendatario<br><br>**Reviewee:** propietario | El sistema crea la valoración con tipo `RENTER_TO_OWNER`, registra la fecha automáticamente y la persiste. | RN-VAL-01<br>RN-VAL-02<br>RN-VAL-05<br>RN-VAL-06<br>RN-VAL-08 |
| **P-02: Fallo - Comentario demasiado largo** | **Puntuación:** 3<br><br>**Comentario:** texto > 1000 caracteres<br><br>**Kit:** válido | El sistema impide la creación y muestra error indicando que el comentario excede el límite permitido. | RN-VAL-02 |
| **P-03: Fallo - Auto-valoración** | **Reviewer = Reviewee** | El sistema impide la creación y muestra error indicando que un usuario no puede valorarse a sí mismo. | RN-VAL-03 |
| **P-04: Fallo - Valoración duplicada por kit** | **Reviewer, Reviewee, Kit** ya existentes | El sistema impide la creación y muestra error indicando que ya existe una valoración para ese kit. | RN-VAL-04 |
| **P-05: Fallo - Usuario no participante en el kit** | **Reviewer:** usuario ajeno al kit | El sistema impide la creación y muestra error indicando que no tiene permisos para valorar ese kit. | RN-VAL-06 |

---

### 6.5 CU-GENERAL-03 - Crear valoración (arrendador → arrendatario)

**Escenario:** Un arrendador desea crear una valoración sobre un arrendatario tras alquilar su producto.

- **Dado:** El usuario está autenticado, ha participado en un kit válido en estado "FINISHED" y accede a la pantalla de historial de alquileres de un objeto donde selecciona la instancia del objeto en el kit para valorar y se encuentra en la pantalla "Valorar kit".

- **Cuando:** Rellena el formulario con los datos de los casos de prueba y presiona el botón "Enviar Valoración".

- **Entonces:** El sistema debe registrar la valoración en caso de éxito, o mostrar un mensaje de error en caso contrario.

| **Caso de Prueba** | **Datos a introducir (Test Data)** | **Resultado Esperado** | **Reglas de Negocio Cubiertas** |
|----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| **P-01: Creación exitosa** | **Puntuación:** 4<br><br>**Comentario:** "Buen trato al objeto"<br><br>**Kit:** válido<br><br>**Reviewer:** propietario<br><br>**Reviewee:** arrendatario | El sistema crea la valoración con tipo `OWNER_TO_RENTER`, registra la fecha automáticamente y la persiste. | RN-VAL-01<br>RN-VAL-02<br>RN-VAL-05<br>RN-VAL-06<br>RN-VAL-08 |
| **P-02: Fallo - Comentario demasiado largo** | **Puntuación:** 3<br><br>**Comentario:** texto > 1000 caracteres<br><br>**Kit:** válido | El sistema impide la creación y muestra error indicando que el comentario excede el límite permitido. | RN-VAL-02 |
| **P-03: Fallo - Auto-valoración** | **Reviewer = Reviewee** | El sistema impide la creación y muestra error indicando que un usuario no puede valorarse a sí mismo. | RN-VAL-03 |
| **P-04: Fallo - Valoración duplicada por kit** | **Reviewer, Reviewee, Kit** ya existentes | El sistema impide la creación y muestra error indicando que ya existe una valoración para ese kit. | RN-VAL-04 |
| **P-05: Fallo - Usuario no participante en el kit** | **Reviewer:** usuario ajeno al kit | El sistema impide la creación y muestra error indicando que no tiene permisos para valorar ese kit. | RN-VAL-06 |

---

### 6.6 CU-GENERAL-03 - Consulta de valoraciones

**Escenario:** Un usuario desea consultar las valoraciones de otro usuario.

- **Dado:** Es usuario está autenticado y existen valoraciones registradas en el sistema para un usuario.

- **Cuando:** Un usuario accede al apartado de valoraciones de otro usuario.

- **Entonces:** El sistema muestra las valoraciones recibidas.

| **Caso de Prueba** | **Datos a introducir (Test Data)** | **Resultado Esperado** | **Reglas de Negocio Cubiertas** |
|----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| **P-01: Consulta exitosa** | **Usuario consultado:** con valoraciones | El sistema muestra la lista de valoraciones recibidas correctamente. | RN-VAL-09 |
| **P-02: Usuario sin valoraciones** | **Usuario consultado:** sin valoraciones | El sistema muestra un mensaje indicando que no hay valoraciones disponibles. | RN-VAL-09 |

### 6.7 CU-ARRENDADOR-01 - Subida de artículos

**Escenario:** Un usuario sube un artículo.

- **Dado:** El usuario ha iniciado sesión, hay una categoría llamada "Acampada" creada en la aplicación con estado "ACTIVE", ha accedido a la página de "Mis Artículos" y pulsa el botón de subir artículo.
    
- **Cuando:** Rellena el formulario con los datos de los casos de prueba y presiona el botón "Publicar".
    
- **Entonces:** El sistema debe mostrar un mensaje de éxito o de error en función de el caso de prueba. En caso de éxito, el artículo subido debe aparecer en su lista de artículos publicados.
    
| **Caso de Prueba**                      | **Datos a introducir (Test Data)**                                                                                                                                                                                                                                                  | **Resultado Esperado**                                                                                                  | **Reglas de Negocio Cubiertas**                                                                                                    |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **P-01: Subida exitosa**                | **Título:** "Tienda de campaña"<br><br>**Desc:** "Ideal para 4 personas"<br><br><br>**Ciudad:** "Madrid"<br><br>**Precio/mes**:(dentro del rango categoría)<br><br>Categoría: "Acampada" <br>  <br>Fechas: Disponible desde hoy hasta hoy+30 días<br><br>Fotos: 2 imágenes adjuntas | Mensaje de éxito. El artículo se guarda en estado `AVAILABLE`. Las unidades se fijan a 1. La imagen se guarda en la app | RN-ART-02, RN-ART-03, RN-ART-04, RN-ART-05, RN-ART-06, RN-ART-07, RN-ART-09, RN-ART-10, RN-ART-11, RN-ART-12, RN-ART-21, RN-CAT-09 |
| **P-02: Fallo - Precio fuera de rango** | Precio/mes:(fuera del rango máximo de la categoría)                                                                                                                                                                                                                                 | El sistema muestra un error de validación indicando que el precio excede el máximo recomendado por la categoría.        | RN-ART-06, RN-CAT-06, RN-CAT-07, RN-CAT-08, RN-PRE-14                                                                              |
| **P-03: Fallo - Fechas inválidas**      | Fecha de disponibilidad inicial (`availableFrom`): Fecha de ayer                                                                                                                                                                                                                    | El sistema impide la publicación y muestra un error indicando que la fecha inicial no puede ser en el pasado.           | RN-ART-10                                                                                                                          |
| **P-03: Fallo - Campos Vacíos**         | Cada uno de los campos obligatorios: sin rellenar                                                                                                                                                                                                                                   | El sistema impide la publicación y muestra un error indicando que los campos obligatorios se deben rellenar.            | RN-ART-02, RN-ART-03, RN-ART-04, RN-ART-05, RN-ART-06, RN-ART-07, RN-ART-09, RN-ART-10, RN-ART-11                                  |

---

### 6.8 CU-ARRENDATARIO-01 - Creación de kits

**Escenario:** Un usuario crea y alquila un kit.

- **Dado:** El usuario ha iniciado sesión, y hay dos artículos subidos por otro usuario. El usuario ha accedido al formulario de "Crear Kit"
    
- **Cuando:** El usuario rellena los campos con los datos de los casos de prueba y confirma el pago.
    
- **Entonces:** Si es un caso de prueba exitoso, el sistema aprueba la transacción y el estado del kit cambia a "Alquilado" para esas fechas.
    

| **Caso de Prueba**                             | **Datos a introducir (Test Data)**                                                                                                                                                                                                                              | **Resultado Esperado**                                                                                                                              | **Reglas de Negocio Cubiertas**                                                                               |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **P-01: Creación y pago exitoso**              | **Nombre Kit:** "Kit Montaña"<br><br>**País:** "España"<br>                                    **Ciudad:** "Madrid"<br><br>**Fechas:** Mañana a Pasado mañana<br><br>Artículos: los dos artículos subidos<br><br>Tarjeta: 16 dígitos, CVV 3 dígitos, Exp: 12/28 | Pago aprobado. El kit pasa al estado `PAID` (o `ACTIVE` tras validación). Se envía email de confirmación. El arrendador recibe el 50% en su wallet. | RN-KIT-02, RN-KIT-03, RN-KIT-04, RN-KIT-05, RN-KIT-06, RN-KIT-10, RN-KIT-11, RN-PAG-01 a RN-PAG-07, RN-NOT-01 |
| **P-02: Fallo - Campos Vacíos**                | Cada uno de los campos obligatorios: sin rellenar                                                                                                                                                                                                               | El sistema impide pasar al pago del kit y muestra un error indicando que los campos obligatorios se deben rellenar.                                 | RN-KIT-02, RN-KIT-03, RN-KIT-04, RN-KIT-05, RN-KIT-06, RN-KIT-10, RN-KIT-11                                   |


---

### 6.9 CU-ARRENDATARIO-05 - Seguimiento de alquileres activos

**Escenario:** Un usuario revisa los kits que ha alquilado.

- **Dado:** El usuario tiene una sesión activa y ha creado previamente dos kits.
    
- **Cuando:** Navega a la sección de "Mis Kits" en su perfil.
    
- **Entonces:** El sistema debe mostrar una lista con exactamente esos dos kits, incluyendo sus nombres, imágenes principales y estado.
    

| **Caso de Prueba**               | **Datos a introducir (Test Data)**                                                                       | **Resultado Esperado**                                                                                                | **Reglas de Negocio Cubiertas**                       |
| -------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **P-01: Visualización correcta** | Usuario Arrendatario que tiene en base de datos: 1 kit en estado `ACTIVE` y 1 kit en estado `COMPLETED`. | Se listan exactamente los 2 kits. Se muestra la fecha de devolución obligatoriamente para el que está activo.         | RN-KIT-15, RN-KIT-16, RN-KIT-17, RN-KIT-20, RN-KIT-21 |
| **P-02: Privacidad de kits**     | Usuario A intenta acceder a la URL o endpoint del seguimiento del Kit del Usuario B.                     | El sistema deniega el acceso (Error 403 Forbidden), garantizando que el seguimiento solo lo ve el arrendatario dueño. | RN-KIT-17                                             |

---

### 6.10 CU-ARRENDATARIO-06 - Confirmar recepción de kit

**Escenario:** Un usuario desea confirmar que ha recibido satisfactoriamente un kit.

- **Dado:** El usuario está autenticado, ha alquilado un kit el cual se encuentra en estado "PAID" y se encuentra en la página de "Detalle del kit".

- **Cuando:** El usuario pulsa en el botón "Confirmar recepción" y luego en "Aceptar".

- **Entonces:** El sistema confirma la recepción del kit y cambia su estado a "ACTIVE" en la base de datos.

| **Caso de Prueba** | **Datos a introducir (Test Data)** | **Resultado Esperado** | **Reglas de Negocio Cubiertas** |
|----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| **P-01: Confirmación exitosa** | **Usuario que confirma:** usuario dueño del kit | El sistema confirma la recepción del kit y cambia su estado a "ACTIVE" en la base de datos. | RN-KIT-18 |
| **P-02: Fallo - Usuario no dueño** | **Usuario que confirma:** usuario no dueño del kit | El sistema muestra un mensaje indicando que el usuario no es dueño del kit cuya recepción a confirmar. | RN-KIT-18 |

---

### 6.11 CU-ARRENDADOR-02 - Listado de artículos subidos

**Escenario:** Un usuario revisa su inventario de artículos subidos en la aplicación.

- **Dado:** El usuario tiene una sesión activa y tiene dos artículos subidos previamente.
    
- **Cuando:** Hace clic en la pestaña "Mis Artículos".
    
- **Entonces:** La pantalla muestra un listado paginado con sus dos artículos subidos, permitiendo acceder a los detalles o edición de cada uno.
    

| **Caso de Prueba**                     | **Datos a introducir (Test Data)**                                                                                | **Resultado Esperado**                                                                                                               | **Reglas de Negocio Cubiertas** |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| **P-01: Visualización y estado**       | Usuario Arrendador con 2 artículos propios en la base de datos: 1 artículo (`AVAILABLE`) y 1 artículo (`RENTED`). | Se listan ambos artículos. Uno muestra su etiqueta de `RENTED` y visualiza la fecha de recuperación (`availableUntil` del alquiler). | RN-ART-13, RN-ART-25, RN-ART-27 |
| **P-02: Filtro por estado**            | En la vista "Mis artículos", el usuario selecciona el filtro: Estado = `RENTED`                                   | La lista se actualiza para mostrar únicamente el artículo con estado RENTED. El otro artículo se oculta.                             | RN-ART-26                       |
| **P-03: Bloqueo de edición alquilado** | El usuario hace clic en "Editar" sobre el artículo que está `RENTED`.                                             | El sistema desactiva el botón o muestra un error indicando que un artículo alquilado no puede ser editado ni eliminado.              | RN-ART-15, RN-ART-16            |

## 7. Procedimiento de Reporte y Gestión de Bugs

Este apartado define el ciclo de vida de un bug desde que es detectado durante las pruebas hasta que es resuelto e integrado en la aplicación. 
Este procedimiento solo aplica a bugs de funcionalidades fusionadas a ramas comunes (develop, main)

### 7.1. Identificación y Creación de la Issue

Cuando un desarrollador un comportamiento anómalo que no cumple con los Criterios de Aceptación, debe crear una _Issue_ en el repositorio. La Issue debe contener como mínimo:

- **Título descriptivo:** Breve resumen del error.
    
- **Descripción:** Lista de acciones exactas para replicar el bug.
    
- **Comportamiento esperado vs. Comportamiento actual:** Qué debería hacer el sistema y qué hace realmente.
    
- **Evidencias:** Capturas de pantalla, vídeos o logs de error de la consola.
    
- **Etiquetas:** Clasificación del tipo de issue (ej. `bug`, `frontend`, `backend`, `alta-prioridad`).

### 7.2. Comunicación y asignación del responsable

Un vez creada la issue y documentada la información de error, se informará por los sistemas de comunicaciones del proyecto del error encontrado y en función de la prioridad estimada para la resolución del error se decidirá el encargado de resolverlo.

### 7.3. Resolución y Política de Ramas

La rama a crear y los commits de cambios se realizarán siguiendo el documento de politica-commits-ramas-archivos.md subido al repositorio.
El desarrollador asignado creará una nueva rama partiendo de la rama principal y corregirá el defecto en el código actualizando o creando nuevas pruebas unitarias para asegurar que el bug no vuelva a ocurrir, en caso de que sea necesario.

### 7.4. Verificación y Cierre

1. **Pull Request (PR):** Una vez solucionado, se abrirá un PR hacia la rama principal.
    
2. **Integración Continua (CI):** La creación del PR lanzará automáticamente los workflows de GitHub Actions (tests de backend y frontend) para asegurar que la corrección no rompe otras partes del sistema.
    
4. **Code Review:** Una persona asignada realizará una revisión del código actualizado.
    
5. **Merge y Cierre:** Si los tests pasan en verde y el PR es aprobado, se integra el código (`merge`). La Issue asociada se moverá automáticamente a "Done" y el tiempo invertido deberá quedar registrado en Clockify.

---

## 8. Historial de versiones

| Versión | Fecha       | Descripción                                   | Autor(es)               |
|---------|-------------|-----------------------------------------------|-------------------------|
| 1.0.0   | 10/03/2026  | Primera versión del documento de Plan de Pruebas | Guillermo García León |
| 1.1.0 | 23/03/2026 | Inclusión de módulos, orden de ejecución y frameworks | Ismael Carrasco Mkhazni |

---

**Redactado por:** Guillermo García León
**Fecha de redacción:** 10/03/2026
**Versión:** 1.1.0
