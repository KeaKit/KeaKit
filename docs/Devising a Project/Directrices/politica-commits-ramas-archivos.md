# Política de commits, ramas y archivos

## Índice

1. [Introducción](#1-introducción)
2. [Commits](#2-commits)
3. [Ramas](#3-ramas)
4. [Archivos](#4-archivos)
5. [Otras consideraciones](#5-otras-consideraciones)
6. [Referencias](#6-referencias)
7. [Historial de versiones](#7-historial-de-versiones)

## 1. Introducción

En el presente documento se describen en detalle los pasos y reglas a seguir a la hora de hacer commits, crear ramas y subir archivos al repositorio. Nace como resultado de la necesidad de unificar todos estos y hacer del repositorio de KeaKit uno más uniforme y legible.

## 2. Commits

La siguiente política de commits está basada en la especificación "Conventional Commits" [1].

### 2.1. Mensajes de commits

- No se podrán dejar vacíos.
- Deben ser redactados en **inglés**.
- Deben seguir el siguiente formato:

```
tipo: descripción corta.
```

- Los tipos deben ir escritos en minúsculas, así como la primera palabra tras los dos puntos.
- Deben ser concisos y claros, pudiendo redactar más detalles al respecto si el usuario así lo desea en el cuerpo del mensaje.
- No deben usarse emoticonos ni en la descripción ni en el cuerpo.

### 2.2. Tipos de commits

| Tipo     | Descripción                                          |
| -------- | ---------------------------------------------------- |
| feat     | Nueva característica                                 |
| fix      | Corrección de un error                               |
| docs     | Cambios o adiciones en la documentación              |
| style    | Cambios de formato sin afectar funcionalidad         |
| refactor | Mejora o cambio de código sin cambiar comportamiento |
| test     | Cambios o adiciones en pruebas                       |
| chore    | Tareas de mantenimiento                              |

### 2.3. Ejemplos de commits

#### 2.3.1. Ejemplo de buen commit

**Ejemplo 1:**

```
feat: add user login functionality
```

_Motivo:_ Es conciso, claro, en inglés, y sigue el formato especificado.

#### 2.3.2. Ejemplos de malos commits

**Ejemplo 1:**

```
Update stuff
```

_Motivo:_ No sigue el formato, es ambiguo y no indica el tipo ni la naturaleza del cambio.

**Ejemplo 2:**

```
feat: Added new feature 😊
```

_Motivo:_ Incluye emoticonos, lo cual no debe hacerse.

**Ejemplo 3:**

```
fix:
```

_Motivo:_ La descripción está vacía.

### 2.4. Atomicidad de los commits

La atomicidad implica que cada commit debe contener un único cambio o conjunto de cambios relacionados. Evita mezclar modificaciones no relacionadas en un mismo commit.

**Recomendaciones:**

- Cada commit debe ser autocontenible y fácil de entender.
- Si se corrige un bug y se añade una nueva funcionalidad, deben ir en commits separados.
- Los commits atómicos facilitan la revisión, el revertido y el seguimiento de cambios.

**Ejemplo correcto:**

```
fix: resolve null pointer exception in payment module
```

```
feat: add payment receipt email notification
```

**Ejemplo incorrecto:**

```
fix: resolve null pointer and add email notification
```

_Motivo:_ Mezcla dos cambios distintos en un solo commit.

## 3. Ramas

El repositorio de KeaKit cuenta con una rama principal, _main_, donde se aloja código definitivo, funcional y testeado. Paralelamente, existe una rama _develop_, sirviendo de área de trabajo y referencia común a todos los desarrolladores.

Para el desarrollo de funcionalidades o arreglo de errores, será necesario crear ramas con esos fines y de corta duración a partir de develop. El nombre de las ramas debe estar en inglés, ser significativo y seguir el siguiente formato:

```
tipo-rama/nombre-rama
```

Pueden haber dos tipos de ramas:

- **feat/**: para nuevas funcionalidades.
- **fix/**: para arreglar errores.
- **docs/**: para generar documentación.

Una vez se haya cumplido el propósito de la rama, se deberá comprobar que el conjunto global con los cambios funciona y pasa las pruebas. Posteriormente, se deberá abrir una Pull Request en Github desde la rama en cuestión hacia develop. Para la aprobación de las mismas, se asignarán internamente parejas de revisión cuya funcionalidad será comprobar que el código a mergear es de calidad y aprobar la PR si es apta. Las ramas específicas _no deberán ser borradas_ después de su desarrollo, pues sirven como herramienta de trazabilidad para ver las contribuciones de cada miembro del equipo a lo largo del desarrollo del proyecto.

No será necesario crear una rama nueva para añadir documentación al proyecto; podrá hacerse directamente sobre main.

**Ejemplos de nombres de ramas correctos:**

```
feat/add-login-module
fix/payment-null-pointer
```

**Ejemplos de nombres de ramas incorrectos:**

```
feature/nueva-funcionalidad
fix/ArregloPago
```

_Motivo:_ No siguen el formato, usan español o mayúsculas.

## 4. Archivos

El nombre de los archivos subidos al repositorio debe seguir el siguiente patrón:

```
nombre-del-archivo.[extension]
```

Los nombres deben ser descriptivos pero concisos. Deberán estar escritos exclusivamente en minúsculas, sin espacios (pudiendo utilizar un guión "-" para separar palabras) y en inglés o español, según el caso.

En ningún caso se utilizarán caracteres especiales o la letra ñ, para evitar problemas de codificación. Aquellas instancias de la letra ñ podrán ser sustituidas por una n. Las palabras que contengan caracteres especiales podrán escribirse sin ellos.

Si la fecha ha de escribirse en el nombre del documento, deberá hacerse en el formato "añomesdia". Por ejemplo:

```
acta-reunion-20260122.md
```

### 4.1. Ejemplos de nombres de archivo

#### 4.1.1. Ejemplo de buen nombre de archivo

**Ejemplo 1:**

```
politica-commits-ramas-archivos.md
```

_Motivo:_ Es descriptivo, separa todas las palabras con guiones, no hace uso de caracteres especiales y hace uso de minúsculas en todos los caracteres.

#### 4.1.2. Ejemplos de malos nombres de archivos

**Ejemplo 1:**

```
Análisis_de_Competidores.md
```

_Motivo:_ Separa las palabras con guiones bajos en lugar de guiones, hace uso de caracteres especiales y mayúsculas.

**Ejemplo 2:**

```
Organización Sprints.md
```

_Motivo:_ Incluye caracteres especiales, mayúsculas y separa las palabras con espacios.

**Ejemplo 3:**

```
Mockups.md
```

_Motivo:_ Contiene una mayúscula y no es muy descriptivo. Esto último solo podría ser obviado si el archivo se encontrase en una carpeta que proveyese el contexto necesario.

## 5. Otras consideraciones

- Si el usuario ha de utilizar una cita bibliográfica, deberá hacerse en formato IEEE e incluirse al final del archivo. Ejemplo:

  > [1] Conventional Commits, "Conventional Commits Specification v1.0.0", [Online]. Available: https://www.conventionalcommits.org/en/v1.0.0/. [Accessed: 17-Feb-2026].

- Generalmente, la documentación deberá hacerse en formato Markdown, salvo excepciones.
- Historial de versiones: Todos los documentos de documentación deben incluir obligatoriamente una sección de "Historial de versiones" al final del documento, seguida de la metainformación del documento. Esta sección debe contener una tabla con las columnas: Versión, Fecha, Descripción y Autor(es). El versionado debe seguir el formato semántico (ej: 1.0.0, 1.1.0, 2.0.0), donde:
  - El primer número se incrementa para cambios mayores o reestructuraciones
  - El segundo número se incrementa para adiciones de contenido significativas
  - El tercer número se incrementa para correcciones menores, erratas o ajustes

## 6. Referencias

[1] Conventional Commits, "Conventional Commits Specification v1.0.0", [Online]. Available: https://www.conventionalcommits.org/en/v1.0.0/. [Accessed: 17-Feb-2026].

## 7. Historial de versiones

| Versión | Fecha      | Descripción                                                               | Autor(es)                    |
| ------- | ---------- | ------------------------------------------------------------------------- | ---------------------------- |
| 1.0.0   | 17/02/2026 | Creación inicial de la política de commits, ramas y archivos              | Rosa María Espinosa Martínez |
| 1.1.0   | 25/02/2026 | Añadida política obligatoria de historial de versiones para documentación | Rosa María Espinosa Martínez |
| 2.0.0   | 25/02/2026 | Cambio en la política de ramas a seguir                                   | Rosa María Espinosa Martínez |
| 2.1.0   | 12/05/2026 | Añadido índice                                                            | Lucía Ponce García de Sola   |

---

**Redactado por:** Rosa María Espinosa Martínez  
**Fecha de redacción:** 25/02/2026  
**Versión:** 2.0.0
