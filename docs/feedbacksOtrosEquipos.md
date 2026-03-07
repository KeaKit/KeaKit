# Feedback 

## NexUS

### Casos de usos probados

#### Autenticación
o Registro de usuarios mediante email.
o Inicio y cierre de sesión
o Recuperación de contraseña.
o Gestión de roles.
o Edición de perfil.


###### **Registro mediante email**

**Funcionamiento inadecuado:** 
- Se dice desarrollado el registro de usuarios mediante email pero no se percibe ningun boton ni opcion para hacerlo.

**Failure condition detectada:** ninguna para el registro

------------------------------------------------------------------------------------------
###### **inicio y cierre de sesion:** 

**Funcionamiento mejorable:** 
- el boton de mantener sesion no hace nada, pues la sesion se mantiene abierta aunque no lo marques.

**Failure condition detectada:** ninguna 

-----------------------------------------------------------------------------------------

###### **Recuperacion de contraseñas**

**Funcionamiento mejorable:** 
- Al no poder registrar una cuenta con mi correo y como los correos proporcionados no existen realmente, no se pudo probar dicho caso de uso

**Failure condition:** ninguno de momento

---------------------------------------------------------------------------------------------

###### **Gestion de roles**

**Funcionamiento mejorable:** 
funciona correctamente: casos probados
- Con una cuenta de residente no puedes entrar como administrador
- Con una cuenta de administrador no puedes entrar como residente

**Failure condition detectada:** Ninguna

---------------------------------------------------------------------------------------------

###### **Edición de perfil**

**Funcionamiento mejorable:** 
- Como administrador intente modificar mi perfil, como funcionamiento que percibo extraño es que puedes poner letras en la parte de telefono de contacto, deberia o eliminarse la seccion o arreglarse.
- Como estudiante funciona perfectamente, pero como cosa a mejorar sería en intereses personalizados agregar un lenght maximo, escribi uno de como mil caracteres y se lo comio, ademas la interfaz queda un poco extraña. 

**Failure condition detectada:** 
- Estas 2 failure condition se consideraron debido a que como administrador no funciona correctamente
- T-12: al modificar el perfil, una vez sales y vuelves a entrar pues no ocurre ninguna modificación, todo sigue igual que antes, por tanto el boton de modificar perfil no modifica el perfil
-T-13: No existe validacion para campos vacios o invalidos, puedes dejar en blanco todos los campos modificables y el sistema no realiza ningun aviso 


#### Panel residencias:
o Acceso e interacción con el panel administrativo.
o Gestión de personal (CRUD).
o Gestión de residentes (CRUD).

---------------------------------------------------------------------------------------------

###### **Acceso e interacción con el panel administrativo**

**Funcionamiento mejorable:**
- Ninguno apreciable, en efecto se ve y se puede interactuar

**Failure condition detectada:**
- Ninguna

---------------------------------------------------------------------------------------------

###### **Gestión de personal (CRUD):**

**Funcionamiento mejorable:**
- Puedes crear un personal, entrar como administrador con ese personal creado, borrarte a ti mismo, y al intentar seguir navegando se bugea todo, el area de personal no se puede ver, al entrar en habitaciones la pantalla se queda en blanco, etc.

**Pasos para replicar el error:**
- Entrar como administrador, ir a personal y crear un personal ej pepito5@nexus.es, luego salir de la sesion, iniciar sesion como administrador con pepito5@nexus.es, volver al apartado de personal, borrar a pepito5@nexus.es, finalmente al intentar interactuar con el sistema ocurren los fallos anteriormente comentados

**Failure condition detectada:**
- T-12: hice un crud "normal" y al borrarme a mi mismo la aplicacion empezo a presentar fallos, ademas una vez hecho eso, al salir e intentar entrar con otras credenciales si existentes sale "el usuario del token no existe", el problema persiste al intentar entrar como estudiante

---------------------------------------------------------------------------------------------

###### **Gestión de residentes (CRUD):**

**Funcionamiento mejorable:**

- Debido al fallo anterior no pude probarla

**Failure condition detectada:**

- Debido al falloa anterio no pude probarla

##### Incidencias

o Creación de incidencias.
o Consulta del historial de incidencias propias.
o Consultada de listado global de incidencias con filtros.
o Cambio de estados de incidencias.
o Adición de notas y comentarios rápidos a las incidencias.

---------------------------------------------------------------------------------------------

