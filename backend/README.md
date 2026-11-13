# Backend de TOTO (Google Sheets + Apps Script)

- Hoja: **TOTO . BASE DE DATOS** (pestañas Carta, Negocio, Pedidos, Clientes, Reservas), en la cuenta de Google de Ricardo.
- Código: `Code.gs`, pegado en Extensiones → Apps Script de esa hoja.
- URL de la aplicación web: la que está en `carta.js` → `negocio.api`.

## Probar
- Carta: abre la URL con `?accion=carta` al final.
- Desde el editor de Apps Script: ejecuta `probarCarta` o `probarPedido`.

## Si cambias Code.gs
Implementar → Gestionar implementaciones → lápiz → Versión: **Nueva versión** → Implementar. Así la URL no cambia.

## Menú TOTO (en la hoja)
- **Actualizar la carta en la web ahora**: para que un precio nuevo se vea al instante (si no, tarda hasta 5 minutos).
- **Configurar la hoja**: vuelve a poner casillas, estados y formatos si se desordenan.
