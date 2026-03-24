# Reglas de Negocio — KeaKit

## Índice del documento

1. [Catálogo de Reglas de Negocio](#1-catálogo-de-reglas-de-negocio)
   1. [Usuarios y Autenticación](#11-usuarios-y-autenticación)
   2. [Categorías y Tipos de Objetos](#12-categorías-y-tipos-de-objetos)
   3. [Artículos (Objetos en Alquiler)](#13-artículos-objetos-en-alquiler)
   4. [Servicios](#14-servicios)
   5. [Kits (Proceso de Alquiler)](#15-kits-proceso-de-alquiler)
   6. [Precios, Comisiones y Garantías](#16-precios-comisiones-y-garantías)
   7. [Pagos y Wallet](#17-pagos-y-wallet)
   8. [Entregas y Logística](#18-entregas-y-logística)
   9. [Devoluciones](#19-devoluciones)
   10. [Valoraciones (Ratings)](#110-valoraciones-ratings)
   11. [Incidencias y Soporte](#111-incidencias-y-soporte)
   12. [Notificaciones](#112-notificaciones)
   13. [Administración de la Plataforma](#113-administración-de-la-plataforma)
   14. [Seguridad y Sesión](#114-seguridad-y-sesión)
2. [Reglas de Negocio por Historia de Usuario / Caso de Uso](#2-reglas-de-negocio-por-historia-de-usuario--caso-de-uso)
   1. [Historias de Arrendador](#21-historias-de-arrendador)
   2. [Historias de Arrendatario](#22-historias-de-arrendatario)
   3. [Historias de Administrador](#23-historias-de-administrador)
   4. [Historias Generales](#24-historias-generales)
3. [Matriz de Trazabilidad](#3-matriz-de-trazabilidad)
4. [Historial de versiones](#4-historial-de-versiones)

---

## 1. Catálogo de Reglas de Negocio

### 1.1 Usuarios y Autenticación

| ID | Regla de Negocio |
|----|------------------|
| RN-USR-01 | El email del usuario debe ser único en toda la plataforma. No pueden existir dos cuentas con el mismo email. |
| RN-USR-02 | El email debe tener un formato válido (contener `@` y un dominio válido). |
| RN-USR-03 | La contraseña debe tener un mínimo de 6 caracteres. |
| RN-USR-04 | El nombre del usuario es obligatorio y no puede estar vacío. |
| RN-USR-05 | El teléfono del usuario es obligatorio y no puede estar vacío. |
| RN-USR-06 | La dirección del usuario es obligatoria y no puede estar vacía. |
| RN-USR-07 | La ciudad del usuario es obligatoria y no puede estar vacía. |
| RN-USR-08 | El país del usuario es obligatorio y no puede estar vacío. |
| RN-USR-09 | La contraseña se almacena cifrada (hash) y nunca en texto plano. |
| RN-USR-10 | Al registrarse, un usuario nuevo recibe automáticamente el rol `USER`. |
| RN-USR-11 | Existen dos roles en la plataforma: `USER` y `ADMIN`. |
| RN-USR-12 | Al registrarse, se crea automáticamente un monedero (wallet) asociado al usuario con saldo disponible y pendiente en 0,00 € y divisa EUR. |
| RN-USR-13 | Un usuario puede editar sus datos de perfil: nombre, teléfono, dirección, ciudad y país. |
| RN-USR-14 | Un usuario no puede modificar su propio rol. Solo un administrador puede hacerlo. |
| RN-USR-15 | Un usuario actúa simultáneamente como arrendador (cuando sube artículos) y como arrendatario (cuando alquila kits). No se requiere un registro separado para cada rol funcional. |

### 1.2 Categorías y Tipos de Objetos

| ID | Regla de Negocio |
|----|------------------|
| RN-CAT-01 | El nombre de la categoría debe ser único en la plataforma. |
| RN-CAT-02 | El nombre de la categoría es obligatorio y no puede estar vacío. |
| RN-CAT-03 | La descripción de la categoría es obligatoria y tiene un máximo de 1000 caracteres. |
| RN-CAT-04 | Una categoría tiene un estado que puede ser `ACTIVE` o `DRAFT`. |
| RN-CAT-05 | Las categorías nuevas se crean en estado `DRAFT` por defecto. |
| RN-CAT-06 | Una categoría debe tener un precio mínimo (`minPrice`) obligatorio y mayor o igual a 0. |
| RN-CAT-07 | Una categoría debe tener un precio máximo (`maxPrice`) obligatorio y mayor que 0. |
| RN-CAT-08 | El precio máximo de una categoría debe ser mayor o igual que el precio mínimo. |
| RN-CAT-09 | Solo las categorías en estado `ACTIVE` son visibles para los arrendadores al subir artículos. |
| RN-CAT-10 | Cada tipo de objeto debe estar asociado a una categoría concreta. |
| RN-CAT-11 | La categoría asociada a un tipo de objeto puede ser modificada por un administrador. |
| RN-CAT-12 | Cada tipo de objeto hereda el rango de precios (mínimo y máximo) de su categoría. |

### 1.3 Artículos (Objetos en Alquiler)

| ID | Regla de Negocio |
|----|------------------|
| RN-ART-01 | Un artículo es un subtipo de ítem (Item) que representa un objeto físico disponible para alquiler. |
| RN-ART-02 | El título del artículo es obligatorio y no puede estar vacío. |
| RN-ART-03 | La descripción del artículo es obligatoria, no puede estar vacía y tiene un máximo de 1000 caracteres. |
| RN-ART-04 | La ciudad del artículo es obligatoria y no puede estar vacía. Indica la ubicación donde se encuentra el objeto. |
| RN-ART-05 | El precio por mes (`pricePerMonth`) del artículo es obligatorio y debe ser mayor o igual a 0. |
| RN-ART-06 | El precio por mes del artículo debe estar dentro del rango de precios definido por su categoría (`minPrice` ≤ `pricePerMonth` ≤ `maxPrice`). |
| RN-ART-07 | Un artículo debe estar asociado a una categoría válida y existente. |
| RN-ART-08 | Un artículo debe tener un propietario (owner) válido y existente. |
| RN-ART-09 | El número de unidades totales (`totalUnits`) debe ser mayor o igual a 1. Si no se proporciona o es inferior a 1, se normaliza a 1. |
| RN-ART-10 | La fecha de disponibilidad inicial (`availableFrom`) no puede ser anterior a la fecha actual. |
| RN-ART-11 | La fecha de disponibilidad inicial (`availableFrom`) debe ser anterior o igual a la fecha de disponibilidad final (`availableUntil`). |
| RN-ART-12 | Un artículo nuevo se crea en estado `AVAILABLE` por defecto. |
| RN-ART-13 | Los estados posibles de un artículo son: `AVAILABLE`, `RENTED` e `INACTIVE`. |
| RN-ART-14 | Solo el propietario del artículo puede editarlo. |
| RN-ART-15 | Un artículo en estado `RENTED` no puede ser editado. |
| RN-ART-16 | Un artículo en estado `RENTED` no puede ser eliminado. |
| RN-ART-17 | Solo el propietario del artículo puede eliminarlo. |
| RN-ART-18 | El cambio de estado de alquiler de un artículo (`AVAILABLE` ↔ `RENTED`) solo puede realizarse a través de una operación específica (toggle rent), no mediante la actualización genérica. |
| RN-ART-19 | Solo el propietario puede cambiar el estado de alquiler de su artículo. |
| RN-ART-20 | Un artículo en estado `INACTIVE` no puede pasar a estado `RENTED`. |
| RN-ART-21 | El artículo puede tener una imagen asociada. Al eliminar el artículo, la imagen se elimina del servicio de almacenamiento (Cloudinary). |
| RN-ART-22 | El artículo puede tener una fecha de compra (`purchaseDate`) como dato opcional para dar confianza sobre la calidad del objeto. |
| RN-ART-23 | Un artículo puede indicar el estado de conservación del objeto (nuevo, poco usado, etc.) para que el arrendatario sepa qué esperar. |
| RN-ART-24 | La fecha de disponibilidad de un artículo puede ser actualizada por el propietario. |
| RN-ART-25 | Un arrendador puede ver todos los artículos que ha subido en la sección "Mis artículos". |
| RN-ART-26 | Un arrendador puede filtrar sus artículos por estado (disponibles, alquilados) para un control rápido. |
| RN-ART-27 | Cuando un artículo está alquilado, el arrendador debe poder ver la fecha de recuperación (fecha hasta la que estará alquilado). |

### 1.4 Servicios

| ID | Regla de Negocio |
|----|------------------|
| RN-SRV-01 | Un servicio (ServiceItem) es un subtipo de ítem (Item) que representa un servicio ofrecido por un propietario. |
| RN-SRV-02 | Un servicio comparte las mismas reglas de validación base que un ítem: título obligatorio, descripción obligatoria, categoría obligatoria y propietario obligatorio. Además para crear o actualizar un servicio, son obligatorios: Título, Ciudad, Precio Mensual (debe ser positivo) y un rango de fechas (availableFrom / availableUntil).|
| RN-SRV-03 | Los servicios utilizan el enumerado ServiceStatus con tres estados: `DRAFT (Borrador)`, `ACTIVE (Disponible)` y `UNAVAILABLE (Alquilado)`. |
| RN-SRV-04 | Un servicio no puede ser modificado ni eliminado si su estado es UNAVAILABLE (está actualmente alquilado). |
|RN-SRV-05|Si la fecha actual supera a availableUntil, el servicio cambia automáticamente a estado DRAFT (vía proceso programado).|
|RN-SRV-06|Al solicitar un servicio, el estado cambia a UNAVAILABLE. Al liberarlo, vuelve a ACTIVE (o DRAFT si ya expiró por fecha).|
|RN-SRV-07|Solo el propietario autenticado del servicio tiene permisos para realizar operaciones de creación, actualización y eliminación.|

### 1.5 Kits (Proceso de Alquiler)

| ID | Regla de Negocio |
|----|------------------|
| RN-KIT-01 | Un kit es una agrupación de ítems (artículos y/o servicios) que un arrendatario alquila de forma conjunta. |
| RN-KIT-02 | El nombre del kit es obligatorio y debe tener al menos 3 caracteres. |
| RN-KIT-03 | El país del kit es obligatorio. |
| RN-KIT-04 | La ciudad del kit es obligatoria. |
| RN-KIT-05 | La fecha de inicio del alquiler (`startDate`) es obligatoria. |
| RN-KIT-06 | La fecha de fin del alquiler (`endDate`) es obligatoria. |
| RN-KIT-07 | La fecha de fin no puede ser anterior a la fecha de inicio. |
| RN-KIT-08 | La fecha de inicio del alquiler no puede ser anterior a la fecha actual. |
| RN-KIT-09 | Los estados posibles de un kit son: `DRAFT`, `PAID`, `ACTIVE`, `CANCELLED` y `FINISHED`. |
| RN-KIT-10 | Un kit se crea en estado `PAID` por defecto (se crea en el momento del pago). |
| RN-KIT-11 | Un kit debe tener al menos un ítem seleccionado, excepto si está en estado `DRAFT`. |
| RN-KIT-12 | Cada selección de ítem debe incluir un ID de ítem válido y existente. |
| RN-KIT-13 | La cantidad solicitada de cada ítem debe ser al menos 1. |
| RN-KIT-14 | La cantidad solicitada de un ítem no puede superar las unidades totales disponibles (`totalUnits`) de dicho ítem. |
| RN-KIT-15 | Un kit debe estar asociado a un arrendatario (tenant). |
| RN-KIT-16 | Un arrendatario puede tener múltiples kits activos simultáneamente. |
| RN-KIT-17 | El seguimiento de un kit solo puede ser consultado por el arrendatario al que pertenece. |
| RN-KIT-18 | Un kit solo puede pasar a estado `ACTIVE` si su estado actual es `PAID`. |
| RN-KIT-19 | Al confirmar un kit (transición a `ACTIVE`), se envía un email de confirmación al arrendatario. |
| RN-KIT-20 | Un arrendatario puede ver todos sus kits en la sección "Mis Kits". |
| RN-KIT-21 | Un arrendatario puede ver la fecha de devolución de cada kit para no olvidarse. |
| RN-KIT-22 | Un arrendatario puede volver atrás en el proceso de creación del kit para modificar su selección antes de confirmar. |
| RN-KIT-23 | Los productos del catálogo se muestran organizados por categorías al arrendatario durante la creación del kit. |
| RN-KIT-24 | El arrendatario puede seleccionar la ciudad destino para ver los objetos disponibles en esa ubicación. |
| RN-KIT-25 | El arrendatario puede filtrar los productos del catálogo por categoría, ciudad y texto de búsqueda. |
| RN-KIT-26 | Los artículos en estado `INACTIVE` no se muestran en el catálogo durante la creación del kit. |
| RN-KIT-27 | El arrendatario puede ver varias opciones del mismo tipo de objeto para poder comparar entre distintos arrendadores. |
| RN-KIT-28 | El arrendatario puede ver el precio, estado, fotos y descripción de cada artículo antes de seleccionarlo. |
| RN-KIT-29 | El arrendatario puede cambiar un artículo elegido por otro del mismo tipo antes de pagar. |
| RN-KIT-30 | La duración del alquiler se calcula en meses entre la fecha de inicio y la fecha de fin, incluyendo fracciones de mes (cada día equivale a 1/30 de mes). |
| RN-KIT-31 | Un arrendatario no puede seleccionar ítems de su propia propiedad al crear un kit. |

### 1.6 Precios, Comisiones y Garantías

| ID | Regla de Negocio |
|----|------------------|
| RN-PRE-01 | El precio de cada artículo se define como precio por mes (`pricePerMonth`). |
| RN-PRE-02 | El precio total de un ítem en un kit se calcula como: `pricePerMonth × cantidad × duración_en_meses`. |
| RN-PRE-03 | El subtotal de un kit es la suma de los precios totales de todos sus ítems. |
| RN-PRE-04 | Se aplica una garantía (depósito) del 20% sobre el subtotal del kit. |
| RN-PRE-05 | Se aplica una comisión de plataforma del 20% sobre el subtotal del kit. |
| RN-PRE-06 | Si el método de entrega es mensajería (`COURIER`), se aplica una tarifa fija de envío de 9,99 €. |
| RN-PRE-07 | Si el método de entrega es punto de encuentro (`MEETING_POINT`), no se cobra tarifa de envío. |
| RN-PRE-08 | El precio total a pagar por el arrendatario = subtotal + garantía (20%) + comisión (20%) + tarifa de mensajería (si aplica). |
| RN-PRE-09 | El arrendatario debe ver el precio total desglosado (subtotal, garantía, comisión, envío) antes de pagar. |
| RN-PRE-10 | El arrendatario debe ver el precio individual de cada artículo en el kit para decidir si quitar o añadir elementos. |
| RN-PRE-11 | El porcentaje de comisión de la plataforma es configurable por el administrador. |
| RN-PRE-12 | Los precios de artículos se muestran por mes y en euros (EUR). |
| RN-PRE-13 | La garantía del 20% se informa al arrendatario antes del pago, indicando que será devuelta si el objeto se retorna en buen estado. |
| RN-PRE-14 | El arrendador ve el rango de precios mínimo y máximo recomendado según la categoría del objeto al fijar el precio. |

### 1.7 Pagos y Wallet

| ID | Regla de Negocio |
|----|------------------|
| RN-PAG-01 | El pago del kit se realiza desde la aplicación mediante tarjeta de crédito/débito. |
| RN-PAG-02 | El número de tarjeta debe tener exactamente 16 dígitos. |
| RN-PAG-03 | El CVV de la tarjeta debe tener exactamente 3 dígitos. |
| RN-PAG-04 | La fecha de expiración de la tarjeta debe tener formato MM/YY. |
| RN-PAG-05 | Todos los campos de pago (número de tarjeta, CVV, expiración) son obligatorios. |
| RN-PAG-06 | Al crear un kit (pagado), el importe correspondiente a cada ítem se acredita en el monedero (`wallet`) del propietario del artículo. |
| RN-PAG-07 | El arrendador recibe automáticamente el 50% del importe del alquiler cuando el arrendatario paga el kit. |
| RN-PAG-08 | El arrendador recibe el 50% restante cuando el arrendatario confirma que el objeto coincide con la descripción y está en buen estado. |
| RN-PAG-09 | Cada usuario tiene un monedero con un saldo disponible (`availableBalance`) y un saldo pendiente (`pendingBalance`). |
| RN-PAG-10 | La divisa del monedero es EUR. |
| RN-PAG-11 | El arrendador puede retirar el dinero de su monedero a su cuenta bancaria. |
| RN-PAG-12 | Los pagos se procesan a través de Stripe. El monto se envía en céntimos. |
| RN-PAG-13 | El arrendatario recibe automáticamente el reembolso del depósito de garantía cuando el alquiler finaliza y el arrendador confirma la devolución en buen estado, sin necesidad de gestiones adicionales. |

### 1.8 Entregas y Logística

| ID | Regla de Negocio |
|----|------------------|
| RN-ENT-01 | El método de entrega puede ser mensajería (`COURIER`) o punto de encuentro (`MEETING_POINT`). |
| RN-ENT-02 | Si el método es `MEETING_POINT`, es obligatorio indicar el punto de encuentro (no puede estar vacío). |
| RN-ENT-03 | Si el método es `COURIER`, es obligatorio indicar una dirección de entrega. |
| RN-ENT-04 | La tarifa fija de mensajería es de 9,99 € por kit. |
| RN-ENT-05 | Si el método es `MEETING_POINT`, el precio de mensajería es nulo (no se cobra). |
| RN-ENT-06 | La fecha estimada de entrega se calcula como el máximo entre `startDate - 1 día` y `orderDate + 6 días` (margen de preparación de 7 días). |
| RN-ENT-07 | Se genera una notificación de entrega basada en la fecha estimada: "llega hoy", "llegará mañana", "llegará el [fecha]" o "tenía entrega prevista para el [fecha]". |
| RN-ENT-08 | El arrendatario puede saber cuándo recibirá el kit para organizar su llegada a la ciudad. |

### 1.9 Devoluciones

| ID | Regla de Negocio |
|----|------------------|
| RN-DEV-01 | Solo el propietario del artículo puede confirmar la devolución. |
| RN-DEV-02 | Solo se puede procesar la devolución de un artículo que esté en estado `RENTED`. |
| RN-DEV-03 | Debe existir un kit activo asociado al artículo para procesar la devolución. |
| RN-DEV-04 | El importe del depósito de garantía se calcula como el 20% del `pricePerMonth` del artículo. |
| RN-DEV-05 | Si el artículo se devuelve en buen estado (`GOOD`), el depósito se devuelve íntegramente al arrendatario. |
| RN-DEV-06 | Si el artículo se devuelve con daños (`DAMAGED`), el depósito se retiene total o parcialmente. |
| RN-DEV-07 | Tras la devolución, el artículo vuelve a estado `AVAILABLE`. |
| RN-DEV-08 | Tras la devolución, la fecha `availableUntil` del artículo se reinicia (se pone a nulo). |
| RN-DEV-09 | La condición de devolución solo acepta los valores `GOOD` o `DAMAGED`. |
| RN-DEV-10 | El arrendador debe poder indicar si el objeto ha sido devuelto con daños o problemas. |
| RN-DEV-11 | El arrendatario puede reportar un objeto dañado al recibirlo para que no se le culpe por desperfectos previos. |
| RN-DEV-12 | El arrendatario puede confirmar desde la app que el objeto recibido coincide con la descripción, imágenes y estado prometido. |
| RN-DEV-13 | Si el arrendatario indica que el objeto no cumple con lo prometido, se debe revisar el caso antes de liberar el pago completo al arrendador. |

### 1.10 Valoraciones (Ratings)

| ID | Regla de Negocio |
|----|------------------|
| RN-VAL-01 | La puntuación de una valoración debe estar entre 1 y 5 (inclusive). |
| RN-VAL-02 | El comentario de la valoración es opcional y tiene un máximo de 1000 caracteres. |
| RN-VAL-03 | Un usuario no puede valorarse a sí mismo. |
| RN-VAL-04 | Un usuario solo puede valorar a otro usuario una vez por kit. La combinación (reviewer, reviewee, kit) es única. |
| RN-VAL-05 | El tipo de valoración se determina automáticamente: si el que valora es el arrendatario → `RENTER_TO_OWNER`; si es el propietario del artículo → `OWNER_TO_RENTER`. |
| RN-VAL-06 | Solo un participante del kit (arrendatario o propietario de algún ítem) puede crear una valoración para ese kit. |
| RN-VAL-07 | Solo el autor de la valoración o un administrador puede eliminar una valoración. |
| RN-VAL-08 | La fecha y hora de creación de la valoración se registra automáticamente. |
| RN-VAL-09 | Las valoraciones recibidas por un usuario son consultables por cualquier usuario para conocer la reputación del arrendador o arrendatario. |

### 1.11 Incidencias y Soporte

| ID | Regla de Negocio |
|----|------------------|
| RN-INC-01 | Una incidencia debe tener un título obligatorio y no vacío. |
| RN-INC-02 | Una incidencia debe tener una descripción obligatoria, no vacía, con un máximo de 1000 caracteres. |
| RN-INC-03 | Los tipos de incidencia son: `GENERAL` (consulta o problema general) y `DAMAGED_ITEM` (objeto dañado reportado por el arrendatario). |
| RN-INC-04 | Los estados de una incidencia son: `OPEN`, `IN_PROGRESS` y `RESOLVED`. |
| RN-INC-05 | Una incidencia nueva se crea en estado `OPEN` por defecto. |
| RN-INC-06 | Una incidencia debe estar asociada a un usuario (el que la crea). |
| RN-INC-07 | Una incidencia puede estar opcionalmente asociada a un ítem relacionado. |
| RN-INC-08 | Una incidencia en estado `RESOLVED` no puede ser eliminada. |
| RN-INC-09 | No se pueden añadir comentarios a una incidencia en estado `RESOLVED`. |
| RN-INC-10 | Los comentarios de incidencia tienen un máximo de 2000 caracteres. |
| RN-INC-11 | La fecha y hora de creación de cada comentario se registra automáticamente. |
| RN-INC-12 | Un usuario puede ver las incidencias que ha creado. |
| RN-INC-13 | Un propietario puede ver las incidencias recibidas sobre sus artículos. |
| RN-INC-14 | El administrador puede mediar en caso de conflicto entre arrendador y arrendatario para decidir entre devolución, compensación o alternativa. |

### 1.12 Notificaciones

| ID | Regla de Negocio |
|----|------------------|
| RN-NOT-01 | Se envía un email de confirmación al arrendatario cuando un kit pasa a estado `ACTIVE`. |
| RN-NOT-02 | El arrendatario recibe una notificación antes de la fecha de devolución del kit: 10 días antes si el alquiler es de un mes o más; si el periodo es menor, cuando falte un cuarto del tiempo total. |
| RN-NOT-03 | El arrendatario recibe una notificación antes de la entrega del kit, basada en la fecha estimada de entrega. |
| RN-NOT-04 | El arrendatario recibe recordatorios de devolución para evitar penalizaciones. |
| RN-NOT-05 | El arrendador recibe una notificación cuando alguien alquila uno de sus objetos. |
| RN-NOT-06 | El arrendador recibe una notificación cuando su objeto está a punto de ser devuelto. |
| RN-NOT-07 | El arrendador recibe notificaciones sobre los objetos más demandados para adaptarse a la demanda. |
| RN-NOT-08 | El arrendador recibe notificaciones cuando la gente solicita objetos que no están disponibles. |
| RN-NOT-09 | El arrendador recibe una notificación cuando el arrendatario valida el estado del objeto, indicando que se liberará el segundo pago. |
| RN-NOT-10 | El arrendatario recibe una notificación cuando se procesa la devolución de su depósito de garantía. |
| RN-NOT-11 | El arrendatario puede marcar "Avisarme cuando esté disponible" en un objeto que no esté disponible, para recibir notificación cuando alguien lo suba. |

### 1.13 Administración de la Plataforma

| ID | Regla de Negocio |
|----|------------------|
| RN-ADM-01 | El administrador se registra con un rol diferenciado (`ADMIN`) para gestionar la plataforma. |
| RN-ADM-02 | Se crea un administrador por defecto al iniciar la aplicación si no existe uno. |
| RN-ADM-03 | El administrador puede crear, editar y eliminar cuentas de usuario. |
| RN-ADM-04 | Al crear un usuario desde el panel de administración, el administrador puede asignar cualquier rol (`USER` o `ADMIN`). |
| RN-ADM-05 | El administrador puede crear, editar y eliminar categorías de objetos. |
| RN-ADM-06 | El administrador puede crear, editar y eliminar tipos de objetos. |
| RN-ADM-07 | El administrador puede asociar cada tipo de objeto a una categoría concreta. |
| RN-ADM-08 | El administrador puede modificar la categoría asociada a un tipo de objeto. |
| RN-ADM-09 | El administrador puede establecer un rango de precios (mínimo y máximo) para cada tipo de objeto/categoría. |
| RN-ADM-10 | El administrador puede editar el rango de precios de un tipo de objeto para ajustarlo según cambios del mercado. |
| RN-ADM-11 | El administrador puede configurar el porcentaje de comisión que la plataforma cobra por cada alquiler. |
| RN-ADM-12 | El administrador puede mediar en conflictos entre arrendador y arrendatario. |
| RN-ADM-13 | El administrador puede acceder a una ventana de estadísticas con información relevante sobre los alquileres. |
| RN-ADM-14 | Al crear un usuario desde administración, se requiere email, contraseña, nombre, rol, teléfono, dirección y ciudad. |
| RN-ADM-15 | El email del usuario creado desde administración debe ser único. |

### 1.14 Seguridad y Sesión

| ID | Regla de Negocio |
|----|------------------|
| RN-SEG-01 | La autenticación se realiza mediante tokens JWT. |
| RN-SEG-02 | El token JWT se genera al registrarse o iniciar sesión, incluyendo el email y el rol del usuario. |
| RN-SEG-03 | El token JWT tiene una expiración de 24 horas (86.400.000 ms). |
| RN-SEG-04 | Al cerrar sesión (logout), el token se invalida añadiéndolo a una lista negra (blacklist). |
| RN-SEG-05 | Los endpoints de registro y login son públicos. El resto de endpoints requieren autenticación. |
| RN-SEG-06 | Las contraseñas se codifican con BCrypt antes de almacenarse. |
| RN-SEG-07 | Un token inválido o expirado rechaza el acceso a los endpoints protegidos. |

---

## 2. Reglas de Negocio por Historia de Usuario / Caso de Uso

### 2.1 Historias de Arrendador

#### HU-ARRENDADOR-01 — Alquilar objetos que poseo para obtener ganancias

| Reglas de Negocio aplicables |
|------------------------------|
| RN-USR-10, RN-USR-11, RN-USR-15 |
| RN-ART-01, RN-ART-08, RN-ART-12, RN-ART-13 |
| RN-PAG-06, RN-PAG-07, RN-PAG-08 |

#### HU-ARRENDADOR-02 — Gestión sencilla de envíos

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ENT-01, RN-ENT-02, RN-ENT-03, RN-ENT-04, RN-ENT-05 |
| RN-ENT-06, RN-ENT-07, RN-ENT-08 |

#### HU-ARRENDADOR-03 — Valor de alquiler acorde a la calidad

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ART-05, RN-ART-06 |
| RN-CAT-06, RN-CAT-07, RN-CAT-08, RN-CAT-12 |
| RN-PRE-01, RN-PRE-14 |

#### HU-ARRENDADOR-04 — Ver objetos en alquiler y disponibles

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ART-13, RN-ART-25, RN-ART-26, RN-ART-27 |

#### HU-ARRENDADOR-05 — Recibir avisos de objetos más demandados

| Reglas de Negocio aplicables |
|------------------------------|
| RN-NOT-07 |

#### HU-ARRENDADOR-06 — Retirar dinero a cuenta bancaria

| Reglas de Negocio aplicables |
|------------------------------|
| RN-PAG-09, RN-PAG-10, RN-PAG-11 |
| RN-USR-12 |

#### HU-ARRENDADOR-07 — Modificar un objeto subido

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ART-02, RN-ART-03, RN-ART-04, RN-ART-05, RN-ART-06, RN-ART-07 |
| RN-ART-09, RN-ART-10, RN-ART-11, RN-ART-14, RN-ART-15, RN-ART-18 |
| RN-CAT-06, RN-CAT-07, RN-CAT-08 |

#### HU-ARRENDADOR-08 — Borrar un objeto

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ART-16, RN-ART-17, RN-ART-21 |

#### HU-ARRENDADOR-09 — Registrarse como proveedor de objetos

| Reglas de Negocio aplicables |
|------------------------------|
| RN-USR-01, RN-USR-02, RN-USR-03, RN-USR-04, RN-USR-05 |
| RN-USR-06, RN-USR-07, RN-USR-08, RN-USR-09, RN-USR-10 |
| RN-USR-12, RN-USR-15 |
| RN-SEG-01, RN-SEG-02, RN-SEG-06 |

#### HU-ARRENDADOR-10 — Indicar la ciudad de mis objetos

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ART-04 |

#### HU-ARRENDADOR-11 — Pulsar "Subir artículo"

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ART-01, RN-ART-02, RN-ART-03, RN-ART-04, RN-ART-05, RN-ART-06 |
| RN-ART-07, RN-ART-08, RN-ART-09, RN-ART-10, RN-ART-11, RN-ART-12 |
| RN-CAT-09 |

#### HU-ARRENDADOR-12 — Seleccionar la categoría del objeto

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ART-07, RN-CAT-09, RN-CAT-10, RN-CAT-12 |

#### HU-ARRENDADOR-13 — Subir fotos del objeto

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ART-21 |

#### HU-ARRENDADOR-14 — Añadir una descripción

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ART-03 |

#### HU-ARRENDADOR-15 — Indicar la fecha de compra

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ART-22 |

#### HU-ARRENDADOR-16 — Indicar el estado del objeto

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ART-13, RN-ART-23 |

#### HU-ARRENDADOR-17 — Indicar desde/hasta cuándo está disponible

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ART-10, RN-ART-11, RN-ART-24 |

#### HU-ARRENDADOR-18 — Actualizar disponibilidad

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ART-10, RN-ART-11, RN-ART-14, RN-ART-24 |

#### HU-ARRENDADOR-19 — Ver todos los objetos en "Mis artículos"

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ART-25 |

#### HU-ARRENDADOR-20 — Filtrar objetos alquilados

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ART-13, RN-ART-26 |

#### HU-ARRENDADOR-21 — Ver la fecha de recuperación del objeto

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ART-27 |

#### HU-ARRENDADOR-22 — Notificaciones de objetos no disponibles solicitados

| Reglas de Negocio aplicables |
|------------------------------|
| RN-NOT-08 |

#### HU-ARRENDADOR-23 — Ver productos con más demanda

| Reglas de Negocio aplicables |
|------------------------------|
| RN-NOT-07  |
| RN-ADM-13 |

#### HU-ARRENDADOR-24 — Aviso cuando alquilan mi objeto

| Reglas de Negocio aplicables |
|------------------------------|
| RN-NOT-05 |

#### HU-ARRENDADOR-25 — Aviso cuando mi objeto esté a punto de volver

| Reglas de Negocio aplicables |
|------------------------------|
| RN-NOT-06 |

#### HU-ARRENDADOR-26 — Asignar un precio de alquiler

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ART-05, RN-ART-06 |
| RN-PRE-01, RN-PRE-14 |
| RN-CAT-06, RN-CAT-07, RN-CAT-08, RN-CAT-12 |

#### HU-ARRENDADOR-27 — Rango de precios permitido por tipo de objeto

| Reglas de Negocio aplicables |
|------------------------------|
| RN-CAT-06, RN-CAT-07, RN-CAT-08, RN-CAT-12 |
| RN-ART-06, RN-PRE-14 |

#### HU-ARRENDADOR-28 — Ver precio mínimo y máximo recomendado

| Reglas de Negocio aplicables |
|------------------------------|
| RN-CAT-06, RN-CAT-07, RN-CAT-08 |
| RN-PRE-14 |

#### HU-ARRENDADOR-29 — Valorar al arrendatario

| Reglas de Negocio aplicables |
|------------------------------|
| RN-VAL-01, RN-VAL-02, RN-VAL-03, RN-VAL-04 |
| RN-VAL-05, RN-VAL-06, RN-VAL-08 |

#### HU-ARRENDADOR-30 — Recibir el 50% al pagar el kit

| Reglas de Negocio aplicables |
|------------------------------|
| RN-PAG-06, RN-PAG-07, RN-PAG-09 |

#### HU-ARRENDADOR-31 — Recibir el 50% restante al validar estado

| Reglas de Negocio aplicables |
|------------------------------|
| RN-PAG-08, RN-PAG-09 |
| RN-DEV-12, RN-DEV-13 |

#### HU-ARRENDADOR-32 — Notificación al validar el estado del objeto

| Reglas de Negocio aplicables |
|------------------------------|
| RN-NOT-09 |
| RN-PAG-08 |

#### HU-ARRENDADOR-33 — Confirmar recepción del objeto devuelto

| Reglas de Negocio aplicables |
|------------------------------|
| RN-DEV-01, RN-DEV-02, RN-DEV-03, RN-DEV-05, RN-DEV-07, RN-DEV-08, RN-DEV-09 |
| RN-PAG-13 |

#### HU-ARRENDADOR-34 — Indicar daños en la devolución

| Reglas de Negocio aplicables |
|------------------------------|
| RN-DEV-01, RN-DEV-02, RN-DEV-06, RN-DEV-09, RN-DEV-10 |

#### HU-ARRENDADOR-35 — Editar datos de perfil

| Reglas de Negocio aplicables |
|------------------------------|
| RN-USR-04, RN-USR-05, RN-USR-06, RN-USR-07, RN-USR-08, RN-USR-13 |

### 2.2 Historias de Arrendatario

#### HU-ARRENDATARIO-01 — Registrarse en la app

| Reglas de Negocio aplicables |
|------------------------------|
| RN-USR-01, RN-USR-02, RN-USR-03, RN-USR-04, RN-USR-05 |
| RN-USR-06, RN-USR-07, RN-USR-08, RN-USR-09, RN-USR-10 |
| RN-USR-12, RN-USR-15 |
| RN-SEG-01, RN-SEG-02, RN-SEG-06 |

#### HU-ARRENDATARIO-02 — Iniciar sesión fácilmente

| Reglas de Negocio aplicables |
|------------------------------|
| RN-USR-01, RN-USR-02, RN-USR-09 |
| RN-SEG-01, RN-SEG-02, RN-SEG-03, RN-SEG-07 |

#### HU-ARRENDATARIO-03 — Indicar datos básicos

| Reglas de Negocio aplicables |
|------------------------------|
| RN-USR-04, RN-USR-05, RN-USR-06, RN-USR-07, RN-USR-08 |

#### HU-ARRENDATARIO-04 — Armar kit personalizado

| Reglas de Negocio aplicables |
|------------------------------|
| RN-KIT-01, RN-KIT-02, RN-KIT-03, RN-KIT-04, RN-KIT-05 |
| RN-KIT-06, RN-KIT-07, RN-KIT-08, RN-KIT-11, RN-KIT-15 |
| RN-KIT-22, RN-KIT-23, RN-KIT-24, RN-KIT-25 |

#### HU-ARRENDATARIO-05 — Seleccionar ciudad destino

| Reglas de Negocio aplicables |
|------------------------------|
| RN-KIT-03, RN-KIT-04, RN-KIT-24, RN-KIT-25 |

#### HU-ARRENDATARIO-06 — Ver productos organizados por categorías

| Reglas de Negocio aplicables |
|------------------------------|
| RN-KIT-23, RN-KIT-25, RN-KIT-26 |
| RN-CAT-04, RN-CAT-09 |

#### HU-ARRENDATARIO-07 — Añadir un objeto al kit

| Reglas de Negocio aplicables |
|------------------------------|
| RN-KIT-11, RN-KIT-12, RN-KIT-13, RN-KIT-14, RN-KIT-26 |
| RN-ART-13 |

#### HU-ARRENDATARIO-08 — Seleccionar varias unidades de un producto

| Reglas de Negocio aplicables |
|------------------------------|
| RN-KIT-13, RN-KIT-14 |
| RN-ART-09 |

#### HU-ARRENDATARIO-09 — Eliminar objetos del kit

| Reglas de Negocio aplicables |
|------------------------------|
| RN-KIT-11, RN-KIT-22 |

#### HU-ARRENDATARIO-10 — Marcar "Avisarme cuando esté disponible"

| Reglas de Negocio aplicables |
|------------------------------|
| RN-NOT-11 |

#### HU-ARRENDATARIO-11 — Ampliar búsqueda a otras ciudades

| Reglas de Negocio aplicables |
|------------------------------|
| RN-KIT-24, RN-KIT-25 |
| RN-ENT-04 |

#### HU-ARRENDATARIO-12 — Indicar fecha de inicio del alquiler

| Reglas de Negocio aplicables |
|------------------------------|
| RN-KIT-05, RN-KIT-07, RN-KIT-08 |

#### HU-ARRENDATARIO-13 — Indicar fecha de fin

| Reglas de Negocio aplicables |
|------------------------------|
| RN-KIT-06, RN-KIT-07 |
| RN-KIT-30 |

#### HU-ARRENDATARIO-14 — Ver precio total según duración

| Reglas de Negocio aplicables |
|------------------------------|
| RN-PRE-01, RN-PRE-02, RN-PRE-03, RN-PRE-04, RN-PRE-05 |
| RN-PRE-06, RN-PRE-07, RN-PRE-08, RN-PRE-09 |
| RN-KIT-30 |

#### HU-ARRENDATARIO-15 — Ver precio por objeto individual

| Reglas de Negocio aplicables |
|------------------------------|
| RN-PRE-01, RN-PRE-02, RN-PRE-10 |

#### HU-ARRENDATARIO-16 — Volver atrás en el proceso

| Reglas de Negocio aplicables |
|------------------------------|
| RN-KIT-22 |

#### HU-ARRENDATARIO-17 — Pagar el kit desde la app

| Reglas de Negocio aplicables |
|------------------------------|
| RN-PAG-01, RN-PAG-02, RN-PAG-03, RN-PAG-04, RN-PAG-05 |
| RN-PAG-06, RN-PAG-12 |
| RN-KIT-10 |
| RN-PRE-08, RN-PRE-09 |

#### HU-ARRENDATARIO-18 — Recibir confirmación del pedido

| Reglas de Negocio aplicables |
|------------------------------|
| RN-NOT-01, RN-KIT-19 |

#### HU-ARRENDATARIO-19 — Saber cuándo recibiré el kit

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ENT-06, RN-ENT-07, RN-ENT-08 |

#### HU-ARRENDATARIO-20 — Elegir método de entrega

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ENT-01, RN-ENT-02, RN-ENT-03, RN-ENT-04, RN-ENT-05 |

#### HU-ARRENDATARIO-21 — Apartado "Mis kits"

| Reglas de Negocio aplicables |
|------------------------------|
| RN-KIT-16, RN-KIT-17, RN-KIT-20 |

#### HU-ARRENDATARIO-22 — Ver fecha de devolución de cada kit

| Reglas de Negocio aplicables |
|------------------------------|
| RN-KIT-21 |

#### HU-ARRENDATARIO-23 — Notificación antes de la fecha de devolución

| Reglas de Negocio aplicables |
|------------------------------|
| RN-NOT-02 |

#### HU-ARRENDATARIO-24 — Notificación antes de la entrega

| Reglas de Negocio aplicables |
|------------------------------|
| RN-NOT-03, RN-ENT-07 |

#### HU-ARRENDATARIO-25 — Recordatorios de devolución

| Reglas de Negocio aplicables |
|------------------------------|
| RN-NOT-04 |

#### HU-ARRENDATARIO-26 — Ver artículos disponibles por categoría en mi ciudad

| Reglas de Negocio aplicables |
|------------------------------|
| RN-KIT-23, RN-KIT-24, RN-KIT-25, RN-KIT-26 |
| RN-CAT-04, RN-CAT-09 |
| RN-ART-04, RN-ART-13 |

#### HU-ARRENDATARIO-27 — Ver varias opciones del mismo tipo

| Reglas de Negocio aplicables |
|------------------------------|
| RN-KIT-27 |

#### HU-ARRENDATARIO-28 — Ver precio de cada artículo disponible

| Reglas de Negocio aplicables |
|------------------------------|
| RN-PRE-01, RN-PRE-10 |
| RN-KIT-28 |

#### HU-ARRENDATARIO-29 — Ver estado/calidad del objeto

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ART-13, RN-ART-23 |
| RN-KIT-28 |

#### HU-ARRENDATARIO-30 — Ver fotos y descripción antes de seleccionar

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ART-03, RN-ART-21 |
| RN-KIT-28 |

#### HU-ARRENDATARIO-31 — Seleccionar un artículo concreto

| Reglas de Negocio aplicables |
|------------------------------|
| RN-KIT-12, RN-KIT-13, RN-KIT-14 |
| RN-KIT-27 |

#### HU-ARRENDATARIO-32 — Cambiar artículo elegido por otro del mismo tipo

| Reglas de Negocio aplicables |
|------------------------------|
| RN-KIT-22, RN-KIT-29 |

#### HU-ARRENDATARIO-33 — Reportar objeto dañado al recibirlo

| Reglas de Negocio aplicables |
|------------------------------|
| RN-DEV-11 |
| RN-INC-01, RN-INC-02, RN-INC-03, RN-INC-05, RN-INC-06, RN-INC-07 |

#### HU-ARRENDATARIO-34 — Valorar y dejar comentario

| Reglas de Negocio aplicables |
|------------------------------|
| RN-VAL-01, RN-VAL-02, RN-VAL-03, RN-VAL-04 |
| RN-VAL-05, RN-VAL-06, RN-VAL-08, RN-VAL-09 |

#### HU-ARRENDATARIO-35 — Depósito de garantía del 20%

| Reglas de Negocio aplicables |
|------------------------------|
| RN-PRE-04, RN-PRE-08, RN-PRE-09, RN-PRE-13 |

#### HU-ARRENDATARIO-36 — Ver importe de la garantía antes de pagar

| Reglas de Negocio aplicables |
|------------------------------|
| RN-PRE-04, RN-PRE-09, RN-PRE-13 |

#### HU-ARRENDATARIO-37 — Garantía devuelta si todo está en buen estado

| Reglas de Negocio aplicables |
|------------------------------|
| RN-PRE-04, RN-PRE-13 |
| RN-DEV-04, RN-DEV-05 |
| RN-PAG-13 |

#### HU-ARRENDATARIO-38 — Confirmar que el objeto recibido coincide

| Reglas de Negocio aplicables |
|------------------------------|
| RN-DEV-12 |
| RN-PAG-08 |
| RN-KIT-18 |

#### HU-ARRENDATARIO-39 — Indicar que el objeto no cumple lo prometido

| Reglas de Negocio aplicables |
|------------------------------|
| RN-DEV-13 |
| RN-INC-01, RN-INC-02, RN-INC-03, RN-INC-06 |
| RN-PAG-08 |

#### HU-ARRENDATARIO-40 — Reembolso automático del depósito

| Reglas de Negocio aplicables |
|------------------------------|
| RN-PAG-13 |
| RN-DEV-04, RN-DEV-05, RN-DEV-07 |

#### HU-ARRENDATARIO-41 — Notificación de devolución del depósito

| Reglas de Negocio aplicables |
|------------------------------|
| RN-NOT-10 |

#### HU-ARRENDATARIO-42 — Editar datos básicos

| Reglas de Negocio aplicables |
|------------------------------|
| RN-USR-04, RN-USR-05, RN-USR-06, RN-USR-07, RN-USR-08, RN-USR-13 |

### 2.3 Historias de Administrador

#### HU-ADMIN-01 — Crear nuevas categorías

| Reglas de Negocio aplicables |
|------------------------------|
| RN-CAT-01, RN-CAT-02, RN-CAT-03, RN-CAT-04, RN-CAT-05 |
| RN-CAT-06, RN-CAT-07, RN-CAT-08 |
| RN-ADM-05 |

#### HU-ADMIN-02 — Editar categorías existentes

| Reglas de Negocio aplicables |
|------------------------------|
| RN-CAT-01, RN-CAT-02, RN-CAT-03, RN-CAT-04 |
| RN-CAT-06, RN-CAT-07, RN-CAT-08 |
| RN-ADM-05 |

#### HU-ADMIN-03 — Eliminar categorías

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ADM-05 |

#### HU-ADMIN-04 — Crear nuevos tipos de objetos

| Reglas de Negocio aplicables |
|------------------------------|
| RN-CAT-10, RN-CAT-12 |
| RN-ADM-06 |

#### HU-ADMIN-05 — Editar tipos de objetos existentes

| Reglas de Negocio aplicables |
|------------------------------|
| RN-CAT-10, RN-CAT-12 |
| RN-ADM-06 |

#### HU-ADMIN-06 — Eliminar tipos de objetos

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ADM-06 |

#### HU-ADMIN-07 — Asociar tipo de objeto a categoría

| Reglas de Negocio aplicables |
|------------------------------|
| RN-CAT-10 |
| RN-ADM-07 |

#### HU-ADMIN-08 — Modificar categoría de un tipo de objeto

| Reglas de Negocio aplicables |
|------------------------------|
| RN-CAT-11 |
| RN-ADM-08 |

#### HU-ADMIN-09 — Rango de precios por tipo de objeto

| Reglas de Negocio aplicables |
|------------------------------|
| RN-CAT-06, RN-CAT-07, RN-CAT-08, RN-CAT-12 |
| RN-ADM-09 |

#### HU-ADMIN-10 — Editar rango de precios

| Reglas de Negocio aplicables |
|------------------------------|
| RN-CAT-06, RN-CAT-07, RN-CAT-08 |
| RN-ADM-10 |

#### HU-ADMIN-11 — Mediar en conflictos

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ADM-12 |
| RN-INC-04, RN-INC-14 |
| RN-DEV-06, RN-DEV-13 |

#### HU-ADMIN-12 — Configurar porcentaje de comisión

| Reglas de Negocio aplicables |
|------------------------------|
| RN-PRE-05 |
| RN-ADM-11 |

#### HU-ADMIN-13 — Registrarse con rol diferenciado

| Reglas de Negocio aplicables |
|------------------------------|
| RN-USR-11 |
| RN-ADM-01, RN-ADM-02 |
| RN-SEG-01, RN-SEG-02 |

#### HU-ADMIN-14 — Crear, editar y eliminar cuentas

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ADM-03, RN-ADM-04, RN-ADM-14, RN-ADM-15 |
| RN-USR-01, RN-USR-02, RN-USR-03, RN-USR-09, RN-USR-11 |

#### HU-ADMIN-15 — Ventana de estadísticas

| Reglas de Negocio aplicables |
|------------------------------|
| RN-ADM-13 |

### 2.4 Historias Generales

#### HU-GENERAL-01 — Enviar incidencias desde un formulario

| Reglas de Negocio aplicables |
|------------------------------|
| RN-INC-01, RN-INC-02, RN-INC-03, RN-INC-04, RN-INC-05 |
| RN-INC-06, RN-INC-07, RN-INC-08, RN-INC-09, RN-INC-10 |
| RN-INC-11, RN-INC-12, RN-INC-13 |

---

## 3. Matriz de Trazabilidad

La siguiente matriz relaciona cada Regla de Negocio con las Historias de Usuario donde aplica.

| Regla de Negocio | Historias de Usuario relacionadas |
|---|---|
| RN-USR-01 | HU-ARRENDADOR-09, HU-ARRENDATARIO-01, HU-ARRENDATARIO-02, HU-ADMIN-14 |
| RN-USR-02 | HU-ARRENDADOR-09, HU-ARRENDATARIO-01, HU-ARRENDATARIO-02, HU-ADMIN-14 |
| RN-USR-03 | HU-ARRENDADOR-09, HU-ARRENDATARIO-01, HU-ADMIN-14 |
| RN-USR-04 | HU-ARRENDADOR-09, HU-ARRENDADOR-35, HU-ARRENDATARIO-01, HU-ARRENDATARIO-03, HU-ARRENDATARIO-42 |
| RN-USR-05 | HU-ARRENDADOR-09, HU-ARRENDADOR-35, HU-ARRENDATARIO-01, HU-ARRENDATARIO-03, HU-ARRENDATARIO-42 |
| RN-USR-06 | HU-ARRENDADOR-09, HU-ARRENDADOR-35, HU-ARRENDATARIO-01, HU-ARRENDATARIO-03, HU-ARRENDATARIO-42 |
| RN-USR-07 | HU-ARRENDADOR-09, HU-ARRENDADOR-35, HU-ARRENDATARIO-01, HU-ARRENDATARIO-03, HU-ARRENDATARIO-42 |
| RN-USR-08 | HU-ARRENDADOR-09, HU-ARRENDADOR-35, HU-ARRENDATARIO-01, HU-ARRENDATARIO-03, HU-ARRENDATARIO-42 |
| RN-USR-09 | HU-ARRENDADOR-09, HU-ARRENDATARIO-01, HU-ARRENDATARIO-02, HU-ADMIN-14 |
| RN-USR-10 | HU-ARRENDADOR-01, HU-ARRENDADOR-09, HU-ARRENDATARIO-01 |
| RN-USR-11 | HU-ARRENDADOR-01, HU-ARRENDADOR-09, HU-ADMIN-13, HU-ADMIN-14 |
| RN-USR-12 | HU-ARRENDADOR-06, HU-ARRENDADOR-09, HU-ARRENDATARIO-01 |
| RN-USR-13 | HU-ARRENDADOR-35, HU-ARRENDATARIO-42 |
| RN-USR-14 | HU-ADMIN-14 |
| RN-USR-15 | HU-ARRENDADOR-01, HU-ARRENDADOR-09, HU-ARRENDATARIO-01 |
| RN-CAT-01 | HU-ADMIN-01, HU-ADMIN-02 |
| RN-CAT-02 | HU-ADMIN-01, HU-ADMIN-02 |
| RN-CAT-03 | HU-ADMIN-01, HU-ADMIN-02 |
| RN-CAT-04 | HU-ADMIN-01, HU-ADMIN-02, HU-ARRENDATARIO-06, HU-ARRENDATARIO-26 |
| RN-CAT-05 | HU-ADMIN-01 |
| RN-CAT-06 | HU-ARRENDADOR-03, HU-ARRENDADOR-07, HU-ARRENDADOR-26, HU-ARRENDADOR-27, HU-ARRENDADOR-28, HU-ADMIN-01, HU-ADMIN-02, HU-ADMIN-09, HU-ADMIN-10 |
| RN-CAT-07 | HU-ARRENDADOR-03, HU-ARRENDADOR-07, HU-ARRENDADOR-26, HU-ARRENDADOR-27, HU-ARRENDADOR-28, HU-ADMIN-01, HU-ADMIN-02, HU-ADMIN-09, HU-ADMIN-10 |
| RN-CAT-08 | HU-ARRENDADOR-03, HU-ARRENDADOR-07, HU-ARRENDADOR-26, HU-ARRENDADOR-27, HU-ARRENDADOR-28, HU-ADMIN-01, HU-ADMIN-02, HU-ADMIN-09, HU-ADMIN-10 |
| RN-CAT-09 | HU-ARRENDADOR-11, HU-ARRENDADOR-12, HU-ARRENDATARIO-06, HU-ARRENDATARIO-26 |
| RN-CAT-10 | HU-ARRENDADOR-12, HU-ADMIN-04, HU-ADMIN-05, HU-ADMIN-07 |
| RN-CAT-11 | HU-ADMIN-08 |
| RN-CAT-12 | HU-ARRENDADOR-03, HU-ARRENDADOR-12, HU-ARRENDADOR-26, HU-ARRENDADOR-27, HU-ADMIN-04, HU-ADMIN-05, HU-ADMIN-09 |
| RN-ART-01 | HU-ARRENDADOR-01, HU-ARRENDADOR-11 |
| RN-ART-02 | HU-ARRENDADOR-07, HU-ARRENDADOR-11 |
| RN-ART-03 | HU-ARRENDADOR-07, HU-ARRENDADOR-11, HU-ARRENDADOR-14, HU-ARRENDATARIO-30 |
| RN-ART-04 | HU-ARRENDADOR-07, HU-ARRENDADOR-10, HU-ARRENDADOR-11, HU-ARRENDATARIO-26 |
| RN-ART-05 | HU-ARRENDADOR-03, HU-ARRENDADOR-07, HU-ARRENDADOR-11, HU-ARRENDADOR-26 |
| RN-ART-06 | HU-ARRENDADOR-03, HU-ARRENDADOR-07, HU-ARRENDADOR-11, HU-ARRENDADOR-26, HU-ARRENDADOR-27 |
| RN-ART-07 | HU-ARRENDADOR-07, HU-ARRENDADOR-11, HU-ARRENDADOR-12 |
| RN-ART-08 | HU-ARRENDADOR-01, HU-ARRENDADOR-11 |
| RN-ART-09 | HU-ARRENDADOR-07, HU-ARRENDADOR-11, HU-ARRENDATARIO-08 |
| RN-ART-10 | HU-ARRENDADOR-07, HU-ARRENDADOR-11, HU-ARRENDADOR-17, HU-ARRENDADOR-18 |
| RN-ART-11 | HU-ARRENDADOR-07, HU-ARRENDADOR-11, HU-ARRENDADOR-17, HU-ARRENDADOR-18 |
| RN-ART-12 | HU-ARRENDADOR-01, HU-ARRENDADOR-11 |
| RN-ART-13 | HU-ARRENDADOR-01, HU-ARRENDADOR-04, HU-ARRENDADOR-16, HU-ARRENDADOR-20, HU-ARRENDATARIO-07, HU-ARRENDATARIO-26, HU-ARRENDATARIO-29 |
| RN-ART-14 | HU-ARRENDADOR-07, HU-ARRENDADOR-18 |
| RN-ART-15 | HU-ARRENDADOR-07 |
| RN-ART-16 | HU-ARRENDADOR-08 |
| RN-ART-17 | HU-ARRENDADOR-08 |
| RN-ART-18 | HU-ARRENDADOR-07 |
| RN-ART-19 | HU-ARRENDADOR-07 |
| RN-ART-20 | HU-ARRENDADOR-07 |
| RN-ART-21 | HU-ARRENDADOR-08, HU-ARRENDADOR-13, HU-ARRENDATARIO-30 |
| RN-ART-22 | HU-ARRENDADOR-15 |
| RN-ART-23 | HU-ARRENDADOR-16, HU-ARRENDATARIO-29 |
| RN-ART-24 | HU-ARRENDADOR-17, HU-ARRENDADOR-18 |
| RN-ART-25 | HU-ARRENDADOR-04, HU-ARRENDADOR-19 |
| RN-ART-26 | HU-ARRENDADOR-04, HU-ARRENDADOR-20 |
| RN-ART-27 | HU-ARRENDADOR-04, HU-ARRENDADOR-21 |
| RN-SRV-01 | HU-ARRENDADOR-01, HU-ARRENDADOR-11 |
| RN-SRV-02 | HU-ARRENDADOR-11, HU-ARRENDADOR-17 |
| RN-SRV-03 | HU-ARRENDADOR-20, HU-ARRENDATARIO-06, HU-ARRENDATARIO-26 |
| RN-SRV-04 | HU-ARRENDADOR-07, HU-ARRENDADOR-08 |
| RN-SRV-05 | HU-ARRENDADOR-18, HU-ARRENDADOR-19|
| RN-SRV-06	| HU-ARRENDATARIO-07, HU-ARRENDATARIO-17, HU-ARRENDATARIO-31 |
| RN-SRV-07	| HU-ARRENDADOR-07, HU-ARRENDADOR-08, HU-ARRENDADOR-11|
| RN-KIT-01 | HU-ARRENDATARIO-04 |
| RN-KIT-02 | HU-ARRENDATARIO-04 |
| RN-KIT-03 | HU-ARRENDATARIO-04, HU-ARRENDATARIO-05 |
| RN-KIT-04 | HU-ARRENDATARIO-04, HU-ARRENDATARIO-05 |
| RN-KIT-05 | HU-ARRENDATARIO-04, HU-ARRENDATARIO-12 |
| RN-KIT-06 | HU-ARRENDATARIO-04, HU-ARRENDATARIO-13 |
| RN-KIT-07 | HU-ARRENDATARIO-04, HU-ARRENDATARIO-12, HU-ARRENDATARIO-13 |
| RN-KIT-08 | HU-ARRENDATARIO-04, HU-ARRENDATARIO-12 |
| RN-KIT-09 | HU-ARRENDATARIO-04 |
| RN-KIT-10 | HU-ARRENDATARIO-17 |
| RN-KIT-11 | HU-ARRENDATARIO-04, HU-ARRENDATARIO-07, HU-ARRENDATARIO-09 |
| RN-KIT-12 | HU-ARRENDATARIO-07, HU-ARRENDATARIO-31 |
| RN-KIT-13 | HU-ARRENDATARIO-07, HU-ARRENDATARIO-08, HU-ARRENDATARIO-31 |
| RN-KIT-14 | HU-ARRENDATARIO-07, HU-ARRENDATARIO-08, HU-ARRENDATARIO-31 |
| RN-KIT-15 | HU-ARRENDATARIO-04 |
| RN-KIT-16 | HU-ARRENDATARIO-21 |
| RN-KIT-17 | HU-ARRENDATARIO-21 |
| RN-KIT-18 | HU-ARRENDATARIO-38 |
| RN-KIT-19 | HU-ARRENDATARIO-18 |
| RN-KIT-20 | HU-ARRENDATARIO-21 |
| RN-KIT-21 | HU-ARRENDATARIO-22 |
| RN-KIT-22 | HU-ARRENDATARIO-04, HU-ARRENDATARIO-09, HU-ARRENDATARIO-16, HU-ARRENDATARIO-32 |
| RN-KIT-23 | HU-ARRENDATARIO-04, HU-ARRENDATARIO-06, HU-ARRENDATARIO-26 |
| RN-KIT-24 | HU-ARRENDATARIO-04, HU-ARRENDATARIO-05, HU-ARRENDATARIO-11, HU-ARRENDATARIO-26 |
| RN-KIT-25 | HU-ARRENDATARIO-04, HU-ARRENDATARIO-05, HU-ARRENDATARIO-06, HU-ARRENDATARIO-11, HU-ARRENDATARIO-26 |
| RN-KIT-26 | HU-ARRENDATARIO-06, HU-ARRENDATARIO-07, HU-ARRENDATARIO-26 |
| RN-KIT-27 | HU-ARRENDATARIO-27, HU-ARRENDATARIO-31 |
| RN-KIT-28 | HU-ARRENDATARIO-28, HU-ARRENDATARIO-29, HU-ARRENDATARIO-30 |
| RN-KIT-29 | HU-ARRENDATARIO-32 |
| RN-KIT-30 | HU-ARRENDATARIO-13, HU-ARRENDATARIO-14 |
| RN-PRE-01 | HU-ARRENDADOR-03, HU-ARRENDADOR-26, HU-ARRENDATARIO-14, HU-ARRENDATARIO-15, HU-ARRENDATARIO-28 |
| RN-PRE-02 | HU-ARRENDATARIO-14, HU-ARRENDATARIO-15 |
| RN-PRE-03 | HU-ARRENDATARIO-14 |
| RN-PRE-04 | HU-ARRENDATARIO-35, HU-ARRENDATARIO-36, HU-ARRENDATARIO-37 |
| RN-PRE-05 | HU-ARRENDATARIO-14, HU-ADMIN-12 |
| RN-PRE-06 | HU-ARRENDATARIO-14, HU-ARRENDATARIO-20 |
| RN-PRE-07 | HU-ARRENDATARIO-14, HU-ARRENDATARIO-20 |
| RN-PRE-08 | HU-ARRENDATARIO-14, HU-ARRENDATARIO-17 |
| RN-PRE-09 | HU-ARRENDATARIO-14, HU-ARRENDATARIO-17, HU-ARRENDATARIO-35, HU-ARRENDATARIO-36 |
| RN-PRE-10 | HU-ARRENDATARIO-15, HU-ARRENDATARIO-28 |
| RN-PRE-11 | HU-ADMIN-12 |
| RN-PRE-12 | HU-ARRENDATARIO-14, HU-ARRENDATARIO-15, HU-ARRENDATARIO-28 |
| RN-PRE-13 | HU-ARRENDATARIO-35, HU-ARRENDATARIO-36, HU-ARRENDATARIO-37 |
| RN-PRE-14 | HU-ARRENDADOR-03, HU-ARRENDADOR-26, HU-ARRENDADOR-27, HU-ARRENDADOR-28 |
| RN-PAG-01 | HU-ARRENDATARIO-17 |
| RN-PAG-02 | HU-ARRENDATARIO-17 |
| RN-PAG-03 | HU-ARRENDATARIO-17 |
| RN-PAG-04 | HU-ARRENDATARIO-17 |
| RN-PAG-05 | HU-ARRENDATARIO-17 |
| RN-PAG-06 | HU-ARRENDADOR-01, HU-ARRENDADOR-30, HU-ARRENDATARIO-17 |
| RN-PAG-07 | HU-ARRENDADOR-01, HU-ARRENDADOR-30 |
| RN-PAG-08 | HU-ARRENDADOR-31, HU-ARRENDADOR-32, HU-ARRENDATARIO-38, HU-ARRENDATARIO-39 |
| RN-PAG-09 | HU-ARRENDADOR-06, HU-ARRENDADOR-30, HU-ARRENDADOR-31 |
| RN-PAG-10 | HU-ARRENDADOR-06 |
| RN-PAG-11 | HU-ARRENDADOR-06 |
| RN-PAG-12 | HU-ARRENDATARIO-17 |
| RN-PAG-13 | HU-ARRENDADOR-33, HU-ARRENDATARIO-37, HU-ARRENDATARIO-40 |
| RN-ENT-01 | HU-ARRENDADOR-02, HU-ARRENDATARIO-20 |
| RN-ENT-02 | HU-ARRENDADOR-02, HU-ARRENDATARIO-20 |
| RN-ENT-03 | HU-ARRENDADOR-02, HU-ARRENDATARIO-20 |
| RN-ENT-04 | HU-ARRENDADOR-02, HU-ARRENDATARIO-11, HU-ARRENDATARIO-20 |
| RN-ENT-05 | HU-ARRENDADOR-02, HU-ARRENDATARIO-20 |
| RN-ENT-06 | HU-ARRENDADOR-02, HU-ARRENDATARIO-19 |
| RN-ENT-07 | HU-ARRENDADOR-02, HU-ARRENDATARIO-19, HU-ARRENDATARIO-24 |
| RN-ENT-08 | HU-ARRENDADOR-02, HU-ARRENDATARIO-19 |
| RN-DEV-01 | HU-ARRENDADOR-33, HU-ARRENDADOR-34 |
| RN-DEV-02 | HU-ARRENDADOR-33, HU-ARRENDADOR-34 |
| RN-DEV-03 | HU-ARRENDADOR-33 |
| RN-DEV-04 | HU-ARRENDATARIO-37, HU-ARRENDATARIO-40 |
| RN-DEV-05 | HU-ARRENDADOR-33, HU-ARRENDATARIO-37, HU-ARRENDATARIO-40 |
| RN-DEV-06 | HU-ARRENDADOR-34, HU-ADMIN-11 |
| RN-DEV-07 | HU-ARRENDADOR-33, HU-ARRENDATARIO-40 |
| RN-DEV-08 | HU-ARRENDADOR-33 |
| RN-DEV-09 | HU-ARRENDADOR-33, HU-ARRENDADOR-34 |
| RN-DEV-10 | HU-ARRENDADOR-34 |
| RN-DEV-11 | HU-ARRENDATARIO-33 |
| RN-DEV-12 | HU-ARRENDADOR-31, HU-ARRENDATARIO-38 |
| RN-DEV-13 | HU-ARRENDADOR-31, HU-ARRENDATARIO-39, HU-ADMIN-11 |
| RN-VAL-01 | HU-ARRENDADOR-29, HU-ARRENDATARIO-34 |
| RN-VAL-02 | HU-ARRENDADOR-29, HU-ARRENDATARIO-34 |
| RN-VAL-03 | HU-ARRENDADOR-29, HU-ARRENDATARIO-34 |
| RN-VAL-04 | HU-ARRENDADOR-29, HU-ARRENDATARIO-34 |
| RN-VAL-05 | HU-ARRENDADOR-29, HU-ARRENDATARIO-34 |
| RN-VAL-06 | HU-ARRENDADOR-29, HU-ARRENDATARIO-34 |
| RN-VAL-07 | HU-ARRENDADOR-29, HU-ARRENDATARIO-34 |
| RN-VAL-08 | HU-ARRENDADOR-29, HU-ARRENDATARIO-34 |
| RN-VAL-09 | HU-ARRENDATARIO-34 |
| RN-INC-01 | HU-GENERAL-01, HU-ARRENDATARIO-33, HU-ARRENDATARIO-39 |
| RN-INC-02 | HU-GENERAL-01, HU-ARRENDATARIO-33, HU-ARRENDATARIO-39 |
| RN-INC-03 | HU-GENERAL-01, HU-ARRENDATARIO-33, HU-ARRENDATARIO-39 |
| RN-INC-04 | HU-GENERAL-01, HU-ADMIN-11 |
| RN-INC-05 | HU-GENERAL-01, HU-ARRENDATARIO-33 |
| RN-INC-06 | HU-GENERAL-01, HU-ARRENDATARIO-33, HU-ARRENDATARIO-39 |
| RN-INC-07 | HU-GENERAL-01, HU-ARRENDATARIO-33 |
| RN-INC-08 | HU-GENERAL-01 |
| RN-INC-09 | HU-GENERAL-01 |
| RN-INC-10 | HU-GENERAL-01 |
| RN-INC-11 | HU-GENERAL-01 |
| RN-INC-12 | HU-GENERAL-01 |
| RN-INC-13 | HU-GENERAL-01 |
| RN-INC-14 | HU-ADMIN-11 |
| RN-NOT-01 | HU-ARRENDATARIO-18 |
| RN-NOT-02 | HU-ARRENDATARIO-23 |
| RN-NOT-03 | HU-ARRENDATARIO-24 |
| RN-NOT-04 | HU-ARRENDATARIO-25 |
| RN-NOT-05 | HU-ARRENDADOR-24 |
| RN-NOT-06 | HU-ARRENDADOR-25 |
| RN-NOT-07 | HU-ARRENDADOR-05, HU-ARRENDADOR-23 |
| RN-NOT-08 | HU-ARRENDADOR-22 |
| RN-NOT-09 | HU-ARRENDADOR-32 |
| RN-NOT-10 | HU-ARRENDATARIO-41 |
| RN-NOT-11 | HU-ARRENDATARIO-10 |
| RN-ADM-01 | HU-ADMIN-13 |
| RN-ADM-02 | HU-ADMIN-13 |
| RN-ADM-03 | HU-ADMIN-14 |
| RN-ADM-04 | HU-ADMIN-14 |
| RN-ADM-05 | HU-ADMIN-01, HU-ADMIN-02, HU-ADMIN-03 |
| RN-ADM-06 | HU-ADMIN-04, HU-ADMIN-05, HU-ADMIN-06 |
| RN-ADM-07 | HU-ADMIN-07 |
| RN-ADM-08 | HU-ADMIN-08 |
| RN-ADM-09 | HU-ADMIN-09 |
| RN-ADM-10 | HU-ADMIN-10 |
| RN-ADM-11 | HU-ADMIN-12 |
| RN-ADM-12 | HU-ADMIN-11 |
| RN-ADM-13 | HU-ARRENDADOR-23, HU-ADMIN-15 |
| RN-ADM-14 | HU-ADMIN-14 |
| RN-ADM-15 | HU-ADMIN-14 |
| RN-SEG-01 | HU-ARRENDADOR-09, HU-ARRENDATARIO-01, HU-ARRENDATARIO-02, HU-ADMIN-13 |
| RN-SEG-02 | HU-ARRENDADOR-09, HU-ARRENDATARIO-01, HU-ARRENDATARIO-02, HU-ADMIN-13 |
| RN-SEG-03 | HU-ARRENDATARIO-02 |
| RN-SEG-04 | HU-ARRENDATARIO-02 |
| RN-SEG-05 | HU-ARRENDADOR-09, HU-ARRENDATARIO-01, HU-ARRENDATARIO-02 |
| RN-SEG-06 | HU-ARRENDADOR-09, HU-ARRENDATARIO-01, HU-ADMIN-14 |
| RN-SEG-07 | HU-ARRENDATARIO-02 |

---

## 4. Historial de versiones

| Versión | Fecha       | Descripción                                   | Autor(es)               |
|---------|-------------|-----------------------------------------------|-------------------------|
| 1.0.0   | 06/03/2026  | Primera versión del documento de Reglas de Negocio | Samuel Tamayo Balogh |
| 1.1.0   | 11/03/2026  | Actualización de reglas de Servicios (RN-SRV) y sincronización de la Matriz de Trazabilidad | Paula Rosa González Páez |
---

**Redactado por:** Samuel Tamayo Balogh, Paula Rosa González Páez  
**Fecha de redacción:** 11/03/2026  
**Versión:** 1.0.0
