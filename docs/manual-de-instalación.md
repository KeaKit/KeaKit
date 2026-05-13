# Manual de instalación y ejecución del sistema

## Índice

1. [Instalación](#1-instalación)  
   1.1. [Windows 11](#11-windows-11)  
   1.2. [Linux](#12-linux)  
2. [Ejecutar el proyecto](#2-ejecutar-el-proyecto)
3. [Problemas comunes](#3-problemas-comunes)

## 1. Instalación

Este proyecto utiliza **Dev Containers** para proporcionar
automáticamente todas las herramientas necesarias (Java, Maven, Node.js,
PostgreSQL, Expo, etc.).

Por tanto, **no necesitas instalar Java, Node ni PostgreSQL manualmente.**

### 1.1. Windows 11

### 1. Instalar WSL2 (Linux dentro de Windows)

Abrir **PowerShell como Administrador** y ejecutar:

```powershell
wsl --install
```

Reiniciar el ordenador cuando lo solicite.

Verificar la instalación:

```powershell
wsl -l -v
```

Debe aparecer algo similar a:

```powershell
    Ubuntu    Version 2
```

### 2. Instalar Docker Desktop

Descargar e instalar: https://www.docker.com/products/docker-desktop/

Durante la instalación:

- Activar **Use WSL 2 backend**

Después abrir Docker Desktop y esperar a que indique:

    Docker Desktop is running

### 3. Activar integración con WSL

En Docker Desktop:

    Settings → Resources → WSL Integration

Activar:

- Ubuntu

Pulsar **Apply & Restart**.

### 4. Instalar Visual Studio Code

Descargar: https://code.visualstudio.com/

Instalar la extensión: **Dev Containers** (Microsoft)

### 5. Clonar el proyecto (MUY IMPORTANTE)

Abrir terminal **Ubuntu (WSL)**, NO PowerShell.

```bash
wsl
mkdir -p ~/projects
cd ~/projects
git clone <URL_DEL_REPO>
cd <repo>
```

**No trabajar en `C:\Users\...`**, ya que provoca lentitud y errores
con Docker.

### 6. Abrir el proyecto en VS Code

Desde la terminal WSL:

```bash
code .
```

Abajo a la izquierda en VS Code debe aparecer:

    WSL: Ubuntu

### 7. Abrir en Dev Container

VS Code detectará automáticamente la configuración:

    Reopen in Container

Haz click.

La primera vez tardará varios minutos porque se instalará todo
automáticamente.

### 8. Verificar instalación

Abrir una terminal en VS Code y ejecutar:

```bash
java -version
mvn -version
node -v
npm -v
```

Si muestran versiones → entorno listo

---

### 1.2. Linux

### 1. Instalar Docker

Abrir la terminal y ejecutar:

```bash
sudo apt update
sudo apt install docker.io -y
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
```

> Reinicia sesión después de ejecutar el último comando.

Verificar instalación:

```bash
docker run hello-world
```

### 2. Instalar Visual Studio Code

Si no está instalado:

```bash
sudo snap install code --classic
```

### 3. Instalar la extensión Dev Containers

1.  Abrir VS Code\
2.  Ir a **Extensiones** (`Ctrl + Shift + X`)
3.  Buscar: `Dev Containers`
4.  Instalar la extensión

### Crear un Dev Container

1.  Abrir la carpeta del proyecto en VS Code
2.  Presionar:

Ctrl + Shift + P

3.  Ejecutar:

```{=html}
<!-- -->
```

    Dev Containers: Add Dev Container Configuration Files

4.  Seleccionar el entorno deseado (Python, Node, Ubuntu, etc.)

### Abrir el proyecto dentro del container

Ejecutar:

    Dev Containers: Reopen in Container

VS Code construirá automáticamente el contenedor y abrirá el proyecto
dentro de él.

### Verificación

Si todo funciona correctamente, en la esquina inferior izquierda
aparecerá:

    Dev Container: <nombre-del-entorno>

La terminal ya estará ejecutándose dentro del contenedor.

## 2. Ejecutar el proyecto

### 2.1. Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
```

Backend disponible en:

    http://localhost:8080 o el puerto que indique la aplicación

### 2.2. Mobile (React Native / Expo)

```bash
cd mobile
npx expo start
```

Pulsar w para abrir en navegador.

### 2.3. Tests de rendimiento (Locust)

Para ejecutar los tests de rendimiento, iniciar el backend en una terminal con el siguiente perfil para usar la bbdd en memoria:

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=loadtest
```

Y en otra terminal distinta:

```bash
cd locust
locust -f locustfile.py --host=http://localhost:8080
```

### 2.4. Notas importantes

- Todo se ejecuta dentro de Docker.
- No instalar dependencias manualmente en Windows.
- El entorno es idéntico para todo el equipo.

## 3. Problemas comunes

### 3.1. No aparece "Reopen in Container"

    Ctrl + Shift + P
    → Dev Containers: Reopen in Container

### 3.2. Docker no arranca

En Windows, abrir Docker Desktop manualmente.

En Linux, ejecutar:

```bash
sudo systemctl start docker
sudo systemctl status docker
```

### 3.3. Problemas de permisos (Linux)

```bash
sudo usermod -aG docker $USER
```

>Reiniciar sesión después

### 3.4. Proyecto lento (Windows)

Asegurarse de que el proyecto está dentro de WSL (`/home/...`) y no en
`C:\`.
