# Mockups

En este apartado, se van a presentar los mockups de nuestra aplicación, Keakit, en formato móvil, con el fin de acercar su diseño a todo posible interesado en la misma.

Para ello, en primer lugar debemos tener en cuenta que nuestra aplicación cuenta con tres roles definidos:
- **Arrendador**: Aquel que pone objetos de su propiedad o servicios en alquiler.
- **Arrendatario**: Aquel que alquila kits, artículos individuales o servicios.
- **Administrador**: Aquel que se encarga de la administración de la aplicación.

## Mockups Generales

En primer lugar, nos centramos en aquellas pantallas que están generalizadas para todos los tipos de usuario, con diferencias mínimas en función del rol.

### Registro - Core

Esta es la pantalla que se mostrará al iniciar la aplicación móvil por primera vez, en ella los usuarios de la aplicación podrán registrarse con dos roles distintos: Arrendador o arrendatario. En esta pantalla se deberán rellenar los datos corrrespondientes y pulsar el botón **"Registrarse"** para completar el registro.

<div style="text-align: center;">
  <img src="img/mockups/Registro Arrendador.png"
       width="200"
       style="object-fit: cover; margin-right: 40px;"
       alt="Pantalla de registro: Arrendador">
  <img src="img/mockups/Registro Arrendatario.png"
       width="200"
       style="object-fit: cover;"
       alt="Pantalla de registro: Arrendatario">
</div>


### Inicio de sesión - Core

Esta pantalla corresponde al inicio de sesión en la aplicación. Tras completar los datos, se nos conducirá a la pantalla de **Home** del rol correspondiente.

<div style="text-align: center;">
  <img src="img/mockups/Inicio de sesión.png"
       width="200"
       style="object-fit: cover;"
       alt="Inicio de sesión: Arrendador">
</div>

### Home - Core

Esta pantalla representa la pantalla principal de la aplicación. Cada tipo de usuario tiene la suya propia, con un diseño personalizado, adaptado al rol.

<div style="text-align: center;">
  <img src="img/mockups/Home Arrendador.png"
       width="200"
       style="object-fit: cover; margin-right: 40px;"
       alt="Pantalla de home: Arrendador">
  <img src="img/mockups/Home Arrendatario.png"
       width="200"
       style="object-fit: cover; margin-right: 40px;"
       alt="Pantalla de home: Arrendatario">
    <img src="img/mockups/Home Admin.png"
       width="200"
       style="object-fit: cover;"
       alt="Pantalla de home: Admisnitrador">
</div>

## Mockups Arrendador

Centrándonos en el primer rol mencionado, el Arrendador, se presentan los siguientes mockups.

### Subir artículos - Core

Desde la pantalla de **Home** mencionada anteriormente, y desde la gran mayoría de las pantallas de la aplicación, se podrá pular el icono **"+"**, que nos llevará a la pantalla desde la que se podrán relenar los datos para subir un artículo que queramos poner en alquiler.

<div style="text-align: center;">
  <img src="img/mockups/Subir artículo.png"
       width="200"
       style="object-fit: cover; margin-right: 40px;"
       alt="Subir un artículo: Arrendador">
  <img src="img/mockups/Subir artículo-relleno.png"
       width="200"
       style="object-fit: cover;"
       alt="Datos artículo rellenos: Arrendatario">
</div>

### Perfil / Mis artículos - Core

En la barra de navegación, encontraremos un icono correspondiente al perfil del usuario, si entramos, accederemos a la pantalla donde podremos ver nuestro datos de usuario como arrendador, junto con el listado de artículos que tenemos subidos para su alquiler. Desde aquí, también podremos acceder a la edción de nueustro perfil (mediante el icono del lápiz), a nuestra cartera (mediante le botón con este mismo nombre), y a la edición de aquellos artículos que actualmente no están alquilados por ningún usuario arrendatario (mediante el lápiz en cada uno de los artículos).

<div style="text-align: center;">
  <img src="img/mockups/Perfil arrendador-Mis artículos.png"
       width="200"
       style="object-fit: cover;"
       alt="Perfil/Mis artículos: Arrendador">
</div>

En caso de que alguno de los artículos que tenemos subidos a la aplicación estén alquilados en ese momento, nos aparecerá un cartel que nos lo indicará claramente, junto con la fecha de finalización del alquiler en curso.

### Edición perfil usuario - Core

Al acceder desde la pantalla anterior a la edición del perfil mediante el lápiz, nos encontramos con la siguiente pantalla:

<div style="text-align: center;">
  <img src="img/mockups/Pantalla edición perfil arrendador.png"
       width="200"
       style="object-fit: cover;"
       alt="Edicion perfil: Arrendador">
</div>


### Detalles de artículo - Core

Si pulsamos sobre los artículos que encontramos en la sección "Mis artículos" de la pantalla del perfil **Arrendador**, accederemos a los detalles del mismo, en una pantalla como la que se muestra a continuación.

