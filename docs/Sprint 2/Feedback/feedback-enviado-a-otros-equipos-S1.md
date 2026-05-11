# Informe de Feedback Sprint 2: NexUS y MeerKatters

## 1. NexUS

### Casos de uso probados

---


####  Autenticación

Casos de uso probados:

* Registro de usuarios mediante email.
* Inicio y cierre de sesión.
* Recuperación de contraseña.
* Gestión de roles.
* Edición de perfil.
* Manter sesión iniciada.

---

###### Registro de usuarios mediante email.

**Funcionamiento detectado**
* El sistema efectivamente crea al usuario y le envia el correo en caso de no haber puesto contraseña

**Funcionamiento mejorable**
* deberia haber un tamaño maximo de contraseña. me dejo poner una de mil caracteres y el correo de bienvenida deberia ser distinto al de recuperacion de contraseña o indicar que el correo que se envia no es de bienvenida sino de recuperación de contraseña

**Failure condition detectada**
* ninguna

---

###### Inicio y cierre de sesión.

**Funcionamiento detectado**
* El sistema efectivamente permite iniciar y cerrar sesión.

**Funcionamiento mejorable**
* nada

**Failure condition detectada**
* ninguna

---

###### Recuperación de contraseña.

**Funcionamiento detectado**
* El sistema envia en corto tiempo un correo de recuperacion de contraseña y funciona correctamente.

**Funcionamiento mejorable**
* nada

**Failure condition detectada**
* ninguna

---
###### Gestión de roles.

**Funcionamiento detectado**
* El sistema diferencia entre administrador y estudiante.

**Funcionamiento mejorable**
* nada

**Failure condition detectada**
* ninguna

---

###### Edición de perfil.

**Funcionamiento detectado**
* El sistema permite la edicion de perfil tanto de administrador como de estudiante.

**Funcionamiento mejorable**
* como estudiante el nombre completo pese a tener el *, no se te permite cambiar, por lo que convendria que no apareciera en la pantalla de edicion o se quitara el * que da a entender que es obligatorio 

**Failure condition detectada**
* T-12: al modificar el apodo desde estudiante y poner un apodo suuuuper largo salta un error de que no se puede guardar, deberia haber un validador de longitud

---

###### Edición de perfil.

**Funcionamiento detectado**
* se mantiene la sesion iniciada correctamente

**Funcionamiento mejorable**
* nada

**Failure condition detectada**
* nada
---

#### Panel residencias

Casos de uso probados:

* Acceso e interacción con el panel administrativo.
* Gestión de personal (CRUD).
* Gestión de residentes (CRUD).
* Filtrado y visualización de detalles de las habitaciones.


---

###### Acceso e interacción con el panel administrativo.

**Funcionamiento detectado**
* se puede interactuar con el panel

**Funcionamiento mejorable**
* nada

**Failure condition detectada**
* nada
---

###### Gestión de personal (CRUD).

**Funcionamiento detectado**
* Puedes crear, borrar, ver a una persona

**Funcionamiento mejorable**
* cuando pones muchos caracteres efectivamente tiene comprobacion de que no se superen, pero no te dice en cual campo estas violando esa restriccion, simplemente te aparece el mensaje por ahi

**Failure condition detectada**
* nada
  
---

###### Filtrado y visualización de detalles de las habitaciones.

**Funcionamiento detectado**
* Puedes filtrar y visualizar habitaciones

**Funcionamiento mejorable**
* niguno

**Failure condition detectada**
* T12- Se contara como fallo pues aunque no sea un caso de uso explicito, los botones estan y no se ha especificado nada en la guia, al crear una habitacion y tener algun error en la validacion, pese a que la validacion salta, una vez corriges el fallo el error no desaparece y tampoco te deja presionar el boton de guardar 
  
---

###### Gestión de residentes (CRUD).

**Funcionamiento detectado**
* Puedes crear, eliminar, leer a un estudiante

**Funcionamiento mejorable**
* niguno

