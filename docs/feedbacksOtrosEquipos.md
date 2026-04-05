# Informe de Feedback Sprint 1: NexUS & Meerkatters

## 1. NexUS

### Casos de uso probados

#### Autenticación
* Registro de usuarios mediante email.
* Inicio y cierre de sesión.
* Recuperación de contraseña.
* Gestión de roles.
* Edición de perfil.

---

###### **Registro mediante email**
* **Funcionamiento inadecuado:** Aunque se indica que el registro está desarrollado, no se visualiza ningún botón ni opción en la interfaz para realizarlo.
* **Failure condition detectada:** Ninguna técnica de backend; sin embargo, existe un bloqueo funcional por falta de elementos de UI.

###### **Inicio y cierre de sesión**
* **Funcionamiento mejorable:** El botón de **"Mantener sesión"** no es funcional; la sesión permanece abierta independientemente de si se marca o no.
* **Failure condition detectada:** Ninguna.

### Recuperación de contraseñas

**Funcionamiento mejorable:**  
Puse un correo personal que no está registrado y me salió un mensaje de “si tu correo existe, te llegaron las instrucciones”. Sin embargo, nunca me llegaron dichas instrucciones. Además, recomendaría primero realizar un filtro para comprobar si dicho correo está registrado en el sistema y enviar un mensaje en consecuencia: **“correo no registrado”**, o, en caso de que lo esté, mostrar el mensaje anterior.

**Failure condition:**  
T12: puse un correo real; el sistema indicó que me enviaría instrucciones, pero no fueron enviadas.

---------------------------------------------------------------------------------------------

###### **Gestión de roles**
* **Estado:** Funciona correctamente.
* **Casos probados:**
  * Un usuario con rol **Residente** no puede acceder como administrador.
  * Un usuario con rol **Administrador** no puede acceder como residente.
* **Failure condition detectada:** Ninguna.

---------------------------------------------------------------------------------------------

###### **Edición de perfil**

###### **Edición de perfil**
* **Funcionamiento mejorable:**
  * **Administrador:** El campo de "Teléfono de contacto" permite la entrada de letras. Se recomienda restringir el campo a valores numéricos o eliminar la sección.
  * **Estudiante:** El campo de "Intereses personalizados" no tiene un límite de caracteres (*max-length*). Al introducir un texto de gran longitud (aprox. 1.000 caracteres), la interfaz se desmaqueta.
* **Failure condition detectada:**
  * Estas dos failure conditions se consideraron suponiendo que se puede editar el perfil del administrador
  * **T-12:** El botón de "Modificar perfil" no persiste los cambios. Al salir y volver a entrar, los datos regresan a su estado original.
  * **T-13:** Ausencia de validación para campos vacíos o inválidos. Es posible guardar el perfil en blanco sin recibir ningún aviso del sistema.

---


#### Panel de Residencias
* Acceso e interacción con el panel administrativo.
* Gestión de personal (CRUD).
* Gestión de residentes (CRUD).

###### **Acceso e interacción con el panel administrativo**

**Funcionamiento mejorable:** Ninguno apreciable, en efecto se ve y se puede interactuar

**Failure condition detectada:** Ninguna

---------------------------------------------------------------------------------------------

###### **Gestión de personal (CRUD)**
* **Funcionamiento mejorable:** Se detectó un error crítico de lógica. Un administrador puede crear un nuevo usuario de personal, iniciar sesión con él y **borrarse a sí mismo**, lo que provoca el colapso de la aplicación.

* **Pasos para replicar el error:**
  1. Entrar como administrador y crear un usuario (ej. `pepito5@nexus.es`).
  2. Cerrar sesión e iniciar sesión como `pepito5@nexus.es`.
  3. Ir al apartado de personal y eliminar la cuenta propia de `pepito5`.
  4. Intentar navegar por el sistema.

* **Failure condition detectada (T-12):** Tras el borrado del usuario activo, el sistema presenta fallos graves: la pantalla de habitaciones se queda en blanco y el área de personal desaparece. Además, al intentar reingresar con cualquier credencial, aparece el error: *"El usuario del token no existe"*.

---


###### **Gestión de residentes (CRUD):**

**Funcionamiento mejorable:**

- Debido al fallo anterior no se pudo probar

