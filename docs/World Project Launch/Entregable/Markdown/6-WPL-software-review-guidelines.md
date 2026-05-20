# PPL - Software Review Guidelines

## Enlace al despliegue

**Enlace:** https://keakitwpl.web.app

## Enlace a la tag de la última release

**Enlace:** https://github.com/KeaKit/KeaKit/releases/tag/v5.0.0

## Casos de uso desarrollados

- **CU-GENERAL-01** – Registro e inicio de sesión: Permite a los usuarios crear una cuenta o acceder al sistema mediante sus credenciales.
- **CU-GENERAL-02** – Gestión de datos personales: Facilita la edición y actualización de la información del perfil de un usuario registrado.
- **CU-GENERAL-03** – Valoraciones: Permite a los usuarios puntuar y comentar su experiencia tras finalizar un alquiler.
- **CU-GENERAL-04** – Soporte: Proporciona un canal de comunicación directo para resolver dudas o problemas técnicos.
- **CU-GENERAL-05** – Home: Ofrece una pantalla principal con accesos rápidos y artículos destacados personalizados.
- **CU-GENERAL-06** – Descuentos según nivel de usuario piloto: Aplica distintos porcentajes de descuento a los arrendatarios en su primer kit y a los arrendadores en la primera comisión que reciben, en función de la cantidad de formularios rellenados como usuarios piloto.
- **CU-GENERAL-07** – Implementar GDPR: Asegura que el tratamiento de datos personales cumpla con el Reglamento General de Protección de Datos, permitiendo el acceso, rectificación y borrado de información sensible.
- **CU-ARRENDADOR-01** – Subida de artículos: Permite a los dueños publicar objetos reales definiendo precio, ciudad y categoría.
- **CU-ARRENDADOR-02** – Listado de artículos subidos: Muestra una vista organizada de todos los artículos que el dueño ha subido a la plataforma.
- **CU-ARRENDADOR-03** – Gestión de artículos subidos: Habilita la edición de detalles o el borrado de artículos siempre que no estén alquilados.
- **CU-ARRENDADOR-05** – Retirada de ingresos: Permite transferir el saldo acumulado en la cartera de la app hacia una cuenta externa.
- **CU-ARRENDADOR-10** – Historial de alquileres de un objeto: Registra y muestra el listado histórico de todas las veces que un objeto específico fue alquilado.
- **CU-ARRENDADOR-11** – Descuento según nivel de usuario piloto: Permite a los arrendadores de la fase piloto acceder a bonificaciones en las comisiones de publicación de objetos según la cantidad de formularios que hayan rellenado.
- **CU-ARRENDATARIO-01** – Creación de kits: Permite agrupar varios artículos para alquilarlos conjuntamente bajo un mismo nombre y fechas.
- **CU-ARRENDATARIO-02** – Visualización dinámica de precios: Calcula y muestra en tiempo real el coste total del kit según se añaden o quitan objetos.
- **CU-ARRENDATARIO-03** – Gestión logística del alquiler: Permite elegir entre recogida en mano o envío mediante servicios de logística externos.
- **CU-ARRENDATARIO-04** – Pago del kit: Procesa el pago seguro del alquiler mediante tarjeta de crédito o métodos electrónicos.
- **CU-ARRENDATARIO-05** – Seguimiento de alquileres activos: Ofrece una vista del estado actual y fechas límite de los kits que el usuario tiene alquilados.
- **CU-ARRENDATARIO-07** – Modificar kits predeterminados: Habilita la personalización de kits sugeridos por la app para adaptarlos a necesidades específicas.
- **CU-ARRENDATARIO-10** – Ampliación de búsqueda geográfica: Sugiere artículos en localidades cercanas cuando no hay stock exacto en la ciudad buscada.
- **CU-ARRENDATARIO-11** – Historial de alquileres: Muestra el archivo histórico de todos los kits alquilados y completados por el usuario.
- **CU-ARRENDATARIO-12** – Descuento según nivel de usuario piloto: Ofrece cupones de descuento a los arrendatarios en la compra de su primer kit si rellenan una serie de formularios durante el periodo piloto.
- **CU-ADMIN-01** – Gestión de categorías: Permite crear y organizar las categorías de la plataforma y sus rangos de precios permitidos.
- **CU-ADMIN-02** – Listado de usuarios: Proporciona una vista global de todas las cuentas registradas en el sistema.
- **CU-ADMIN-04** – Gestión de usuarios: Facilita la creación, edición o eliminación de cuentas de usuario desde el panel de gestión.
- **CU-ADMIN-05** – Configuración modelo negocio: Habilita la configuración de parámetros críticos como el porcentaje de comisión de la plataforma.
- **CU-ADMIN-06** – Creación kits predeterminados: Permite diseñar packs de artículos sugeridos para facilitar la experiencia de alquiler al usuario.
- **CU-ADMIN-07** – Sistema de recompensas para usuarios piloto: Define y gestiona las reglas de asignación de descuentos para los usuarios piloto que rellenen una serie de encuestas.