**Failure condition detectada**
* T12- comentado anteriormente pero al crear o editar el campo checking no se guarda
  
---


#### Onboarding

Casos de uso probados:

* Dar de alta a nuevos residentes a través de un formulario.
* Preinscripción a través de formulario.

---

###### **Dar de alta a nuevos residentes a través de un formulario**

**Funcionamiento detectado**

* El sistema permite crear residentes correctamente cuando los datos introducidos son válidos.
* La edición de residentes funciona correctamente cuando los datos son válidos.
* En caso de no introducir contraseña, se envía correctamente el correo para su establecimiento.
* El borrado de residentes funciona correctamente:
  * El residente se elimina del sistema.
  * El enlace de establecimiento de contraseña deja de ser válido tras el borrado.

**Funcionamiento mejorable**

* El campo **fecha de check-in** presenta un problema de persistencia/visualización:
  * Al introducir una fecha y guardar (tanto en creación como en edición), esta **no se muestra posteriormente**:
    * Ni en el listado de residentes.
    * Ni al volver a editar el residente (aparece como `dd/mm/aaaa`).
  * La fecha debería reflejarse correctamente tras ser guardada.

**Failure condition detectada**

* **T-12:** El sistema no presenta el comportamiento esperado, ya que un dato introducido y guardado correctamente (fecha de check-in) no se persiste ni se muestra al usuario.

---

###### **Preinscripción a través de formulario**

**Funcionamiento detectado**

* El formulario funciona correctamente en todos los casos probados.
* Se valida correctamente el envío de datos.

**Failure condition detectada**

* Ninguna.

---

#### Objetos

Casos de uso probados:

* Gestión de reservas de objetos (CRUD).
* Visualización de disponibilidad de los objetos.

---

###### **Gestión de reservas de objetos (CRUD)**

**Funcionamiento detectado**

* Todas las operaciones CRUD funcionan correctamente.

**Failure condition detectada**

* Ninguna.

---

###### **Visualización de disponibilidad de los objetos**

**Funcionamiento detectado**

* La disponibilidad de los objetos se muestra correctamente.

**Failure condition detectada**

* Ninguna.

---

#### Matching

Casos de uso probados:

* Configuración del perfil biográfico y preferencias.
* Gestión de etiquetas personales.

---

###### **Configuración del perfil biográfico y preferencias**

**Funcionamiento detectado**

* La configuración del perfil funciona correctamente.
* Los datos se guardan y reflejan adecuadamente.

**Failure condition detectada**

* Ninguna.

---

###### **Gestión de etiquetas personales**

**Funcionamiento detectado**

* La gestión de etiquetas personales funciona correctamente.

**Failure condition detectada**

* Ninguna.

---

#### Paquetería

Casos de uso probados:

* Editar y eliminar paquetes.
* Marcar paquetes como entregados.
* Notificación al residente.

---

###### **Gestión de paquetes**

**Funcionamiento detectado**

* La edición y eliminación de paquetes funciona correctamente.
* El marcado como entregado funciona correctamente.
* Las notificaciones al residente cuando llega un paquete funcionan correctamente.

**Failure condition detectada**

* Ninguna.

---

#### Gestión de acceso

Casos de uso probados:

* Crear pase de invitado.
* Listado de pases activos.
* Historial de pases expirados.
* Listado general de invitados.
* Visualización de detalles.

---

###### **Crear pase de invitado**

**Funcionamiento detectado**

* Es posible crear pases correctamente con intervalo de fechas válido.

**Funcionamiento mejorable**

* El sistema permite crear pases con:
  * Fecha de inicio en el pasado.
  * Fecha de fin en el pasado.
* Aunque el intervalo sea coherente, no debería permitirse la creación de pases en fechas pasadas según un comportamiento esperado habitual.

**Failure condition detectada**

* **T-13:** El sistema no valida correctamente los datos introducidos en el formulario (permite fechas inválidas desde el punto de vista del negocio).

---

###### **Listado de pases activos**

**Funcionamiento detectado**

