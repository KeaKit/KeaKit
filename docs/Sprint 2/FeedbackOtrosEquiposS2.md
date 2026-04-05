# Informe de Feedback Sprint 2: NexUS 

## 1. NexUS

### Casos de uso probados

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

## Historial de versiones

| Versión | Fecha       | Descripción | Autor(es) |
|---------|------------|-------------|-----------|
| 1.0.0 | 05/04/2026 | Creación del documento e Integración de pruebas de casos de uso de NexUS  | Salma El Hakimy Ettorabi |
| 1.1.0 | 05/04/2026 | Integración del resto de pruebas de casos de uso de NexUS  | Marta Aguilar Morcillo |


---

**Redactado por:** Luis Emmanuel Chavez Malave, Marta Aguilar Morcillo y Salma El Hakimy Ettorabi
**Fecha de redacción:** 05/04/2026
**Versión:** 1.1.0
