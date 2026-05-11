# Casos de uso core

## Índice del documento

1. [Generales](#1-generales)  
   1.1. [CU-GENERAL-01: Registro e inicio de sesión](#11-cu-general-01-registro-e-inicio-de-sesión)  
   1.2. [CU-GENERAL-02: Gestión de datos personales](#12-cu-general-02-gestión-de-datos-personales)  
   1.3. [CU-GENERAL-03: Valoraciones](#13-cu-general-03-valoraciones)  
   1.4. [CU-GENERAL-04: Soporte](#14-cu-general-04-soporte)
2. [Arrendador](#2-arrendador)  
   2.1. [CU-ARRENDADOR-01: Subida de artículos](#21-cu-arrendador-01-subida-de-artículos)  
   2.2. [CU-ARRENDADOR-02: Listado de artículos subidos](#22-cu-arrendador-02-listado-de-artículos-subidos)  
   2.3. [CU-ARRENDADOR-03: Gestión de artículos subidos](#23-cu-arrendador-03-gestión-de-artículos-subidos)
3. [Arrendatario](#3-arrendatario)  
   3.1. [CU-ARRENDATARIO-01: Creación de kits](#31-cu-arrendatario-01-creación-de-kits)  
   3.2. [CU-ARRENDATARIO-02: Visualización dinámica de precios](#32-cu-arrendatario-02-visualización-dinámica-de-precios)  
   3.3. [CU-ARRENDATARIO-03: Gestión logística del alquiler](#33-cu-arrendatario-03-gestión-logística-del-alquiler)  
   3.4. [CU-ARRENDATARIO-04: Pago del kit](#34-cu-arrendatario-04-pago-del-kit)  
   3.5. [CU-ARRENDATARIO-05: Seguimiento de alquileres activos](#35-cu-arrendatario-05-seguimiento-de-alquileres-activos)
4. [Administrador](#4-administrador)  
   4.1. [CU-ADMIN-01: Gestión de categorías](#41-cu-admin-01-gestión-de-categorías)  
   4.2. [CU-ADMIN-02: Listado de usuarios](#42-cu-admin-02-listado-de-usuarios)
5. [Historias de usuario](#5-historias-de-usuario)  
   5.1. [Generales](#51-generales)  
   5.2. [Arrendador](#52-arrendador)  
   5.3. [Arrendatario](#53-arrendatario)  
   5.4. [Administrador](#54-administrador)
6. [Historial de versiones](#6-historial-de-versiones)

## 1. Generales

### 1.1. **CU-GENERAL-01:** Registro e inicio de sesión

| **Elemento**             | **Descripción**                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-GENERAL-01                                                                                               |
| **Nombre**               | Registro e inicio de sesión                                                                                 |
| **Actores**              | Arrendador, arrendatario y administrador                                                                    |
| **Objetivo**             | Los usuarios deben poder registrarse e iniciar sesión en la aplicación                                      |
| **Precondiciones**       | -                                                                                                           |
| **Flujo principal**      | 1. Iniciar la aplicación <br> 2. Rellenar los datos de registro <br> 3. Iniciar sesión con las credenciales |
| **Excepciones**          | -                                                                                                           |
| **Resultado**            | El usuario accede a la pantalla "Home"                                                                      |
| **Historias de usuario** | HU-ARRENDATARIO-01 <br> HU-ARRENDATARIO-02 <br> HU-ARRENDADOR-09 <br> HU-ADMIN-13                           |

### 1.2. **CU-GENERAL-02:** Gestión de datos personales

| **Elemento**             | **Descripción**                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-GENERAL-02                                                                                                                               |
| **Nombre**               | Gestión de datos personales                                                                                                                 |
| **Actores**              | Arrendador, arrendatario y administrador                                                                                                    |
| **Objetivo**             | Los usuarios deben poder editar sus datos personales                                                                                        |
| **Precondiciones**       | -                                                                                                                                           |
| **Flujo principal**      | 1. Ir al apartado de perfil <br> 2. Pulsar el botón para editar el perfil <br> 3. Editar los datos que se desee <br> 4. Guardar los cambios |
| **Excepciones**          | -                                                                                                                                           |
| **Resultado**            | Datos personales actualizados                                                                                                               |
| **Historias de usuario** | HU-ARRENDATARIO-03 <br> HU-ARRENDATARIO-42 <br> HU-ARRENDADOR-35                                                                            |

### 1.3. **CU-GENERAL-03:** Valoraciones

| **Elemento**             | **Descripción**                                                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-GENERAL-03                                                                                                              |
| **Nombre**               | Valoraciones                                                                                                               |
| **Actores**              | Arrendador y arrendatario                                                                                                  |
| **Objetivo**             | Los usuarios deben poder valorar al resto de usuarios en calidad de arrendador y arrendatario                              |
| **Precondiciones**       | -                                                                                                                          |
| **Flujo principal**      | 1. Acceder al perfil del usuario a valorar <br> 2. Pulsar el botón para añadir una valoración <br> 3. Enviar la valoración |
| **Excepciones**          | -                                                                                                                          |
| **Resultado**            | Valoración creada                                                                                                          |
| **Historias de usuario** | HU-ARRENDATARIO-34 <br> HU-ARRENDADOR-29                                                                                   |

### 1.4. **CU-GENERAL-04:** Soporte

| **Elemento**             | **Descripción**                                                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-GENERAL-04                                                                                                                |
| **Nombre**               | Soporte                                                                                                                      |
| **Actores**              | Arrendador, arrendatario y administrador                                                                                     |
| **Objetivo**             | Los usuarios deben poder acceder a un formulario de incidencias                                                              |
| **Precondiciones**       | -                                                                                                                            |
| **Flujo principal**      | 1. Acceder al apartado de soporte <br> 2. Pulsar el botón para acceder al formulario <br> 3. Rellenar y enviar el formulario |
| **Excepciones**          | -                                                                                                                            |
| **Resultado**            | Incidencia enviada con éxito                                                                                                 |
| **Historias de usuario** | HU-GENERAL-01 <br> HU-ARRENDATARIO-33                                                                                        |

## 2. Arrendador

### 2.1. **CU-ARRENDADOR-01:** Subida de artículos

| **Elemento**             | **Descripción**                                                                                                                                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**                   | CU-ARRENDADOR-01                                                                                                                                                                                                                                                   |
| **Nombre**               | Subida de artículos                                                                                                                                                                                                                                                |
| **Actores**              | Arrendador                                                                                                                                                                                                                                                         |
| **Objetivo**             | Los usuarios deben poder subir artículos para ponerlos en alquiler                                                                                                                                                                                                 |
| **Precondiciones**       | -                                                                                                                                                                                                                                                                  |
| **Flujo principal**      | 1. Pulsar sobre el botón "Subir artículo" <br> 2. Rellenar los datos del artículo <br> 3. Confirmar la subida del artículo                                                                                                                                         |
| **Excepciones**          | -                                                                                                                                                                                                                                                                  |
| **Resultado**            | Artículo subido a la aplicación                                                                                                                                                                                                                                    |
| **Historias de usuario** | HU-ARRENDADOR-01 <br> HU-ARRENDADOR-10 <br> HU-ARRENDADOR-11 <br> HU-ARRENDADOR-12 <br> HU-ARRENDADOR-13 <br> HU-ARRENDADOR-14 <br> HU-ARRENDADOR-15 <br> HU-ARRENDADOR-16 <br> HU-ARRENDADOR-17 <br> HU-ARRENDADOR-26 <br> HU-ARRENDADOR-27 <br> HU-ARRENDADOR-28 |

### 2.2. **CU-ARRENDADOR-02:** Listado de artículos subidos

| **Elemento**             | **Descripción**                                                                   |
| ------------------------ | --------------------------------------------------------------------------------- |
| **ID**                   | CU-ARRENDADOR-02                                                                  |
| **Nombre**               | Listado de artículos subidos                                                      |
| **Actores**              | Arrendador                                                                        |
| **Objetivo**             | El usuario debe poder ver todos los artículos que tiene subidos en el momento     |
| **Precondiciones**       | -                                                                                 |
| **Flujo principal**      | 1. Acceder al apartado perfil <br> 2. Dentro del perfil acceder a "Mis artículos" |
| **Excepciones**          | -                                                                                 |
| **Resultado**            | -                                                                                 |
| **Historias de usuario** | HU-ARRENDADOR-04 <br> HU-ARRENDADOR-19                                            |

### 2.3. **CU-ARRENDADOR-03:** Gestión de artículos subidos

| **Elemento**             | **Descripción**                                                                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-ARRENDADOR-03                                                                                                                                   |
| **Nombre**               | Gestión de artículos subidos                                                                                                                       |
| **Actores**              | Arrendador                                                                                                                                         |
| **Objetivo**             | Los usuarios deben poder modificar o eliminar los artículos subidos                                                                                |
| **Precondiciones**       | -                                                                                                                                                  |
| **Flujo principal**      | 1. Entrar en algún artículo <br> 2. Eliminar o editar el artículo <br> 3. En caso de editar el artículo, cambiar los datos y confirmar los cambios |
| **Excepciones**          | Si el artículo está alquilado en ese momento, no podrá eliminarlo ni editarlo                                                                      |
| **Resultado**            | -                                                                                                                                                  |
| **Historias de usuario** | HU-ARRENDADOR-07 <br> HU-ARRENDADOR-08 <br> HU-ARRENDADOR-18                                                                                       |

## 3. Arrendatario

### 3.1. **CU-ARRENDATARIO-01:** Creación de kits

| **Elemento**             | **Descripción**                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**                   | CU-ARRENDATARIO-01                                                                                                                                                                                                                                                                                                                                                                         |
| **Nombre**               | Creación de kits                                                                                                                                                                                                                                                                                                                                                                           |
| **Actores**              | Arrendatario                                                                                                                                                                                                                                                                                                                                                                               |
| **Objetivo**             | El arrendatario debe poder crear kits personalizados para alquilarlos                                                                                                                                                                                                                                                                                                                      |
| **Precondiciones**       | -                                                                                                                                                                                                                                                                                                                                                                                          |
| **Flujo principal**      | 1. Pulsar en el botón "Alquilar kit" <br> 2. Rellenar los datos del alquiler del kit <br> 3. Añadir los productos a alquilar <br> 4. Pulsar el botón "Pagar kit"                                                                                                                                                                                                                           |
| **Excepciones**          | -                                                                                                                                                                                                                                                                                                                                                                                          |
| **Resultado**            | Se accederá a la pantalla de pago del kit                                                                                                                                                                                                                                                                                                                                                  |
| **Historias de usuario** | HU-ARRENDATARIO-04 <br> HU-ARRENDATARIO-05 <br> HU-ARRENDATARIO-06 <br> HU-ARRENDATARIO-07 <br> HU-ARRENDATARIO-08 <br> HU-ARRENDATARIO-09 <br> HU-ARRENDATARIO-12 <br> HU-ARRENDATARIO-13 <br> HU-ARRENDATARIO-16 <br> HU-ARRENDATARIO-26 <br> HU-ARRENDATARIO-27 <br> HU-ARRENDATARIO-28 <br> HU-ARRENDATARIO-29 <br> HU-ARRENDATARIO-30 <br> HU-ARRENDATARIO-31 <br> HU-ARRENDATARIO-32 |

### 3.2. **CU-ARRENDATARIO-02:** Visualización dinámica de precios

| **Elemento**             | **Descripción**                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-ARRENDATARIO-02                                                                                                                                                  |
| **Nombre**               | Visualización dinámica de precios                                                                                                                                   |
| **Actores**              | Arrendatario                                                                                                                                                        |
| **Objetivo**             | El arrendatario debe poder ver el precio individual de cada objeto o servicio, y el precio total del kit en función de la duración del alquiler                     |
| **Precondiciones**       | -                                                                                                                                                                   |
| **Flujo principal**      | 1. Pantalla de creación de kits <br> 2. Cada artículo lleva su precio individual asignado <br> 3. En la parte inferior de la pantalla, se observará el precio total |
| **Excepciones**          | -                                                                                                                                                                   |
| **Resultado**            | -                                                                                                                                                                   |
| **Historias de usuario** | HU-ARRENDATARIO-14 <br> HU-ARRENDATARIO-15 <br> HU-ARRENDATARIO-35 <br> HU-ARRENDATARIO-36 <br> HU-ARRENDADOR-03                                                    |

### 3.3. **CU-ARRENDATARIO-03:** Gestión logística del alquiler

| **Elemento**             | **Descripción**                                                                                                                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-ARRENDATARIO-03                                                                                                                                                                                          |
| **Nombre**               | Gestión logística del alquiler                                                                                                                                                                              |
| **Actores**              | Arrendatario                                                                                                                                                                                                |
| **Objetivo**             | El arrendatario debe poder elegir el método de entrega (mensajería o punto de encuentro) y ver detalles logísticos                                                                                          |
| **Precondiciones**       | -                                                                                                                                                                                                           |
| **Flujo principal**      | 1. Pantalla de creación de kits <br> 2. Acceder a alguno de los artículos añadidos <br> 3. Elegir el método de entrega <br> 4. Acceder a detalles del kit <br> 5. Ir a la sección "Ver detalles logísticos" |
| **Excepciones**          | -                                                                                                                                                                                                           |
| **Resultado**            | Método de entrega para el artículo seleccionado                                                                                                                                                             |
| **Historias de usuario** | HU-ARRENDATARIO-20 <br> HU-ARRENDATARIO-19 <br> HU-ARRENDADOR-02                                                                                                                                            |

### 3.4. **CU-ARRENDATARIO-04:** Pago del kit

| **Elemento**             | **Descripción**                                                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-ARRENDATARIO-04                                                                                                                     |
| **Nombre**               | Pago del kit                                                                                                                           |
| **Actores**              | Arrendatario                                                                                                                           |
| **Objetivo**             | El arrendatario debe poder pagar el kit de forma segura                                                                                |
| **Precondiciones**       | -                                                                                                                                      |
| **Flujo principal**      | 1. Pantalla de creación de kits <br> 2. Pulsar sobre el botón "Pagar kit" <br> 3. Rellenar los datos de pago <br> 4. Confirmar el pago |
| **Excepciones**          | -                                                                                                                                      |
| **Resultado**            | El kit quedará pagado y aparecerá en "Mis alquileres"                                                                                  |
| **Historias de usuario** | HU-ARRENDATARIO-17                                                                                                                     |

### 3.5. **CU-ARRENDATARIO-05:** Seguimiento de alquileres activos

| **Elemento**             | **Descripción**                                                                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-ARRENDATARIO-05                                                                                                                                          |
| **Nombre**               | Seguimiento de alquileres activos                                                                                                                           |
| **Actores**              | Arrendatario                                                                                                                                                |
| **Objetivo**             | El arrendatario debe poder visualizar el estado de los alquileres vigentes y sus fechas de devolución                                                       |
| **Precondiciones**       | -                                                                                                                                                           |
| **Flujo principal**      | 1. Acceder a la sección "Mis kits" del perfil <br> 2. Entrar en el kit del que queramos ver sus detalles de seguimiento <br> 3. Ver detalles de seguimiento |
| **Excepciones**          | -                                                                                                                                                           |
| **Resultado**            | Visualización de datos de seguimiento                                                                                                                       |
| **Historias de usuario** | HU-ARRENDATARIO-21 <br> HU-ARRENDATARIO-22 <br> HU-ARRENDATARIO-23 <br> HU-ARRENDATARIO-25                                                                  |

## 4. Administrador

### 4.1. **CU-ADMIN-01:** Gestión de categorías

| **Elemento**             | **Descripción**                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-ADMIN-01                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Nombre**               | Gestión de categorías                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **Actores**              | Administrador                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Objetivo**             | El administrador debe poder ver, crear, editar y eliminar categorías de la aplicación                                                                                                                                                                                                                                                                                                                                                                |
| **Precondiciones**       | Tener rol de administrador                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Flujo principal**      | 1. Acceder a la sección "Categorías" <br> 2. Realizar la gestión correspondiente: Para ver, pulsar sobre una categoría, para crear pulsar sobre "Añadir categoría", para editar, pulsar sobre el lápiz en la categoría a editar, y para eliminar, pulsar en el icono de la papelera en la categoría a eliminar. <br> 3. En caso de creación, rellenar los datos y confirmar la creación. En caso de edición, editar los datos y confirmar la edición |
| **Excepciones**          | -                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Resultado**            | -                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Historias de usuario** | HU-ADMIN-01 <br> HU-ADMIN-02 <br> HU-ADMIN-03 <br> HU-ADMIN-09 <br> HU-ADMIN-10                                                                                                                                                                                                                                                                                                                                                                      |

### 4.2. **CU-ADMIN-02:** Listado de usuarios

| **Elemento**             | **Descripción**                                                              |
| ------------------------ | ---------------------------------------------------------------------------- |
| **ID**                   | CU-ADMIN-02                                                                  |
| **Nombre**               | Listado de usuarios                                                          |
| **Actores**              | Administrador                                                                |
| **Objetivo**             | El administrador debe poder ver todos los usuarios registrados en el sistema |
| **Precondiciones**       | Tener rol de administrador                                                   |
| **Flujo principal**      | 1. Acceder a la sección "Usuarios"                                           |
| **Excepciones**          | -                                                                            |
| **Resultado**            | Vista de listado de usuarios                                                 |
| **Historias de usuario** | HU-ADMIN-14                                                                  |

## 5. Historias de usuario

### 5.1. Generales

**HU‑GENERAL‑01**: Como usuario, quiero enviar incidencias desde un formulario, para recibir soporte.

---

### 5.2. Arrendador

**HU-ARRENDADOR-01**: Como arrendador, quiero poder alquilar objetos que poseo, para obtener ganancias.

**HU-ARRENDADOR-02**: Como arrendador, quiero que la gestión de los envíos sea lo más sencilla posible, para maximizar el número de días que pueda alquilar mis objetos.

**HU-ARRENDADOR-04**: Como arrendador, quiero ver todos los objetos que tengo en alquiler y hasta cuándo estarán alquilados, así como los que están disponibles, para tener control sobre ellos.

**HU-ARRENDADOR-07**: Como arrendador, quiero modificar un objeto que he subido, para actualizar su información.

**HU-ARRENDADOR-08**: Como arrendador, quiero borrar un objeto, para retirarlo del alquiler.

**HU-ARRENDADOR-09**: Como arrendador, quiero registrarme como proveedor de objetos, para poder ganar dinero con ellos.

**HU-ARRENDADOR-11**: Como arrendador, quiero pulsar “Subir artículo”, para poner un objeto en alquiler.

**HU-ARRENDADOR-12**: Como arrendador, quiero seleccionar la categoría del objeto, para clasificarlo correctamente.

**HU-ARRENDADOR-13**: Como arrendador, quiero subir fotos del objeto, para que los arrendatarios vean su estado.

**HU-ARRENDADOR-14**: Como arrendador, quiero añadir una descripción, para explicar características y condiciones.

**HU-ARRENDADOR-15**: Como arrendador, quiero indicar la fecha de compra, para dar confianza sobre su calidad.

**HU-ARRENDADOR-16**: Como arrendador, quiero indicar el estado del objeto, para que el usuario sepa qué esperar.

**HU-ARRENDADOR-17**: Como arrendador, quiero indicar desde qué fecha hasta qué fecha está disponible el objeto, para controlar cuándo puedo prestarlo.

**HU-ARRENDADOR-18**: Como arrendador, quiero actualizar la disponibilidad, para adaptarla a mis necesidades.

**HU-ARRENDADOR-19**: Como arrendador, quiero ver todos los objetos que he subido en “Mis artículos”, para gestionarlos fácilmente.

**HU-ARRENDADOR-26**: Como arrendador, quiero poder asignar un precio de alquiler a cada objeto que subo, para obtener un beneficio acorde a su valor.

**HU-ARRENDADOR-27**: Como arrendador, quiero que el sistema me indique el rango de precios permitido según el tipo de objeto, para fijar un precio adecuado.

**HU-ARRENDADOR-28**: Como arrendador, quiero ver el precio mínimo y máximo recomendado, para orientarme al poner valor a mi objeto.

**HU-ARRENDADOR-29**: Como arrendador, quiero valorar al arrendatario, para que otros propietarios sepan si es un usuario cuidadoso.

**HU-ARRENDADOR-35**: Como arrendador, quiero poder editar los datos de mi perfil de usuario, para poder actualizarlos en caso de sufrir alguna modificación.

---

### 5.3. Arrendatario

**HU-ARRENDATARIO-01**: Como arrendatario, quiero registrarme en la app, para poder crear y alquilar kits.

**HU-ARRENDATARIO-02**: Como arrendatario, quiero iniciar sesión fácilmente, para acceder a mis kits y pedidos.

**HU-ARRENDADOR-03**: Como arrendador, quiero que el valor por el que alquilo mis objetos sea acorde a su calidad, para obtener un beneficio justo.

**HU-ARRENDATARIO-03**: Como arrendatario, quiero indicar mis datos básicos, para que se gestionen correctamente pagos y envíos.

**HU-ARRENDATARIO-04**: Como arrendatario, quiero poder armar mi kit personalizado, para empezar el proceso guiado.

**HU-ARRENDATARIO-05**: Como arrendatario, quiero seleccionar la ciudad destino, para ver y seleccionar objetos y servicios disponibles en esa ubicación.

**HU-ARRENDATARIO-06**: Como arrendatario, quiero ver los productos organizados por categorías, para construir mi kit de forma ordenada.

**HU-ARRENDATARIO-07**: Como arrendatario, quiero poder añadir un objeto determinado, para personalizar mi kit según mis necesidades.

**HU-ARRENDATARIO-08**: Como arrendatario, quiero seleccionar varias unidades de un mismo producto, para cubrir necesidades específicas.

**HU-ARRENDATARIO-09**: Como arrendatario, quiero eliminar objetos fácilmente, para ajustar el kit.

**HU-ARRENDADOR-10**: Como arrendador, quiero indicar la ciudad donde están mis objetos, para que se asignen correctamente.

**HU-ARRENDATARIO-12**: Como arrendatario, quiero indicar la fecha de inicio del alquiler, para recibir el kit cuando llegue a la ciudad.

**HU-ARRENDATARIO-13**: Como arrendatario, quiero indicar la fecha de fin, para calcular el tiempo total de uso.

**HU-ARRENDATARIO-14**: Como arrendatario, quiero ver el precio total en función de la duración, para saber cuánto voy a pagar.

**HU-ARRENDATARIO-15**: Como arrendatario, quiero ver el precio por objeto individual, para decidir si quitar o añadir elementos.

**HU-ARRENDATARIO-16**: Como arrendatario, quiero poder volver atrás en el proceso, para modificar mi selección.

**HU-ARRENDATARIO-17**: Como arrendatario, quiero pagar el kit desde la app, para confirmar el alquiler.

**HU-ARRENDATARIO-19**: Como arrendatario, quiero saber cuándo recibiré el kit, para organizar mi llegada.

**HU-ARRENDATARIO-20**: Como arrendatario, quiero poder elegir entre recibir el kit mediante mensajería o acordar un punto de encuentro con el arrendador, para seleccionar la opción de entrega que me resulte más cómoda y económica.

**HU-ARRENDATARIO-21**: Como arrendatario, quiero tener un apartado “Mis kits”, para ver todos los kits que tengo activos.

**HU-ARRENDATARIO-22**: Como arrendatario, quiero ver la fecha de devolución de cada kit, para no olvidarme.

**HU-ARRENDATARIO-23**: Como arrendatario, quiero recibir una notificación antes de la fecha de devolución del kit, que se envíe 10 días antes si el alquiler es de un mes y, si el periodo es menor, cuando falte un cuarto del tiempo total, para poder prepararme con antelación.

**HU-ARRENDATARIO-25**: Como arrendatario, quiero recibir recordatorios de devolución, para evitar penalizaciones.

**HU-ARRENDATARIO-26**: Como arrendatario, quiero que al seleccionar un tipo de objeto se me muestren todos los artículos disponibles de esa categoría en mi ciudad, para poder elegir el que más me convenga.

**HU-ARRENDATARIO-27**: Como arrendatario, quiero ver varias opciones del mismo tipo de objeto, para poder comparar entre distintos arrendadores.

**HU-ARRENDATARIO-28**: Como arrendatario, quiero ver el precio de cada artículo disponible, para elegir el que mejor se ajuste a mi presupuesto.

**HU-ARRENDATARIO-29**: Como arrendatario, quiero ver información sobre el estado o calidad del objeto (nuevo, poco usado, etc.), para decidir cuál prefiero alquilar.

**HU-ARRENDATARIO-30**: Como arrendatario, quiero ver fotos y descripciones de cada artículo antes de seleccionarlo, para saber exactamente qué estoy alquilando.

**HU-ARRENDATARIO-31**: Como arrendatario, quiero seleccionar un artículo concreto entre varias opciones del mismo tipo, para personalizar mi kit según precio y calidad.

**HU-ARRENDATARIO-32**: Como arrendatario, quiero poder cambiar el artículo elegido por otro del mismo tipo, para reconsiderar mi decisión antes de pagar.

**HU-ARRENDATARIO-33**: Como arrendatario, quiero reportar un objeto dañado al recibirlo, para que no se me culpe por desperfectos previos.

**HU-ARRENDATARIO-34**: Como arrendatario, quiero valorar y dejar un comentario sobre el kit y el arrendador tras la devolución, para ayudar a otros usuarios.

**HU-ARRENDATARIO-35**: Como arrendatario, quiero que al pagar mi kit se me cobre un 20% adicional como depósito de garantía, para asegurar la correcta devolución de los objetos alquilados.

**HU-ARRENDATARIO-36**: Como arrendatario, quiero ver claramente el importe de la garantía antes de pagar, para saber cuánto estoy pagando exactamente como depósito.

**HU-ARRENDATARIO-42**: Como arrendatario, quiero poder editar mis datos básicos, para que se gestionen correctamente pagos y envíos.

---

### 5.4. Administrador

**HU-ADMIN-01**: Como administrador, quiero crear nuevas categorías de objetos, para organizar correctamente los artículos dentro de la plataforma.

**HU-ADMIN-02**: Como administrador, quiero editar las categorías existentes, para mantener su información actualizada.

**HU-ADMIN-03**: Como administrador, quiero eliminar categorías, para depurar o reorganizar el catálogo.

**HU-ADMIN-09**: Como administrador, quiero establecer un rango de precios mínimo y máximo para cada tipo de objeto, para controlar que los precios definidos por los arrendadores se mantengan dentro de valores razonables.

**HU-ADMIN-10**: Como administrador, quiero editar el rango de precios de un tipo de objeto, para ajustarlo según cambios del mercado o del negocio.

**HU-ADMIN-13**: Como administrador, quiero registrarme con un usuario específico con rol diferenciado, para gestionar la plataforma.

**HU-ADMIN-14**: Como administrador, quiero crear, editar y eliminar cuentas, para mantener el control sobre la aplicación.

## 6. Historial de versiones

| Versión | Fecha      | Descripción                                                                                                    | Autor(es)                  |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------- | -------------------------- |
| 1.0.0   | 11/02/2026 | Primera versión de casos de uso de la aplicación                                                               | Marta Aguilar Morcillo     |
| 1.1.0   | 18/02/2026 | Añadidos algunos casos de uso                                                                                  | Cristina Fernández Chica   |
| 2.0.0   | 24/02/2026 | Reestructuración de los casos de uso core y no core. Se han añadido algunos casos y unificado algunos de ellos | Cristina Fernández Chica   |
| 3.0.0   | 11/05/2026 | Reestructuración, formateo y revisión ortográfica                                                              | Lucía Ponce García de Sola |

---

**Redactado por:** Marta Aguilar Morcillo y Cristina Fernández Chica  
**Fecha:** 11/05/2026  
**Versión:** 3.0.0