* **Vista residente:**
  * Se muestran correctamente los pases activos.
  * Los pases creados en el pasado no aparecen (comportamiento correcto).

* **Vista administrador:**
  * Se muestran también los pases creados en el pasado.
  * Estos aparecen etiquetados como **“pase activo”**, lo cual es inconsistente.

**Funcionamiento mejorable**

* Inconsistencia en la lógica de negocio entre vistas.
* Los pases en el pasado no deberían considerarse activos.

**Failure condition detectada**

* **T-12:** El sistema muestra un comportamiento inconsistente e incorrecto al etiquetar como activos pases que ya han expirado.

---

###### **Historial de pases expirados**

**Funcionamiento detectado**

* No se ha encontrado funcionalidad para visualizar el historial de pases expirados.

**Failure condition detectada**

* Ninguna (posible funcionalidad no implementada).

---

###### **Listado general de invitados**

**Funcionamiento detectado**

* Funciona correctamente.

**Failure condition detectada**

* Ninguna.

---

###### **Visualización de detalles de invitados**

**Funcionamiento detectado**

* Funciona correctamente.

**Failure condition detectada**

* Ninguna.

---

#### Incidencias

Casos de uso probados:

* Gestión de incidencias (CRUD).
* Consulta del historial de incidencias propias.
* Consulta del listado global de incidencias con filtros.
* Cambio de estados de incidencias.
* Adición de notas y comentarios rápidos.
* Añadir filtro para buscar incidencias.
* Asignar técnicos para gestionar las incidencias.
* Vinculación de habitaciones con las incidencias.
* Adjuntar imágenes a las incidencias.
* Visualizar pipeline con el estado de las incidencias.

---

###### **Gestión de incidencias (CRUD)**

* **Estado:** Funciona correctamente.
* Se pueden crear, visualizar, editar y gestionar incidencias sin problemas.

---

###### **Consulta del historial de incidencias propias**

* **Estado:** Funciona correctamente.
* Existe un botón **“Viendo mis incidencias”** que filtra correctamente las incidencias creadas por el usuario residente autenticado.

---

###### **Consulta del listado global de incidencias con filtros**

* **Estado:** Funciona correctamente.
* Los filtros aplican correctamente, incluyendo el filtro de prioridad con valores **Baja** y **Urgente**.

---

###### **Cambio de estados de incidencias**

* **Estado:** Funciona correctamente.
* Los cambios de estado se reflejan correctamente tanto en la vista del administrador como en la del residente.

---

###### **Adición de notas y comentarios rápidos a las incidencias**

* **Estado:** Funciona correctamente.
* Las notas y comentarios añadidos por administración se visualizan correctamente en la vista del residente.

---

###### **Añadir filtro para buscar incidencias**

* **Estado:** Funciona correctamente.
* La búsqueda permite localizar incidencias de forma rápida y precisa.

---

###### **Asignar técnicos para gestionar las incidencias**

* **Estado:** Funciona correctamente.
* La asignación ya no es libre, sino que solo permite seleccionar técnicos registrados mediante un desplegable.

**Sugerencia de mejora:**

* Actualmente se puede asignar una incidencia a cualquier técnico registrado, independientemente de si está **activo, ausente o de vacaciones**.
* Sería recomendable restringir la asignación únicamente a técnicos disponibles.

---

###### **Vinculación de habitaciones con las incidencias**

* **Estado:** Funciona correctamente.
* La incidencia puede vincularse correctamente a una habitación.

---

###### **Adjuntar imágenes a las incidencias**

* **Estado:** Funciona correctamente.
* El sistema permite adjuntar imágenes y visualizarlas sin incidencias.

---

###### **Visualizar pipeline con el estado de las incidencias**

* **Estado:** Funciona correctamente.
* El pipeline refleja correctamente el estado actual y su evolución.

---

**Observación**

* Las notificaciones de incidencias funcionan correctamente en la campana.
* En la vista de administrador, al acceder a una notificación esta desaparece correctamente.
* En la vista de residente, las notificaciones ya visualizadas **no desaparecen**, lo que provoca acumulación progresiva.