> Durante esta entrega no se han implementado nuevos casos de uso, solo se han ampliado algunos de los ya existentes.

## Fallos y mejoras identificados

### Fallos

| **Fuente** | **Fallo** | **Solución proporcionada** | **Issue asociada** | **Impacto** | **Urgencia** | **Estado** | **Resultado obtenido** |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PUG (Bookmerang) | El formulario de la interfaz de retirada de dinero valida erróneamente un valor mínimo mayor que 0.00 (permitiendo enviar 0.1), cuando la regla de negocio real exige un mínimo de 1.00 | Se han implementado las validaciones correspondientes. | #894 | Alto | Alto | 🟢 Solucionado | Se evitan errores de retirada. |
| PUG (Bookmerang) | Al enviar una cantidad menor de un euro (interacción permitida por el formulario), el backend rechaza la petición devolviendo un código HTTP 500 (Internal Server Error) en la llamada withdraw. | Se han implementado las validaciones correspondientes. | #894 | Alto | Alta | 🟢 Solucionado | Se evitan errores de retirada. |
| PUG (Bookmerang) | El sistema muestra un mensaje de excepción crudo y sin capturar en el cliente: Amount must be no less than €1.00..., exponiendo las trazas de código internas del servidor directamente en el modal de cara al usuario. | Se ha capturado el error y ahora se muestra correctamente, gracias a las validaciones también. | #894 | Alto | Alta | 🟢 Solucionado | Se evitan errores de retirada. |
| PUG (Bookmerang) | Validación de emails no se hace correctamente al registrarse. | Se ha añadido un pattern personalizado junto al validador @Email, ya que este permitía crear emails del tipo email@examplecom (sin punto, es decir, un dominio no válido). | #897 | Alto | Alta | 🟢 Solucionado | Evita problemas con envíos de emails. |
| PUG (Bookmerang) | Al crear un artículo, el formulario de la pantalla envía de forma oculta el parámetro status. Interceptando la petición con Burp Suite, el backend acepta cualquier estado modificado sin verificarlo en el servidor. Esto permite a un actor forzar la creación de un producto en estados restringidos que solo el sistema o un administrador deberían gestionar. | El backend asegura un estado por defecto a la hora de crear un artículo, evitando así que se pueda inyectar desde el frontend un estado no válido. | #898 | Alto | Alta | 🟢 Solucionado | Se pueden editar artículos de forma correcta. |
| PUG (Bookmerang) | Se permite asignar categoría en estado borrador al actualizar un artículo. | Se ha modificado la función de actualizar un artículo para que ahora compruebe que el estado de la categoría sea correcto. | #899 | Bajo | Baja | 🟢 Solucionado | Ahora se pueden asignar las categorías verdaderamente disponibles. |
| PUG (Bookmerang) | El precio de cada producto del kit se envía directamente desde el frontend hacia el backend al pulsar "Realizar pedido". Esto permite interceptar y manipular la petición para alterar los precios unitarios de los productos por mes, logrando tramitar la compra del kit completo por un valor total de 0€. | Corrección al guardar los artículos (Snapshots): En el método itemSelectionToSnapshots, se eliminó el uso del precio proveniente del cliente (sel.pricePerMonth()) y se forzó a que el sistema asigne el precio verídico extraído de la entidad Item de la base de datos (item.getPricePerMonth()). Corrección al calcular el presupuesto: En el método getKitPayment(KitCreateRequest request, ...), se modificó la lógica para que el sistema busque primero el artículo en la base de datos y utilice su precio original para calcular el subtotal (multiplicando por la cantidad y los meses), ignorando el precio enviado en la petición. | #901 | Alto | Alta | 🟢 Solucionado | Se evitan errores en la creación de un kit. |
| PUG (Bookmerang) | Se permite título de categoría demasiado extenso. | Se ha añadido la validación correspondiente para el atributo nombre en backend. | #903| Bajo | Baja | 🟢 Solucionado | No se permiten valores imposibles, mejora estética y usabilidad. |
| PUG (Bookmerang) | Panic al eliminar usuarios. | Se ha añadido el lado que faltaba de la relación User y RgpdConsent del primero al segundo y configurado para que el consentimiento almacenado se elimine en cascada para evitar el error de base de datos que ocurría. | #904| Alto | Alta | 🟢 Solucionado | Ahora se puede eliminar un usuario correctamente. |
| PUG (Bookmerang) | Estando logueado como Lucia, aparece el punto rojo encima de la campana de notificaciones a pesar de no haber ninguna. | Se han puesto en común las notificaciones de tracking y las de actividad para que se muestren todas (siempre que sean nuevas) al pulsar la campana. Además, se ha añadido un tracking de prueba al seeder que daba lugar a error al no existir. | #912| Bajo | Baja | 🟢 Solucionado | Todas las notificaciones han quedado unificadas en la misma bandeja, lo que mejora la usabilidad. |
| PUG (Bookmerang) | Pagar con mi saldo de KeaKit devuelve 500 incontrolado. | Ya que no se ha podido replicar el problema, se ha controlado el mensaje de error mostrando un mensaje genérico en caso de que se trate de un error con código de estado 500. | #914| Alto | Alta | 🟢 Solucionado | Evitamos errores en la creación de kits al pagar con la cartera. |
| PUG (Bookmerang) | El formulario de origen permite introducir y enviar un nombre de kit que supera los 255 caracteres sin aplicar ninguna validación o restricción en el frontend (maxlength), arrastrando el dato inválido hasta el checkout. | **Este error se controló en la entrega anterior, por lo que no es posible que haya sucedido.** No han aportado pruebas gráficas del error y no se ha podido reproducir. | #915| Bajo | Bajo | 🟢 Solucionado desde la entrega anterior | - |
| PUG (Bookmerang) | Al intentar editar un objeto pagado sale el mensaje de error "El artículo está actualmente alquilado y no puede ser editado" (inconsistente debido a que se trata del mismo mensaje que sale para los objetos alquilados). | Por un lado se comprueba si está alquilado el artículo y por otro lado se comprueba si está pagado, cada uno con su respectivo mensaje de error. | #920| Alto | Alto | 🟢 Solucionado | Ahora saltan los mensajes con un texto coherente. |
| PUG (Bookmerang) | Como arrendatario, al seleccionar un rango de fechas en el que el MacBook Pro está alquilado, el sistema sigue mostrando 1 unidad disponible. Sin embargo, al decrementar el artículo no se permite volver a incrementarlo, lo que evidencia una inconsistencia: el sistema debería detectar desde el principio que el artículo no está disponible en ese rango y reflejarlo correctamente, en lugar de permitir seleccionarlo y bloquearlo posteriormente. | **Somos conscientes de este error, se trata de un problema con los seeders que no ha sido posible solucionarlo por tiempo.** | #921| Bajo | Bajo | 🔴 No solucionado | - |
| PUG (Bookmerang) | No puedo buscar en el mapa objetos que valgan menos de 1 euro o 0 (inconsistencia con lo puesto en el guideline tras el fix de la issue #655 sí se permiten artículos gratuitos). | Se ha corregido el filtrado que se realizaba. | #922| Bajo | Bajo | 🟢 Solucionado | El filtrado es más preciso, lo que ayuda en la búsqueda de artículos y servicios. |
| PUG (Bookmerang) | Como admin, al editar el rango de precios de una categoría, los artículos existentes cuyo precio quede fuera del nuevo rango no pueden ser guardados por el arrendador aunque no se realice ningún cambio sobre ellos, mostrando el mensaje "El precio debe estar entre X€ y X€ para esta categoría". El sistema debería permitir mantener artículos ya existentes sin forzar al arrendador a modificar su precio como consecuencia de un cambio administrativo. | **Somos conscientes de este error, no ha sido posible solucionarlo por tiempo.** | #923| Medio | Medio | 🔴 No solucionado | El filtrado es más preciso, lo que ayuda en la búsqueda de artículos y servicios. |
| PUG (Bookmerang) | Validación de teléfono resulta en 500 al crear usuario. | Se ha estandarizado el patrón que deben seguir los números de teléfono en toda la aplicación. El error ocurría porque la entidad User y el dto de admin tenían validadores distintos. | #924| Alto | Alto | 🟢 Solucionado | Ahora hay una correcta validación del teléfono en toda la apliación. |
| Equipo KeaKit | Mensaje de devolución de garantía mostrado al usuario incorrecto. | **Somos conscientes del error** | #803| Medio | Medio | 🔴 No solucionado | -|
| Equipo KeaKit | Se ha detectado una inconsistencia en la lógica de estados de los artículos dentro de un Kit. Cuando los propietarios evalúan el estado de sus productos (marcar como "Dañado" o "Buen estado"), el sistema cambia automáticamente el detalle del alquiler a "Finalizado", ignorando que la fecha de finalización del contrato aún no ha expirado. Además, pone los artículos en estado Disponible aunque no lo están. | **Somos conscientes del error** | #780| Medio | Medio | 🔴 No solucionado | -|
| Equipo KeaKit | Devolución de garantía que nunca ha sido cobrada. | **Somos conscientes del error** | #805| Medio | Medio | 🔴 No solucionado | -|
| Equipo KeaKit | Disponibilidad errónea tras evaluación prematura. | **Somos conscientes del error** | #808| Medio | Medio | 🔴 No solucionado | -|

### Mejoras

| **Fuente** | **Mejora** | **Solución proporcionada** | **Issue asociada** | **Impacto** | **Urgencia** | **Estado** | **Resultado obtenido** |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Equipo KeaKit | Mejorar visualización de pantalla de home del administrador, eliminando también los menús no utilizados. | Se han unificado estilos y eliminado apartados no utilizados.| - | Bajo | Baja | 🟢 Implementada | Mayor claridad para la administración de la apliación. |
| Equipo KeaKit | Evitar superposición de la barra de navegación en listado de artículos subidos. | **Somos conscientes de la necesida de  esta mejora**| #906 | Bajo | Baja | 🔴 No implementada | - |


## Datos necesarios

Para realizar las pruebas de inicio de sesión, se pueden utilizar las siguientes credenciales:

| Correo electrónico   | Contraseña       |
| :------------------- | :--------------- |
| `owner@example.com`  | `password123`    |
| `tenant@example.com` | `password123`    |
| `admin@tusitio.com`  | `password_admin` |

## Requisitos para utilizar el sistema

- Conexión a Internet.
- Navegador web actualizado.
