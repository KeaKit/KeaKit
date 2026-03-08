# Informe de Feedback: NexUS & Meerkatters

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

###### **Recuperación de contraseñas**
* **Funcionamiento mejorable:** No se pudo probar este caso de uso debido a la imposibilidad de registrar una cuenta propia y a que los correos de prueba proporcionados no son reales.
* **Failure condition:** Pendiente de validación.

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

---------------------------------------------------------------------------------------------

## Meerkatters

### Casos de usos probados
---------------------------------------------------------------------------------------------
#### UC01 – Registrarse
Permite a un usuario no autenticado crear una cuenta en la plataforma, proporcionando sus datos básicos. Durante el registro se valida si el dominio del correo pertenece a una institución reconocida, para aplicar posibles beneficios o restricciones.

**Funcionamiento mejorable:**

- Los botones de Google y LinkedIn no hacen nada. Sería recomendable, como dijo el profe, eliminarlos hasta que la funcionalidad esté implementada o indicarlo en la sección de indicaciones varias.

- No me deja poner caracteres en chino para el email: 汉字/漢字@alum.es.

- No tiene límite de caracteres en contraseña, por eso creo que ocurrió el siguiente error.

**Pasos para replicar el error:**

- Al intentar crear una cuenta, rellené los campos con el siguiente contenido:

Nombre completo

汉字/漢字

University Email

chinhuan@alum.es

Password

汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字汉字/漢字

**Failure condition detectada:**

- T-12: Al rellenar los campos de la forma anteriormente mencionada, al darle a registrar cuenta me salta el siguiente error: "Error interno del servidor".
- T-13: No sé hasta qué punto esto cuente como un T-13.

---------------------------------------------------------------------------------------------
#### UC02 – Iniciar Sesión
Permite a un usuario autenticarse en la plataforma mediante sus credenciales registradas, para acceder a funcionalidades personalizadas.

**Funcionamiento mejorable:**

- Funciona como es de esperar, tanto con las credenciales que nos dieron como con usuarios creados por mi persona.

**Failure condition detectada:**

- Ninguna.

---------------------------------------------------------------------------------------------
#### UC03 – Cerrar Sesión
Permite al usuario autenticado finalizar su sesión activa, garantizando la seguridad y evitando accesos no autorizados desde el mismo dispositivo.

**Funcionamiento mejorable:**

- Súper escondida. Pónganla en la navbar, pls, o en algún lugar fácil de ver; me costó encontrarla.

**Failure condition detectada:**

- Ninguna.

---------------------------------------------------------------------------------------------
#### UC04 – Personalizar Perfil
Permite al usuario editar su información personal, como nombre, foto, descripción o preferencias visibles dentro de la plataforma.

**Funcionamiento mejorable:**

- Revisen el tamaño máximo de caracteres de varios campos. Nuevamente puse un montón de caracteres en descripción personal y me salió el error de "Error interno del servidor".

**Failure condition detectada:**

- T-12: Al editar mi perfil y escribir más de 500 caracteres en la sección de descripción personal, me saltó el error "Error interno del servidor".
- T-11: No sé hasta qué punto cuente como un T11.

---------------------------------------------------------------------------------------------
#### UC05 – Ver Perfil
Permite visualizar el perfil propio o el de otros usuarios, mostrando información pública relevante.

**Funcionamiento mejorable:**

- Al entrar como mi usuario creado, chinhuan, accedo a la parte de profesores y sale "No se pudieron cargar profesores" y el botón de reintentar, cuando se supone que existe al menos un profesor (el de los datos de acceso).

**Failure condition detectada:**

- T-12: Intenté listar a los profesores para ver su perfil, pero me sale "No se pudieron cargar los profesores" y un botón de reintentar que, al presionarlo, sigue sin cargar a ninguno.

---------------------------------------------------------------------------------------------
#### UC06 – Cambiar Contraseña
Permite al usuario modificar su contraseña actual para reforzar la seguridad de su cuenta.

**Funcionamiento mejorable:**

- Nuevamente, problema de length de campos. Puse una contraseña de muchos caracteres y me sale el error de servidor.

- Error al cambiar contraseña.

- Si te ayuda, creo que ocurre porque al crear usuario pide contraseña de tamaño mínimo de 8, pero al cambiarla pide tamaño mínimo de 6. Por tanto, si pones una de tamaño 6 ocurre el problema mencionado. Como nota adicional, si cambias la contraseña por una de tamaño 8 no hay ningún fallo.

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