**Failure condition detectada:**

- Debido al falloa anterio no se pudo probar

##### Incidencias

o Creación de incidencias.
o Consulta del historial de incidencias propias.
o Consultada de listado global de incidencias con filtros.
o Cambio de estados de incidencias.
o Adición de notas y comentarios rápidos a las incidencias.

#### Incidencias

Casos de uso probados:

* Creación de incidencias.
* Consulta del historial de incidencias propias.
* Consulta del listado global con filtros.
* Cambio de estados de incidencias.
* Adición de notas y comentarios.

---

###### **Creación de incidencias**

**Vista de residente**

* **Estado:** Funciona correctamente. Permite crear incidencias y valida que los campos obligatorios estén completos.
* Una vez creada la incidencia, se puede visualizar su descripción correctamente.

**Vista de administrador**

La incidencia creada por un residente aparece correctamente en el panel de administración.  
El administrador puede:

* Cambiar el estado de la incidencia.
* Añadir una nota.
* Asignar un técnico.

**Funcionamiento mejorable:**

* El campo para asignar técnico es un **campo de texto libre** y no valida que el técnico sea un usuario registrado en el sistema.
* Durante las pruebas se asignó un técnico inexistente y el sistema lo permitió.

---

###### **Consulta del historial de incidencias propias**

**Funcionamiento mejorable:**

* No queda claro si la lista mostrada corresponde a:
  * incidencias propias del usuario
  * incidencias globales de la residencia.
* No existe un filtro que permita visualizar únicamente las incidencias creadas por el usuario actual.

---

###### **Consulta del listado global de incidencias con filtros**

* **Estado:** Todos los filtros funcionan correctamente, incluso con incidencias recién creadas.

**Mejora sugerida:**

* El filtro de prioridad utiliza los valores **BAJA** y **ALTA**, mientras que en otras partes de la aplicación se utiliza **URGENTE**, lo que puede generar confusión para los usuarios.
* En la cabecera aparece un **icono de notificaciones (campana)** que no realiza ninguna acción al pulsarlo.

---

###### **Cambio de estado de incidencias**

**Vista de residentes**

* Cuando el administrador cambia el estado de una incidencia, el nuevo estado aparece correctamente reflejado en la vista del residente.

**Vista de administradores**

* Permite cambiar el estado de cualquier incidencia sin problemas.

---

###### **Adición de notas y comentarios a incidencias**

**Vista de administradores**

* Permite añadir notas sin problemas.

**Vista de residentes**

* Las notas añadidas por el administrador aparecen correctamente reflejadas.

---

#### Avisos

###### **Gestión de avisos (CRUD)**

**Vista de administrador**

* Permite crear avisos correctamente.
* Los campos incluyen validaciones, como impedir seleccionar fechas pasadas.

---

###### **Recepción de avisos**

**Vista de residentes**

Los residentes pueden:

* visualizar avisos
* filtrarlos por categoría.

Los avisos cuya fecha ha pasado aparecen **oscurecidos**, lo cual ayuda a distinguirlos.

**Sugerencia de mejora:**

* Sería recomendable que los avisos desaparecieran del tablón una vez pasada su fecha para evitar saturar la interfaz.

---

#### Reservas

Casos de uso probados:

* Configuración de espacios, horas y aforos.
* Panel de gestión y visualización de reservas.
* Consulta de disponibilidad y reserva de espacios.
* Creación de reservas.
* Cancelación de reservas propias.

---

###### **Panel de gestión y visualización de reservas**

**Vista de residente**

* Permite visualizar reservas realizadas con sus fechas y estados correctamente.

**Vista de administrador**

* Las reservas realizadas por residentes se reflejan correctamente en el panel de administración.

---

###### **Consulta de disponibilidad y reserva de espacios**

**Vista de residentes**

* Los residentes solo pueden reservar objetos o salas que no estén **en curso**, lo cual funciona correctamente.

---

###### **Creación de reservas**

Permite crear reservas indicando fecha y hora de uso.

El sistema valida correctamente:

* fechas pasadas
* campos obligatorios.

**Funcionamiento mejorable:**

Se detectaron dos problemas:

* Las reservas finalizadas **no se liberan automáticamente**.
* Es posible crear **varias reservas del mismo objeto en el mismo intervalo de tiempo**.