---

#### Avisos

Casos de uso probados:

* Gestión de avisos (CRUD).
* Recepción de notificaciones de avisos.

---

###### **Gestión de avisos (CRUD)**

* **Estado:** Funciona correctamente.
* Todas las operaciones CRUD se ejecutan sin problemas.

---

###### **Recepción de notificaciones de avisos**

* **Estado:** Funciona correctamente.
* Los residentes reciben correctamente las notificaciones de avisos.

---

#### Reservas

Casos de uso probados:

* Configuración de espacios, horas y aforos.
* Panel de gestión y visualización de reservas.
* Consulta de disponibilidad en tiempo real y reserva de espacios.
* Creación de reservas.
* Cancelación de reservas propias.
* Liberación automática de objetos.
* Permitir múltiples reservas según aforo.

---

###### **Configuración de espacios, horas y aforos**

* **Estado:** Funciona correctamente.

---

###### **Panel de gestión y visualización de reservas**

**Vista de residente**

* Permite visualizar correctamente las reservas realizadas.

**Vista de administrador**

* Las reservas se reflejan correctamente en el panel de administración.

****Failure condition detectada (T12)****

* En **Gestión de espacios**, al pulsar el botón **“Ver reservas”**, no se muestran las reservas realizadas de ese espacio.
* En su lugar, se muestran los **detalles del espacio**, lo cual no corresponde con la acción esperada.
* En cambio, en **Gestión de objetos**, el botón **“Ver préstamos”** sí funciona correctamente.

---

###### **Consulta de disponibilidad en tiempo real y reserva de espacios**

* **Estado:** Funciona correctamente.
* El sistema refleja correctamente la disponibilidad en tiempo real.

---

###### **Creación de reservas**

* **Estado:** Funciona correctamente.
* Se validan fechas, horas y campos obligatorios.

---

###### **Cancelación de reservas propias**

* **Estado:** Funciona correctamente.
* El residente puede cancelar reservas y el cambio se refleja inmediatamente.

---

###### **Liberación automática de objetos**

* **Estado:** Funciona correctamente.
* Los espacios y objetos quedan liberados automáticamente al finalizar la reserva.

---

###### **Permitir múltiples reservas a la vez según el aforo del espacio**

* **Estado:** Funciona correctamente.
* El sistema respeta correctamente el aforo configurado.

---

#### Eventos

Casos de uso probados:

* Gestión de eventos (CRUD).
* Inscripción a eventos.
* Gestión de asistencia.
* Crear reserva de espacios públicos al crear un evento.

---

###### **Gestión de eventos (CRUD)**

* **Estado:** Funciona correctamente.

---

###### **Inscripción a eventos**

* **Estado:** Funciona correctamente.

---

###### **Gestión de asistencia**

* **Estado:** Funciona correctamente.

---

###### **Crear reserva de espacios públicos al crear un evento en dicho espacio**

* **Estado:** Funciona correctamente.
* La reserva del espacio se genera correctamente al crear el evento.

---

#### Comedor

Casos de uso probados:

* Listado de menús semanales de prueba.

---

###### **Listado de menús semanales de prueba**

* **Estado:** Funciona correctamente.

---

#### Comunicación

Casos de uso probados:

* Gestión de chats (CRUD).
* Hacer administrador del grupo a los miembros.
* Añadir y expulsar miembros a los grupos.
* Chats grupales y privados

---

###### Gestión de chats (CRUD)

**Funcionamiento detectado**
* Puedes crear, eliminar y ver chats

**Funcionamiento mejorable**
* nada, suponiendo que esta bien que los usuarios no puedan crear chats grupales y es algo que solo puede hacer el administrador

**Failure condition detectada**
* nada
  
---

###### Hacer administrador del grupo a los miembros.

**Funcionamiento detectado**
* Puedes poner a otros miembros como administradores del grupo

**Funcionamiento mejorable**
* nada

