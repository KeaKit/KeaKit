# Informe de Feedback Sprint 3: NexUS y MeerKatters

## 1. NexUS

### Casos de uso antiguo revisados

####  Autenticación

###### Edición de perfil.

**Revision:** Bugs anteriores revisados y arreglados, no se han detectado nuevas failure condition.

**Funcionamiento mejorable**
* El mensaje de error "Este campo no puede tener mas de 128 caracteres" no aparece justo debajo ni encima de contraseña, sino flotante en la parte de arriba del modal de creación de nuevo residente. Por lo que si se rellenan más campos aparte de la contraseña, no se sabe exactamente cuál es "este campo" en concreto.

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
#### Onboarding

###### Dar de alta a nuevos residentes / Edición

**Revisión:** Bugs anteriores revisados y arreglados (el error T-12 y la visualización mejorable donde la fecha de check-in no se guardaba ni se mostraba han sido solucionados). No se han detectado nuevas failure conditions.

---

### Nuevos casos de uso Sprint 3 

#### EVENTOS

###### Recomendación de eventos

**Funcionamiento detectado**
* Funciona bien.

**Funcionamiento mejorable**
* Ninguno.

**Failure condition detectada**
* Ninguna.

---

###### Creación de chats para eventos

**Funcionamiento detectado**
* Funciona bien.

**Funcionamiento mejorable**
* Estaría bien que el administrador pueda entrar a los chats para supervisar.

**Failure condition detectada**
* Ninguna.

---

#### MATCHING

###### Funcionalidad de likes entre matches

**Funcionamiento detectado**
* Funciona bien la acción de dar el like.

**Funcionamiento mejorable**
* Actualmente no influye en nada (por ejemplo, en el porcentaje de match) y no lo recibe ni se le notifica a la persona a quien se le da el like.

**Failure condition detectada**
* Ninguna.

---

#### COMEDOR

###### Analíticas del comedor

**Funcionamiento detectado**
* El resto de la funcionalidad opera correctamente y muestra los datos.

**Funcionamiento mejorable**
* Ninguno.

**Failure condition detectada**
* **T-13:** En los filtros, el sistema deja poner una fecha de fin anterior a la fecha de inicio.

---

###### Borrar foto del menú, Avanzar semana y Ver menús publicados

**Funcionamiento detectado**
* Todas estas funcionalidades operan correctamente.

**Funcionamiento mejorable**
* Ninguno.

**Failure condition detectada**
* Ninguna.

---

#### GESTIÓN DE ACCESO

###### Historial de pases expirados, Filtrar invitados e Introducir hora de salida

**Funcionamiento detectado**
* Estas funcionalidades operan correctamente.

**Funcionamiento mejorable**
* Ninguno.

**Failure condition detectada**
* Ninguna.

---

###### Generación código qr/código numérico

**Funcionamiento detectado**
* Sale un QR en la pantalla al solicitarlo.

**Funcionamiento mejorable**
* Ninguno.

**Failure condition detectada**
* **T-12:** Al comparar los códigos QR de dos usuarios distintos, resulta que son iguales.

---

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

#### NOTIFICACIONES

###### Notificación al administrador para informar de invitados fuera del horario permitido

**Funcionamiento detectado**
* Se han detectado nuevas failure conditions.

**Funcionamiento mejorable**
* Ninguno.

**Failure condition detectada**
* **T-12:** El sistema permite al administrador rechazar pases aunque el período de visita ya haya finalizado.

---

###### Notificación al residente para avisar de hora próxima de salida del invitado

**Funcionamiento detectado**
* Funciona correctamente.

**Funcionamiento mejorable**
* Ninguno.

**Failure condition detectada**
* Ninguna.

---

###### Descartar notificaciones para residente y administrador

**Funcionamiento detectado**
* Funciona correctamente.

**Funcionamiento mejorable**
* Ninguno.

**Failure condition detectada**
* Ninguna.

---

#### ANALÍTICAS

###### Interfaz de analíticas para administrador

**Funcionamiento detectado**
* La interfaz funciona correctamente y permite visualizar los datos.

**Funcionamiento mejorable**
* Ninguno.

**Failure condition detectada**
* Ninguna.

---

###### Métricas de análisis (visitas, habitaciones, incidencias y paquetería)

**Funcionamiento detectado**
* Todas las métricas se muestran correctamente.

**Funcionamiento mejorable**
* Ninguno.

**Failure condition detectada**
* Ninguna.

---

###### Analíticas por membership (staff o residentes)

**Funcionamiento detectado**
* Funciona correctamente.

**Funcionamiento mejorable**
* Ninguno.

**Failure condition detectada**
* Ninguna.

---

#### INCIDENCIAS

###### Lógica de priorización automática de incidencias

**Funcionamiento detectado**
* Funciona correctamente.

**Funcionamiento mejorable**
* Ninguno.

**Failure condition detectada**
* Ninguna.

---

#### RESERVAS

###### Sistema de recordatorio automático de reservas de espacios