---

###### **Cancelación de reservas propias**

**Vista de residentes**

* Los residentes pueden cancelar sus reservas correctamente.
* El cambio se refleja inmediatamente en el panel de administración.

---

**Observación**

* El cambio del **estado de la reserva** no está implementado actualmente.
* Dado que esta funcionalidad no aparece como obligatoria en las guidelines del sprint, se asume que se implementará en futuros sprints.

---

#### Eventos

Casos de uso probados:

* Gestión de eventos (CRUD).
* Inscripción a eventos.
* Gestión de asistencia.

---

###### **Gestión de eventos (CRUD)**

**Vista de administrador**

Permite crear eventos correctamente y valida:

* fechas pasadas
* coherencia entre hora de inicio y hora de fin.

**Mejora sugerida:**

* El lugar del evento es un **campo libre**. Sería recomendable restringirlo a ubicaciones de la residencia.

---

###### **Problema principal detectado**

Los eventos creados por administradores **no aparecen en la vista de residentes**, por lo que los residentes:

* no pueden visualizarlos
* no pueden inscribirse.

Esto limita la funcionalidad principal del sistema de eventos.

---

###### **Inscripción a eventos**

**Vista de administrador**

* Un administrador puede inscribirse en eventos.  
Esto puede resultar incoherente si los eventos están pensados únicamente para residentes.

---

###### **Gestión de asistencia**

**Vista de administrador**

* Se puede visualizar correctamente el número de asistentes registrados respecto al máximo permitido.

**Vista de residentes**

* No se pudo probar debido a que los eventos no aparecen en su interfaz.

---

###### **Seguridad**

* Las vistas de administrador están correctamente protegidas por rol.
* Se intentó acceder a URLs de administración desde una cuenta residente y el sistema denegó el acceso correctamente.

---------------------------------------------------------------------------------------------

#### Onboarding

Casos de uso probados:

* Dar de alta a nuevos residentes a través de un formulario.
* Preinscripción a través de formulario.

---

###### **Dar de alta a nuevos residentes a través de un formulario**


**Acción legal**

El formulario permite crear residentes correctamente cuando los datos son válidos.

**Acción ilegal / Funcionamiento mejorable**

Se detectaron múltiples problemas de validación del formulario:

* El sistema permite introducir **solo un nombre sin apellido** en el campo de nombre completo sin mostrar ningún error.
* Permite registrar nombres inválidos como:
  * `22`
  * `.`
  * `@`
  * `??¿`
  * `a`
* Permite registrar correos inválidos como `.@gmail.com`, lo cual **no cumple los estándares RFC de correo electrónico**.
* No existe **límite máximo de caracteres** en los campos:
  * nombre
  * contraseña
  * correo
  * habitación
  * edificio
* Se pudieron introducir **aproximadamente 1000 caracteres** sin que el sistema lo impidiera.
* Los campos **habitación y edificio permiten símbolos**, sin ninguna validación.
* Se puede introducir una **fecha de check-in en el pasado** (ej: `12-06-1981`).
  * El sistema indica que el residente se ha creado correctamente, pero **luego no aparece en el listado**.
* El sistema permite introducir **nombres de habitación y edificio que no existen**, cuando idealmente deberían seleccionarse de una lista de habitaciones existentes y disponibles.
* Se puede intentar crear **dos residentes con exactamente los mismos datos**.
  * El sistema muestra el mensaje **“creado correctamente”**, pero el residente realmente **no se crea**.

**Failure condition detectada**

* **T-12:** El sistema muestra mensajes de éxito aunque la acción no se complete realmente (por ejemplo, al crear un residente duplicado o con fecha inválida).
* **T-13:** El formulario no valida correctamente datos obligatorios o incorrectos (nombres inválidos, correos inválidos, campos con símbolos o longitud excesiva).

---

###### **Preinscripción a través de formulario**
Se trata del formulario que aparece la primera vez que se inicia sesión con una cuenta de residente.
**Funcionamiento detectado**

* El formulario **no permite enviarse vacío**, lo cual es correcto.
* La funcionalidad de preinscripción **funciona correctamente**.

**Failure condition detectada**

* Ninguna.

---------------------------------------------------------------------------------------------

#### Objetos

Casos de uso probados:

* Gestión de reservas de objetos (CRUD).
* Visualización de disponibilidad de los objetos.

---

###### **Gestión de reservas de objetos (CRUD)**

**Funcionamiento mejorable**

Se detectaron varios problemas en operaciones de gestión de objetos:

* Al **eliminar un objeto** aparece el error: `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`


* Aunque aparece el error, **al recargar la página el objeto sí se elimina**.
* El mismo error aparece al intentar **ver el préstamo de un objeto** inmediatamente después de intentar eliminarlo sin recargar la página.
* El sistema permite **crear objetos con nombres inválidos**, por ejemplo `@`.
* Cuando se elimina un objeto, **no desaparece de la lista inmediatamente**, solo desaparece tras **recargar manualmente la página**.

**Failure condition detectada**

* **T-10:** Se muestra un error HTTP al usuario durante acciones legales como eliminar un objeto.
* **T-12:** La interfaz no se actualiza correctamente después de eliminar un objeto, generando un comportamiento inesperado.

---

###### **Visualización de disponibilidad de los objetos**

**Funcionamiento detectado**

* El sistema muestra si el objeto está **disponible o no**.
* También muestra **cuántas reservas tiene**, además del resto de detalles del objeto.

**Funcionamiento mejorable**

Se detectó una **inconsistencia entre vistas**:

* En la **vista de residente**, un objeto (por ejemplo un *patinete*) aparece como **no disponible**.
* En la **vista de administrador**, el mismo objeto aparece como **disponible**, incluso teniendo **dos reservas activas**.

**Failure condition detectada**

* **T-12:** El sistema muestra información inconsistente dependiendo del rol del usuario.

---------------------------------------------------------------------------------------------

#### Matching

Casos de uso probados:

* Configuración del perfil biográfico y preferencias.
* Gestión de etiquetas personales para el algoritmo.

---

###### **Configuración del perfil biográfico y preferencias**

**Funcionamiento mejorable**

Se detectaron problemas de validación en campos obligatorios:

* El campo **“Nombre completo”** aparece marcado como obligatorio (con asterisco), pero el sistema permite **guardar los cambios sin introducir ningún nombre**.
* Incluso eliminando el **apodo**, el sistema permite guardar el perfil **completamente vacío**.
* El campo **“Lugar de origen”** también aparece marcado como obligatorio, pero el sistema permite guardar el perfil **sin rellenarlo**.

**Failure condition detectada**

* **T-13:** El sistema no detecta formularios enviados con **campos obligatorios vacíos**.

---

###### **Gestión de etiquetas personales para el algoritmo**

**Funcionamiento detectado**

* La gestión de etiquetas personales funciona correctamente.

**Failure condition detectada**

* Ninguna.

## Meerkatters

### Casos de usos probados
---------------------------------------------------------------------------------------------
#### UC01 – Registrarse
Permite a un usuario no autenticado crear una cuenta en la plataforma, proporcionando sus datos básicos. Durante el registro se valida si el dominio del correo pertenece a una institución reconocida, para aplicar posibles beneficios o restricciones.

**Funcionamiento mejorable:**

* Los botones de Google y LinkedIn no hacen nada. Sería recomendable, como dijo el profe, eliminarlos hasta que la funcionalidad esté implementada o indicarlo en la sección de indicaciones varias.

* No me deja poner caracteres en chino para el email: 汉字/漢字@alum.es.

* No tiene límite de caracteres en contraseña, por eso creo que ocurrió el siguiente error.

**Pasos para replicar el error:**

* Al intentar crear una cuenta, rellené los campos con el siguiente contenido:

Nombre completo

汉字/漢字

University Email

chinhuan@alum.es

Password

汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字

**Failure condition detectada:**

* T-12: Al rellenar los campos de la forma anteriormente mencionada, al darle a registrar cuenta me salta el siguiente error: "Error interno del servidor".
* T-13: No sé hasta qué punto esto cuente como un T-13.

---------------------------------------------------------------------------------------------
#### UC02 – Iniciar Sesión
Permite a un usuario autenticarse en la plataforma mediante sus credenciales registradas, para acceder a funcionalidades personalizadas.

**Funcionamiento mejorable:**

* Funciona como es de esperar, tanto con las credenciales que nos dieron como con usuarios creados por mi persona.

