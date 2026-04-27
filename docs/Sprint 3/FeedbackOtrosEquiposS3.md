# Informe de Feedback Sprint 2: NexUS y MeerKatters

## 1. NexUS

### Casos de uso antiguo revisados

####  Autenticación

###### Edición de perfil.

**Revision:** Bugs anteriores revisados y arreglados, no se han detectado nuevas failure condition.

---

#### Panel residencias

###### Gestión de residentes (CRUD).

**Revision**
Bug anteiores revisados y arreglados, se han detectado nuevas failure condition.

**Failure condition:** T-12 al intentar eliminar un residente que ya tenga asignado una habitacion salta un error 500 en vez de un error controlado o que se borre el residente

---

#### Comunicación

###### Hacer administrador del grupo a los miembros.

**Revision:** Bug anteiores revisados y arreglados, se han detectado nuevas failure condition.

**Failure condition:** T-12 Te puedes quitar el admin a ti mismo y ya una vez sin admin, seguir modificando el chat.

---

### Nuevos casos de uso Sprint 3 

#### PANEL DE RESIDENCIA

---

###### Ver perfil de estudiante desde su habitación

**Funcionamiento detectado**
* Al entrar en las habitaciones puedes ver el perfil de los residentes 

**Funcionamiento mejorable**
* Niguno

**Failure condition detectada**
* Ninguna

---

###### AUDITORIA DE HABITACIONES

**Funcionamiento detectado**
* cuando hay una modificación en una habitación aparece un historial de auditoría

**Funcionamiento mejorable**
* Cuando se generan muchas modificaciones al presionar el boton salen tantas que se bugea el modal visualmente, recomendacion, que apartir de x auditorias, esa sección sea scrolleable en vez de crecer indefinidamente

**Failure condition detectada**
* Ninguna

---

###### Modificación de términos legales

**Funcionamiento detectado**
* No se entendio bien que hace esta nueva funcionalidad

**Funcionamiento mejorable**
* Explicar mejor, no se sabe si se refiere a que ahora es modificable o que se cambiaron lo de las cookies, para la evaluación de este requisito se da a entender que es la ultima

**Failure condition detectada**
* Ninguna, aunque por la forma ambigua del nombre tampoco se ha probado esta funcionalidad

---
  
## 2. MeerKatters 

### Casos de uso antiguo revisados


#### GESTIÓN DE USUARIOS

###### **UC-02 Iniciar sesión**

**Revision:** Bugs anteriores revisados y arreglados, no se han detectado nuevas failure condition.

###### UC-05 Ver perfil

**Revision:** Bugs anteriores revisados y no han sido arreglados, siguen con las mismas failure condition anteriores.

**Failure condition:** T-12 no se ha solucionado el error anteriormente marcado, al visualizar el perfil de una persona cuyo foto de perfil sean 2 letras de su nombre ej: UsuarioPrueba, la foto de perfil cambia de una U en fondo azul, a el nombre y apellido de la persona sin formato y con parte del nombre cortado por la longitud del mismo.

---

#### COMUNIDADES

###### UC-13 Gestionar miembros de comunidad

**Revision:** Bugs anteriores revisados y no han sido arreglados, siguen con las mismas failure condition anteriores.

**Failure condition:** T-12 No se ha solucionado el error anteriormente marcado, al recibir una solicitud para entrar en un grupo privado, al presionar aceptar o rechazar el sistema no hace nada.

---

#### VIDEOLLAMADAS

###### UC-47 Crear sala de videollamada

**Revision:** Bugs anteriores revisados y no han sido arreglados, siguen con las mismas failure condition anteriores.

**Failure condition:** T-12 no se han solucionado los errores anteriores, si pones en los minutos de duración de crear una reunión un numero gigante como 6000000000000000 te sale un error interno, además si presionas para escribir puedes poner que la reunión dure -45 minutos

---

### Nuevos casos de uso Sprint 3 

#### COMUNICACIÓN Y ANUNCIOS

###### UC-67 Publicar anuncio en comunidad

**Estado:** Funciona correctamente.

**Funcionamiento mejorable**
* Ninguno

**Failure condition detectada**
* Ninguna

---

###### UC-68 Comentar en anuncio

**Estado:** Funciona correctamente, se puede comentar en un anuncio, pero no se ven los botones para editar.

**Funcionamiento mejorable**
* hacer la zona scrolleable, cuando un anuncio tiene muchos comentarios se van apilando y la pagina se transforma en scrollear para abajo hasta que dejen de salir comentarios.

**Failure condition detectada**
* T-12 En la guía dice que el administrador debe poder borrar comentarios en un anuncio, pero o no se encontró el botón o no esta implementado para hacerlo

---

######  UC-69 Enviar mensaje directo (1-a-1)

**Estado:** Funciona correctamente.

**Funcionamiento mejorable**
* Ninguno

**Failure condition detectada**
* Ninguna

---

###### UC-70: Recuperación de contraseña olvidada

**Estado:** Funciona correctamente.

**Funcionamiento mejorable**
* Ninguno

**Failure condition detectada**
* Ninguna

---

###### UC-72: Comunicación en tiempo real (Chat de comunidad)

**Estado:** Funciona correctamente, aunque en la guia dice que al presionar silenciar chat no deberia salirte notificaciones.

**Funcionamiento mejorable**
* Ninguno

**Failure condition detectada**
* T-12 En la guia dice que si presionas silenciar chat solo deberian salirte como notificaciones aquellos mensajes que sean para ti, pero con otro usuario escribi tanto mensajes generales como para mi usando el @ y en ambos casos el numero de mensajes no leidos aumentaba pese a que yo presione silenciar chat

---

###### UC-77: Confirmación de lectura (Read Receipts) en chats de comunidad

**Estado:** Funciona correctamente.

**Funcionamiento mejorable**
* Ninguno

**Failure condition detectada**
* Ninguna

## Historial de versiones

| Versión | Fecha       | Descripción | Autor(es) |
|---------|------------|-------------|-----------|
| 1.0.0 | 28/04/2026 | Creación del documento y casos de uso de meerkateers y Nexus | Luis Emmanuel Chavez Malave|
---

**Redactado por:** Luis Emmanuel Chavez Malave, Marta Aguilar Morcillo y Salma El Hakimy Ettorabi
**Fecha de redacción:** 28/04/2026
**Versión:** 1.0.0
