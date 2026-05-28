# Test de Eneagrama — versión standalone

Test de eneagrama independiente, con el mismo diseño del proyecto original.
Envía las respuestas a un Google Sheets vía Google Apps Script.

## Estructura

```
EneagramaTest/
├── Index.html        ← pantalla principal
├── style.css         ← diseño (fondo cósmico + cards)
├── script.js         ← lógica del test + envío a GAS
├── Code.gs           ← código para pegar en Apps Script
├── img/              ← logo + favicon
└── README.md
```

## Datos

- **Total de preguntas: 90** (10 por tipo × 9 tipos)
- Distribución: 9 páginas de 10 preguntas
- Escala: 1 (Nunca) → 5 (Siempre)
- Calcula automáticamente el eneatipo dominante y los porcentajes por tipo

## Configuración (5 minutos)

### 1) Crear el Sheet + Apps Script

1. Creá un Google Sheet nuevo y vacío.
2. Menú **Extensiones → Apps Script**.
3. Borrá el contenido de `Code.gs` y pegá el contenido del archivo `Code.gs` de esta carpeta.
4. **Guardar** (💾).
5. Botón **Implementar → Nueva implementación**.
   - Engranaje → **Aplicación web**.
   - Descripción: `Test Eneagrama`.
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier persona**.
   - Click **Implementar**.
6. Autorizá los permisos cuando te los pida.
7. Copiá la **URL de la aplicación web** (termina en `/exec`).

### 2) Pegar la URL en el test

Abrí `script.js` y reemplazá:

```js
var GOOGLE_SCRIPT_URL = 'PEGAR_AQUI_TU_URL_DE_APPS_SCRIPT';
```

por:

```js
var GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycb..../exec';
```

### 3) Probar

Abrí `Index.html` directamente en el navegador (o subilo a cualquier hosting estático: Netlify, Vercel, GitHub Pages, Hostinger, etc.).

Cuando alguien complete el test, en el Sheet aparecerá una fila nueva con estas columnas:

| Fecha | Nombre | Apellido | Correo | Eneatipo | Eneatipo_Nombre | Respuestas | Score_T1..T9 | Pct_T1..T9 |

La hoja `Respuestas` y sus cabeceras se crean automáticamente la primera vez.

## Columnas que se guardan

- **Fecha** → dd/mm/yyyy hh:mm:ss
- **Nombre, Apellido, Correo** → datos del formulario inicial
- **Eneatipo** → número del 1 al 9
- **Eneatipo_Nombre** → ej. "Tipo 4: El Individualista"
- **Respuestas** → string con todas las respuestas y el tiempo por bloque, ej. `{T1: 2m 15s - 1;3, 2;4, ...} {T2: 1m 48s - ...}`
- **Score_T1..T9** → suma cruda por tipo (10 a 50)
- **Pct_T1..T9** → porcentaje normalizado (0 a 100)

## Notas

- El test guarda un borrador en `localStorage` cada vez que se responde una pregunta, así que si alguien cierra accidentalmente la pestaña puede retomar donde dejó (hasta 2 horas).
- El frontend espera `{ success: true, row: N }` como respuesta del Apps Script. Si querés sumar deduplicación, emails de confirmación, o subida de PDFs, podés expandir el `Code.gs` sin tocar el frontend.
