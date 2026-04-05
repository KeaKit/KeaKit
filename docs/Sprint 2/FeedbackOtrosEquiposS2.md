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

## Historial de versiones

| Versión | Fecha       | Descripción | Autor(es) |
|---------|------------|-------------|-----------|
| 1.0.0 | 05/04/2026 | Creación del documento e Integración de pruebas de casos de uso de NexUS  | Salma El Hakimy Ettorabi |



---

**Redactado por:** Luis Emmanuel Chavez Malave, Marta Aguilar Morcillo y Salma El Hakimy Ettorabi
**Fecha de redacción:** 05/04/2026
**Versión:** 1.0.0
