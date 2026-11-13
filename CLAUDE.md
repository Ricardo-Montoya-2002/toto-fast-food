# TOTO Fast Food — instrucciones del proyecto

Web de TOTO Fast Food (pollería y comida rápida, Perú), hecha por **Vitrina Sur**.
Se publica con **GitHub Pages** desde la rama `main`, carpeta raíz:
https://ricardo-montoya-2002.github.io/toto-fast-food/

Responde siempre en **español**. El dueño del repositorio, Ricardo, está aprendiendo: explica cada paso que él deba hacer a mano, en lenguaje simple.

## Archivos
- `index.html`: toda la web (HTML + CSS + JS en un solo archivo, sin frameworks ni build).
- `carta.js`: datos del negocio y **todos los precios** (`window.CARTA`). Es la fuente de verdad mientras no exista la base de datos, y será el **respaldo** cuando exista.
- `img/`: fotos en WebP.
- `.claude/agents/`: agentes `vitrina-frontend`, `vitrina-backend` y `vitrina-ventas`.
- `docs/PLAN-BASE-DE-DATOS.md`: plan de trabajo vigente.
- `backend/` (por crear): código de Google Apps Script.

## Reglas
1. **Nada de frameworks ni pasos de build.** GitHub Pages sirve los archivos tal cual.
2. **Mobile-first.** Se prueba en 375×667, 390×844 y 1440×800 sin scroll horizontal.
3. **El pedido por WhatsApp no se puede romper.** Si la base de datos falla o tarda, el cliente igual debe poder enviar su pedido por WhatsApp.
4. **El formato de `window.CARTA` es el contrato** entre la web y la base de datos. No cambies sus campos existentes; si agregas uno, que sea opcional.
5. **Sin secretos en el repositorio.** El repositorio es público.
6. Precios en soles, formato `S/ 12.00`. Teléfono de pedidos: 51981535896.
7. Respeta la identidad visual: amarillo mostaza `#F4A51C`, rojo `#D7261E`, ladrillo `#7E1716`, negro `#141414`; letras Anton, Barlow y Yellowtail.
8. Mensajes de commit en español, cortos y claros.

## Antes de dar algo por terminado
- Abre `index.html` y prueba: agregar platos, elegir salsas de alitas, enviar pedido, reservar.
- Revisa que no haya errores en la consola.
- Di qué debe hacer Ricardo a mano (por ejemplo, en su cuenta de Google) con pasos numerados.
