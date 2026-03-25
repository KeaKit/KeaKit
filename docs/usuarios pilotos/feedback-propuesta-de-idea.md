# Análisis y Propuesta de Cuestionario para Usuarios Piloto: KEAKIT
**Proyecto:** KEAKIT App

**Fase:** Usuarios piloto

**Objetivo:** Conocer la opinión sobre KEAKIT, conectar a personas que se mudan 
temporalmente con dueños locales que quieren rentabilizar sus pertenencias, y reclutar usuarios piloto.

---

## 1. Estructura General y Lógica del Cuestionario

El cuestionario está diseñado con una lógica condicional (bifurcación) para no saturar al usuario y mostrarle solo información relevante.
Dependiendo de la respuesta en la Sección 1 (pregunta de perfil), el encuestado será dirigido a una ruta específica adaptada a su rol.
El test además ha sido traducido al Inglés con el objetivo de poder encontrar usuarios piloto fuera de españa, clave para nuestros
nuestros perfiles de erasmus y prácticas en el extranjero.
**URL**: https://forms.gle/9cjNfozDvAavqFzy9
> **Lógica de Bifurcación:**
> * **Sección 1 (Común):** Perfil de Usuario.
> * Si Perfil = **Arrendatario** ➔ Salta a la **Ruta A** (Sección 2A y Sección 3A). Luego salta a la Sección 4.
> * Si Perfil = **Arrendador** ➔ Salta a la **Ruta B** (Sección 2B y Sección 3B).Luego salta a la Sección 4.
> * **Sección 4 (Común):** Ambas rutas convergen al final para probar el prototipo interactivo de la app.

---

## 2. Organización de Secciones y Preguntas

### Sección 1: Perfil de Usuario
**Objetivo:** Acotar al encuestado dentro de los perfiles piloto definidos y recopilar su correo para el acceso anticipado.

* **P1.** Correo electrónico *(Obligatorio)*.
* **P2.** ¿Cuál es su rango de edad? *(Opciones: Menos de 18, 18-24, 25-34, 35-44, 45-54, 55-64, 65 o más)*.
* **P3 (Pregunta filtro)** ¿Con cuál de estos dos perfiles te identificas?.
    * *Opción A:* Soy Arrendatario (Busco equipamiento).
    * *Opción B:* Soy Arrendador (Tengo equipamiento).

---

### Sección 2: Encontrar el Problema
**Objetivo:** Profundizar acerca del problema a resolver por KEAKIT, preguntando sobre frustraciones, dinero y tiempo malgastado.

#### Ruta A: Arrendatarios (Inquilinos)
* **P4.** Para conocer mejor tu perfil, ¿cuál de estos roles encaja mejor contigo?
  *(Opciones: Estudiante Erasmus, Estudiante en prácticas, Nómada digital, Otro)*.
* **P5.** Al mudarte a una ciudad temporalmente, ¿cuál es tu mayor frustración con la vivienda?
  *(Opciones: Piso vacío/mal equipado, Sin Internet, No apetece comprar, Coste alto, Coste transporte excede compra)*.
* **P6.** ¿Cuánto tiempo estimas que invertiste/invertirás en compras y montaje básico?
  *(Opciones: Menos de 1 día, 1-3 días, Más de 3 días, Aún sigo comprando)*.
* **P7.** ¿Cuánto dinero gastaste de más en tu última mudanza entre comprar y malvender?
  *(Opciones: Menos de 50€, Entre 50€ y 150€, Más de 150€, Prefiero no pensarlo)*.
* **P8.** ¿Alguna vez has pagado sobrepeso o facturado maleta extra SOLO para llevarte cosas de casa?
  *(Opciones: Sí, No pero casi, No - prefiero comprar al llegar)*.
* **P9.** En caso de haber tenido dicho gasto, indica una cifra aproximada *(Texto abierto)*.

#### Ruta B: Arrendadores (Propietarios)
* **P16.** ¿Has utilizado alguna vez plataformas de segunda mano (Para vender)? *(Opciones: Wallapop, Vinted, Milanuncios, FB Marketplace, Ninguna)*.
* **P17.** ¿Cuál es tu situación actual respecto a tu vivienda?*(Opciones: Propietario vivo en ella, Propietario con habs. vacías, Vivo de alquiler, Otro)*.
* **P18.** ¿Con cuál de estos 3 perfiles de "Arrendador" te sientes más identificado/a?*(Opciones: Rentabilizador, Práctico, Eco-Colaborador, Otro)*.
* **P19.** ¿Qué tipos de objetos funcionales tienes guardados "cogiendo polvo"?*(Opciones: Ropa cama/toallas, Vajilla/menaje, Pequeños electrodomésticos, Muebles pequeños, Nada)*.
* **P20.** Si tienes esos objetos y no los usas, ¿por qué no los has vendido o tirado?*(Opciones: Pena, Valor sentimental, Lío quedar, Por si acaso, No sé cuánto pedir)*.

