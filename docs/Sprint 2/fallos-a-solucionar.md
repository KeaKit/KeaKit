# Informe de Errores y Mejoras: Casos de Uso del Sistema

Este documento detalla las incidencias detectadas en la plataforma, divididas según el rol del usuario y el flujo de trabajo correspondiente.

---

## 🛠️ Problemas en Casos de Uso: Administrador

### 1. Gestión de usuarios
- **Campo faltante:** No se ha incluido el campo `address` (dirección) en los formularios de creación ni de edición de usuarios. (solucionado, PR en revision)
- **borrar usuarios:**	Intenté borrar un usuario vacío que creé y saltó un error grave.
- **borrar usuarios2:** Aparece como usuario a borrar y modificar el administrador, no deberias poder eliminarte a ti mismo, ni quitarte el rol de admin porque si no te quedas sin administrador en la apliacio. (solucionado, PR en revision)
- **Contraseña:** Se puede modificar la contraseña de un usuario y dejarla vacia, impidiendo que el usuario pueda ingresar porque aparece "contraseña obligatoria". Poner las mismas restricciones para modificar contraseña que cuando se crea. (esta en vacio para garantizar la privacidad, si no la tocas, no se modifica en la base de datos)
- **modificar correo:** Cuando modificas un correo por uno invalido ej w@g.com por w, no sale un error controlado y explicativo, sale un error de jpa transaction. (solucionado, PR en revision)


### 2. Gestión de categorías - SOLUCIONADO, ESPERANDO REVISIÓN
- **precio de categoria:** limitar los digitos a 2, porque puedes poner de precio 12.1212121212121, no se si convendria poner un tope de precio porque tambien puedes poner como 10 mil millones. - Solucionado, esperando revisión.
- **pantalla de categorias:** solo se ve desde el frontend la categoría creada en el seeder, por mucho que edites o crees nuevas categorias, estas no salen por pantalla, sin embargo si que existen en la base de datos. - Solucionado (poner categoría en modo activo pulsando en la palabra Borrador que aparece en naranja)

### 3. Establecer comisión de la plataforma
- *(Sin incidencias reportadas)*.

### 4. Gestión de incidencias
- **Error de asociación:** El sistema no permite vincular una incidencia a un objeto concreto. 
- **Observación:** Durante el periodo de alquiler no aparece ningún artículo disponible para reportar. Queda pendiente verificar si el comportamiento cambia una vez finalizado el tiempo de alquiler.

### 5. Configuración de kits predeterminados
- **Funcionalidad inexistente:** El administrador no dispone de una herramienta para configurar o crear un kit predeterminado nuevo desde cero.

### 6. Gestión de repartidores
- **Fallo en el filtrado geográfico:** El buscador no funciona correctamente por ubicación. 
- **Ejemplo:** Los repartidores de España no aparecen en los resultados, mientras que los de Albania se listan sin problemas.

### 7. Perfil de usuario
- *(Sin incidencias reportadas)*.

---

## 👤 Problemas en Casos de Uso: Usuarios Normales

### 8. Registro de usuario - SOLUCIONADO
- **Nombre:** Poner un max length de 255, porque como pongas mas letras te salta un error de sql.

### 9. Añadir fechas en la creación de kit - SOLUCIONADO
- **Fecha:** Si en el componente de poner fecha precionas el lapiz te deja poner la fecha de forma manual, solo que si lo haces no sirve.

### 10. Subir artículos / servicios - SOLUCIONADO
- **Poner validacion de max length:** si pones mas de 255 letras en el titulo te da un error sql.

### 11. Creación de un kit - TRABAJANDO EN ELLO - GCIRIA
- **Funcionalidad faltante:** No existe la opción de seleccionar un kit predeterminado existente.
- **Error de lógica de negocio:** Si un usuario selecciona un artículo para una fecha y lugar específicos y, tras añadirlo al carrito, cambia los datos de reserva (fecha/lugar), el sistema permite proceder al pago del artículo original sin validar la disponibilidad para los nuevos parámetros. - Solucionado, pendiente de revisión y merge

### 12. Wallet
- **Error de UI/UX:** El botón de "Retirar dinero" se encuentra inactivo o no ejecuta ninguna función al ser pulsado.

### 13. Comisión de la app
- No se aplica la comision de la app cuando recibes el dinero como "owner".