**Failure condition detectada**
* T12 - puse de administrador del chat general al usuario de prueba, y a todos los usuarios creados, pero al iniciar como el usuario de prueba y hacer modificaciones en el chat, al darle guardar cambios, me dice "No tienes permisos para gestionar este grupo." lo mismo al intentar expulsar miembros que son admin o quitarle el admin a otros miembros administradores del grupo 
  
---

###### Añadir y expulsar miembros a los grupos.

**Funcionamiento detectado**
* Como adminsitrador puedes

**Funcionamiento mejorable**
* nada

**Failure condition detectada**
* nada
  
---


#### Premium

Casos de uso probados:

* Interfaz de customización de la imagen de marca.
* Modificar banner e icono en el header.

---

###### **Interfaz de customización de la imagen de marca**

* **Estado:** Funciona correctamente.

---

###### **Modificar banner e icono en el header**

* **Estado:** Funciona correctamente.

---

## 2. MeerKatters

### Casos de uso probados

---

#### GESTIÓN DE USUARIOS

Casos de uso probados:

* UC-01 Registrar usuario
* UC-02 Iniciar sesión
* UC-03 Cerrar sesión
* UC-04 Editar perfil
* UC-05 Ver perfil
* UC-06 Cambiar contraseña
* UC-07 Eliminar cuenta

---

###### **UC-01 Registrar usuario**

* **Estado:** Funciona correctamente.
* El correo es enviando

****Failure condition detectada Ninguna****

---

###### **UC-02 Iniciar sesión**

* **Estado:** Funciona correctamente.
* El sistema requiere que validez la cuenta con email
* No permite iniciar sesion si no esta validado

****Failure condition detectada T12****
* Dentro del formulario de iniciar sesion si presionas ¿olvidaste la contraseña? no hace nada para recuperarla, solo te manda a otra pantalla que no es la de inicio de sesion

---

###### **UC-03 Cerrar sesión**

* **Estado:** Funciona correctamente.
* El sistema efectivamente cierra la sesion

****Failure condition detectada Ninguna****

---

###### *** UC-04 Editar perfil**

* **Estado:** Funciona correctamente.
* El sistema efectivamente edita el perfil
* El sistema hace caso omiso a modificaciones en los campos con "inpeccionar elemento"
* Se tuvieron en cuenta validaciones de logitud en los campos

****Failure condition detectada Ninguna****

---

###### **UC-05 Ver perfil**

* **Estado:** Funciona correctamente.
* El sistema te deja ver el perfil de otras personas

****Failure condition detectada T12****
* No se si cuenta como failure condition, pero al ver el perfil de alguien que no tiene foto ej. Alejo Molina, su foto deja de ser las letras AM y se transforma en su nombre en entero en texto plano y pequeño

---

###### **UC-06 Cambiar contraseña**

* **Estado:** Funciona correctamente.
* El sistema valida correctamente la contraseña actual

****Cosas a mejorar****
* No se tiene la misma validacion para cambiar de contraseña que cuando se crea, para crear requiere mayuscula, minuscula, etc y para cambiar solo que sea 8 caracteres, puedes no poner ninguna mayuscula y lo acepta igualmente
* El error de cuando la contraseña es muy larga en vez de decir algo como "contraseña muy larga" dice que no puede ser mas de 72 bytes (poco intuitivo para el usuario comun)

****Failure condition detectada ninguno****

---

###### **UC-07 Eliminar cuenta**

* **Estado:** Funciona correctamente.
* El sistema elimina la cuenta

****Failure condition detectada ninguno****

---

#### COMUNIDADES

Casos de uso probados:

* UC-08 Crear comunidad
* UC-09 Editar comunidad
* UC-10 Eliminar comunidad
* UC-11 Unirse a comunidad
* UC-12 Solicitar acceso a comunidad privada
* UC-13 Gestionar miembros de comunidad
* UC-14 Publicar contenido en comunidad
* UC-15 Moderar contenido de comunidad

---