---

### Sección 3: Aplicación (KEAKIT)
**Objetivo:** Exponer la solución, conocer el interés en la app y valorar diversas funcionalidades exclusivas.

#### Ruta A: Arrendatarios
* **P10.** Si crearas tu kit en la app, ¿qué categorías serían imprescindibles?*(Opciones: Cocina, Dormitorio, Estudio, Servicios (Router), Otro)*.
* **P11.** ¿Qué valoras más de una solución como KEAKIT? *(Opciones: Precio, Comodidad, Impacto ecológico)*.
* **P12.** ¿Estarías dispuesto a alquilar un "Kit de Supervivencia" en nuestra app en lugar de comprar nuevo? *(Opciones: Sí por sostenibilidad, Sí por comodidad, No)*.
* **P13.** ¿Preferirías pagar por el kit completo o precio desglosado por objeto?*(Opciones: Pack cerrado, Precio individual)*.
* **P14.** Si KeaKit ofreciera un seguro obligatorio en lugar de fianza alta, ¿lo preferirías?*(Opciones: Sí, No, Otro)*.
* **P15.** ¿Te gustaría ver un apartado de 'Estado de recepción' con fotos para asegurar la fianza?*(Opciones: Sí, No, Tal vez, No relevante)*.

#### Ruta B: Arrendadores
* **P21.** ¿Te interesaría un servicio de alquiler a estudiantes por 6 meses? *(Opciones: Sí dinero extra, Sí por ayudar, No prefiero guardar, No prefiero vender)*.
* **P22.** ¿Cuál sería tu mayor miedo o barrera? *(Opciones: Rotos/sucios, Roben, Lío administrativo, Poco dinero para el riesgo)*.
* **P23.** Trato justo por un Kit de Cocina tuyo por 6 meses: *(Opciones: Tarifa mensual, Pago único, Da igual si me lo cuidan)*.
* **P24.** ¿Cómo preferirías subir objetos para ahorrar tiempo? *(Opciones: Sueltos uno a uno, Crear un "Kit completo")*.
* **P25.** Funcionalidad para sentir tranquilidad al dejar tus cosas: *(Opciones: Verificación fotográfica, Sistema de reputación, Garantía KeaKit)* .
* **P26.** Gestión de solicitudes: *(Opciones: Control total, Reserva inmediata)*.
* **P27.** ¿Te gustaría tener un "Panel de Rendimiento"? *(Opciones: Sí motiva, No solo notificación, Indiferente)*.
* **P28.** Función "Inventario Virtual" para retirar temporalmente objetos: *(Opciones: Sí flexibilidad, No compromiso 3-6 meses)*.

---

### Sección 4: Prototipo Funcional y Feedback
**Objetivo:** Obtener feedback sobre la interfaz y experiencia de usuario (UX/UI), y solicitar al encuestado que sea usuario piloto si este lo desea.

> **Instrucción:** A los usuarios se les facilita el enlace al *Prototipo Interactivo* y se les pide seguir 5 pasos: Registro, Acceso, Configuración de un kit, Simulación de pago y revisión de Perfil.

* **P29.** Del 1 al 5, ¿cómo de intuitiva te ha resultado la interfaz del prototipo?*(Escala lineal)*.
* **P30.** Del 1 al 5, ¿se encuentra lo suficientemente claro el desglose del precio?*(Escala lineal)*.
* **P31.** Basándote exclusivamente en el aspecto visual, ¿qué nivel de confianza te transmite para introducir los datos de tu tarjeta bancaria?*(Escala 1 al 5)*.
* **P32.** ¿Qué elemento de la pantalla de un kit te ayudaría MÁS a decidirte a alquilarlo? *(Opciones: Fotos grandes, Valoraciones, Ver perfil, Otro)*.
* **P33.** Para terminar, ¿te animas a probar KEAKIT como usuario piloto? *(Sí / No)*.

## 3. Conclusiones
El diseño segmentado de este cuestionario permite a KEAKIT validar de forma eficiente su propuesta de valor en un mercado de dos caras (oferta y demanda). 
Al implementar una lógica de bifurcación, garantizamos una experiencia de usuario fluida, evitando el abandono de la encuesta y 
obteniendo datos precisos sobre los "dolores" reales de ambos perfiles (el gasto excesivo de los inquilinos temporales y 
los miedos o barreras de los propietarios).
Además de recopilar información cualitativa y cuantitativa vital para el modelo de negocio, 
la estrategia de incluir la prueba del prototipo interactivo al final cumple un doble propósito fundamental:

* Testear la usabilidad (UX/UI) y medir la confianza que transmite la plataforma en un momento crítico (el pago).

* Generar tracción inicial, convirtiendo de forma natural a los encuestados en nuestros primeros usuarios piloto (early adopters).