**Funcionamiento detectado**
* Funciona correctamente.

**Funcionamiento mejorable**
* Ninguno.

**Failure condition detectada**
* Ninguna.

---

#### ESPACIOS COMUNES

###### Añadir imagen al crear/editar un espacio

**Revision:** Se han detectado nuevas failure conditions.

**Funcionamiento detectado**
* Permite subir imágenes correctamente.

**Funcionamiento mejorable**
* Validar el tipo de archivo subido para evitar formatos incorrectos.

**Failure condition detectada**
* **T-12:** El sistema permite subir archivos que no son imágenes (por ejemplo, PDF) al crear o editar espacios/eventos.

---
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
* La creación y edición del perfil de profesor sigue funcionando correctamente.
* El sistema permite guardar correctamente la información del perfil cuando los datos introducidos son válidos.

**Funcionamiento mejorable**
* Las validaciones de los campos siguen siendo poco específicas.
* Al introducir un correo electrónico con formato inválido, el sistema impide continuar, pero no muestra ningún mensaje indicando que el formato es incorrecto.
* Al introducir texto excesivamente largo en algunos campos, el sistema tampoco informa del motivo exacto del error, limitándose a bloquear la acción.

**Failure condition detectada**
* **T12** - El sistema no proporciona feedback claro al usuario sobre qué validación está fallando, dificultando la corrección de errores.

---

###### UC-33 Solicitar verificación de profesor.

**Funcionamiento detectado**
* La solicitud de verificación del perfil funciona correctamente.

**Failure condition detectada**
* Ninguna.

---

###### UC-34 Listar profesores.

**Funcionamiento detectado**
* El listado de profesores funciona correctamente y permite visualizar los perfiles disponibles.

**Failure condition detectada**
* Ninguna.

---

###### UC-35 Listar profesores verificados.

**Funcionamiento detectado**
* El filtrado de profesores verificados funciona correctamente.

**Failure condition detectada**
* Ninguna.

---

###### UC-36 Pago para verificación / promoción.

**Funcionamiento detectado**
* El flujo de pago para la promoción o verificación del perfil de profesor funciona correctamente.

**Failure condition detectada**
* Ninguna.

---

###### UC-37 Valorar profesor.

**Funcionamiento detectado**
* No se ha podido validar completamente la funcionalidad.

**Funcionamiento mejorable**
* No ha sido posible completar el flujo de valoración porque no se proporcionó una cuenta de profesor promocionado para realizar una contratación real.
* El proceso requería verificar información personal y profesional real, lo que impedía continuar con datos de prueba.

**Failure condition detectada**
* No se ha podido comprobar el flujo completo de contratación y valoración, por falta de datos de prueba adecuados.

---

###### UC-38 Chat con profesor.

**Funcionamiento detectado**
* El chat entre usuario y profesor funciona correctamente y permite la comunicación privada en tiempo real.

**Failure condition detectada**
* Ninguna.

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
* La visualización de planes sigue funcionando correctamente para todos los tipos de usuario.

**Failure condition detectada**
* Ninguna.

---

###### UC-40 Suscribirse a un plan.

**Funcionamiento detectado**
* La suscripción a planes continúa funcionando correctamente.

**Funcionamiento mejorable**
* Sigue existiendo una gestión poco clara cuando un usuario tiene varios planes activos simultáneamente.
* El sistema permite mantener suscripciones Premium y Pro activas al mismo tiempo, generando confusión sobre cuál es la suscripción principal o prioritaria.

**Failure condition detectada**
* **T12** - Persisten inconsistencias en la gestión de múltiples planes simultáneos.

---

###### UC-41 Procesar pago.

**Funcionamiento detectado**
* El procesamiento de pagos continúa funcionando correctamente y el flujo de pago se completa sin incidencias.

**Failure condition detectada**
* Ninguna.

---

###### UC-42 Cancelar suscripción.

**Funcionamiento detectado**
* La cancelación de suscripción, que anteriormente no estaba implementada, ahora funciona correctamente.
* El sistema permite cancelar la renovación del plan de forma adecuada.

**Failure condition detectada**
* Ninguna.

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
* El envío de notificaciones sigue funcionando correctamente.

**Failure condition detectada**
* Ninguna.

---

###### UC-44 Recibir notificación.

**Funcionamiento detectado**
* La recepción de notificaciones en tiempo real funciona correctamente.

**Failure condition detectada**
* Ninguna.

---

###### UC-45 Ver historial de notificaciones.

**Funcionamiento detectado**
* El historial de notificaciones se muestra correctamente.

**Failure condition detectada**
* Ninguna.

---

###### UC-46 Marcar notificación como leída.

**Funcionamiento detectado**
* El marcado de notificaciones como leídas funciona correctamente y actualiza su estado.

**Failure condition detectada**
* Ninguna.
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

---

---

#### EVENTOS

Casos de uso probados:

* UC-14 Publicar contenido en comunidad
* UC-15 Moderar contenido de comunidad
* UC-16 Crear evento
* UC-17 Configurar privacidad de evento
* UC-18 Especificar información del evento
* UC-19 Seleccionar ubicación (mapa interactivo)
* UC-20 Ver ubicaciones recomendadas
* UC-21 Unirse a evento
* UC-22 Cancelar asistencia
* UC-23 Ver asistentes
* UC-24 Editar evento
* UC-25 Cancelar evento

---

###### UC-20 Ver ubicaciones recomendadas

**Revision:** Se han detectado nuevas failure conditions.

**Failure condition:**  
* **T-12:** En la selección de la ubicación en la creación o edición de eventos, no aparecen ubicaciones recomendadas.

---

###### Resto de casos de uso de EVENTOS

**Funcionamiento detectado**
* Todas las funcionalidades restantes funcionan correctamente.

**Funcionamiento mejorable**
* Ninguno.

**Failure condition detectada**
* Ninguna.

---

#### CONTENIDO

Casos de uso probados:

* UC-26 Subir archivo
* UC-27 Visualizar archivo
* UC-28 Descargar archivo
* UC-29 Eliminar archivo

---

###### Gestión de archivos

**Funcionamiento detectado**
* Todas las funcionalidades funcionan correctamente.

**Funcionamiento mejorable**
* Ninguno.

**Failure condition detectada**
* Ninguna.

---

#### MAPAS Y UBICACIÓN

Casos de uso probados:

* UC-30 Búsqueda por ubicación
* UC-31 Visualizar mapa de meetings

---

###### Funcionalidad de mapas

**Funcionamiento detectado**
* Todas las funcionalidades funcionan correctamente.

**Funcionamiento mejorable**
* Ninguno.

**Failure condition detectada**
* Ninguna.

---

#### CUESTIONARIOS

Casos de uso probados:

* UC-64 Crear cuestionario
* UC-65 Resolver cuestionario
* UC-66 Dar feedback o calificación a profesor

---

###### UC-64 Crear cuestionario

**Revision:** Se han detectado nuevas failure conditions.

**Failure condition:**  
* **T-12:** Permite introducir valores decimales como "0,3" en el tiempo estimado; sin embargo, tras crear el cuestionario se muestra "Tiempo estimado: - min".

---

###### UC-65 Resolver cuestionario

**Revision:** Se han detectado nuevas failure conditions.

**Failure condition:**  
* **T-12:** Una vez superado el tiempo límite del cuestionario, el sistema sigue permitiendo enviar respuestas.

---

###### UC-66 Dar feedback o calificación a profesor

**Funcionamiento detectado**
* Funciona correctamente.

**Funcionamiento mejorable**
* Ninguno.

**Failure condition detectada**
* Ninguna.

---

#### COMUNICACIÓN Y ANUNCIOS

Casos de uso probados:

* UC-67 Publicar anuncio en comunidad
* UC-68 Comentar en anuncio
* UC-69 Enviar mensaje directo (1-a-1)
* UC-70 Recuperación de contraseña olvidada
* UC-71 Abandonar una comunidad voluntariamente
* UC-72 Comunicación en tiempo real (Chat de comunidad)
* UC-73 Edición de un mensaje propio en la comunidad
* UC-74 Eliminación de mensajes en la comunidad
* UC-75 Contratación de planes institucionales (Planes B2B)
* UC-76 Cancelación de reservas por parte del estudiante
* UC-77 Confirmación de lectura (Read Receipts)
* UC-78 Buscar usuarios generales

---

###### UC-68 Comentar en anuncio

**Revision:** Se han detectado nuevas failure conditions.

**Failure condition:**  
* **T-12:** No permite eliminar un anuncio si este tiene comentarios, incluso cuando los comentarios son del propio usuario.

---

###### UC-75 Contratación de planes institucionales (Planes B2B)

**Revision:** Se han detectado nuevas failure conditions.

**Failure condition:**  
* **T-12:** El precio estimado no varía al modificar la cantidad de usuarios durante la contratación del plan.

---

###### Resto de casos de uso de COMUNICACIÓN Y ANUNCIOS

**Funcionamiento detectado**
* Todas las funcionalidades restantes funcionan correctamente.

**Funcionamiento mejorable**
* Ninguno.

**Failure condition detectada**
* Ninguna.

---

## Historial de versiones

| Versión | Fecha       | Descripción | Autor(es) |
|---------|------------|-------------|-----------|
| 1.0.0 | 28/04/2026 | Creación del documento y casos de uso de meerkateers y Nexus | Luis Emmanuel Chavez Malave|
| 1.1.0 | 28/04/2026 | Feedback casos de uso Nexus y Meerkatters | Salma El Hakimy Etorabi|
| 1.2.0 | 28/04/2026 | Feedback casos de uso Nexus y Meerkatters | Marta Aguilar Morcillo|

---

**Redactado por:** Luis Emmanuel Chavez Malave, Marta Aguilar Morcillo y Salma El Hakimy Ettorabi
**Fecha de redacción:** 28/04/2026
**Versión:** 1.2.0