###### **UC-08 Crear comunidad**

* **Estado:** Funciona correctamente.
* El sistema permite crear comunidades

****sugerencia de mejora:****
* Poner limite de caracteres en las tags, puedes poner un monton y se bugea visualmente

****Failure condition detectada Ninguna****

---

###### **UC-09 Editar comunidad**

* **Estado:** Funciona correctamente.
* El sistema permite editar el nombre y descripcion comunidades
* valida el numero minimo de caracteres para el nombre

****Failure condition detectada Ninguna****

---

###### **UC-10 Eliminar comunidad**

* **Estado:** Funciona correctamente.
* El sistema elimina la comunidad

****Failure condition detectada Ninguna****

---

###### **UC-11 Unirse a comunidad**

* **Estado:** Funciona correctamente.
* El sistema te permite igresar a comunidades publicas y no te deja entrar directamente a comunidades privadas

****Failure condition detectada Ninguna****

---

###### **UC-12 Solicitar acceso a comunidad privada**

* **Estado:** Funciona correctamente.
* El sistema te permite igresar a comunidades publicas y no te deja entrar directamente a comunidades privadas

****Failure condition detectada Ninguna****

---

###### **UC-13 Gestionar miembros de comunidad**

* **Estado:** Funciona correctamente.
* El sistema te permite igresar y ver a los miembros de una comunidad

****Sugerencia de mejoras****
* Que cuando das el admin a alguien puedas quitarselo
* Que un admin no pueda expulsar a otro porque se podria "adueñar" de la comunidad al expulsar a todos los otros admin 

****Failure condition detectada T12****
* cuando recibes una solicitud de una comunidad privada cuando le das en aceptar o rechazar el sistema no hace nada

---

###### **UC-14 Publicar contenido en comunidad**

* **Estado:** Funciona correctamente.
* El sistema te permite igresar ver a los miembros de una comunidad

****Failure condition detectada ninguno****

---

###### **UC-15 Moderar contenido de comunidad**

* **Estado:** Funciona correctamente.
* El sistema te permite eliminar eventos
* 
****sugerencia de mejora****
* Al abrir el chat tienes que bajarle el zoom al 75% para que se pueda ver

****Failure condition detectada ninguno****
---


#### Eventos

Casos de uso probados:

* UC-16 Crear evento.
* UC-17 Configurar privacidad de evento.
* UC-18 Especificar información del evento.
* UC-19 Seleccionar ubicación (mapa interactivo).
* UC-20 Ver ubicaciones recomendadas.
* UC-21 Unirse a evento.
* UC-22 Cancelar asistencia.
* UC-23 Ver asistentes.
* UC-24 Editar evento.
* UC-25 Cancelar evento.

---

###### **UC-16 Crear evento**

* **Estado:** Funciona correctamente.
* El sistema no permite crear eventos con fecha pasada.
* Tampoco permite crear eventos cuya fecha de inicio sea posterior a la fecha de fin.

****Failure condition detectada (T-13)****

* Al indicar la ubicación presencial de un evento, el sistema permite introducir una **dirección inventada o inexistente**.
* Por ejemplo, si se asigna el punto **(0,0)** y se introduce como nombre una dirección ficticia, el evento se guarda igualmente.
* La ubicación queda registrada con un valor incorrecto y se representa en coordenadas inválidas.

---

###### **UC-17 Configurar privacidad de evento**

* **Estado:** Funciona correctamente.

---

###### **UC-18 Especificar información del evento**

* **Estado:** Funciona correctamente.

---

###### **UC-19 Seleccionar ubicación (mapa interactivo)**

* **Estado:** Funciona correctamente.
* La ubicación seleccionada se refleja correctamente en el mapa cuando existen coordenadas válidas.

---

###### **UC-20 Ver ubicaciones recomendadas**

* **Estado:** Funciona correctamente.

---

###### **UC-21 Unirse a evento**

* **Estado:** Funciona correctamente.
* Aunque en la vista de comunidad, al pulsar **“Mostrar cancelados”**, siguen apareciendo eventos cancelados con el botón **“Apuntarse”**, el sistema no completa la inscripción.

