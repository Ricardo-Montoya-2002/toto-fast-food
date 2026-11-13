# Plan: base de datos de TOTO Fast Food

**Objetivo:** que la web guarde pedidos, clientes frecuentes y reservas, y que el dueño cambie precios y marque platos agotados desde su celular, sin tocar código.

**Decisión:** Google Sheets + Google Apps Script publicado como aplicación web.
- Gratis, sin servidor que mantener.
- El dueño usa la app de Google Sheets en su celular.
- GitHub Pages sigue sirviendo la web; Apps Script es la "API".

Agente responsable: `vitrina-backend` (fases 1 a 3) y `vitrina-frontend` (fase 4).

---

## Fase 1 — La hoja de cálculo "TOTO · Base de datos"

Una hoja con 5 pestañas. La fila 1 son los encabezados (no se cambian de nombre).

| Pestaña | Columnas |
| --- | --- |
| **Carta** | categoria · id · nombre · descripcion · tamano · precio · salsas · disponible · orden |
| **Negocio** | clave · valor (whatsapp, telefono, direccion, horario, delivery, tapper) |
| **Pedidos** | fecha · codigo · nombre · telefono · entrega · direccion · detalle · subtotal · tapper · total · estado · nota |
| **Clientes** | telefono · nombre · pedidos · total_gastado · primer_pedido · ultimo_pedido |
| **Reservas** | fecha_registro · codigo · nombre · telefono · personas · dia · hora · estado · nota |

- **Carta:** una fila por producto, o por tamaño cuando el producto tiene varios (pollo a la brasa: entero, 1/2, 1/4, 1/8; alitas: 4 a 30). `salsas` solo en alitas. `disponible` es una casilla de verificación: desmarcada = "Agotado" en la web.
- **Pedidos y Reservas:** `estado` es una lista desplegable (Nuevo, Confirmado, Entregado, Cancelado).
- Llenar la Carta inicial a partir de `carta.js` (generar un CSV para importar).

Entregable: `backend/plantilla/*.csv` (una por pestaña) y los pasos para crear la hoja e importarlos.

## Fase 2 — Apps Script (`backend/Code.gs`)

Publicado como **Aplicación web** (Ejecutar como: yo; Acceso: cualquier persona).

**`doGet(e)`**
- `?accion=carta` → devuelve JSON con **exactamente el formato de `window.CARTA`** (negocio + salsas + categorias/productos/tamanos), armado desde las pestañas Carta y Negocio. Los productos no disponibles salen con `"disponible": false`.
- Usar `CacheService` (5 minutos) para responder rápido.

**`doPost(e)`** — recibe JSON enviado como `text/plain` (evita el bloqueo CORS):
- `{ "tipo": "pedido", ... }`
  - **Recalcula precios y total con la pestaña Carta**; nunca confía en el total que manda el navegador.
  - Genera `codigo` corto (ej. `T-0142`), guarda en Pedidos con estado "Nuevo".
  - Actualiza Clientes por teléfono (suma pedidos y total, fechas).
  - Responde `{ ok: true, codigo, total }`.
- `{ "tipo": "reserva", ... }` → guarda en Reservas, responde `{ ok: true, codigo }`.

**Protecciones** (la URL es pública):
- Validar todo: cantidades enteras 1 a 50, textos máximo 140 caracteres, teléfono peruano de 9 dígitos, ids que existan en la Carta.
- Campo trampa (honeypot) vacío; si viene lleno, ignorar.
- Límite por teléfono con `CacheService` (máximo 5 envíos en 10 minutos).
- `LockService` al escribir, para que dos pedidos simultáneos no se pisen.

## Fase 3 — Panel del dueño (en la misma hoja)

- Formato condicional: pedidos "Nuevo" en amarillo.
- Menú personalizado **TOTO** con: "Pedidos de hoy" (filtro) y "Limpiar caché de la carta" (para ver un precio nuevo al instante).
- Guía de una página para el dueño (`docs/GUIA-DUENO.md`): cambiar un precio, marcar agotado, ver pedidos, confirmar una reserva.

## Fase 4 — Conectar la web (`index.html`)

- `carta.js` gana un campo opcional `negocio.api` con la URL de la aplicación web.
- **Al cargar:** si hay `api`, pedir `?accion=carta` (máximo 4 segundos). Si responde bien, usar esos datos; si falla, seguir con `carta.js` sin avisar al cliente.
- Mostrar "Agotado" y bloquear el botón de los productos con `disponible: false`.
- **Formulario de pedido:** agregar campo **teléfono** (9 dígitos) y una línea de aviso de privacidad ("Usamos tu nombre y teléfono solo para tu pedido y promociones de TOTO").
- **Al enviar pedido:** primero `POST` a la API (máximo 3 segundos); con el `codigo` recibido, abrir WhatsApp con el mensaje que incluya "Pedido T-0142". Si la API falla o tarda, abrir WhatsApp igual, sin código.
- **Reservas:** reemplazar el botón actual por una hoja con nombre, teléfono, personas, día y hora → `POST` a la API → WhatsApp con el resumen.
- El editor `#precios` se mantiene solo para cuando no hay `api`; si hay `api`, mostrar "Los precios se cambian en la hoja de Google".

## Lo que Ricardo hace a mano (no se puede automatizar desde aquí)

1. Crear la hoja en su Google Drive (o en la cuenta de su primo) e importar los CSV.
2. Extensiones → Apps Script → pegar `backend/Code.gs` → Implementar → Nueva implementación → Aplicación web.
3. Copiar la URL de la aplicación web y ponerla en `carta.js` → `negocio.api`.
4. Compartir la hoja con su primo (editor).

## Criterios de aceptación

- [ ] Cambiar un precio en la hoja se ve en la web en menos de 5 minutos (o al instante con "Limpiar caché").
- [ ] Desmarcar `disponible` muestra el plato como "Agotado" y no se puede pedir.
- [ ] Un pedido de prueba aparece en Pedidos con el total correcto, actualiza Clientes y abre WhatsApp con el código.
- [ ] Con la API apagada o la URL mal escrita, la web sigue mostrando la carta (de `carta.js`) y el pedido sigue llegando por WhatsApp.
- [ ] Un total manipulado desde el navegador se guarda con el total real calculado por la hoja.
- [ ] Una reserva de prueba aparece en Reservas y abre WhatsApp.
- [ ] Sin scroll horizontal en 375, 390 y 1440 px; sin errores en consola.
