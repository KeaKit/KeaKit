# Casos de uso no core

## Índice del documento

1. [Generales](#1-generales)  
1.1. [CU-GENERAL-05: Home](#11-cu-general-05-home)
2. [Arrendador](#2-arrendador)  
2.1. [CU-ARRENDADOR-04: Gestión de fin de alquiler](#21-cu-arrendador-04-gestión-de-fin-de-alquiler)  
2.2. [CU-ARRENDADOR-05: Retirada de ingresos](#22-cu-arrendador-05-retirada-de-ingresos)  
2.3. [CU-ARRENDADOR-06: Alertas de demanda](#23-cu-arrendador-06-alertas-de-demanda)  
2.4. [CU-ARRENDADOR-07: Filtros en “Mis artículos”](#24-cu-arrendador-07-filtros-en-mis-artículos)  
2.5. [CU-ARRENDADOR-08: Notificaciones de actividad](#25-cu-arrendador-08-notificaciones-de-actividad)  
2.6. [CU-ARRENDADOR-09: Análisis demanda](#26-cu-arrendador-09-análisis-demanda)  
2.7. [CU-ARRENDADOR-10: Historial de alquileres de un objeto](#27-cu-arrendador-10-historial-de-alquileres-de-un-objeto)  
3. [Arrendatario](#3-arrendatario)  
3.1. [CU-ARRENDATARIO-06: Validación de recepción y liberación del pago restante](#31-cu-arrendatario-06-validación-de-recepción-y-liberación-del-pago-restante)  
3.2. [CU-ARRENDATARIO-07: Modificar kits predeterminados](#32-cu-arrendatario-07-modificar-kits-predeterminados)  
3.3. [CU-ARRENDATARIO-08: Filtrado de artículos disponibles](#33-cu-arrendatario-08-filtrado-de-artículos-disponibles)  
3.4. [CU-ARRENDATARIO-09: Avisos de disponibilidad](#34-cu-arrendatario-09-avisos-de-disponibilidad)  
3.5. [CU-ARRENDATARIO-10: Ampliación de búsqueda geográfica](#35-cu-arrendatario-10-ampliación-de-búsqueda-geográfica)  
3.6. [CU-ARRENDATARIO-11: Historial de alquileres](#36-cu-arrendatario-11-historial-de-alquileres)  
4. [Administrador](#4-administrador)  
4.1. [CU-ADMIN-04: Gestión de usuarios](#41-cu-admin-04-gestión-de-usuarios)  
4.2. [CU-ADMIN-05: Configuración modelo negocio (% transacción)](#42-cu-admin-05-configuración-modelo-negocio--transacción)  
4.3. [CU-ADMIN-06: Creación kits predeterminados](#43-cu-admin-06-creación-kits-predeterminados)  
5. [Historias de usuario](#5-historias-de-usuario)  
5.1. [Arrendador](#51-arrendador)  
5.2. [Arrendatario](#52-arrendatario)  
5.3. [Administrador](#53-administrador)  
6. [Historial de versiones](#6-historial-de-versiones)

## 1. Generales

### 1.1. **CU-GENERAL-05:** Home

| **Elemento**             | **Descripción**                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| **ID**                   | CU-GENERAL-05                                                                                          |
| **Nombre**               | Home                                                                                                   |
| **Actores**              | Arrendador, Arrendatario y Administrador                                                               |
| **Objetivo**             | Los usuarios deben tener una pantalla de inicio (home) donde se expongan distintos detalles de interés |
| **Precondiciones**       | -                                                                                                      |
| **Flujo principal**      | 1. Registrarse en la aplicación <br> 2. Iniciar sesión en la aplicación                                |
| **Excepciones**          | -                                                                                                      |
| **Resultado**            | Acceso a la pantalla home del usuario                                                                  |
| **Historias de usuario** | HU-ARRENDADOR-23 <br> HU-ARRENDATARIO-21                                                               |

## 2. Arrendador

### 2.1. **CU-ARRENDADOR-04:** Gestión de fin de alquiler

| **Elemento**             | **Descripción**                                                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-ARRENDADOR-04                                                                                                                                          |
| **Nombre**               | Gestión de fin de alquiler                                                                                                                                |
| **Actores**              | Arrendador                                                                                                                                                |
| **Objetivo**             | El arrendador debe poder confirmar (o no) la devolución del objeto                                                                                        |
| **Precondiciones**       | -                                                                                                                                                         |
| **Flujo principal**      | 1. Entrar al artículo correspondiente <br> 2. Pulsar sobre una de las opciones posibles sobre la devolución del objeto                                    |
| **Excepciones**          | -                                                                                                                                                         |
| **Resultado**            | **Si está en buen estado**: Se devuleve el 20% de depósito de garantía al arrendatario <br> **Si hay daños**: Se retiene total o parcialmente la garantía |
| **Historias de usuario** | HU-ARRENDADOR-02 <br> HU-ARRENDADOR-33 <br> HU-ARRENDADOR-34 <br> HU-ARRENDATARIO-37 <br> HU-ARRENDATARIO-40                                                                                             |

### 2.2. **CU-ARRENDADOR-05:** Retirada de ingresos

| **Elemento**             | **Descripción**                                                                                                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-ARRENDADOR-05                                                                                                                                                       |
| **Nombre**               | Retirada de ingresos                                                                                                                                                   |
| **Actores**              | Arrendador                                                                                                                                                             |
| **Objetivo**             | Los arrendadores deben poder retirar el dinero ganado poniendo en alquiler sus artículos a su cuenta bancara                                                           |
| **Precondiciones**       | -                                                                                                                                                                      |
| **Flujo principal**      | 1. Acceder al perfil de usuario <br> 2. Pulsar en el botón "Cartera" <br> 3. Pulsar el botón "Retirar" <br> 4. Indicar datos de retirada <br> 5. Confirmar la retirada |
| **Excepciones**          | -                                                                                                                                                                      |
| **Resultado**            | Ingreso retirado                                                                                                                                                       |
| **Historias de usuario** | HU-ARRENDADOR-06 <br> HU-ARRENDADOR-30 <br> HU-ARRENDADOR-31                                                                                                          |

### 2.3. **CU-ARRENDADOR-06** Alertas de demanda

| **Elemento**             | **Descripción**                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| **ID**                   | CU-ARRENDADOR-06                                                                                 |
| **Nombre**               | Alertas de demanda                                                                               |
| **Actores**              | Arrendador                                                                                       |
| **Objetivo**             | Los arrendadores deben recibir notificaciones sobre objetos solicitados que no están disponibles |
| **Precondiciones**       | Haber hecho solicitud de notificación de disponibilidad en algún artículo                        |
| **Flujo principal**      | 1. Acceder al buzón de notificaciones <br> 2. Buscar la notificación correspondiente             |
| **Excepciones**          | -                                                                                                |
| **Resultado**            | -                                                                                                |
| **Historias de usuario** | HU-ARRENDADOR-05 <br> HU-ARRENDADOR-22                                                           |

### 2.4. **CU-ARRENDADOR-07:** Filtros en "Mis artículos"

| **Elemento**             | **Descripción**                                                                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-ARRENDADOR-07                                                                                                                                     |
| **Nombre**               | Filtros en "Mis artículos"                                                                                                                           |
| **Actores**              | Arrendador                                                                                                                                           |
| **Objetivo**             | Los arrendadores deben poder filtrar sus artículos por distintos parámetros                                                                          |
| **Precondiciones**       | -                                                                                                                                                    |
| **Flujo principal**      | 1. Acceder a la sección "Mis artículos" del perfil <br> 2. Entrar en los filtros <br> 3. Introducir los filtros deseados <br> 4. Aplicar los filtros |
| **Excepciones**          | -                                                                                                                                                    |
| **Resultado**            | Listado de artículos que cumplen los filtros aplicados                                                                                               |
| **Historias de usuario** | HU-ARRENDADOR-20 <br> HU-ARRENDADOR-21                                                                                                               |

### 2.5. **CU-ARRENDADOR-08:** Notificaciones de actividad

| **Elemento**             | **Descripción**                                                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-ARRENDADOR-08                                                                                                                   |
| **Nombre**               | Notificaciones de actividad                                                                                                        |
| **Actores**              | Arrendador                                                                                                                         |
| **Objetivo**             | Los arrendadores deben poder recibir notificaciones cuando un objeto es alquilado o cuando un alquiler está próximo a la fecha fin |
| **Precondiciones**       | -                                                                                                                                  |
| **Flujo principal**      | 1. Acceder al buzón de notificaciones <br> 2. Buscar la notificación correspondiente                                               |
| **Excepciones**          | -                                                                                                                                  |
| **Resultado**            | Listado de artículos que cumplen los filtros aplicados                                                                             |
| **Historias de usuario** | HU-ARRENDADOR-24 <br> HU-ARRENDADOR-25 <br> HU-ARRENDADOR-32 <br> HU-ARRENDATARIO-18 <br> HU-ARRENDATARIO-24                                                                                          |

### 2.6. **CU-ARRENDADOR-09:** Análisis demanda

| **Elemento**             | **Descripción**                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------- |
| **ID**                   | CU-ARRENDADOR-09                                                                   |
| **Nombre**               | Análisis demanda                                                                   |
| **Actores**              | Arrendador                                                                         |
| **Objetivo**             | Los arrendadores deben poder visualizar los artículos que tienen mayor demanda     |
| **Precondiciones**       | -                                                                                  |
| **Flujo principal**      | 1. Iniciar sesión <br> 2. En la pantalla home, apartado "Top productos demandados" |
| **Excepciones**          | -                                                                                  |
| **Resultado**            | Top de los productos más demandados                                                |
| **Historias de usuario** | HU-ARRENDADOR-23                                                                   |

### 2.7. **CU-ARRENDADOR-10:** Historial de alquileres de un objeto

| **Elemento**             | **Descripción**                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-ARRENDADOR-10                                                                                                          |
| **Nombre**               | Historial de alquileres de un objeto                                                                                      |
| **Actores**              | Arrendador                                                                                                                |
| **Objetivo**             | Los arrendadores deben poder visualizar el historial de alquileres de sus artículos                                       |
| **Precondiciones**       | -                                                                                                                         |
| **Flujo principal**      | 1. Acceder a perfil de usuario <br> 2. Acceder al apartado "Mis artículos" <br> 3. Pulsar botón "Historial de alquileres" |
| **Excepciones**          | -                                                                                                                         |
| **Resultado**            | Acceso al historial de alquileres                                                                                         |
| **Historias de usuario** | HU-ARRENDADOR-04 <br> HU-ARRENDADOR-21                                                                                    |

## 3. Arrendatario

### 3.1. **CU-ARRENDATARIO-06:** Validación de recepción y liberación del pago restante

| **Elemento**             | **Descripción**                                                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-ARRENDATARIO-06                                                                                                                |
| **Nombre**               | Validación de recepción y liberación del pago restante                                                                            |
| **Actores**              | Arrendatario                                                                                                                      |
| **Objetivo**             | El arrendatario debe poder validar la recepción del kit                                                                           |
| **Precondiciones**       | -                                                                                                                                 |
| **Flujo principal**      | 1. Acceder a la sección "Mis kits" del perfil <br> 2. Entrar en el kit correspondiente <br> 3. Pulsar en recibido (o no recibido) |
| **Excepciones**          | -                                                                                                                                 |
| **Resultado**            | Validación de recepción realizada                                                                                                 |
| **Historias de usuario** | HU-ARRENDATARIO-38 <br> HU-ARRENDATARIO-39 <br> HU-ARRENDATARIO-32 <br> HU-ARRENDATARIO-41                                        |

### 3.2. **CU-ARRENDATARIO-07:** Modificar kits predeterminados

| **Elemento**             | **Descripción**                                                                                                       |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-ARRENDATARIO-07                                                                                                    |
| **Nombre**               | Modificar kits predeterminados                                                                                        |
| **Actores**              | Arrendatario                                                                                                          |
| **Objetivo**             | Los arrendatarios deben poder personalizar los kits predeterminados de la aplicación                                  |
| **Precondiciones**       | -                                                                                                                     |
| **Flujo principal**      | 1. Acceder al apartado de kits predeterminados <br> 2. Elegir un kit <br> 3. Añadir o eliminar los productos deseados |
| **Excepciones**          | -                                                                                                                     |
| **Resultado**            | -                                                                                                                     |
| **Historias de usuario** | HU-ARRENDATARIO-07 <br> HU-ARRENDATARIO-09                                                                            |

### 3.3. **CU-ARRENDATARIO-08:** Filtrado de artículos disponibles

| **Elemento**             | **Descripción**                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-ARRENDATARIO-08                                                                                                                                      |
| **Nombre**               | Filtrado de objetos disponibles                                                                                                                         |
| **Actores**              | Arrendatario                                                                                                                                            |
| **Objetivo**             | Los arrendatarios deben poder aplicar filtros avanzados a la hora de seleccionar los artículos en la creación de un kit                                 |
| **Precondiciones**       | -                                                                                                                                                       |
| **Flujo principal**      | 1. Acceder a la creación de un kit <br> 2. Pulsar el botón "Añadir artículo" <br> 3. Usar los filtros avanzados de la página de selección de artículos. |
| **Excepciones**          | -                                                                                                                                                       |
| **Resultado**            | -                                                                                                                                                       |
| **Historias de usuario** | HU-ARRENDATARIO-26 <br> HU-ARRENDATARIO-27 <br> HU-ARRENDATARIO-28 <br> HU-ARRENDATARIO-29                                                              |

### 3.4. **CU-ARRENDATARIO-09:** Avisos de disponibilidad

| **Elemento**             | **Descripción**                                                                                                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-ARRENDATARIO-09                                                                                                                                                                     |
| **Nombre**               | Avisos de disponibilidads                                                                                                                                                              |
| **Actores**              | Arrendatario                                                                                                                                                                           |
| **Objetivo**             | Los arrendatarios deben poder activar avisos de disponibilidad sobre artículos que no estén disponibles en ese momento                                                                 |
| **Precondiciones**       | -                                                                                                                                                                                      |
| **Flujo principal**      | 1. Acceder a la creación de un kit <br> 2. Pulsar el botón "Añadir artículo" <br> 3. Pulsar sobre el icono de la exclamación para activar el aviso de disponibilidad sobre el artículo |
| **Excepciones**          | -                                                                                                                                                                                      |
| **Resultado**            | -                                                                                                                                                                                      |
| **Historias de usuario** | HU-ARRENDATARIO-10                                                                                                                                                                     |

### 3.5. **CU-ARRENDATARIO-10:** Ampliación de búsqueda geográfica

| **Elemento**             | **Descripción**                                                                                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**                   | CU-ARRENDATARIO-10                                                                                                                                                             |
| **Nombre**               | Ampliación de búsqueda geográfica                                                                                                                                              |
| **Actores**              | Arrendatario                                                                                                                                                                   |
| **Objetivo**             | Los arrendatarios deben poder buscar artículos en ciudades cercanas cuando no estén disponibles en la ciudad destino, mostrando avisos de posibles costes extra                |
| **Precondiciones**       | -                                                                                                                                                                              |
| **Flujo principal**      | 1. Acceder a la creación de un kit <br> 2. Pulsar el botón "Añadir artículo" <br> 3. Pulsar sobre el icono de globo terráqueo para activar la búsqueda con territorio ampliado |
| **Excepciones**          | -                                                                                                                                                                              |
| **Resultado**            | -                                                                                                                                                                              |
| **Historias de usuario** | HU-ARRENDATARIO-11                                                                                                                                                             |

### 3.6. **CU-ARRENDATARIO-11:** Historial de alquileres

| **Elemento**             | **Descripción**                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-ARRENDATARIO-11                                                                                                        |
| **Nombre**               | Historial de alquileres                                                                                                   |
| **Actores**              | Arrendatario                                                                                                              |
| **Objetivo**             | Los arrendatarios deben poder visualizar el historial de kits alquilados a lo largo del tiempo                            |
| **Precondiciones**       | -                                                                                                                         |
| **Flujo principal**      | 1. Acceder a perfil de usuario <br> 2. Acceder al apartado "Mis kits" <br> 3. Pulsar botón "Historial de kits alquilados" |
| **Excepciones**          | -                                                                                                                         |
| **Resultado**            | -                                                                                                                         |
| **Historias de usuario** | HU-ARRENDATARIO-21 <br> HU-ARRENDATARIO-34                                                                                |

## 4. Administrador

### 4.1. **CU-ADMIN-04:** Gestión de usuarios

| **Elemento**             | **Descripción**                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-ADMIN-04                                                                                                   |
| **Nombre**               | Gestión de usuarios                                                                                           |
| **Actores**              | Administrador                                                                                                 |
| **Objetivo**             | Los administradores deben poder eliminar usuarios, cambiarles el rol o resetear la contraseña de los usuarios |
| **Precondiciones**       | -                                                                                                             |
| **Flujo principal**      | 1. Acceder al apartado "Usuarios"<br> 2. Pulsar sobre el icono de la acción que desea realizar                |
| **Excepciones**          | -                                                                                                             |
| **Resultado**            | -                                                                                                             |
| **Historias de usuario** | HU-ADMIN-14 <br> HU-ADMIN-11                                                                                  |

### 4.2. **CU-ADMIN-05:** Configuración modelo negocio (% transacción)

| **Elemento**             | **Descripción**                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-ADMIN-05                                                                                                                           |
| **Nombre**               | Configuración modelo negocio (% transacción)                                                                                          |
| **Actores**              | Administrador                                                                                                                         |
| **Objetivo**             | Los administradores deben poder configurar el porcentaje que se lleva la aplicaicón por kit alquilado                                 |
| **Precondiciones**       | -                                                                                                                                     |
| **Flujo principal**      | 1. Acceder al apartado "Configuraciones" <br> 2. Acceder al apartado "% por transacción" <br> 3. Editar el porcentaje por transacción |
| **Excepciones**          | -                                                                                                                                     |
| **Resultado**            | -                                                                                                                                     |
| **Historias de usuario** | HU-ADMIN-12                                                                                                                           |

### 4.3. **CU-ADMIN-06:** Creación kits predeterminados

| **Elemento**             | **Descripción**                                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| **ID**                   | CU-ADMIN-06                                                                                                       |
| **Nombre**               | Creación kits predeterminados                                                                                     |
| **Actores**              | Administrador                                                                                                     |
| **Objetivo**             | Los administradores deben poder crear kits predeterminados                                                        |
| **Precondiciones**       | -                                                                                                                 |
| **Flujo principal**      | 1. Pulsar el botón "Añadir kit" <br> 2. Rellenar los datos correspondientes <br> 3. Completar la creación del kit |
| **Excepciones**          | -                                                                                                                 |
| **Resultado**            | -                                                                                                                 |
| **Historias de usuario** | HU-ADMIN-04 <br> HU-ADMIN-05 <br> HU-ADMIN-06 <br> HU-ADMIN-07 <br> HU-ADMIN-08                                   |

## 5. Historias de usuario

### 5.1. Arrendador

**HU-ARRENDADOR-02 (core)**: Como arrendador, quiero que la gestión de los envíos sea lo más sencilla posible, para maximizar el número de días que pueda alquilar mis objetos.

**HU-ARRENDADOR-04 (core)**: Como arrendador, quiero ver todos los objetos que tengo en alquiler y hasta cuándo estarán alquilados, así como los que están disponibles, para tener control sobre ellos.

**HU-ARRENDADOR-05**: Como arrendador, quiero recibir avisos de los objetos más demandados, para adaptarme a la demanda.

**HU-ARRENDADOR-06**: Como arrendador, quiero poder retirar el dinero obtenido de mis alquileres a mi cuenta bancaria.

**HU-ARRENDADOR-20**: Como arrendador, quiero filtrar mis objetos para ver cuáles están alquilados en ese momento, para tener un control rápido.

**HU-ARRENDADOR-21**: Como arrendador, quiero ver la fecha de recuperación del objeto, para saber cuándo vuelve a mí.

**HU-ARRENDADOR-22**: Como arrendador, quiero recibir notificaciones cuando la gente pida objetos que no están disponibles, para saber qué subir.

**HU-ARRENDADOR-23**: Como arrendador, quiero ver qué productos tienen más demanda, para optimizar lo que pongo en alquiler.

**HU-ARRENDADOR-24**: Como arrendador, quiero recibir avisos cuando alquilan mi objeto, para estar informado.

**HU-ARRENDADOR-25**: Como arrendador, quiero recibir avisos cuando mi objeto esté a punto de volver, para prepararme.

**HU-ARRENDADOR-30**: Como arrendador, quiero recibir automáticamente el 50% del importe del alquiler cuando el arrendatario pague el kit, para asegurar un ingreso inicial.

**HU-ARRENDADOR-31**: Como arrendador, quiero recibir el 50% restante cuando el arrendatario confirme que el objeto coincide con la descripción y está en buen estado.

**HU-ARRENDADOR-32**: Como arrendador, quiero recibir una notificación cuando el arrendatario valide el estado del objeto, para saber cuándo se liberará el segundo pago.

**HU-ARRENDADOR-33**: Como arrendador, quiero confirmar desde la app que he recibido mi objeto de vuelta y que está en buen estado, para que se libere la devolución de la garantía.

**HU-ARRENDADOR-34**: Como arrendador, quiero indicar si el objeto ha sido devuelto con daños o problemas, para que se retenga total o parcialmente la garantía.

---

### 5.2. Arrendatario

**HU-ARRENDATARIO-07 (core)**: Como arrendatario, quiero poder añadir un objeto determinado, para personalizar mi kit según mis necesidades.  

**HU-ARRENDATARIO-09 (core)**: Como arrendatario, quiero eliminar objetos fácilmente, para ajustar el kit.  

**HU-ARRENDATARIO-10**: Como arrendatario, quiero marcar “Avisarme cuando esté disponible” en un objeto faltante, para poder alquilarlo cuando alguien lo suba.

**HU-ARRENDATARIO-11**: Como arrendatario, quiero saber cuando un objeto no está disponible en mi ciudad y tener la opción de ampliar la búsqueda a otras ciudades, siendo consciente del posible incremento en el coste de envío, para poder decidir si me compensa incluirlo en mi kit.

**HU-ARRENDATARIO-18**: Como arrendatario, quiero recibir confirmación del pedido, para saber que todo está gestionado.

**HU-ARRENDATARIO-21 (core)**: Como arrendatario, quiero tener un apartado “Mis kits”, para ver todos los kits que tengo activos.

**HU-ARRENDATARIO-24**: Como arrendatario, quiero recibir una notificación antes de la entrega, para estar disponible.

**HU-ARRENDATARIO-26 (core)**: Como arrendatario, quiero que al seleccionar un tipo de objeto se me muestren todos los artículos disponibles de esa categoría en mi ciudad, para poder elegir el que más me convenga.

**HU-ARRENDATARIO-27 (core)**: Como arrendatario, quiero ver varias opciones del mismo tipo de objeto, para poder comparar entre distintos arrendadores.

**HU-ARRENDATARIO-28 (core)**: Como arrendatario, quiero ver el precio de cada artículo disponible, para elegir el que mejor se ajuste a mi presupuesto.

**HU-ARRENDATARIO-29 (core)**: Como arrendatario, quiero ver información sobre el estado o calidad del objeto (nuevo, poco usado, etc.), para decidir cuál prefiero alquilar.

**HU-ARRENDATARIO-32 (core)**: Como arrendatario, quiero poder cambiar el artículo elegido por otro del mismo tipo, para reconsiderar mi decisión antes de pagar.

**HU-ARRENDATARIO-34 (core)**: Como arrendatario, quiero valorar y dejar un comentario sobre el kit y el arrendador tras la devolución, para ayudar a otros usuarios.

**HU-ARRENDATARIO-37**: Como arrendatario, quiero saber que el depósito del 20% me será devuelto al finalizar el alquiler si todo está en buen estado, para tener tranquilidad al realizar el pago.

**HU-ARRENDATARIO-38**: Como arrendatario, quiero poder confirmar desde la app que el objeto recibido coincide con la descripción, imágenes y estado prometido, para validar que el servicio se ha cumplido correctamente.

**HU-ARRENDATARIO-39**: Como arrendatario, quiero poder indicar que el objeto no cumple con lo prometido, para que se revise el caso antes de liberar el pago completo al arrendador.

**HU-ARRENDATARIO-40**: Como arrendatario, quiero recibir automáticamente el reembolso del depósito cuando finalice el alquiler y el arrendador confirme que el objeto ha sido devuelto en buen estado, para recuperar mi dinero sin gestiones adicionales.

**HU-ARRENDATARIO-41**: Como arrendatario, quiero recibir una notificación cuando se procese la devolución de mi depósito, para saber que el proceso ha finalizado correctamente.

---

### 5.3. Administrador

**HU-ADMIN-04**: Como administrador, quiero crear nuevos tipos de objetos, para ampliar el catálogo disponible.

**HU-ADMIN-05**: Como administrador, quiero editar los tipos de objetos existentes, para corregir información o adaptarlos a nuevas necesidades.

**HU-ADMIN-06**: Como administrador, quiero eliminar tipos de objetos, para retirar del sistema aquellos que ya no deban ofrecerse.

**HU-ADMIN-07**: Como administrador, quiero asociar cada tipo de objeto a una categoría concreta, para mantener una estructura organizada y coherente.

**HU-ADMIN-08**: Como administrador, quiero modificar la categoría asociada a un tipo de objeto, para reorganizar el catálogo cuando sea necesario.  

**HU-ADMIN-11**: Como administrador, quiero mediar en caso de conflicto entre arrendador y arrendatario, para decidir entre devolución, compensación o alternativa.

**HU-ADMIN-12**: Como administrador, quiero configurar el porcentaje de comisión que la plataforma se queda por cada alquiler, para ajustar el modelo de negocio.

**HU-ADMIN-14 (core)**: Como administrador, quiero crear, editar y eliminar cuentas, para mantener el control sobre la aplicación.

| Versión | Fecha      | Descripción                                                                                                     | Autor(es)                |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 1.0.0   | 11/02/2026 | Primera versión de casos de uso de la aplicación                                                                | Marta Aguilar Morcillo   |
| 1.1.0   | 18/02/2026 | Añadidos algunos casos de uso                                                                                   | Cristina Fernández Chica |
| 2.0.0   | 24/02/2026 | Reestructuración de los casos de uso core y no core. Se han añadido algunos casos y unificado algunos de ellos  | Cristina Fernández Chica |

---
**Redactado por:** Marta Aguilar Morcillo y Cristina Fernández Chica  
**Fecha:** 24/02/2026  
**Versión:** 2.0.0