**Failure condition detectada:**

* Ninguna.

---------------------------------------------------------------------------------------------
#### UC03 – Cerrar Sesión
Permite al usuario autenticado finalizar su sesión activa, garantizando la seguridad y evitando accesos no autorizados desde el mismo dispositivo.

**Funcionamiento mejorable:**

* Súper escondida. Pónganla en la navbar, pls, o en algún lugar fácil de ver; me costó encontrarla.

**Failure condition detectada:**

* Ninguna.

---------------------------------------------------------------------------------------------
#### UC04 – Personalizar Perfil
Permite al usuario editar su información personal, como nombre, foto, descripción o preferencias visibles dentro de la plataforma.

**Funcionamiento mejorable:**

* Revisen el tamaño máximo de caracteres de varios campos. Nuevamente puse un montón de caracteres en descripción personal y me salió el error de "Error interno del servidor".

**Failure condition detectada:**

* T-12: Al editar mi perfil y escribir más de 500 caracteres en la sección de descripción personal, me saltó el error "Error interno del servidor".
* T-11: No sé hasta qué punto cuente como un T11.

---------------------------------------------------------------------------------------------
#### UC05 – Ver Perfil
Permite visualizar el perfil propio o el de otros usuarios, mostrando información pública relevante.

**Funcionamiento mejorable:**

* Al entrar como mi usuario creado, chinhuan, accedo a la parte de profesores y sale "No se pudieron cargar profesores" y el botón de reintentar, cuando se supone que existe al menos un profesor (el de los datos de acceso).

**Failure condition detectada:**

* T-12: Intenté listar a los profesores para ver su perfil, pero me sale "No se pudieron cargar los profesores" y un botón de reintentar que, al presionarlo, sigue sin cargar a ninguno.

---------------------------------------------------------------------------------------------
#### UC06 – Cambiar Contraseña
Permite al usuario modificar su contraseña actual para reforzar la seguridad de su cuenta.

**Funcionamiento mejorable:**

* Nuevamente, problema de length de campos. Puse una contraseña de muchos caracteres y me sale el error de servidor.

* Error al cambiar contraseña.

* Si te ayuda, creo que ocurre porque al crear usuario pide contraseña de tamaño mínimo de 8, pero al cambiarla pide tamaño mínimo de 6. Por tanto, si pones una de tamaño 6 ocurre el problema mencionado. Como nota adicional, si cambias la contraseña por una de tamaño 8 no hay ningún fallo.

**Pasos para replicar el error:**

Rellena los campos de la siguiente manera:

Contraseña actual

*tu contraseña actual*

Nueva contraseña

123456

Confirmar nueva contraseña

123456

Error obtenido: "Error interno del servidor".

**Failure condition detectada:**

* T-12: Intenté cambiar la contraseña por otra y no me dejó, saltando el error "Error interno del servidor".

---------------------------------------------------------------------------------------------
### UC07 – Eliminar Cuenta
Permite al usuario eliminar permanentemente su cuenta y todos los datos asociados, según la política de privacidad.

**Funcionamiento mejorable:**

* Se borra correctamente un usuario.

**Failure condition detectada:**

* Ninguna.

---------------------------------------------------------------------------------------------

#### UC8 – Crear Comunidad
Permite a un usuario crear una nueva comunidad con un nombre, descripción y configuración inicial.

**Funcionamiento mejorable:**

* Ninguna detectada, teniendo en cuenta las indicaciones dadas en el documento.

**Failure condition detectada:**

* Ninguna.

---------------------------------------------------------------------------------------------

#### UC9 – Configurar Privacidad Comunidad
Permite al administrador definir si la comunidad es pública o privada y establecer reglas de acceso.

**Funcionamiento mejorable:**

* No entendí muy bien eso de reglas de acceso, pero efectivamente creé una comunidad en privado y nadie más la ve.

**Failure condition detectada:**

* Ninguna.

---------------------------------------------------------------------------------------------

#### UC10 – Buscar Comunidades
Permite a los usuarios buscar comunidades mediante filtros o palabras clave.

**Funcionamiento mejorable:**

* Al buscarse de forma automática mientras escribes, la lupita que está al lado del input literalmente no hace nada. Yo la quitaría, la verdad.

