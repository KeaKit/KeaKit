# Informe Declarativo del Uso de la IA


## Introducción
El objetivo de este documento consiste en detallar el uso de herramientas de Inteligencia Artificial durante el desarrollo del proyecto KeaKit. A continuación, se describen las interacciones realizadas con la IA, especificando la herramienta empleada, el prompt utilizado, la respuesta obtenida y el objetivo de la interacción.


## Registro de Interacciones

**Herramienta y versión de Inteligencia Artificial utilizada:** ChatGPT, modelo GPT-5.2.

**Fecha de uso:** 25/02/2026

**Prompt utilizado:** 

```
"cuanto puede pesar un dato en una tabla sql?"
```
**Respuesta obtenida:** 
```
"El “peso” de un dato en una tabla SQL depende principalmente de su tipo de dato y de cómo lo almacene el motor de base de datos que estés usando (MySQL, PostgreSQL, SQL Server, Oracle, etc.). Vamos a desglosarlo:

1. Tipos de datos numéricos
Tipo	Tamaño típico
TINYINT	1 byte (0 a 255 o -128 a 127)
SMALLINT	2 bytes
INT o INTEGER	4 bytes
BIGINT	8 bytes
DECIMAL(p,s) / NUMERIC(p,s)	Depende de la precisión p, pero normalmente varios bytes, hasta ~16 bytes para grandes precisiones
FLOAT	4 bytes
DOUBLE / REAL	8 bytes
2. Tipos de datos de texto
Tipo	Tamaño típico
CHAR(n)	n bytes (si es ASCII; puede ser más si es UTF-8 y contiene caracteres multibyte)
VARCHAR(n)	Longitud real + 1-2 bytes de overhead (para guardar el tamaño)
TEXT / CLOB	Depende del motor, pero puede ser hasta varios GB (almacenamiento externo a la fila en muchos motores)

Ejemplo: un VARCHAR(50) que contiene "Hola mundo" ocupa 10 bytes de texto + 1-2 bytes de overhead = ~12 bytes.

3. Tipos de datos binarios
Tipo	Tamaño típico
BINARY(n)	n bytes
VARBINARY(n)	longitud real + 1-2 bytes
BLOB	Puede ser desde kilobytes hasta gigabytes, depende del motor
4. Tipos de datos especiales

DATE → generalmente 3 bytes

DATETIME / TIMESTAMP → 8 bytes

BOOLEAN → 1 byte

🔹 Conclusión práctica

No hay un “peso fijo” universal para un dato, depende del tipo y del contenido.

Por ejemplo:

Un entero INT siempre pesa 4 bytes.

Un VARCHAR(255) puede pesar desde 0 bytes hasta 255 bytes (más overhead).

Un TEXT grande puede pesar cientos de KB o más, dependiendo de lo que almacenes.

Si quieres, puedo hacerte una tabla completa con todos los tipos de datos de MySQL y su tamaño exacto para que veas cuánto “pesa” cada dato de forma concreta. Esto es muy útil para estimar espacio en disco.

¿Quieres que haga eso?"
```

**Prompt utilizado:** 

```
"y un objeto con 10 campos"
```

**Respuesta obtenida:** 
```
"Vale, vamos a estimarlo paso a paso. Un objeto con 10 campos en SQL significa que tienes 10 columnas en una tabla, cada una con su tipo de dato. El “peso” total del objeto es básicamente la suma de los tamaños de cada campo más un pequeño overhead de la fila.

1️⃣ Supongamos un ejemplo típico de objeto:
Campo	Tipo	Tamaño aproximado
id	INT	4 bytes
nombre	VARCHAR(50)	50 bytes máximo + 1 byte overhead ≈ 51 bytes
apellido	VARCHAR(50)	51 bytes
email	VARCHAR(100)	100 bytes + 1 ≈ 101 bytes
edad	TINYINT	1 byte
fecha_nac	DATE	3 bytes
activo	BOOLEAN	1 byte
saldo	DECIMAL(10,2)	5 bytes aprox.
descripcion	TEXT	variable, digamos 500 bytes de promedio
foto	BLOB	variable, digamos 10 KB promedio
2️⃣ Calculamos un peso aproximado

Sumamos los bytes de cada campo:

id           4
nombre       51
apellido     51
email       101
edad         1
fecha_nac    3
activo       1
saldo        5
descripcion 500
foto       10,000
-------------------
Total ≈ 10,717 bytes ≈ 10.5 KB por fila

Nota: La columna foto y descripcion son variables. Si el BLOB fuera más grande, la fila pesaría más, pero muchos motores lo almacenan fuera de la fila principal, así que el overhead en la tabla puede ser menor.

3️⃣ Overhead de fila

MySQL/InnoDB: cada fila tiene ~7-10 bytes de overhead más punteros para columnas VARCHAR/BLOB.

PostgreSQL: unas 23 bytes de overhead por fila más un puntero a TOAST para datos grandes (TEXT/BYTEA).

Así que el cálculo anterior es una estimación “realista”, pero no exacta al byte.

Si quieres, puedo hacer un calculador automático: tú me das los 10 campos con sus tipos y valores promedio, y te digo exactamente cuánto pesaría cada fila en MySQL y PostgreSQL.

¿Quieres que haga eso?"
```