- T-12: Intenté cambiar la contraseña por otra y no me dejó, saltando el error "Error interno del servidor".

---------------------------------------------------------------------------------------------
### UC07 – Eliminar Cuenta
Permite al usuario eliminar permanentemente su cuenta y todos los datos asociados, según la política de privacidad.

**Funcionamiento mejorable:**

- Se borra correctamente un usuario.

**Failure condition detectada:**

- Ninguna.

---------------------------------------------------------------------------------------------

#### UC8 – Crear Comunidad
Permite a un usuario crear una nueva comunidad con un nombre, descripción y configuración inicial.

**Funcionamiento mejorable:**

- Ninguna detectada, teniendo en cuenta las indicaciones dadas en el documento.

**Failure condition detectada:**

- Ninguna.

---------------------------------------------------------------------------------------------

#### UC9 – Configurar Privacidad Comunidad
Permite al administrador definir si la comunidad es pública o privada y establecer reglas de acceso.

**Funcionamiento mejorable:**

- No entendí muy bien eso de reglas de acceso, pero efectivamente creé una comunidad en privado y nadie más la ve.

**Failure condition detectada:**

- Ninguna.

---------------------------------------------------------------------------------------------

#### UC10 – Buscar Comunidades
Permite a los usuarios buscar comunidades mediante filtros o palabras clave.

**Funcionamiento mejorable:**

- Al buscarse de forma automática mientras escribes, la lupita que está al lado del input literalmente no hace nada. Yo la quitaría, la verdad.  
  Por otro lado, nuevamente si introduces muchísimos caracteres en la barra de búsqueda dice que hubo un error al buscar comunidades, pero no lo considero failure condition porque sale un "inténtelo más tarde".  
  Igual, ya que el tamaño máximo de nombre de comunidad es 100, pondría un length máximo en esta barra de búsqueda de 100 para evitar problemas.

**Failure condition detectada:**

- Ninguna.

---------------------------------------------------------------------------------------------

#### UC11 – Explorar Comunidades
Permite navegar por comunidades.

**Funcionamiento mejorable:**

- Funciona correctamente. Puedes ver las comunidades y clickear para ver sus eventos y el botón de unirse a la comunidad.

**Failure condition detectada:**

- Ninguna.

---------------------------------------------------------------------------------------------

#### UC12 – Unirse a Comunidad Pública
Permite al usuario acceder directamente a una comunidad pública sin necesidad de aprobación.

**Funcionamiento mejorable:**

- Funciona correctamente, puedes unirte.

**Failure condition detectada:**

- Ninguna.

---------------------------------------------------------------------------------------------

#### UC13 – Abandonar Comunidad
Permite al usuario dejar voluntariamente una comunidad a la que pertenece.

**Funcionamiento mejorable:**

- Funciona correctamente, puedes salirte de la comunidad. Solo que si tú la creaste no puedes; dice algo de que tienes que pasarle el admin a otra persona. Yo lo que haría es que te deje salirte y, si una comunidad tiene 0 personas, que se borre automáticamente.

**Failure condition detectada:**

- Ninguna.

---------------------------------------------------------------------------------------------

#### UC14 – Chat de Comunidad
Permite a los miembros comunicarse en tiempo real dentro de la comunidad, mediante mensajes y archivos.

**Funcionamiento mejorable:**

- No se puede navegar entre chat de comunidades y personales. Si clickeas en el nombre de alguien que escribió en un chat de comunidad puedes escribirle de forma personal, pero una vez ya le escribiste, si le das en volver no vuelves a los chats de comunidades; te toca volver a entrar en la pantalla de chats.

**Failure condition detectada:**

- Ninguna.

## 9. Historial de versiones

| Versión | Fecha       | Descripción | Autor(es) |
|---------|------------|-------------|-----------|
| 1.0.0   | 07/03/2026 | Se creó a modo de borrador el documento y se probaron varios casos de uso, tanto de Meerkatters como de NexUS. | Luis Emmanuel Chavez Malave |
| 1.0.1   | 08/03/2026 | Se corrigieron signos de puntuación | Luis Emmanuel Chavez Malave |

---

**Redactado por:** Luis Emmanuel Chavez Malave  
**Fecha de redacción:** 78/03/2026  
**Versión:** 1.0.1