* Por otro lado, nuevamente si introduces muchísimos caracteres en la barra de búsqueda dice que hubo un error al buscar comunidades, pero no lo considero failure condition porque sale un "inténtelo más tarde". Igual, ya que el tamaño máximo de nombre de comunidad es 100, pondría un length máximo en esta barra de búsqueda de 100 para evitar problemas.

**Failure condition detectada:**

* Ninguna.

---------------------------------------------------------------------------------------------

#### UC11 – Explorar Comunidades
Permite navegar por comunidades.

**Funcionamiento mejorable:**

* Funciona correctamente. Puedes ver las comunidades y clickear para ver sus eventos y el botón de unirse a la comunidad.

**Failure condition detectada:**

* Ninguna.

---------------------------------------------------------------------------------------------

#### UC12 – Unirse a Comunidad Pública
Permite al usuario acceder directamente a una comunidad pública sin necesidad de aprobación.

**Funcionamiento mejorable:**

* Funciona correctamente, puedes unirte.

**Failure condition detectada:**

* Ninguna.

---------------------------------------------------------------------------------------------

#### UC13 – Abandonar Comunidad
Permite al usuario dejar voluntariamente una comunidad a la que pertenece.

**Funcionamiento mejorable:**

* Funciona correctamente, puedes salirte de la comunidad. Solo que si tú la creaste no puedes; dice algo de que tienes que pasarle el admin a otra persona. Yo lo que haría es que te deje salirte y, si una comunidad tiene 0 personas, que se borre automáticamente.

**Failure condition detectada:**

* Ninguna.

---------------------------------------------------------------------------------------------

#### UC14 – Chat de Comunidad
Permite a los miembros comunicarse en tiempo real dentro de la comunidad, mediante mensajes y archivos.

**Funcionamiento mejorable:**

* No se puede navegar entre chat de comunidades y personales. Si clickeas en el nombre de alguien que escribió en un chat de comunidad puedes escribirle de forma personal, pero una vez ya le escribiste, si le das en volver no vuelves a los chats de comunidades; te toca volver a entrar en la pantalla de chats.

**Failure condition detectada:**

* Ninguna.

-------

#### Eventos

---

###### **UC15 – Crear evento**

Permite crear un evento que aparece posteriormente en el mapa.

**Funcionamiento detectado:**

* El evento se crea correctamente.
* Los detalles se muestran correctamente al acceder a su vista.

**Problemas detectados:**

* Es posible crear eventos con fecha pasada.
* Al introducir valores inválidos en algunos campos se produce un **error 500 del servidor**.

---

###### **UC16 – Configurar privacidad evento**

Permite indicar si un evento es **público o privado**.

* La etiqueta correspondiente aparece correctamente tras la creación del evento.

---

###### **UC17 – Información evento**

Permite visualizar la descripción completa del evento desde el mapa.

* **Estado:** Funciona correctamente.

---

###### **UC18 – Ubicación mediante Google Maps**

* Todos los eventos aparecen correctamente en el mapa.
* Cuando se crea un evento en una ubicación concreta, este se refleja inmediatamente en el mapa.

---

###### **UC19 – Ubicaciones recomendadas**

* No se encontró ninguna funcionalidad visible que permita consultar o seleccionar ubicaciones recomendadas.

---

###### **UC20 – Unirse a evento**

Permite confirmar asistencia a eventos futuros.

**Problemas detectados:**

* Intentar unirse a un evento concreto del pasado ya disponible en el sistema denominado Clases de ecuaciones diferenciales provoca un **error 500**.
* En otros eventos pasados el sistema permite confirmar asistencia, lo cual no debería ser posible.

---

###### **UC21 – Cancelar asistencia**

Permite cancelar la asistencia correctamente.

**Problema detectado:**

* El sistema permite cancelar asistencia a eventos ya finalizados.
* Una vez pasado el evento debería bloquearse cualquier modificación.

---

###### **UC22 – Ver asistentes**

Permite visualizar correctamente la lista de asistentes a un evento.

---

###### **UC23 – Editar evento**

Permite modificar eventos existentes.

* Los cambios se reflejan correctamente tras guardar.

---

###### **UC24 – Cancelar evento**

Cuando un evento se cancela:

* desaparece de la lista de eventos
* desaparece del mapa