**Prompt utilizado:** 

```
"elimina la foto en el conteo, la foto la guardamos en un lugar a parte"
```
**Respuesta obtenida:** 
```
"¡Perfecto! Si eliminamos la columna foto del cálculo, entonces nuestro objeto queda con 9 campos, y el tamaño aproximado de la fila cambia.

1️⃣ Recalculamos tamaño de la fila sin foto
Campo	Tipo	Tamaño aprox.
id	INT	4 bytes
nombre	VARCHAR(50)	51 bytes
apellido	VARCHAR(50)	51 bytes
email	VARCHAR(100)	101 bytes
edad	TINYINT	1 byte
fecha_nac	DATE	3 bytes
activo	BOOLEAN	1 byte
saldo	DECIMAL(10,2)	5 bytes
descripcion	TEXT (promedio)	500 bytes

Suma:

4 + 51 + 51 + 101 + 1 + 3 + 1 + 5 + 500 = 717 bytes

Ojo: ¡esto parece muy bajo! Eso es porque antes contábamos foto como 10 KB. Sin foto, la fila queda relativamente pequeña.
Agreguemos un overhead de fila típico de InnoDB: ~10 bytes → 717 + 10 = 727 bytes ≈ 0.71 KB

2️⃣ Calculamos cuántas filas caben en 500 MB

Espacio disponible: 500 MB = 524,288,000 bytes

Filas
=
524
,
288
,
000
727
≈
720
,
900
 filas
Filas=
727
524,288,000
	​

≈720,900 filas

✅ Entonces, sin guardar la foto en la tabla, podrías almacenar aproximadamente 720 mil filas de ese objeto en 500 MB.

Si quieres, puedo hacer un mini gráfico de cuántas filas caben según el tamaño promedio de descripcion para que veas cómo cambia el número de filas si algunos textos son más largos.

¿Quieres que haga eso?"
```

**Prompt utilizado:** 

```
"cuanto tiempo puede tardar de media consultas a una base de datos con datos de ese tipo,"
```

**Respuesta obtenida:** 
```
"El tiempo de una consulta SQL depende de muchos factores, no solo del tamaño de los datos. Pero podemos hacer un cálculo aproximado y un análisis realista usando tu ejemplo (objetos de ~727 bytes, 720k filas, 500 MB de datos).

1️⃣ Factores que afectan el tiempo de consulta

Tipo de consulta

SELECT * FROM tabla → más lento porque lee todas las columnas.

SELECT campo1 FROM tabla WHERE id = 123 → más rápido si hay índice sobre id.

Índices

Sin índice: un WHERE sobre una columna requiere scan completo de la tabla (full table scan).

Con índice: se accede directamente a las filas relevantes (log(n) tiempo en B-Tree).

Motor de base de datos

MySQL/InnoDB, PostgreSQL, SQL Server, Oracle… todos tienen optimizaciones distintas.

Hardware

RAM: si la tabla cabe en memoria, las consultas son mucho más rápidas.

SSD vs HDD: los discos lentos aumentan el tiempo de lectura.

Número de filas devueltas

Traer 1 fila es mucho más rápido que traer 100k filas.

2️⃣ Estimación general

Supongamos:

Tabla: 720k filas, 727 bytes por fila → 524 MB

Consulta: SELECT * FROM tabla WHERE id = ?

Índice: id es PRIMARY KEY → uso de B-Tree

Sistema: SSD + 16 GB RAM

Tiempo aproximado:

Tipo de consulta	Sin índice	Con índice
Buscar 1 fila	100 ms – 500 ms (full scan)	< 1 ms
Buscar 100 filas	500 ms – 2 s	1–3 ms
Seleccionar toda la tabla	5–20 s (SSD)	5–20 s (el índice ayuda poco si traes todo)

Nota: si la tabla cabe en memoria, tiempos de búsqueda bajan a microsegundos/milisegundos incluso sin índices.
Si los datos están en disco y no en cache, el tiempo depende mucho de la velocidad de lectura del disco.

3️⃣ Recomendaciones para que las consultas sean rápidas

Crear índices en las columnas que uses en WHERE y JOIN.

Evitar SELECT * si no necesitas todas las columnas.

Mantener columnas grandes (TEXT, BLOB) fuera de la tabla principal si no son necesarias en la consulta.

Analizar la tabla y actualizar estadísticas para que el optimizador elija el mejor plan.

Considerar particionamiento o sharding si los datos crecen mucho (millones de filas).

Si quieres, puedo hacer una simulación con distintos tipos de consultas para tu tabla de 720k filas y darte un rango de tiempos esperado más detallado, incluyendo WHERE, JOIN y SELECT *. Esto te daría un panorama muy realista de la performance.

¿Quieres que haga esa simulación?"
```

**Prompt utilizado:** 