<div style="text-align: center;">
  <img src="img/mockups/Detalles artículo.png"
       width="200"
       style="object-fit: cover;"
       alt="Detalles artículo: Arrendador">
</div>

Desde esta pantalla podremos acceder también a la pantalla de edición del artículo, o podremos eliminar el artículo.

### Edición detalles artículo - Core

Al acceder a la edición de los detalles de un artículo, se nos muestra la siguiente pantalla:

<div style="text-align: center;">
  <img src="img/mockups/Pantalla edición artículo.png"
       width="200"
       style="object-fit: cover;"
       alt="Edicion perfil: Arrendador">
</div>

Desde aquí, podremos editar cualquiera de los atributos asociados al artículo.


### Cartera - Core

Como ya se ha mencionado, desde el perfil del arrendador, se podrá acceder a la cartera, desde donde se podrán revisar todos los movimientos del cliente en la aplicación, tanto los ingresos por alquiler, como las retiradas a su cuenta bancaria. La cartera viene representada por la siguiente pantalla:

<div style="text-align: center;">
  <img src="img/mockups/Cartera arrendador.png"
       width="200"
       style="object-fit: cover;"
       alt="Cartera: Arrendador">
</div>

### Notificaciones - No Core

Al arrendador le llegarán distintos tipos de notificaciones, entre ellas:
- Notificación por **FIN DE ALQUILER**.
- Notificación por **DEMANDA** de un producto.
- Notificación por **ALQUILER** de un producto de su propiedad.
Estas notificaciones llegarán, en forma de notificaciones push, como se puede ver reflejado en las siguientes pantallas:

<div style="text-align: center;">
  <img src="img/mockups/Notificación fin alquiler.png"
       width="200"
       style="object-fit: cover; margin-right: 40px;"
       alt="Notificación fin alquiler: Arrendador">
  <img src="img/mockups/Notificación demanda.png"
       width="200"
       style="object-fit: cover; margin-right: 40px;"
       alt="Notificación demanda: Arrendador">
    <img src="img/mockups/Notificación artículo alquilado.png"
       width="200"
       style="object-fit: cover;"
       alt="Notificación artículo alquilado: Arrendador">
</div>

Estas notificaciones, además, quedarán guardadas en un buzón de notificaciones al que se podrá acceder desde cualquier pantalla de la aplicación, en la esquina superior derecha.

<div style="text-align: center;">
  <img src="img/mockups/Buzón notificaciones.png"
       width="200"
       style="object-fit: cover;"
       alt="Buzón notificaciones: Arrendador">
</div>

## Mockups Arrendatario

### Crear un kit - Core

Desde prácticamente cualquier pantalla de la aplicación, tras haber iniciado sesión en la aplicación con un perfil de rol **Arrendatario**, se podrá acceder a la pantalla de **creación de un kit** a través del icono **"+"** ubicado en la parte inferior derecha de la pantalla. Esta pantalla tendrá la siguiente composición;

<div style="text-align: center;">
  <img src="img/mockups/Crear kit.png"
       width="200"
       style="object-fit: cover;"
       alt="Crear kit: Arrendatario">
</div>

Desde esta pantalla, podremos rellenar los datos necesarios para crear un kit que queramos alquilar, pudiendo añadir cualquier prodcuto disponible en la aplicación en las fechas elegidas. Esta adición de productos, se hace a través del botón **"Añadir Producto +"**.

También, podremos acceder a la edición de determinados datos de los artículos que se van añadiendo al kit, pulsando en el icono del lápiz.

### Añadir Productos a un Kit - Core

Desde esta pantalla podremos realizar una búsqueda entre todos los artículos disponibles en la aplicación en las fechas indicadas para poder añadirlo al kit que estamos por alquilar. La pantalla seguiría el siguiente estilo:

<div style="text-align: center;">
  <img src="img/mockups/Buscador artículos para añadir.png"
       width="200"
       style="object-fit: cover;"
       alt="Añadir producto kit: Arrendatario">
</div>

### Edicion artículo en kit - Core

Desde esta pantalla podremos editar el tipo de envío que queremos para cada uno de los artículos que hemos incluído en el kit. 

<div style="text-align: center;">
  <img src="img/mockups/Elegir envío artículo.png"
       width="200"
       style="object-fit: cover;"
       alt="Elegir envío artículo kit: Arrendatario">
</div>

### Pago - Core

Desde esta pantalla podremos realizar el pago del kit que hemos montado. En ella tendremos que rellenar los datos de la tarjeta con la que se va a pagar. Además, aparecerán todos los gastos asocuados al alquiler del kit. La pantalla será como se muestra a continuación:

<div style="text-align: center;">
  <img src="img/mockups/Pantalla pago.png"
       width="200"
       style="object-fit: cover;"
       alt="Pago: Arrendatario">
</div>

------ POR COMPLETAR -----

### Perfil / Mis alquileres - Core



### Detalles kit - Core


### Mockups Administrador

### Gestión tipos productos/categorías - Core

### Detalles tipo productos/categorías - Core

### Edición tipo productos/categorías - Core

### Gestión usuarios - Core