**Sugerencia de mejora:**

* No debería mostrarse el botón **“Apuntarse”** ni el formulario de inscripción en eventos **cancelados o ya finalizados**, aunque internamente bloquee la operación.
* Esto mejora la intuitividad de la interfaz.

****Failure condition detectada (T-12)****

* En **Inicio > Mis eventos > Historial**, aparecen eventos a los que el usuario **no ha asistido**.
* Incluso se listan eventos ocurridos **antes de la creación de la cuenta**, lo que indica una inconsistencia en el filtrado histórico.

---

###### **UC-22 Cancelar asistencia**

* **Estado:** Funciona correctamente.

---

###### **UC-23 Ver asistentes**

* **Estado:** Funciona correctamente.

---

###### **UC-24 Editar evento**

* **Estado:** Funciona correctamente.

---

###### **UC-25 Cancelar evento**

* **Estado:** Funciona correctamente.

---

#### Contenido

Casos de uso probados:

* UC-26 Subir archivo.
* UC-27 Visualizar archivo.
* UC-28 Descargar archivo.
* UC-29 Eliminar archivo.

---

###### **UC-26 Subir archivo**

* **Estado:** Funciona correctamente.

---

###### **UC-27 Visualizar archivo**

* **Estado:** Funciona correctamente.

---

###### **UC-28 Descargar archivo**

* **Estado:** Funciona correctamente.

---

###### **UC-29 Eliminar archivo**

* **Estado:** Funciona correctamente.

---

#### Mapas y ubicación

Casos de uso probados:

* UC-30 Búsqueda por ubicación.
* UC-31 Visualizar mapa de meetings.

---

###### **UC-30 Búsqueda por ubicación**

****Failure condition detectada (T-13)****

* El sistema permite introducir una **ubicación inventada en el perfil del usuario**.
* Aunque no se hayan seleccionado coordenadas reales en el mapa del perfil, la aplicación permite utilizar esa ubicación falsa para buscar profesores cercanos.

---

###### **UC-31 Visualizar mapa de meetings**

* **Estado:** Funciona correctamente.
* Si el evento tiene coordenadas asociadas, la ubicación aparece correctamente representada en el mapa.

---


#### Profesores

Casos de uso probados:

* UC-32 Crear / editar perfil de profesor.
* UC-33 Solicitar verificación de profesor.
* UC-34 Listar profesores.
* UC-35 Listar profesores verificados.
* UC-36 Pago para verificación / promoción.
* UC-37 Valorar profesor.
* UC-38 Chat con profesor.

---

###### UC-32 Crear / editar perfil de profesor.

**Funcionamiento detectado**
* Funciona bien, pero las validaciones de campos no son específicas; solo se muestra mensaje genérico.

**Funcionamiento mejorable**
* Mostrar específicamente qué campo y qué error ocurre.

**Failure condition detectada**
* T12

---

###### UC-33 Solicitar verificación de profesor.

**Funcionamiento detectado**
* Funciona correctamente.

**Failure condition detectada**
* ninguna

---

###### UC-34 Listar profesores.

**Funcionamiento detectado**
* Funciona correctamente.

**Failure condition detectada**
* ninguna

---

###### UC-35 Listar profesores verificados.

**Funcionamiento detectado**
* Funciona correctamente.

**Failure condition detectada**
* ninguna

---

###### UC-36 Pago para verificación / promoción.

**Funcionamiento detectado**
* Funciona correctamente.

**Failure condition detectada**
* ninguna

---

###### UC-37 Valorar profesor.

**Funcionamiento detectado**
* No se encuentra completamente implementado; la fecha aparece en formato americano.

**Funcionamiento mejorable**
* Usar un formato de fecha universal.

**Failure condition detectada**
* T12

---

###### UC-38 Chat con profesor.

**Funcionamiento detectado**
* Funciona correctamente.

**Failure condition detectada**
* ninguna