```
"y si busco unas 1000 filas"
```
**Respuesta obtenida:** 
```
"Perfecto, vamos a estimarlo con más detalle.

Tenemos tu tabla de 720k filas, 727 bytes por fila (sin foto), ≈524 MB. Buscas 1000 filas.

1️⃣ Escenario A: Columna buscada tiene índice

Por ejemplo: SELECT * FROM tabla WHERE id BETWEEN 1000 AND 2000 con id como PRIMARY KEY.

El índice permite localizar rápidamente las filas: B-Tree → O(log n)

Tiempo típico en SSD y RAM suficiente: 1–5 ms para localizar punteros + tiempo de lectura de 1000 filas (~727 KB).

Leer 1000 filas (~727 KB) es prácticamente instantáneo en RAM, y unos 1–3 ms extra en SSD.

≈ 2–10 ms por consulta.

2️⃣ Escenario B: Columna buscada sin índice

Por ejemplo: SELECT * FROM tabla WHERE nombre = 'Juan' y no hay índice en nombre.

El motor hace un full table scan de 720k filas.

Total de datos a leer: 524 MB → lectura secuencial en SSD: 500 MB / 500 MB/s ≈ 1 s

Más overhead de filtrado → ≈1–2 s en promedio.

En disco HDD sería mucho más lento: 5–10 s para leer toda la tabla.

3️⃣ Escenario C: Consulta parcial (solo algunas columnas)

Si haces SELECT id, nombre FROM tabla WHERE id BETWEEN 1000 AND 2000:

Datos a leer: 4 + 51 bytes = 55 bytes por fila × 1000 filas ≈ 55 KB

Tiempo: microsegundos–milisegundos, prácticamente instantáneo incluso sin índices si la tabla está en cache.

🔹 Conclusión práctica

Con índice: 1000 filas → ≈ 2–10 ms

Sin índice: 1000 filas → ≈ 1–2 s en SSD, más lento en HDD

Evitar SELECT * con filas grandes (TEXT) si solo necesitas columnas pequeñas.

Si quieres, puedo hacer un mini cálculo de “tiempo vs número de filas devueltas” para tu tabla de 720k filas, para ver cuánto tarda desde 1 hasta 100k filas en distintos escenarios. Eso da un panorama muy visual de performance.

¿Quieres que haga eso?"
```

**Prompt utilizado:** 

```
"y de escritura?"
```

**Respuesta obtenida:** 
```
"Perfecto, veamos el tiempo de escritura para tu tabla de 720k filas (~727 bytes cada fila, sin foto). La escritura depende mucho de motor de base de datos, índices y hardware, así que vamos a desglosarlo.

1️⃣ Factores que afectan la escritura

Tipo de operación

INSERT simple (una fila)

INSERT masivo (bulk insert)

UPDATE o DELETE

Índices

Cada índice debe actualizarse al insertar → aumenta tiempo de escritura.

Más índices = más lento para escribir.

Disco y RAM

SSD vs HDD → SSD mucho más rápido para escrituras aleatorias.

RAM + cache ayuda: operaciones en memoria se reflejan luego en disco (buffered writes).

Transacciones

INSERT con commit por fila → más lento

INSERT en bloque y commit único → mucho más rápido

2️⃣ Estimación de tiempo de escritura
a) Inserción de una fila individual

Tamaño fila: 727 bytes + overhead (~737 bytes)

Índice PRIMARY KEY: actualizar B-Tree → unos pocos microsegundos

SSD y RAM suficiente → ≈ 0.1–1 ms por fila

En HDD puede subir a 2–5 ms por fila.

b) Inserción masiva (1000 filas)

Tamaño total: 737 bytes × 1000 ≈ 0.7 MB

Bulk insert con commit único: el motor escribe en buffer y luego al disco → ≈ 5–10 ms en SSD

Bulk insert sin índices adicionales es muy rápido; con muchos índices puede subir a 20–50 ms para 1000 filas.

c) Actualizaciones (UPDATE)

Depende del índice: si buscas la fila por columna indexada → rápido (~1–5 ms por fila)

Si no hay índice → full table scan → lento, puede ser 1–2 s para 1000 filas

3️⃣ Consideraciones importantes

Número de índices importa más que el tamaño de fila para escritura masiva.

BLOBs o TEXT grandes ralentizan la escritura si se guardan en la tabla (pero en tu caso la foto está afuera).

Para inserciones masivas grandes, usar:

INSERT ... VALUES (...) en bloque

COPY en PostgreSQL o LOAD DATA INFILE en MySQL

Si quieres, puedo hacerte una tabla con estimación de velocidad de escritura para tu objeto, desde 1 fila hasta 100k filas, considerando índices y sin índices, para que tengas una idea de throughput en MB/s y filas/s.

¿Quieres que haga eso?"
```

**Objetivo del uso:** Investigar el tiempo y peso promedio de busquedas de objetos en tablas sql para tener un estimado de cuanta quota se puede llegar a gastar a lo largo del proyecto, debido a que solo se estaba estimando casos hipoteticos no se requirió una investigación más profunda por los datos aproximados de chatgpt se utilizaron de manera directa en el análisis

**Enlace a la conversación:** [Ver conversación](https://chatgpt.com/share/699f577c-14a4-8013-9d7c-ba35fbdd2400)