###### **Creacion de incidencias**

**Funcionamiento mejorable:**

// Nota, falta seguir viendo casos de uso y ver el de gestion de residentes porque despues de encontrar el fallo en gestion de personal no pude seguir probando la aplicacion, como ultima cosa a mencionar, Muchas de las cosas que puse en funcionamiento mejorable pueden tomarse como un feilure condition T-12, si al leerlo consideran que es asi, pasenlo de funcionamiento mejorable a failure condition T-12

---------------------------------------------------------------------------------------------

## Meerkatters

### Casos de usos probados
---------------------------------------------------------------------------------------------
#### UC01 – Registrarse
Permite a un usuario no autenticado crear una cuenta en la plataforma
proporcionando sus datos básicos. Durante el registro se valida si el dominio
del correo pertenece a una institución reconocida para aplicar posibles
beneficios o restricciones.

**Funcionamiento mejorable:**

- Los botones de google y linkedin no hacen nada, seria recomendable como dijo el profe o eliminarlos hasta que la funcionalidad este implementada o indicarlo en la seccion de indicaciones varias

- No me deja poner caracteres en chino para el email 汉字/漢字@alum.es

- No tiene limite de caracteres en contraseña, por eso creo que ocurrio el siguiente error


**Pasos para replicar el error:**

- Al intentar crear una cuenta rellene los campos con el siguiente contenido:

Nombre completo

汉字/漢字

University Email

chinhuan@alum.es

Password

汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字

**Failure condition detectada:**

- T-12: Al rellenar los campos de la forma anteriormente mencionada, al darle registrar cuenta me salta el siguiente error "Error interno del servidor"
- T-13: no se hasta que punto esto cuente como un T-13
---------------------------------------------------------------------------------------------
#### UC02 – Iniciar Sesión
Permite a un usuario autenticarse en la plataforma mediante sus credenciales
registradas para acceder a funcionalidades personalizadas.

**Funcionamiento mejorable:**

- Funciona como es de esperar, tanto con las credenciales que nos dieron como con usuarios creados por mi persona

**Failure condition detectada:**

- Ninguna
---------------------------------------------------------------------------------------------
#### UC03 – Cerrar Sesión
Permite al usuario autenticado finalizar su sesión activa, garantizando la
seguridad y evitando accesos no autorizados desde el mismo dispositivo.

**Funcionamiento mejorable:**

- Super escondida, ponganla en la navbar pls o en algun lugar facil de ver, me costo encontrarla

**Failure condition detectada:**

- Ninguna
---------------------------------------------------------------------------------------------
#### UC04 – Personalizar Perfil
Permite al usuario editar su información personal como nombre, foto,
descripción o preferencias visibles dentro de la plataforma.


**Funcionamiento mejorable:**

- Revisen el tamaño maximo de caracteres de varios campos, nuevamente puse un monton de caracteres en descripcion personal y nuevamente me salio el error de "Error interno del servidor"

**Failure condition detectada:**

- T-12: Al editar mi perfil y escribir mas de 500 caracteres en la seccion de descripcion personal me salto el error "Error interno del servidor"
- T-11: no se hasta que punto cuente como un T11

---------------------------------------------------------------------------------------------
#### UC05 – Ver Perfil
Permite visualizar el perfil propio o el de otros usuarios, mostrando información
pública relevante.


**Funcionamiento mejorable:**

- Al entrar como mi usuario creado chinhuan, accedo a la parte de profesores y sale no se pudieron cargar profesores y el boton de reintentar, cuando se supone que existe al menos un profesor (el de los dato de acceso)

**Failure condition detectada:**

- T-12: Intente listar a los profesores para ver su perfil, pero me sale "No se pudieron cargar los profesores" y un boton de reintentar que al presionarlo sigue sin cargar a ninguno
---------------------------------------------------------------------------------------------
#### UC06 – Cambiar Contraseña
Permite al usuario modificar su contraseña actual para reforzar la seguridad de
su cuenta

**Funcionamiento mejorable:**

- Nuevamente problema de length de campos, puse una contraseña de muchos caracteres y me sale el error de servidor

- Error al cambiar contraseña 

- Si te ayuda creo que ocurre porque al crear usuario pide contraseña de tamaño minimo de 8, pero al cambiarla pide tamaño minimo de 6, por tanto si pones una de tamaño 6 ocurre el problema mencionado, como nota adicional, si cambias la contraseña por una de tamaño 8 no hay ningun fallo