---

#### FINANZAS Y SISTEMA DE PAGOS

Casos de uso probados:

* UC-39 Ver planes.
* UC-40 Suscribirse a un plan.
* UC-41 Procesar pago.
* UC-42 Cancelar suscripción.

---

###### UC-39 Ver planes.

**Funcionamiento detectado**
* Funciona correctamente para profesor, alumno e institución.

**Failure condition detectada**
* ninguna

---

###### UC-40 Suscribirse a un plan.

**Funcionamiento detectado**
* Funciona correctamente para profesor y alumno, pero presenta problemas de consistencia y validaciones incompletas:  
  - En "Tu suscripción" no aparece el plan contratado individualmente; muestra "No tienes suscripción activa".  
  - Después de contratar un plan de institución, solo ese aparece como activo.  
  - Validaciones de campos (nombre, email, dominio) se hacen al clicar en "Continuar el pago"; sería mejor hacerlas antes.  
  - No se valida número de teléfono ni sitio web.  
  - Si se cierra la ventana de pago sin completar y luego se intenta usar los mismos datos, no se permite indicando que el dominio ya existe.  
  - No se puede retroceder después de "Continuar pago", impidiendo modificar datos.  
  - En "Mis pagos", no aparecen los datos del plan de institución contratado, solo que hay un plan activo.  
  - No queda claro cómo manejar la contratación de plan individual tras un plan institucional.  
  - En planes individuales, se puede contratar un plan Pro junto con Premium; debería permitir cancelar el anterior antes de aumentar al siguiente.

**Failure condition detectada**
* T12

---

###### UC-41 Procesar pago.

**Funcionamiento detectado**
* Funciona correctamente para estudiante, profesor y planes de institución.

**Failure condition detectada**
* ninguna

---

###### UC-42 Cancelar suscripción.

**Funcionamiento detectado**
* No se puede; parece que no está desarrollado.

**Failure condition detectada**
* T12

---

#### Notificaciones

Casos de uso probados:

* UC-43 Enviar notificación.
* UC-44 Recibir notificación.
* UC-45 Ver historial de notificaciones.
* UC-46 Marcar notificación como leída.

---

###### UC-43 Enviar notificación.

**Funcionamiento detectado**
* Funciona correctamente.

**Failure condition detectada**
* ninguna

---

###### UC-44 Recibir notificación.

**Funcionamiento detectado**
* Funciona correctamente.

**Failure condition detectada**
* ninguna

---

###### UC-45 Ver historial de notificaciones.

**Funcionamiento detectado**
* Funciona correctamente.

**Failure condition detectada**
* ninguna

---

###### UC-46 Marcar notificación como leída.

**Funcionamiento detectado**
* Funciona correctamente.

**Failure condition detectada**
* ninguna





## Historial de versiones

| Versión | Fecha       | Descripción | Autor(es) |
|---------|------------|-------------|-----------|
| 1.0.0 | 05/04/2026 | Creación del documento e Integración de pruebas de casos de uso de NexUS  | Salma El Hakimy Ettorabi |
| 1.1.0 | 05/04/2026 | Integración del resto de pruebas de casos de uso de NexUS  | Marta Aguilar Morcillo |
| 1.2.0 | 06/04/2026 | Integración de algunos casos de uso de MeerKatters  | Marta Aguilar Morcillo |
| 1.3.0 | 06/04/2026 | Integración de algunos casos de uso de NexUS  | Luis Emmanuel Chavez Malave |
| 1.4.0 | 06/04/2026 | Integración de algunos casos de uso de MeerKatters  | Luis Emmanuel Chavez Malave |
| 1.5.0 | 07/04/2026 | Integración de pruebas de casos de uso de Meerkatters  | Salma El Hakimy Ettorabi |
---

**Redactado por:** Luis Emmanuel Chavez Malave, Marta Aguilar Morcillo y Salma El Hakimy Ettorabi
**Fecha de redacción:** 06/04/2026
**Versión:** 1.5.0
