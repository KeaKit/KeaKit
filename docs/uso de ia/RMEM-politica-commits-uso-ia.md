# Informe Declarativo del Uso de la IA

## Introducción
El objetivo de este documento consiste en detallar el uso de herramientas de Inteligencia Artificial durante el desarrollo del proyecto KeaKit. A continuación, se describen las interacciones realizadas con la IA, especificando la herramienta empleada, el prompt utilizado, la respuesta obtenida y el objetivo de la interacción.


## Registro de Interacciones

**Herramienta y versión de Inteligencia Artificial utilizada:** Copilot en Visual Studio Code, modelo GPT-4.1 en modo Agente.

**Fecha de uso:** 17/02/2026

**Prompt utilizado:** 
```
[Subido como contexto el archivo politica-commits-ramas-archivos.md] "Revisa el contenido. ¿Algo a mejorar?"
```

**Respuesta obtenida:** 
```
"El documento es claro, estructurado y cumple su propósito. Algunas sugerencias menores para mejorar la legibilidad y precisión:

En la sección de ramas, la frase "Las ramas deben ser El nombre de éstas debe estar en inglés..." tiene un error de redacción. Debería ser: "El nombre de las ramas debe estar en inglés...".
En la sección de archivos, podrías unificar el criterio de idioma: especificar cuándo usar inglés o español, para evitar ambigüedad.
Considera agregar ejemplos de nombres de ramas correctos e incorrectos, como hiciste con los commits y archivos.
En "Otras consideraciones", podrías aclarar cómo citar en IEEE (ejemplo concreto).
Revisa la consistencia de los términos: "tiporama/nombre-rama" debería ser "tiporamas/nombre-rama" o "tipo-rama/nombre-rama".
¿Quieres que realice estas mejoras directamente en el archivo?"
```
**Siguiente prompt utilizado:** 
```
"aplica los puntos 3, 4, 5"
```

**Siguiente respuesta obtenida:** 

```
"Listo. He realizado las siguientes mejoras en el archivo:

Agregué ejemplos de nombres de ramas correctos e incorrectos, con explicación.
Añadí un ejemplo concreto de cita en formato IEEE.
Corregí el término "tiporama" por "tipo-rama" en el formato de nombres de ramas.
¿Quieres revisar el resultado o necesitas algún ajuste adicional?"
```

**Objetivo del uso:** Pulir la redacción del documento que estaba redactando antes de subirlo al repositorio.

**Enlace a la conversación:** Copilot no permite compartir enlaces de la conversación. Adjunto captura de pantalla.

<div style="text-align: center;">
  <img src="img/rmem-copilot-politica-commits.png" width="500" height="auto" style="object-fit: cover;" alt="Captura Conversación Copilot">
</div>
