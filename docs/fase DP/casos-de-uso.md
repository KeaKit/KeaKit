# CASOS DE USO

## Índice del documento

[Casos de Uso Core](#casos-de-uso-core)  
   - [Generales](#generales)  
      - [CU-GENERAL-01 – Registro e inicio de sesión](#cu-general-01---registro-e-inicio-de-sesión)  
      - [CU-GENERAL-02 – Gestión de datos personales](#cu-general-02---gestión-de-datos-personales)  
      - [CU-GENERAL-03 – Valoraciones](#cu-general-03---valoraciones)  
      - [CU-GENERAL-04 – Soporte](#cu-general-04---soporte)  

   - [Arrendador](#arrendador)  
      - [CU-ARRENDADOR-01 – Subida de artículos](#cu-arrendador-01---subida-de-artículos)  
      - [CU-ARRENDADOR-02 – Listado de artículos subidos](#cu-arrendador-02---listado-de-artículos-subidos)  
      - [CU-ARRENDADOR-03 – Gestión de artículos subidos](#cu-arrendador-03---gestión-de-artículos-subidos)  

   - [Arrendatario](#arrendatario)  
      - [CU-ARRENDATARIO-01 – Creación de kits](#cu-arrendatario--01---creación-de-kits)  
      - [CU-ARRENDATARIO-02 – Visualización dinámica de precios](#cu-arrendatario--02---visualización-dinámiaca-de-precios)  
      - [CU-ARRENDATARIO-03 – Gestión logística del alquiler](#cu-arrendatario--03---gestión-logística-del-alquiler)  
      - [CU-ARRENDATARIO-04 – Pago del kit](#cu-arrendatario-04---pago-del-kit)  
      - [CU-ARRENDATARIO-05 – Seguimiento de alquileres activos](#cu-arrendatario--05---seguimiento-de-alquileres-activos)  

   - [Administrador](#administrador)  
      - [CU-ADMIN-01 – Gestión de categorías](#cu-admin-01---gestión-de-categorías)  
      - [CU-ADMIN-02 – Listado de usuarios](#cu-admin-02---listado-de-usuarios)  

---

[Casos de Uso No Core](#casos-de-uso-no-core)  
   - [Generales](#general)  
      - [CU-GENERAL-05 – Home](#cu-general-05---home)  

   - [Arrendador](#arrendador-1)  
      - [CU-ARRENDADOR-04 – Gestión de fin de alquiler](#cu-arrendador-04---gestión-de-fin-de-alquiler)  
      - [CU-ARRENDADOR-05 – Retirada de ingresos](#cu-arrendador-05---retirada-de-ingresos)  
      - [CU-ARRENDADOR-06 – Alertas de demanda](#cu-arrendador-06---alertas-de-demanda)  
      - [CU-ARRENDADOR-07 – Filtros en “Mis artículos”](#cu-arrendador-07---filtros-en-mis-artículos)  
      - [CU-ARRENDADOR-08 – Notificaciones de actividad](#cu-arrendador-08---notificaciones-de-actividad)  
      - [CU-ARRENDADOR-09 – Análisis demanda](#cu-arrendador-09---análisis-demanda)  
      - [CU-ARRENDADOR-10 – Historial de alquileres de un objeto](#cu-arrendador-10---historial-de-alquileres-de-un-objeto)  

   - [Arrendatario](#arrendatario-1)  
      - [CU-ARRENDATARIO-06 – Validación de recepción y liberación del pago restante](#cu-arrendatario-06---validación-de-recepción-y-liberación-del-pago-restante)  
      - [CU-ARRENDATARIO-07 – Modificar kits predeterminados](#cu-arrendatario--07---modificar-kits-predeterminados)  
      - [CU-ARRENDATARIO-08 – Filtrado de artículos disponibles](#cu-arrendatario--08---filtrado-de-artículos-disponibles)  
      - [CU-ARRENDATARIO-09 – Avisos de disponibilidad](#cu-arrendatario--09---avisos-de-disponibilidad)  
      - [CU-ARRENDATARIO-10 – Ampliación de búsqueda geográfica](#cu-arrendatario--10---ampliación-de-búsqueda-geográfica)  
      - [CU-ARRENDATARIO-11 – Historial de alquileres](#cu-arrendatario--11---historial-de-alquileres)  

   - [Administrador](#administrador-1)  
      - [CU-ADMIN-04 – Gestión de usuarios](#cu-admin-04---gestión-de-usuarios)  
      - [CU-ADMIN-05 – Configuración modelo negocio (% transacción)](#cu-admin-05---configuración-modelo-negocio--transacción)  
      - [CU-ADMIN-06 – Creación kits predeterminados](#cu-admin-06---creación-kits-predeterminados)  

---

[Historias de Usuario](#historias-de-usuario)  
   - [General](#general-1)  
      - HU-GENERAL-01
   - [Arrendador](#arrendador-2)  
      - HU-ARRENDADOR-01 a HU-ARRENDADOR-35
   - [Arrendatario](#arrendatario-2)  
      - HU-ARRENDATARIO-01 a HU-ARRENDATARIO-42
   - [Administrador](#administrador-2)  
      - HU-ADMIN-01 a HU-ADMIN-15



# CASOS DE USO CORE

## GENERALES

### CU-GENERAL-01 - Registro e inicio de sesión

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-GENERAL-01 |
| **Nombre**         | Registro e inicio de sesión |
| **Actores**        | Arrendador, arrendatario y administrador |
| **Objetivo**       | Los usuarios deben poder registrarse e iniciar sesión en la aplicación |
| **Precondiciones** | - |
| **Flujo principal**| 1. Iniciar la aplicación <br> 2. Rellenar los datos de registro <br> 3. Iniciar sesión con las credenciales |
| **Excepciones**    | - |
| **Resultado**      | El usuario accede a la pantalla "Home" |
| **Historias de usuario**      | HU-ARRENDATARIO-01 <br> HU-ARRENDATARIO-02 <br> HU-ARRENDADOR-09 <br> HU-ADMIN-13  |


### CU-GENERAL-02 - Gestión de datos personales

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-GENERAL-02 |
| **Nombre**         | Gestión de datos personales  |
| **Actores**        | Arrendador, arrendatario y administrador |
| **Objetivo**       | Los usuarios deben poder editar sus datos personales |
| **Precondiciones** | - |
| **Flujo principal**| 1. Ir al apartado de perfil <br> 2. Puslar el botón para editar el perfil <br> 3. Editar los datos que se desee <br> 4. Guardar los cambios |
| **Excepciones**    | - |
| **Resultado**      | Datos personales actualizados |
| **Historias de usuario**      | HU-ARRENDATARIO-03 <br> HU-ARRENDATARIO-42 <br> HU-ARRENDADOR-35 |

### CU-GENERAL-03 - Valoraciones

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-GENERAL-03 |
| **Nombre**         | Valoraciones  |
| **Actores**        | Arrendador y arrendatario|
| **Objetivo**       | Los usuarios deben poder valorar al resto de usuarios en calidad de arrendador y arrendatario |
| **Precondiciones** | - |
| **Flujo principal**| 1. Acceder al perfil del usuario a valorar <br> 2. Pulsar el botón para añadir una valoración <br> 3. Enviar la valoración. |
| **Excepciones**    | - |
| **Resultado**      | Valoración creada |
| **Historias de usuario**      | HU-ARRENDATARIO-34 <br> HU-ARRENDADOR-29 |

### CU-GENERAL-04 - Soporte

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-GENERAL-04 |
| **Nombre**         | Soporte |
| **Actores**        | Arrendador, arrendatario y administrador |
| **Objetivo**       | Los usuarios deben poder acceder a un formulario de incidencias|
| **Precondiciones** | - |
| **Flujo principal**| 1. Acceder al apartado de soporte <br> 2. Pulsar el botón para acceder al formulario <br> 3. Rellenar y enviar el formulario |
| **Excepciones**    | - |
| **Resultado**      | Incidencia enviada con éxito |
| **Historias de usuario**      | HU-GENERAL-01 <br> HU-ARRENDATARIO-33|

## ARRENDADOR

### CU-ARRENDADOR-01 - Subida de artículos

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ARRENDADOR-01 |
| **Nombre**         | Subida de artículos |
| **Actores**        | Arrendador |
| **Objetivo**       | Los usuarios deben poder subir artículos para ponerlos en alquiler|
| **Precondiciones** | - |
| **Flujo principal**| 1. Pulsar sobre el botón "Subir artículo" <br> 2. Rellenar los datos del atículo <br> 3. Confirmar la subida del artículo |
| **Excepciones**    | - |
| **Resultado**      | Artículo subido a la aplicación |
| **Historias de usuario**      | HU-ARRENDADOR-11 <br> HU-ARRENDADOR-12 <br> HU-ARRENDADOR-13 <br> HU-ARRENDADOR-14 <br> HU-ARRENDADOR-15  <br> HU-ARRENDADOR-16 <br> HU-ARRENDADOR-17 <br> HU-ARRENDADOR-26 <br> HU-ARRENDADOR-27 <br> HU-ARRENDADOR-28 |



### CU-ARRENDADOR-02 - Listado de artículos subidos

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ARRENDADOR-02 |
| **Nombre**         | Listado de artículos subidos |
| **Actores**        | Arrendador |
| **Objetivo**       | El usuario debe poder ver todos los artículos que tiene subidos en el momento|
| **Precondiciones** | - |
| **Flujo principal**| 1. Acceder al apartado perfil <br> 2. Dentro del perfil acceder a "Mis artículos" |
| **Excepciones**    | - |
| **Resultado**      | - |
| **Historias de usuario**      | HU-ARRENDADOR-04 <br> HU-ARRENDADOR-19 |

### CU-ARRENDADOR-03 - Gestión de artículos subidos

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ARRENDADOR-03|
| **Nombre**         | Gestión de artículos subidos |
| **Actores**        | Arrendador |
| **Objetivo**       | Los usuarios deben poder modificar o eliminar los artículos subidos |
| **Precondiciones** | - |
| **Flujo principal**| 1. Entrar en algún artículo <br> 2. Eliminar o editar el artículo <br> 3. En caso de editar el artículo, cambiar los datos y confirmar los cambios |
| **Excepciones**    | Si el artículo está alquilado en ese momento, no podrá eliminarlo ni editarlo |
| **Resultado**      | - |
| **Historias de usuario**      | HU-ARRENDADOR-07 <br> HU-ARRENDADOR-08 <br> HU-ARRENDADOR-18 |

## ARRENDATARIO

### CU-ARRENDATARIO-01 - Creación de kits

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ARRENDATARIO-01|
| **Nombre**         | Creación de kits |
| **Actores**        | Arrendatario |
| **Objetivo**       | El arrendatario debe poder crear kits personalizados para alquilarlos|
| **Precondiciones** | - |
| **Flujo principal**| 1. Pulsar en el botón "Alquilar kit" <br> 2. Rellenar los datos en relación al alquiler del kit <br> 3. Añadir los productos a alquilar <br> 4. Pulsar el botón "Pagar kit"|
| **Excepciones**    | - |
| **Resultado**      | Se accederá a la pantalla de pago del kit|
| **Historias de usuario**      | HU-ARRENDATARIO-04 <br> HU-ARRENDATARIO-05 <br> HU-ARRENDATARIO-06 <br> HU-ARRENDATARIO-07 <br> HU-ARRENDATARIO-08 <br> HU-ARRENDATARIO-09 <br> HU-ARRENDATARIO-12 <br> HU-ARRENDATARIO-13 <br> HU-ARRENDATARIO-16 <br> HU-ARRENDATARIO-26 <br> HU-ARRENDATARIO-27 <br> HU-ARRENDATARIO-28 <br> HU-ARRENDATARIO-29 <br> HU-ARRENDATARIO-30 <br> HU-ARRENDATARIO-31 <br> HU-ARRENDATARIO-32 |


### CU-ARRENDATARIO-02 - Visualización dinámiaca de precios

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ARRENDATARIO-02|
| **Nombre**         | Visualización dinámica de precios |
| **Actores**        | Arrendatario |
| **Objetivo**       | El arrendatario debe poder ver el precio individual de cada objeto o servicio, y el precio total del kit en función de la duración del alquiler|
| **Precondiciones** | - |
| **Flujo principal**| 1. Pantalla de creación de kits <br> 2. Cada artículo lleva su precio individual asignado <br> 3. En la parte inferior de la pantalla, se observará el precio total|
| **Excepciones**    | - |
| **Resultado**      | - |
| **Historias de usuario**      | HU-ARRENDATARIO-14 <br> HU-ARRENDATARIO-15 <br> HU-ARRENDATARIO-35 <br> HU-ARRENDATARIO-36 |


### CU-ARRENDATARIO-03 - Gestión logística del alquiler

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ARRENDATARIO-03|
| **Nombre**         | Gestión logística del alquiler |
| **Actores**        | Arrendatario |
| **Objetivo**       | El arrendatario debe poder elegir el método de entrega (mensajería o punto de encuentro) y ver detalles logísticos|
| **Precondiciones** | - |
| **Flujo principal**| 1. Pantalla de creación de kits <br> 2. Acceder a alguno de los artículos añadidos <br> 3. Elegir el método de entrega 4. Acceder a detalles del kit 5. Ir a la sección "Ver detalles logísticos"|
| **Excepciones**    | - |
| **Resultado**      | Método de entrega para el artículo seleccionado |
| **Historias de usuario**      | HU-ARRENDATARIO-20 <br> HU-ARRENDATARIO-19 |

### CU-ARRENDATARIO-04 - Pago del kit

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ARRENDATARIO-04|
| **Nombre**         | Pago kit |
| **Actores**        | Arrendatario |
| **Objetivo**       | El arrendatario debe poder pagar el kit de forma segura|
| **Precondiciones** | - |
| **Flujo principal**| 1. Pantalla de creación de kits <br> 2. Pulsar sobre el botón "Pagar kit" <br> 3. Rellenar los datos de pago <br> 4. Confirmar el pago|
| **Excepciones**    | - |
| **Resultado**      | El kit quedará pagado y aparecerá en "Mis alquileres" |
| **Historias de usuario**      | HU-ARRENDATARIO-17  |

### CU-ARRENDATARIO-05 - Seguimiento de alquileres activos

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ARRENDATARIO-05|
| **Nombre**         | Seguimiento de alquileres activos |
| **Actores**        | Arrendatario |
| **Objetivo**       | El arrendatario debe poder visualizar el estado de los alquileres vigentes y sus fechas de devolución|
| **Precondiciones** | - |
| **Flujo principal**| 1. Acceder a la sección "Mis kits" del perfil <br> 2.  Entrar en el kit del que queramos ver sus detalles de seguimiento <br> 3. Ver detalles de seguimiento|
| **Excepciones**    | - |
| **Resultado**      | Visualización de datos de seguimiento |
| **Historias de usuario**      | HU-ARRENDATARIO-21 <br> HU-ARRENDATARIO-22 <br> HU-ARRENDATARIO-23 <br> HU-ARRENDATARIO-25 |


## ADMINISTRADOR

### CU-ADMIN-01 - Gestión de categorías

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ADMIN-01 |
| **Nombre**         | Gestión de categorías |
| **Actores**        | Administrador |
| **Objetivo**       | El administrador debe poder ver, crear, editar y eliminar categorías de la aplicación |
| **Precondiciones** | - y tener rol administrador|
| **Flujo principal**| 1. Acceder a la sección "Categorías" <br> 2. Realizar la gestión correspondiente: Para ver, pulsar sobre una categoría, para crear pulsar sobre "Añadir categoría", para editar, pulsar sobre el lápiz en la categoría a editar, y para eliminar, pulsar en el icono de la papelera en la categoría a eliminar. <br> 3. En caso de creación, rellenar los datos y confirmar la creación. En caso de edición, editar los datos y confirmar la edición|
| **Excepciones**    | - |
| **Resultado**      | - |
| **Historias de usuario**      | HU-ADMIN-01 <br> HU-ADMIN-02 <br> HU-ADMIN-03 <br> HU-ADMIN-09 <br> HU-ADMIN-10 |

### CU-ADMIN-02 - Listado de usuarios

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ADMIN-02 |
| **Nombre**         | Listado de usuarios |
| **Actores**        | Administrador |
| **Objetivo**       | El administrador debe poder ver todos los usuarios registrados en el sistema |
| **Precondiciones** | Tener rol administrador|
| **Flujo principal**| 1. Acceder a la sección "Usuarios" |
| **Excepciones**    | - |
| **Resultado**      | Vista de listado de usuarios |
| **Historias de usuario**      | HU-ADMIN-14 |

---



# CASOS DE USO NO CORE

## GENERAL

### CU-GENERAL-05 - Home

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-GENERAL-05 |
| **Nombre**         | Home |
| **Actores**        | Arrendador, Arrendatario y Administrador |
| **Objetivo**       | Los usuarios deben tener una pantalla de inicio (home) donde se expongan distintos detalles de interés |
| **Precondiciones** | - |
| **Flujo principal**| 1. Registrarse en la aplicación <br> 2. Iniciar sesión en la aplicación |
| **Excepciones**    | - |
| **Resultado**      | Acceso a la pantalla home del usuario |
| **Historias de usuario**      | HU-ARRENDADOR-23 <br> HU-ARRENDATARIO-21 |

## ARRENDADOR

### CU-ARRENDADOR-04 - Gestión de fin de alquiler

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ARRENDADOR-04|
| **Nombre**         | Gestión de fin de alquiler |
| **Actores**        | Arrendador |
| **Objetivo**       | El arrendador debe poder confirmar (o no) la devolución del objeto|
| **Precondiciones** | - |
| **Flujo principal**| 1. Entrar al artículo correspondiente <br> 2. Pulsar sobre una de las opciones posibles sobre la devolución del objeto|
| **Excepciones**    | - |
| **Resultado**      | **Si está en buen estado**: Se devuleve el 20% de depósito de garantía al arrendatario <br> **Si hay daños**: Se retiene total o parcialmente la garantía |
| **Historias de usuario**      | HU-ARRENDADOR-33 <br> HU-ARRENDADOR-34 <br> HU-ARRENDADOR-40 |

### CU-ARRENDADOR-05 - Retirada de ingresos

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ARRENDADOR-05 |
| **Nombre**         | Retirada de ingresos |
| **Actores**        | Arrendador |
| **Objetivo**       | Los arrendadores deben poder retirar el dinero ganado poniendo en alquiler sus artículos a su cuenta bancara |
| **Precondiciones** | - |
| **Flujo principal**| 1. Acceder al perfil de usuario <br> 2. Pulsar en el botón "Cartera" <br> 3. Pulsar el botón "Retirar" <br> 4. Indicar datos de retirada <br> 5. Confirmar la retirada |
| **Excepciones**    | - |
| **Resultado**      | Ingreso retirado |
| **Historias de usuario**      | HU-ARRENDADOR-006 <br> HU-ARRENDADOR-30 <br> HU-ARRENDADOR-31 |


### CU-ARRENDADOR-06 - Alertas de demanda

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ARRENDADOR-06 |
| **Nombre**         | Alertas de demanda |
| **Actores**        | Arrendador |
| **Objetivo**       | Los arrendadores deben recibir notificaciones sobre objetos solicitados que no están disponibles |
| **Precondiciones** | Haber hecho solicitud de notificación de disponibilidad en algún artículo |
| **Flujo principal**| 1. Acceder al buzón de notificaciones <br> 2. Buscar la notificación correspondiente |
| **Excepciones**    | - |
| **Resultado**      | - |
| **Historias de usuario**      | HU-ARRENDADOR-05 <br> HU-ARRENDADOR-22 |


### CU-ARRENDADOR-07 - Filtros en "Mis artículos"

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ARRENDADOR-07 |
| **Nombre**         | Filtros en "Mis artículos" |
| **Actores**        | Arrendador |
| **Objetivo**       | Los arrendadores deben poder filtrar sus artículos por distintos parámetros |
| **Precondiciones** | - |
| **Flujo principal**| 1. Acceder a la sección "Mis artículos" del perfil <br> 2. Entrar en los filtros <br> 3. Introducir los filtros deseados <br> 4. Aplicar los filtros |
| **Excepciones**    | - |
| **Resultado**      | Listado de artículos que cumplen los filtros aplicados |
| **Historias de usuario**      | HU-ARRENDADOR-20 <br> HU-ARRENDADOR-21 |


### CU-ARRENDADOR-08 - Notificaciones de actividad


| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ARRENDADOR-08 |
| **Nombre**         | Notificaciones de actividad |
| **Actores**        | Arrendador |
| **Objetivo**       | Los arrendadores deben poder recibir notificaciones cuando un objeto es alquilado o cuando un alquiler está próximo a la fecha fin|
| **Precondiciones** | - |
| **Flujo principal**| 1. Acceder al buzón de notificaciones <br> 2. Buscar la notificación correspondiente |
| **Excepciones**    | - |
| **Resultado**      | Listado de artículos que cumplen los filtros aplicados |
| **Historias de usuario**      | HU-ARRENDADOR-24 <br> HU-ARRENDADOR-25 |


### CU-ARRENDADOR-09 - Análisis demanda

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ARRENDADOR-09 |
| **Nombre**         | Análisis demanda |
| **Actores**        | Arrendador |
| **Objetivo**       | Los arrendadores deben poder visualizar los artículos que tienen mayor demanda |
| **Precondiciones** | - |
| **Flujo principal**| 1. Iniciar sesión <br> 2. En la pantalla home, apartado "Top productos demandados" |
| **Excepciones**    | - |
| **Resultado**      | Top de los productos más demandados |
| **Historias de usuario**      | HU-ARRENDADOR-23 |



### CU-ARRENDADOR-10 - Historial de alquileres de un objeto

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ARRENDADOR-10 |
| **Nombre**         | Historial de alquileres de un objeto |
| **Actores**        | Arrendador |
| **Objetivo**       | Los arrendadores deben poder visualizar el historial de alquileres de sus artículos |
| **Precondiciones** | - |
| **Flujo principal**| 1. Acceder a perfil de usuario <br> 2. Acceder al apartado "Mis artículos" <br> 3. Pulsar botón "Historial de alquileres" |
| **Excepciones**    | - |
| **Resultado**      | Acceso al historial de alquileres |
| **Historias de usuario**      | HU-ARRENDADOR-04 <br> HU-ARRENDADOR-21 |


## ARRENDATARIO

### CU-ARRENDATARIO-06 - Validación de recepción y liberación del pago restante

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ARRENDATARIO-06|
| **Nombre**         | Validación de recepción y liberación del pago restante |
| **Actores**        | Arrendatario |
| **Objetivo**       | El arrendatario debe poder validar la recepción del kit |
| **Precondiciones** | - |
| **Flujo principal**| 1. Acceder a la sección "Mis kits" del perfil <br> 2. Entrar en el kit correspondiente <br> 3. Pulsar en recibido (o no recibido)|
| **Excepciones**    | - |
| **Resultado**      | Validación de recepción realizada |
| **Historias de usuario**      | HU-ARRENDATARIO-38 <br> HU-ARRENDATARIO-39 <br> HU-ARRENDATARIO-32 <br> HU-ARRENDATARIO-41 |

### CU-ARRENDATARIO-07 - Modificar kits predeterminados

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ARRENDATARIO-07 |
| **Nombre**         | Modificar kits predeterminados |
| **Actores**        | Arrendatario |
| **Objetivo**       | Los arrendatarios deben poder personalizar los kits predeterminados de la aplicación |
| **Precondiciones** | - |
| **Flujo principal**| 1. Acceder al apartado de kits predeterminados <br> 2. Elegir un kit <br> 3. Añadir o eliminar los productos deseados |
| **Excepciones**    | - |
| **Resultado**      | - |
| **Historias de usuario**      | HU-ARRENDATARIO-07 <br> HU-ARRENDATARIO-09 |


### CU-ARRENDATARIO-08 - Filtrado de artículos disponibles 

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ARRENDATARIO-08 |
| **Nombre**         | Filtrado de objetos disponibles  |
| **Actores**        | Arrendatario |
| **Objetivo**       | Los arrendatarios deben poder aplicar filtros avanzados a la hora de seleccionar los artículos en la creación de un kit |
| **Precondiciones** | - |
| **Flujo principal**| 1. Acceder a la creación de un kit <br> 2. Pulsar el botón "Añadir artículo" <br> 3. Usar los filtros avanzados de la página de selección de artículos. |
| **Excepciones**    | - |
| **Resultado**      | - |
| **Historias de usuario**      | HU-ARRENDATARIO-26 <br> HU-ARRENDATARIO-27 <br> HU-ARRENDATARIO-28 <br> HU-ARRENDATARIO-29 |


### CU-ARRENDATARIO-09 - Avisos de disponibilidad

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ARRENDATARIO-09 |
| **Nombre**         | Avisos de disponibilidads  |
| **Actores**        | Arrendatario |
| **Objetivo**       | Los arrendatarios deben poder activar avisos de disponibilidad sobre artículos que no estén disponibles en ese momento|
| **Precondiciones** | - |
| **Flujo principal**| 1. Acceder a la creación de un kit <br> 2. Pulsar el botón "Añadir artículo" <br> 3. Pulsar sobre el icono de la exclamación para activar el aviso de disponibilidad sobre el artículo |
| **Excepciones**    | - |
| **Resultado**      | - |
| **Historias de usuario**      | HU-ARRENDATARIO-10 |


### CU-ARRENDATARIO-10 - Ampliación de búsqueda geográfica

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ARRENDATARIO-10 |
| **Nombre**         | Ampliación de búsqueda geográfica  |
| **Actores**        | Arrendatario |
| **Objetivo**       | Los arrendatarios deben poder buscar artículos en ciudades cercanas cuando no estén disponibles en la ciudad destino, mostrando avisos de posibles costes extra |
| **Precondiciones** | - |
| **Flujo principal**| 1. Acceder a la creación de un kit <br> 2. Pulsar el botón "Añadir artículo" <br> 3. Pulsar sobre el icono de globo terráqueo para activar la búsqueda con territorio ampliado |
| **Excepciones**    | - |
| **Resultado**      | - |
| **Historias de usuario**      | HU-ARRENDATARIO-11 |

### CU-ARRENDATARIO-11 - Historial de alquileres

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ARRENDATARIO-11 |
| **Nombre**         | Historial de alquileres  |
| **Actores**        | Arrendatario |
| **Objetivo**       | Los arrendatarios deben poder visualizar el historial de kits alquilados a lo largo del tiempo |
| **Precondiciones** | - |
| **Flujo principal**| 1. Acceder a perfil de usuario <br> 2. Acceder al apartado "Mis kits" <br> 3. Pulsar botón "Historial de kits alquilados" |
| **Excepciones**    | - |
| **Resultado**      | - |
| **Historias de usuario**      | HU-ARRENDATARIO-21 <br> HU-ARRENDATARIO-34 |

## ADMINISTRADOR

### CU-ADMIN-04 - Gestión de usuarios

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ADMIN-04 |
| **Nombre**         | Gestión de usuarios  |
| **Actores**        | Administrador |
| **Objetivo**       | Los administradores deben poder eliminar usuarios, cambiarles el rol o resetear la contraseña de los usuarios |
| **Precondiciones** | - |
| **Flujo principal**| 1. Acceder al apartado "Usuarios"<br> 2. Pulsar sobre el icono de la acción que desea realizar |
| **Excepciones**    | - |
| **Resultado**      | - |
| **Historias de usuario**      | HU-ADMIN-14 <br> HU-ADMIN-11 |

### CU-ADMIN-05 - Configuración modelo negocio (% transacción)

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ADMIN-05 |
| **Nombre**         | Configuración modelo negocio (% transacción)  |
| **Actores**        | Administrador |
| **Objetivo**       | Los administradores deben poder configurar el porcentaje que se lleva la aplicaicón por kit alquilado|
| **Precondiciones** | - |
| **Flujo principal**| 1. Acceder al apartado "Configuraciones" <br> 2. Acceder al apartado "% por transacción" <br> 3. Editar el porcentaje por transacción |
| **Excepciones**    | - |
| **Resultado**      | - |
| **Historias de usuario**      | HU-ADMIN-12 |

### CU-ADMIN-06 - Creación kits predeterminados

| **Elemento**       | **Descripción**|
|---------------------|-----------------|
| **ID**             | CU-ADMIN-06 |
| **Nombre**         | Creación kits predeterminados  |
| **Actores**        | Administrador |
| **Objetivo**       | Los administradores deben poder crear kits predeterminados |
| **Precondiciones** | - |
| **Flujo principal**| 1. Pulsar el botón "Añadir kit" <br> 2. Rellenar los datos correspondientes <br> 3. Completar la creación del kit |
| **Excepciones**    | - |
| **Resultado**      | - |
| **Historias de usuario**      | HU-ADMIN-04 <br> HU-ADMIN-05 <br> HU-ADMIN-06 <br> HU-ADMIN-07 <br> HU-ADMIN-08 |


# HISTORIAS DE USUARIO

## GENERAL

**HU‑GENERAL‑01**: Como usuario, quiero enviar incidencias desde un formulario, para recibir soporte.


## ARRENDADOR

**HU-ARRENDADOR-01**: Como arrendador, quiero poder alquilar objetos que poseo, para obtener ganancias.

**HU-ARRENDADOR-02**: Como arrendador, quiero que la gestión de los envíos sea lo más sencilla posible, para maximizar el número de días que pueda alquilar mis objetos.

**HU-ARRENDADOR-03**: Como arrendador, quiero que el valor por el que alquilo mis objetos sea acorde a su calidad, para obtener un beneficio justo.

**HU-ARRENDADOR-04**: Como arrendador, quiero ver todos los objetos que tengo en alquiler y hasta cuándo estarán alquilados, así como los que están disponibles, para tener control sobre ellos.

**HU-ARRENDADOR-05**: Como arrendador, quiero recibir avisos de los objetos más demandados, para adaptarme a la demanda.

**HU-ARRENDADOR-06**: Como arrendador, quiero poder retirar el dinero obtenido de mis alquileres a mi cuenta bancaria.

**HU-ARRENDADOR-07**: Como arrendador, quiero modificar un objeto que he subido, para actualizar su información.

**HU-ARRENDADOR-08**: Como arrendador, quiero borrar un objeto, para retirarlo del alquiler.

**HU-ARRENDADOR-09**: Como arrendador, quiero registrarme como proveedor de objetos, para poder ganar dinero con ellos.

**HU-ARRENDADOR-10**: Como arrendador, quiero indicar la ciudad donde están mis objetos, para que se asignen correctamente.

**HU-ARRENDADOR-11**: Como arrendador, quiero pulsar “Subir artículo”, para poner un objeto en alquiler.

**HU-ARRENDADOR-12**: Como arrendador, quiero seleccionar la categoría del objeto, para clasificarlo correctamente.

**HU-ARRENDADOR-13**: Como arrendador, quiero subir fotos del objeto, para que los arrendatarios vean su estado.

**HU-ARRENDADOR-14**: Como arrendador, quiero añadir una descripción, para explicar características y condiciones.

**HU-ARRENDADOR-15**: Como arrendador, quiero indicar la fecha de compra, para dar confianza sobre su calidad.

**HU-ARRENDADOR-16**: Como arrendador, quiero indicar el estado del objeto, para que el usuario sepa qué esperar.

**HU-ARRENDADOR-17**: Como arrendador, quiero indicar desde qué fecha hasta qué fecha está disponible el objeto, para controlar cuándo puedo prestarlo.

**HU-ARRENDADOR-18**: Como arrendador, quiero actualizar la disponibilidad, para adaptarla a mis necesidades.

**HU-ARRENDADOR-19**: Como arrendador, quiero ver todos los objetos que he subido en “Mis artículos”, para gestionarlos fácilmente.

**HU-ARRENDADOR-20**: Como arrendador, quiero filtrar mis objetos para ver cuáles están alquilados en ese momento, para tener un control rápido.

**HU-ARRENDADOR-21**: Como arrendador, quiero ver la fecha de recuperación del objeto, para saber cuándo vuelve a mí.

**HU-ARRENDADOR-22**: Como arrendador, quiero recibir notificaciones cuando la gente pida objetos que no están disponibles, para saber qué subir.

**HU-ARRENDADOR-23**: Como arrendador, quiero ver qué productos tienen más demanda, para optimizar lo que pongo en alquiler.

**HU-ARRENDADOR-24**: Como arrendador, quiero recibir avisos cuando alquilan mi objeto, para estar informado.

**HU-ARRENDADOR-25**: Como arrendador, quiero recibir avisos cuando mi objeto esté a punto de volver, para prepararme.

**HU-ARRENDADOR-26**: Como arrendador, quiero poder asignar un precio de alquiler a cada objeto que subo, para obtener un beneficio acorde a su valor.

**HU-ARRENDADOR-27**: Como arrendador, quiero que el sistema me indique el rango de precios permitido según el tipo de objeto, para fijar un precio adecuado.

**HU-ARRENDADOR-28**: Como arrendador, quiero ver el precio mínimo y máximo recomendado, para orientarme al poner valor a mi objeto.

**HU-ARRENDADOR-29**: Como arrendador, quiero valorar al arrendatario, para que otros propietarios sepan si es un usuario cuidadoso.

**HU-ARRENDADOR-30**: Como arrendador, quiero recibir automáticamente el 50% del importe del alquiler cuando el arrendatario pague el kit, para asegurar un ingreso inicial.

**HU-ARRENDADOR-31**: Como arrendador, quiero recibir el 50% restante cuando el arrendatario confirme que el objeto coincide con la descripción y está en buen estado.

**HU-ARRENDADOR-32**: Como arrendador, quiero recibir una notificación cuando el arrendatario valide el estado del objeto, para saber cuándo se liberará el segundo pago.

**HU-ARRENDADOR-33**: Como arrendador, quiero confirmar desde la app que he recibido mi objeto de vuelta y que está en buen estado, para que se libere la devolución de la garantía.

**HU-ARRENDADOR-34**: Como arrendador, quiero indicar si el objeto ha sido devuelto con daños o problemas, para que se retenga total o parcialmente la garantía.

**HU-ARRENDADOR-35**: Como arrendador, quiero poder editar los datos de mi perfil de usuario, para poder actualizarlos en caso de sufrir alguna modificación.


## ARRENDATARIO

**HU-ARRENDATARIO-01**: Como arrendatario, quiero registrarme en la app, para poder crear y alquilar kits.

**HU-ARRENDATARIO-02**: Como arrendatario, quiero iniciar sesión fácilmente, para acceder a mis kits y pedidos.

**HU-ARRENDATARIO-03**: Como arrendatario, quiero indicar mis datos básicos, para que se gestionen correctamente pagos y envíos.

**HU-ARRENDATARIO-04**: Como arrendatario, quiero poder armar mi kit personalizado, para empezar el proceso guiado.

**HU-ARRENDATARIO-05**: Como arrendatario, quiero seleccionar la ciudad destino, para ver y seleccionar objetos y servicios disponibles en esa ubicación.

**HU-ARRENDATARIO-06**: Como arrendatario, quiero ver los productos organizados por categorías, para construir mi kit de forma ordenada.

**HU-ARRENDATARIO-07**: Como arrendatario, quiero poder añadir un objeto determinado, para personalizar mi kit según mis necesidades.

**HU-ARRENDATARIO-08**: Como arrendatario, quiero seleccionar varias unidades de un mismo producto, para cubrir necesidades específicas.

**HU-ARRENDATARIO-09**: Como arrendatario, quiero eliminar objetos fácilmente, para ajustar el kit.

**HU-ARRENDATARIO-10**: Como arrendatario, quiero marcar “Avisarme cuando esté disponible” en un objeto faltante, para poder alquilarlo cuando alguien lo suba.

**HU-ARRENDATARIO-11**: Como arrendatario, quiero saber cuando un objeto no está disponible en mi ciudad y tener la opción de ampliar la búsqueda a otras ciudades, siendo consciente del posible incremento en el coste de envío, para poder decidir si me compensa incluirlo en mi kit.

**HU-ARRENDATARIO-12**: Como arrendatario, quiero indicar la fecha de inicio del alquiler, para recibir el kit cuando llegue a la ciudad.

**HU-ARRENDATARIO-13**: Como arrendatario, quiero indicar la fecha de fin, para calcular el tiempo total de uso.

**HU-ARRENDATARIO-14**: Como arrendatario, quiero ver el precio total en función de la duración, para saber cuánto voy a pagar.

**HU-ARRENDATARIO-15**: Como arrendatario, quiero ver el precio por objeto individual, para decidir si quitar o añadir elementos.

**HU-ARRENDATARIO-16**: Como arrendatario, quiero poder volver atrás en el proceso, para modificar mi selección.

**HU-ARRENDATARIO-17**: Como arrendatario, quiero pagar el kit desde la app, para confirmar el alquiler.

**HU-ARRENDATARIO-18**: Como arrendatario, quiero recibir confirmación del pedido, para saber que todo está gestionado.

**HU-ARRENDATARIO-19**: Como arrendatario, quiero saber cuándo recibiré el kit, para organizar mi llegada.

**HU-ARRENDATARIO-20**: Como arrendatario, quiero poder elegir entre recibir el kit mediante mensajería o acordar un punto de encuentro con el arrendador, para seleccionar la opción de entrega que me resulte más cómoda y económica.

**HU-ARRENDATARIO-21**: Como arrendatario, quiero tener un apartado “Mis kits”, para ver todos los kits que tengo activos.

**HU-ARRENDATARIO-22**: Como arrendatario, quiero ver la fecha de devolución de cada kit, para no olvidarme.

**HU-ARRENDATARIO-23**: Como arrendatario, quiero recibir una notificación antes de la fecha de devolución del kit, que se envíe 10 días antes si el alquiler es de un mes y, si el periodo es menor, cuando falte un cuarto del tiempo total, para poder prepararme con antelación.

**HU-ARRENDATARIO-24**: Como arrendatario, quiero recibir una notificación antes de la entrega, para estar disponible.

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

**HU-ARRENDATARIO-37**: Como arrendatario, quiero saber que el depósito del 20% me será devuelto al finalizar el alquiler si todo está en buen estado, para tener tranquilidad al realizar el pago.

**HU-ARRENDATARIO-38**: Como arrendatario, quiero poder confirmar desde la app que el objeto recibido coincide con la descripción, imágenes y estado prometido, para validar que el servicio se ha cumplido correctamente.

**HU-ARRENDATARIO-39**: Como arrendatario, quiero poder indicar que el objeto no cumple con lo prometido, para que se revise el caso antes de liberar el pago completo al arrendador.

**HU-ARRENDATARIO-40**: Como arrendatario, quiero recibir automáticamente el reembolso del depósito cuando finalice el alquiler y el arrendador confirme que el objeto ha sido devuelto en buen estado, para recuperar mi dinero sin gestiones adicionales.

**HU-ARRENDATARIO-41**: Como arrendatario, quiero recibir una notificación cuando se procese la devolución de mi depósito, para saber que el proceso ha finalizado correctamente.

**HU-ARRENDATARIO-42**: Como arrendatario, quiero poder editar mis datos básicos, para que se gestionen correctamente pagos y envíos.

### ADMINISTRADOR

**HU-ADMIN-01**: Como administrador, quiero crear nuevas categorías de objetos, para organizar correctamente los artículos dentro de la plataforma.

**HU-ADMIN-02**: Como administrador, quiero editar las categorías existentes, para mantener su información actualizada.

**HU-ADMIN-03**: Como administrador, quiero eliminar categorías, para depurar o reorganizar el catálogo.

**HU-ADMIN-04**: Como administrador, quiero crear nuevos tipos de objetos, para ampliar el catálogo disponible.

**HU-ADMIN-05**: Como administrador, quiero editar los tipos de objetos existentes, para corregir información o adaptarlos a nuevas necesidades.

**HU-ADMIN-06**: Como administrador, quiero eliminar tipos de objetos, para retirar del sistema aquellos que ya no deban ofrecerse.

**HU-ADMIN-07**: Como administrador, quiero asociar cada tipo de objeto a una categoría concreta, para mantener una estructura organizada y coherente.

**HU-ADMIN-08**: Como administrador, quiero modificar la categoría asociada a un tipo de objeto, para reorganizar el catálogo cuando sea necesario.

**HU-ADMIN-09**: Como administrador, quiero establecer un rango de precios mínimo y máximo para cada tipo de objeto, para controlar que los precios definidos por los arrendadores se mantengan dentro de valores razonables.

**HU-ADMIN-10**: Como administrador, quiero editar el rango de precios de un tipo de objeto, para ajustarlo según cambios del mercado o del negocio.

**HU-ADMIN-11**: Como administrador, quiero mediar en caso de conflicto entre arrendador y arrendatario, para decidir entre devolución, compensación o alternativa.

**HU-ADMIN-12**: Como administrador, quiero configurar el porcentaje de comisión que la plataforma se queda por cada alquiler, para ajustar el modelo de negocio.

**HU-ADMIN-13**: Como administrador, quiero registrarme con un usuario específico con rol diferenciado, para gestionar la plataforma.

**HU-ADMIN-14**: Como administrador, quiero crear, editar y eliminar cuentas, para mantener el control sobre la aplicación.

**HU-ADMIN-15**: Como administrador, quiero acceder a una ventana de estadísticas con información relevante sobre los alquileres, para tener contexto del estado de la aplicación.



| Versión | Fecha       | Descripción                   | Autor(es)       |
|---------|------------|--------------------------------|------------|
| 1.0.0   | 11/02/2026 | Primera versión de casos de uso de la aplicación | Marta Aguilar Morcillo |
| 1.1.0   | 18/02/2026 | Añadidos algunos casos de uso | Cristina Fernández Chica |
| 2.0.0   | 24/02/2026 | Reestructuración de los casos de uso core y no core. Se han añadido algunos casos y unnificado algunos de ellos | Cristina Fernández Chica |