* **Estado:** El funcionamiento es correcto.

-----
#### Gestión de contenido (Archivos)

---

Este apartado no está todavía implementado. Hemos contactado con los miembros de MeerKatters y nos han informado que dicha funcionalidad la implementarán en futuros sprints, puesto que no es core.


---------------------------------------------------------------------------------------------

#### Suscripciones y Pagos

Casos de uso probados:

* UC29 – Ver Planes
* UC30 – Suscribirse a Plan Premium
* UC31 – Procesar Pago
* UC32 – Cancelar Suscripción

---

###### **UC29 – Ver Planes**

Permite consultar los planes de suscripción disponibles y sus beneficios.

**Funcionamiento detectado**

* Los planes de suscripción se visualizan correctamente.
* La información de los beneficios asociados a cada plan se muestra sin problemas.

**Failure condition detectada**

* Ninguna.

---

###### **UC30 – Suscribirse a Plan Premium**

Permite contratar un plan premium con ventajas adicionales.

**Funcionamiento detectado**

* El sistema no permite enviar el formulario vacío, lo cual es correcto.
* El sistema valida correctamente algunos datos inválidos:
  * No permite introducir **fechas de tarjeta expiradas**.
  * No permite introducir **CVV con menos de 3 dígitos**.

**Funcionamiento mejorable**

Se detectaron algunos problemas de validación en el formulario de pago:

* El campo **nombre del titular** permite introducir símbolos, por ejemplo `@`.
* El campo **número de tarjeta** acepta cualquier secuencia de números.
  * Se entiende que esto puede estar configurado así para pruebas, pero en un entorno real solo deberían aceptarse **tarjetas válidas**.

**Failure condition detectada**

* **T-13:** El formulario permite introducir datos incorrectos o no válidos (por ejemplo símbolos en el nombre del titular), lo que indica ausencia de validación adecuada.

---

###### **UC31 – Procesar Pago**

Gestiona la transacción económica mediante la pasarela de pago integrada.

**Funcionamiento detectado**

* El proceso de pago se ejecuta correctamente una vez introducidos los datos.
* El sistema completa la suscripción sin errores visibles para el usuario.

**Failure condition detectada**

* Ninguna.

---

###### **UC32 – Cancelar Suscripción**

Permite finalizar una suscripción activa.

**Funcionamiento detectado**

* La cancelación de la suscripción se realiza correctamente.
* El cambio se refleja inmediatamente en el estado de la cuenta.

**Failure condition detectada**

* Ninguna.

---------------------------------------------------------------------------------------------

#### Publicidad y Ajustes

Casos de uso probados:

* UC33 – Panel de Ajustes

---

###### **UC33 – Panel de Ajustes**

Permite modificar preferencias generales de la cuenta.

**Funcionamiento mejorable**

* El panel muestra correctamente los controles de configuración.
* Sin embargo, los cambios realizados **solo se modifican visualmente en la interfaz**, pero **no se guardan realmente en el sistema**.

**Failure condition detectada**

* **T-12:** El sistema no presenta el comportamiento esperado, ya que los cambios realizados en los ajustes no se persisten tras modificarlos.


## 9. Historial de versiones

| Versión | Fecha       | Descripción | Autor(es) |
|---------|------------|-------------|-----------|
| 1.0.0   | 07/03/2026 | Se creó a modo de borrador el documento y se probaron varios casos de uso, tanto de Meerkatters como de NexUS. | Luis Emmanuel Chavez Malave |
| 1.0.1   | 08/03/2026 | Se corrigieron signos de puntuación | Luis Emmanuel Chavez Malave |
| 1.1.0 | 08/03/2026 | Integración de pruebas adicionales de NexUS y Meerkatters | Marta Aguilar Morcillo |
| 1.2.0 | 08/03/2026 | Integración de pruebas de casos de uso de NexUS  | Salma El Hakimy Ettorabi |
| 1.2.1 | 08/03/2026 | Integración de pruebas de casos de uso de Meerkatters  | Salma El Hakimy Ettorabi |


---

**Redactado por:** Luis Emmanuel Chavez Malave, Marta Aguilar Morcillo y Salma El Hakimy Ettorabi
**Fecha de redacción:** 08/03/2026  
**Versión:** 1.2.1
