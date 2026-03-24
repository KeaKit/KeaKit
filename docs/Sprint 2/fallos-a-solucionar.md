# Informe de Errores y Mejoras: Casos de Uso del Sistema

Este documento detalla las incidencias detectadas en la plataforma, divididas según el rol del usuario y el flujo de trabajo correspondiente.

---

## 🛠️ Problemas en Casos de Uso: Administrador

### 1. Gestión de usuarios
- **Campo faltante:** No se ha incluido el campo `address` (dirección) en los formularios de creación ni de edición de usuarios.

### 2. Gestión de categorías
- *(Sin incidencias reportadas)*.

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

### 8. Registro de usuario
- *(Sin incidencias reportadas)*.

### 9. Editar perfil de usuario
- *(Sin incidencias reportadas)*.

### 10. Subir artículos / servicios
- *(Sin incidencias reportadas)*.

### 11. Creación de un kit
- **Funcionalidad faltante:** No existe la opción de seleccionar un kit predeterminado existente.
- **Error de lógica de negocio:** Si un usuario selecciona un artículo para una fecha y lugar específicos y, tras añadirlo al carrito, cambia los datos de reserva (fecha/lugar), el sistema permite proceder al pago del artículo original sin validar la disponibilidad para los nuevos parámetros.

### 12. Wallet
- **Error de UI/UX:** El botón de "Retirar dinero" se encuentra inactivo o no ejecuta ninguna función al ser pulsado.

### 13. Comisión de la app
- *(Sin incidencias reportadas)*.
