# Mockups

En este apartado, se van a presentar los mockups de nuestra aplicación, Keakit, en formato móvil, con el fin de acercar su diseño a todo posible interesado en la misma.

Para ello, en primer lugar debemos tener en cuenta que nuestra aplicación cuenta con tres roles internos definidos:
- **Arrendador**: Aquel que pone objetos de su propiedad o servicios en alquiler.
- **Arrendatario**: Aquel que alquila kits, artículos individuales o servicios.
- **Administrador**: Aquel que se encarga de la administración de la aplicación.

A efectos prácticos, se ha decidido finalmente que solo existan dos roles `USER`  (que hará de arrendador y arrendatario desde un mismo perfil) y `ADMIN`.

En el siguiente enlace, se puede acceder al prototipo funcional de la aplicación: [Prototipo funcional inicial](https://keakit-prototype.netlify.app/)

En caso de querer empezar la navegación desde 0, pulsar sobre el logo de la aplicaicón en cualquiera de las pantallas (borrará los datos registrados en el navegador, para poder reiniciar el prototoipo).

## Índice

- **[Mockups Generales](#mockups-generales-1)**
  - [Registro e Inicio de sesión - Core](#registro-e-inicio-de-sesión---core-cu-general-01)
  - [Gestión datos personales - Core](#gestión-datos-personales---core-cu-general-02cu-general-03)
  - [Home - No core](#home---no-core-cu-general-05)

- **[Mockups Arrendador](#mockups-arrendador-1)**
  - [Subir artículos - Core](#subir-artículos---core-cu-arrendador-01)
  - [Perfil / Mis artículos - Core](#perfil--mis-artículos---core-cu-arrendador-02)
  - [Filtrado de mis artículos - No Core](#filtrado-de-mis-artículos---no-core-cu-arrendador-07)
  - [Detalles de artículo - Core](#detalles-de-artículo---core-cu-arrendador-03)
  - [Edición detalles artículo - Core](#edición-detalles-artículo---core-cu-arrendador-03)
  - [Cartera - Semi-Core](#cartera---semi-core-cu-arrendador-05cu-arrendatario-04)
  - [Gestión fin alquiler - No Core](#gestión-fin-alquiler---no-core-cu-arrendador-04)
  - [Notificaciones arrendador - No Core](#notificaciones-arrendador---no-core-cu-arrendador-06cu-arrendador-08)
  - [Consulta alta demanda - No Core](#consulta-alta-demanda---no-core-cu-arrendador-12)

- **[Mockups Arrendatario](#mockups-arrendatario-1)**
  - [Crear un kit - Core](#crear-un-kit---core-cu-arrendatario-01cu-arrendatario-02)
  - [Añadir Productos a un Kit - Core](#añadir-productos-a-un-kit---core-cu-arrendatario-01cu-arrendatario-02)
  - [Edición artículo en kit - Core](#edición-artículo-en-kit---core-cu-arrendatario-01cu-arrendatario-03)
  - [Pago - Core](#pago---core-cu-arrendatario-04)
  - [Perfil / Mis alquileres - Core](#perfil--mis-alquileres---core-cu-arrendatario-05)
  - [Detalles kit - Core](#detalles-kit---core-cu-arrendatario-02cu-arrendatario-05)
  - [Aviso disponibilidad - No Core](#aviso-disponibilidad---no-core-cu-arrendatario-09)
  - [Ampliación de búsqueda - No Core](#ampliación-de-búsqueda---no-core-cu-arrendatario-10)

- **[Mockups Administrador](#mockups-administrador-1)**
  - [Gestión categorías - Core](#gestión-categorías---core-cu-admin-01)
  - [Detalles tipo productos/categorías - Core](#detalles-tipo-productoscategorías---core-cu-admin-01)
  - [Edición tipo productos/categorías - Core](#edición-tipo-productoscategorías---core-cu-admin-01)
  - [Gestión usuarios - Semi Core](#gestión-usuarios---semi-core-cu-admin-02cu-admin-04)
  - [Configuración modelo de negocio - Core](#configuración-modelo-de-negocio---core-cu-admin-05)

## Mockups Generales

En primer lugar, nos centramos en aquellas pantallas que están generalizadas para todos los tipos de usuario, con diferencias mínimas en función del rol.

### Registro e Inicio de sesión - Core ([CU-GENERAL-01](./casos-de-uso.md#cu-general-01---registro-e-inicio-de-sesión))

Esta es la pantalla que se mostrará al entrar en el perfil por primera vez, en ella los usuarios de la aplicación podrán registrarse. En esta pantalla se deberán rellenar los datos corrrespondientes y pulsar el botón **"Registrarse"** para completar el registro.

<div style="text-align: center;">
  <img src="img/mockups/registro-arrendador.png"
       width="200"
       style="object-fit: cover; margin-right: 40px;"
       alt="Pantalla de registro: Arrendador">
  <img src="img/mockups/registro-arrendatario.png"
       width="200"
       style="object-fit: cover;"
       alt="Pantalla de registro: Arrendatario">
</div>

Esta pantalla corresponde al inicio de sesión en la aplicación. Tras completar los datos, se nos conducirá a la pantalla de **Home** de la aplicación. Los administradores ya estarán registrados previamente.

<div style="text-align: center;">
  <img src="img/mockups/inicio-de-sesion.png"
       width="200"
       style="object-fit: cover;"
       alt="Inicio de sesión: Arrendador">
</div>

### Gestión datos personales - Core ([CU-GENERAL-02](./casos-de-uso.md#cu-general-02---gestión-de-datos-personales)/[CU-GENERAL-03](./casos-de-uso.md#cu-general-03---valoraciones))

Al acceder desde la pantalla anterior a la edición del perfil mediante el lápiz, nos encontramos con la siguiente pantalla:

<div style="text-align: center;">
  <img src="img/mockups/pantalla-edicion-perfil-arrendador.png"
       width="200"
       style="object-fit: cover;"
       alt="Edicion perfil: Arrendador">
</div>

En esta pantalla también podremos observar el nivel de valoración de los usuarios a nuestro perfil.

### Home - No core ([CU-GENERAL-05](./casos-de-uso.md#cu-general-05---home))

Esta pantalla representa la pantalla de inicio de la aplicación. Cada tipo de usuario tiene la suya propia, con un diseño personalizado, adaptado al rol.

<div style="text-align: center;">
  <img src="img/mockups/home-arrendatario.png"
       width="200"
       style="object-fit: cover; margin-right: 40px;"
       alt="Pantalla de home: Arrendatario">
    <img src="img/mockups/home-admin.png"
       width="200"
       style="object-fit: cover;"
       alt="Pantalla de home: Admisnitrador">
</div>

## Mockups Arrendador

Centrándonos en el primer rol interno mencionado, el Arrendador, se presentan los siguientes mockups.

### Subir artículos - Core ([CU-ARRENDADOR-01](./casos-de-uso.md#cu-arrendador-01---subida-de-artículos))

Desde la pantalla de [**Home**](#home---no-core) mencionada anteriormente, y desde la gran mayoría de las pantallas de la aplicación, se podrá pular el icono **"+"**, que nos llevará a la pantalla desde la que se podrán relenar los datos para subir un artículo que queramos poner en alquiler.

<div style="text-align: center;">
  <img src="img/mockups/subir-articulo.png"
       width="200"
       style="object-fit: cover; margin-right: 40px;"
       alt="Subir un artículo: Arrendador">
  <img src="img/mockups/subir-articulo-relleno.png"
       width="200"
       style="object-fit: cover;"
       alt="Datos artículo rellenos: Arrendatario">
</div>

### Perfil / Mis artículos - Core ([CU-ARRENDADOR-02](./casos-de-uso.md#cu-arrendador-02---listado-de-artículos-subidos))

En la barra de navegación, encontraremos un icono correspondiente al perfil del usuario, si entramos, accederemos a la pantalla donde podremos ver nuestro datos de usuario como arrendador, junto con el listado de artículos que tenemos subidos para su alquiler. Desde aquí, también podremos acceder a la edción de nueustro perfil (mediante el icono del lápiz), a nuestra cartera (mediante le botón con este mismo nombre), y a la edición de aquellos artículos que actualmente no están alquilados por ningún usuario arrendatario (mediante el lápiz en cada uno de los artículos).

<div style="text-align: center;">
  <img src="img/mockups/perfil-arrendador-mis-articulos.png"
       width="200"
       style="object-fit: cover;"
       alt="Perfil/Mis artículos: Arrendador">
</div>

En caso de que alguno de los artículos que tenemos subidos a la aplicación estén alquilados en ese momento, nos aparecerá un cartel que nos lo indicará claramente, junto con la fecha de finalización del alquiler en curso.

Si pulsamos sobre los artículos que encontramos en la sección "Mis artículos", accederemos a los detalles del mismo, en una pantalla como la que se muestra a continuación.

<div style="text-align: center;">
  <img src="img/mockups/detalles-articulo.png"
       width="200"
       style="object-fit: cover;"
       alt="Detalles artículo: Arrendador">
</div>

Desde esta pantalla podremos acceder también a la pantalla de edición del artículo, o podremos eliminar el artículo.

### Filtrado de mis artículos - No Core ([CU-ARRENDADOR-07](./casos-de-uso.md#cu-arrendador-07---filtros-en-mis-artículos))

Además de lo anterior, se podrá realizar un filtrado por distintos aspectos como el precio, la categoría, etc. La sección de filtrado tendrá el siguiente aspecto:

<div style="text-align: center;">
  <img src="img/mockups/filtros-mis-art.png"
       width="200"
       style="object-fit: cover;"
       alt="Filtros Perfil/Mis artículos: Arrendador">
</div>


### Edición detalles artículo - Core ([CU-ARRENDADOR-03](./casos-de-uso.md#cu-arrendador-03---gestión-de-artículos-subidos))

Al acceder a la edición de los detalles de un artículo, se nos muestra la siguiente pantalla:

<div style="text-align: center;">
  <img src="img/mockups/pantalla-edicion-articulo.png"
       width="200"
       style="object-fit: cover;"
       alt="Edicion perfil: Arrendador">
</div>

Desde aquí, podremos editar cualquiera de los atributos asociados al artículo.


### Cartera - Semi-Core ([CU-ARRENDATARIO-04](./casos-de-uso.md#cu-arrendatario-04---pago-del-kit)/[CU-ARRENDADOR-05](./casos-de-uso.md#cu-arrendador-05---retirada-de-ingresos))

Como ya se ha mencionado, como arrendador arrendador, se podrá acceder a la cartera, desde donde se podrán revisar todos los movimientos del cliente en la aplicación, tanto los ingresos por alquiler, como las retiradas a su cuenta bancaria. La cartera viene representada por la siguiente pantalla:

<div style="text-align: center;">
  <img src="img/mockups/cartera-arrendador.png"
       width="200"
       style="object-fit: cover;"
       alt="Cartera: Arrendador">
</div>

### Gestión fin alquiler - No Core ([CU-ARRENDADOR-04](./casos-de-uso.md#cu-arrendador-04---gestión-de-fin-de-alquiler))

A esta pantalla se podrá acceder tras cierto tiempo después del fin de alquiler de un artículo, entrando en los detalles del artículo. Desde ella se deberá confirmar la devolución del artículo (o no) y si el estado en que se ha devuelto es óptimo.

<div style="text-align: center;">
  <img src="img/mockups/fin-alquiler-garantia.png"
       width="200"
       style="object-fit: cover;"
       alt="Cartera: Arrendador">
</div>

### Notificaciones arrendador - No Core ([CU-ARRENDADOR-06](./casos-de-uso.md#cu-arrendador-06---alertas-de-demanda)/[CU-ARRENDADOR-08](./casos-de-uso.md#cu-arrendador-08---notificaciones-de-actividad))

Como arrendador le llegarán distintos tipos de notificaciones, entre ellas:
- Notificación por **FIN DE ALQUILER**.
- Notificación por **DEMANDA** de un producto.
- Notificación por **ALQUILER** de un producto de su propiedad.
Estas notificaciones llegarán, en forma de notificaciones push, como se puede ver reflejado en las siguientes pantallas:

<div style="text-align: center;">
  <img src="img/mockups/notificacion-fin-alquiler.png"
       width="200"
       style="object-fit: cover; margin-right: 40px;"
       alt="Notificación fin alquiler: Arrendador">
  <img src="img/mockups/notificacion-demanda.png"
       width="200"
       style="object-fit: cover; margin-right: 40px;"
       alt="Notificación demanda: Arrendador">
    <img src="img/mockups/notificacion-articulo-alquilado.png"
       width="200"
       style="object-fit: cover;"
       alt="Notificación artículo alquilado: Arrendador">
</div>

Estas notificaciones, además, quedarán guardadas en un buzón de notificaciones al que se podrá acceder desde cualquier pantalla de la aplicación, en la esquina superior derecha.

<div style="text-align: center;">
  <img src="img/mockups/buzon-notificaciones.png"
       width="200"
       style="object-fit: cover;"
       alt="Buzón notificaciones: Arrendador">
</div>

### Consulta alta demanda - No Core (CU-ARRENDADOR12)

En esta pantalla, como arrendadores podrán mirar los artículos más demandados de cada tipo producto/categoría existente en la aplicación.

<div style="text-align: center;">
  <img src="img/mockups/demanda-buscador-cat.png"
       width="200"
       style="object-fit: cover; margin-right: 40px;"
       alt="Cartera: Arrendador">
  <img src="img/mockups/demanda-buscador.png"
       width="200"
       style="object-fit: cover;"
       alt="Cartera: Arrendador">
</div>

La esclamación presente en cada artículo, representa que es un artículo altamente demandado. Si es de color verde, es porque actualmente está disponible el artículo, si está en rojo, es porque en ese momento está alquilado por alguien. Se podrán ver también los detalles del número de usuarios que han alquilado cada uno de los artículos en esta sección.

## Mockups Arrendatario

### Crear un kit - Core ([CU-ARRENDATARIO-01](./casos-de-uso.md#cu-arrendatario-01---creación-de-kits)/[CU-ARRENDATARIO-02](./casos-de-uso.md#cu-arrendatario-02---visualización-dinámiaca-de-precios))

Desde prácticamente cualquier pantalla de la aplicación, tras haber iniciado sesión en la aplicación, como **Arrendatario** se podrá acceder a la pantalla de **creación de un kit** a través del icono **"+"** ubicado en la parte inferior derecha de la pantalla. Esta pantalla tendrá la siguiente composición;

<div style="text-align: center;">
  <img src="img/mockups/crear-kit.png"
       width="200"
       style="object-fit: cover;"
       alt="Crear kit: Arrendatario">
</div>

Desde esta pantalla, podremos rellenar los datos necesarios para crear un kit que queramos alquilar, pudiendo añadir cualquier prodcuto disponible en la aplicación en las fechas elegidas. Esta adición de productos, se hace a través del botón **"Añadir Producto +"**.

También, podremos acceder a la edición de determinados datos de los artículos que se van añadiendo al kit, pulsando en el icono del lápiz.

### Añadir Productos a un Kit - Core ([CU-ARRENDATARIO-01](./casos-de-uso.md#cu-arrendatario-01---creación-de-kits)/[CU-ARRENDATARIO-02](./casos-de-uso.md#cu-arrendatario-02---visualización-dinámiaca-de-precios))

Desde esta pantalla podremos realizar una búsqueda entre todos los artículos disponibles en la aplicación en las fechas indicadas para poder añadirlo al kit que estamos por alquilar. La pantalla seguiría el siguiente estilo:

<div style="text-align: center;">
  <img src="img/mockups/buscador-articulos-para-anadir.png"
       width="200"
       style="object-fit: cover;"
       alt="Añadir producto kit: Arrendatario">
</div>

### Edicion artículo en kit - Core ([CU-ARRENDATARIO-01](./casos-de-uso.md#cu-arrendatario-01---creación-de-kits)/[CU-ARRENDATARIO-03](./casos-de-uso.md#cu-arrendatario-03---gestión-logística-del-alquiler))

Desde esta pantalla podremos editar el tipo de envío que queremos para cada uno de los artículos que hemos incluído en el kit. 

<div style="text-align: center;">
  <img src="img/mockups/elegir-envio-articulo.png"
       width="200"
       style="object-fit: cover;"
       alt="Elegir envío artículo kit: Arrendatario">
</div>

### Pago - Core (Primera Versión) ([CU-ARRENDATARIO-04](./casos-de-uso.md#cu-arrendatario-04---pago-del-kit))

Desde esta pantalla podremos realizar el pago del kit que hemos montado. En ella tendremos que rellenar los datos de la tarjeta con la que se va a pagar. Además, aparecerán todos los gastos asocuados al alquiler del kit. La pantalla será como se muestra a continuación:

<div style="text-align: center;">
  <img src="img/mockups/pantalla-pago.png"
       width="200"
       style="object-fit: cover;"
       alt="Pago: Arrendatario">
</div>


### Perfil / Mis kits - Core ([CU-ARRENDATARIO-05](./casos-de-uso.md#cu-arrendatario-05---seguimiento-de-alquileres-activos))

Como ya se ha mencionado, en la barra de navegación se encuentra un icono que corresponde al perfil del usuario. Al acceder a esta pantalla con rol Arrendatario, nos encontraremos el perfil del usuario, y los alquileres que tiene el mismo, puediendo entrar a ver sus detalles. También, se podrá acceder a la edición de los datos de si perfil.


<div style="text-align: center;">
  <img src="img/mockups/perfil-arrendatario-mis-alquileres.png"
       width="200"
       style="object-fit: cover;"
       alt="Edicion perfil: Arrendatario">
</div>


### Detalles kit - Core ([CU-ARRENDATARIO-02](./casos-de-uso.md#cu-arrendatario-02---visualización-dinámiaca-de-precios)/[CU-ARRENDATARIO-05](./casos-de-uso.md#cu-arrendatario-05---seguimiento-de-alquileres-activos))

Si en la pantalla anterior (Perfil / Mis kits) pulsamos sobre alguno de los kits que tiene el usuario en alquiler, se podrá acceder a los detalles del mismo. En caso de que aún no se haya recibido el kit, al entrar en los detalles del kit aparecerá una la misma pantalla pero con dos opciones: `RECIBIDO` o `NO RECIBIDO`, que servirán para confirmar la recepción (o no) del kit. Todo esto se observa en las siguientes pantallas:

<div style="text-align: center;">
  <img src="img/mockups/detalles-kit-alquilado.png"
       width="200"
       style="object-fit: cover; margin-right: 40px;"
       alt="Edicion perfil: Arrendatario">
  <img src="img/mockups/confirmar-recepcion-kit.png"
       width="200"
       style="object-fit: cover;"
       alt="Edicion perfil: Arrendatario">
</div>

### Aviso disponibilidad - No Core ([CU-ARRENDATARIO-09](./casos-de-uso.md#cu-arrendatario-09---avisos-de-disponibilidad))

En caso de que al querer añadir un producto al kit, este no esté disponible, podemos indicar que nos avise cuando pase a estar disponible con una notificación en la aplicación.

<div style="text-align: center;">
  <img src="img/mockups/aviso-disponibilidad.png"
       width="200"
       style="object-fit: cover;"
       alt="Aviso disponibilidad: Arrendatario">
</div>


### Ampliación de búsqueda - No Core ([CU-ARRENDATARIO-10](./casos-de-uso.md#cu-arrendatario-10---ampliación-de-búsqueda-geográfica))

En caso de que al hacer una búsqueda de artículos para añadir a un kit, esta no ofrezca ningún resultado, se dará la opción de ampliar la búsqueda a regiones más lejanas (con su consecuente aumento de gastos de envío).

<div style="text-align: center;">
  <img src="img/mockups/ampliar-busqueda.png"
       width="200"
       style="object-fit: cover;"
       alt="Ampliar búsqueda: Arrendatario">
</div>


## Mockups Administrador

### Gestión categorías - Core ([CU-ADMIN-01](./casos-de-uso.md#cu-admin-01---gestión-de-categorías))

Desde esta pantalla el administrador podrá filtrar, buscando el tipo de producto/categoría que desee y puediendo entrar a editarlo o ver sus detalles, si es necesario. También, se podrá acceder a la creación deun nuevo tipo de producto/categoría a través del icono "+" en la parte inferior de la pantalla.

<div style="text-align: center;">
  <img src="img/mockups/categorias-tipos-prductos.png"
       width="200"
       style="object-fit: cover;"
       alt="Gestión tipos de productos/categorías: Admin">
</div>


### Detalles tipo productos/categorías - Core ([CU-ADMIN-01](./casos-de-uso.md#cu-admin-01---gestión-de-categorías))

Desde esta pantalla, se podrán ver todos los detalles de la categoría, además de poder acceder a su edición mediante el icono del lápiz.

<div style="text-align: center;">
  <img src="img/mockups/detalles-tipo-categoria.png"
       width="200"
       style="object-fit: cover;"
       alt="Detalles tipos de productos/categorías: Admin">
</div>

### Edición tipo productos/categorías - Core ([CU-ADMIN-01](./casos-de-uso.md#cu-admin-01---gestión-de-categorías))

Desde esta pantalla, se podrán editar los tipos de productos/categorías disponibles en la aplicación. La pantalla de creación de tipos de productos/categorías será exactamente igual, pero con los campos vacíos listos para rellenar.

<div style="text-align: center;">
  <img src="img/mockups/Edición tipo-categoría.png"
       width="200"
       style="object-fit: cover;"
       alt="Edición tipos productos/categorías: Admin">
</div>

### Gestión usuarios - Semi Core ([CU-ADMIN-02](./casos-de-uso.md#cu-admin-02---listado-de-usuarios)/[CU-ADMIN-04](./casos-de-uso.md#cu-admin-04---gestión-de-usuarios))

Desde esta pantalla, el administrador podrá buscar entre todos los usuarios de la aplicación, acceder a sus detalles y eliminarlos.

<div style="text-align: center;">
  <img src="img/mockups/gestion-usuarios.png"
       width="200"
       style="object-fit: cover;"
       alt="Gestión usuarios: Admin">
</div>

### Configuración modelo de negocio - Core ([CU-ADMIN-05](./casos-de-uso.md#cu-admin-05---configuración-modelo-negocio--transacción))

Dentro de las distintas configuraciones que podrá hacer el administrador, una de las más importantes es el porcentaje por transacción que se lleva la empresa.

<div style="text-align: center;">
  <img src="img/mockups/config-porcentaje-trans.png"
       width="200"
       style="object-fit: cover;"
       alt="Configuración porcentaje transacción: Admin">
</div>