**Pasos para replicar el error:**

rellena los campos de la siguiente manera

Contraseña actual

*tu contraseña actual*

Nueva contraseña

123456

Confirmar nueva contraseña

123456

error obtenido: "Error interno del servidor"

**Failure condition detectada:**

- T-12: Intente cambiar la contraseña por otra y no me dejo, saltando el error "Error interno del servidor"

---------------------------------------------------------------------------------------------
### UC07 – Eliminar Cuenta
Permite al usuario eliminar permanentemente su cuenta y todos los datos
asociados según la política de privacidad.

**Funcionamiento mejorable:**

- Se borra correctamente un usuario

**Failure condition detectada:**

- Ninguna

---------------------------------------------------------------------------------------------

#### UC8 – Crear Comunidad
Permite a un usuario crear una nueva comunidad con un nombre, descripción y
configuración inicial.

**Funcionamiento mejorable:**

- Ninguna detectada, teniendo en cuenta las indicaciones dadas en el documento

**Failure condition detectada:**

- Ninguna 

---------------------------------------------------------------------------------------------

#### UC9 – Configurar Privacidad Comunidad
Permite al administrador definir si la comunidad es pública o privada y
establecer reglas de acceso.


**Funcionamiento mejorable:**

- No entendi muy bien eso de reglas de acceso pero efectivamente cree una comunidad en privado y nadie mas la ve

**Failure condition detectada:**

- Ninguna 

---------------------------------------------------------------------------------------------

#### UC10 – Buscar Comunidades
Permite a los usuarios buscar comunidades mediante filtros o palabras clave.

**Funcionamiento mejorable:**

- Al buscarse de forma automatica mientras escribes, la lupita que esta al lado del input literal no hace nada, yo la quitaria la verdad, por otro lado nuevamente si introduces muchisimos caracteres en la barra de busqueda dice que hubo un error al buscar comunidades, pero no lo considero failure condition porque sale un intentelo mas tarde, igual ya que el tamaño maximo de nombre de comunidad es 100 pondria un length maximo en esta barra de busqueda de 100 para evitar problemas

**Failure condition detectada:**

- Ninguna 

---------------------------------------------------------------------------------------------

#### UC11 – Explorar Comunidades
Permite navegar por comunidades

**Funcionamiento mejorable:**

- Funciona correctamente, puedes ver las comunidades y clickear para ver sus eventos y el boton de  unirse a la comunidad

**Failure condition detectada:**

- Ninguna 


---------------------------------------------------------------------------------------------

#### UC12 – Unirse a Comunidad Pública
Permite al usuario acceder directamente a una comunidad pública sin
necesidad de aprobación

**Funcionamiento mejorable:**

- Funciona correctamente, puedes unirte

**Failure condition detectada:**

- Ninguna 

---------------------------------------------------------------------------------------------

#### UC13 – Abandonar Comunidad
Permite al usuario dejar voluntariamente una comunidad a la que pertenece.

**Funcionamiento mejorable:**

- Funciona correctamente, puedes salirte de la comunidad, solo que si tu la creaste no puedes, dice algo de que tienes que pasarle el admin a otra persona, yo lo que haria es que te deje salirte y si una comunidad tiene 0 personas que se borre automaticamente 

**Failure condition detectada:**

- Ninguna 

---------------------------------------------------------------------------------------------

#### UC14 – Chat de Comunidad
Permite a los miembros comunicarse en tiempo real dentro de la comunidad
mediante mensajes y archivos.

**Funcionamiento mejorable:**

- No se puede navegar entre chat de comunidades y personales, si clickas en el nombre de alguien que escribio en un chat de comunidad puedes escribirle de forma personal, pero una vez ya le escribiste, si le das en vovler no vuelves a los chats de comunidades, te toca volver a entrar en la pantalla de chats

**Failure condition detectada:**

- Ninguna 



## 9. Historial de versiones

| Versión | Fecha       | Descripción                   | Autor(es)       |
|---------|------------|--------------------------------|------------|
| 1.0.0   | 07/03/2026 | Se creo a modo de borrador el documento y se probaron varios casos de uso, tanto de meetkaters como de nexUS | Luis Emmanuel Chavez Malave |
---
**Redactado por:** Luis Emmanuel Chavez Malave
**Fecha de redacción:** 7/03/2026  
**Versión:** 1.0.0