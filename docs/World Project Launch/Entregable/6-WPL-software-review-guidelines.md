# WPL - Software Review Guidelines

## Enlace al despliegue

**Enlace:** https://keakit.net/

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

| Fuente | Fallo | Solución proporcionada | Issue asociada | Impacto | Urgencia | Estado | Resultado obtenido |
| --- | --- | --- | --- | --- | --- | --- | --- |

### Mejoras

| Fuente | Mejora | Solución proporcionada | Issue asociada | Impacto | Urgencia | Estado | Resultado obtenido |
| --- | --- | --- | --- | --- | --- | --- | --- |

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
