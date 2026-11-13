/**
 * TOTO Fast Food · Base de datos en Google Sheets (Apps Script)
 * ------------------------------------------------------------
 * Pestañas: Carta · Negocio · Pedidos · Clientes · Reservas
 *
 * GET  ?accion=carta  -> la carta en el mismo formato que window.CARTA (carta.js)
 * POST {tipo:"pedido", ...}  -> guarda el pedido (recalcula precios con la hoja)
 * POST {tipo:"reserva", ...} -> guarda la reserva
 *
 * La web envía el POST como text/plain para evitar el bloqueo CORS.
 * Menú "TOTO" en la hoja: configurar, ver pedidos de hoy, limpiar caché.
 */

const CACHE_SEG = 300;          // la carta se guarda 5 minutos en caché
const ENTREGAS = ['Delivery', 'Recojo en el local', 'Comer en el local'];
const ESTADOS = ['Nuevo', 'Confirmado', 'Entregado', 'Cancelado'];

// Datos de presentación de cada categoría (no viven en la hoja).
const CAT_META = {
  'pollo a la brasa':    { id: 'c-brasa', estilo: 'ladrillo', incluye: 'Papas crocantes · Ensalada · Cremas', foto: 'img/brasa_toto.webp' },
  'broaster y parrilla': { id: 'c-broaster', eco: 'Receta secreta', incluye: 'Con papas crocantes y ensalada', foto: 'img/parrilla.webp' },
  'salchipapas':         { id: 'c-salchi', incluye: 'Todas con papas crocantes', foto: 'img/salchipapa.webp' },
  'hamburguesas':        { id: 'c-hamb', incluye: 'Elige tu favorita', foto: 'img/hamburguesa.webp' },
  'alitas':              { id: 'c-alitas', estilo: 'ladrillo', tipo: 'alitas', incluye: 'Escoge tu salsa favorita', foto: 'img/alitas.webp' }
};

/* ====================== utilidades ====================== */
function libro_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function hoja_(nombre) {
  const h = libro_().getSheetByName(nombre);
  if (!h) throw new Error('Falta la pestaña "' + nombre + '"');
  return h;
}
function tabla_(nombre) {
  const datos = hoja_(nombre).getDataRange().getValues();
  const cab = datos.shift().map(c => String(c).trim().toLowerCase());
  return datos.filter(f => f.some(v => v !== '' && v !== null))
              .map(f => Object.fromEntries(cab.map((c, i) => [c, f[i]])));
}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
// Limpia texto que viene de la web. Si empieza con = + - @ la hoja lo tomaría como FÓRMULA
// (alguien podría inyectar una fórmula que robe datos al abrir la hoja). El apóstrofo lo deja como texto.
function txt_(v, max) {
  let s = String(v == null ? '' : v).replace(/[<>\u0000-\u001F]/g, ' ').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
function bool_(v) { return v === true || String(v).toUpperCase() === 'TRUE' || String(v).toUpperCase() === 'VERDADERO'; }
function num_(v) { const n = Number(String(v).replace(',', '.')); return isNaN(n) ? 0 : n; }
function slug_(s) { return 'c-' + String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-'); }
function soles_(n) { return 'S/ ' + Number(n).toFixed(2); }

/* ====================== la carta ====================== */
function construirCarta_() {
  const neg = {};
  tabla_('Negocio').forEach(f => { neg[String(f.clave).trim()] = f.valor; });
  const lista = s => String(s || '').split(',').map(x => x.trim()).filter(Boolean);

  const negocio = {
    nombre: String(neg.nombre || 'TOTO Fast Food'),
    whatsapp: String(neg.whatsapp || '').replace(/\D/g, ''),
    telefono: String(neg.telefono || ''),
    direccion: String(neg.direccion || ''),
    horario: String(neg.horario || ''),
    delivery: String(neg.delivery || ''),
    tapper: num_(neg.tapper),
    videoPortada: String(neg.video_portada || '')
  };

  const filas = tabla_('Carta').sort((a, b) => num_(a.orden) - num_(b.orden));
  const cats = [], porCat = {}, porProd = {};
  filas.forEach(f => {
    const catNom = String(f.categoria).trim();
    let cat = porCat[catNom];
    if (!cat) {
      const meta = CAT_META[catNom.toLowerCase()] || { id: slug_(catNom), incluye: '' };
      cat = Object.assign({ nombre: catNom }, meta, { productos: [] });
      porCat[catNom] = cat; cats.push(cat);
    }
    const id = String(f.id).trim();
    let p = porProd[id];
    if (!p) {
      p = { id: id, nombre: String(f.nombre), desc: String(f.descripcion || '') };
      if (f.etiqueta) p.etiqueta = String(f.etiqueta);
      if (f.foto) p.foto = String(f.foto);
      if (f.pedido) p.pedido = String(f.pedido);
      if (bool_(f.elegir_arroz)) p.elegirArroz = true;
      porProd[id] = p; cat.productos.push(p);
    }
    const disp = bool_(f.disponible);
    if (String(f.tamano || '').trim()) {
      p.tamanos = p.tamanos || [];
      const t = { nombre: String(f.tamano).trim(), precio: num_(f.precio) };
      if (num_(f.salsas)) t.salsas = num_(f.salsas);
      if (!disp) t.disponible = false;
      p.tamanos.push(t);
    } else {
      p.precio = num_(f.precio);
      if (!disp) p.disponible = false;
    }
  });
  // un producto con tamaños está agotado solo si todos sus tamaños lo están
  Object.values(porProd).forEach(p => {
    if (p.tamanos && p.tamanos.every(t => t.disponible === false)) p.disponible = false;
  });

  return {
    negocio: negocio,
    salsas: { dulces: lista(neg.salsas_dulces), saladas: lista(neg.salsas_saladas) },
    categorias: cats
  };
}

function cartaEnCache_() {
  const cache = CacheService.getScriptCache();
  const guardada = cache.get('carta');
  if (guardada) return JSON.parse(guardada);
  const carta = construirCarta_();
  cache.put('carta', JSON.stringify(carta), CACHE_SEG);
  return carta;
}

/* ====================== API web ====================== */
function doGet(e) {
  try {
    const accion = (e && e.parameter && e.parameter.accion) || 'carta';
    if (accion === 'carta') return json_(cartaEnCache_());
    if (accion === 'ping') return json_({ ok: true });
    return json_({ ok: false, error: 'Acción no válida' });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function doPost(e) {
  try {
    const cuerpo = (e && e.postData && e.postData.contents) || '{}';
    if (cuerpo.length > 10000) return json_({ ok: false, error: 'Envío demasiado grande' });
    const d = JSON.parse(cuerpo);
    if (d.web) return json_({ ok: true });                    // campo trampa: bots
    const tel = String(d.telefono || '').replace(/\D/g, '').replace(/^51/, '');
    if (!/^9\d{8}$/.test(tel)) return json_({ ok: false, error: 'Teléfono no válido' });
    if (!limite_(tel)) return json_({ ok: false, error: 'Demasiados envíos, intenta en unos minutos' });
    if (d.tipo === 'pedido') return json_(guardarPedido_(d, tel));
    if (d.tipo === 'reserva') return json_(guardarReserva_(d, tel));
    return json_({ ok: false, error: 'Tipo no válido' });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

// Límites contra abuso: máximo 5 envíos por teléfono y 60 en total cada 10 minutos
function limite_(tel) {
  const cache = CacheService.getScriptCache();
  const kTel = 'rl_' + tel, kTodos = 'rl_todos';
  const nTel = Number(cache.get(kTel) || 0), nTodos = Number(cache.get(kTodos) || 0);
  if (nTel >= 5 || nTodos >= 60) return false;
  cache.put(kTel, String(nTel + 1), 600);
  cache.put(kTodos, String(nTodos + 1), 600);
  return true;
}

function siguienteCodigo_(hoja, prefijo) {
  return prefijo + '-' + String(Math.max(1, hoja.getLastRow())).padStart(4, '0');
}

/* ====================== pedidos ====================== */
function guardarPedido_(d, tel) {
  const nombre = txt_(d.nombre, 60);
  const entrega = ENTREGAS.indexOf(d.entrega) >= 0 ? d.entrega : null;
  const direccion = txt_(d.direccion, 140);
  const nota = txt_(d.nota, 200);
  if (!nombre) return { ok: false, error: 'Falta el nombre' };
  if (!entrega) return { ok: false, error: 'Tipo de entrega no válido' };
  if (entrega === 'Delivery' && !direccion) return { ok: false, error: 'Falta la dirección' };
  if (!Array.isArray(d.items) || !d.items.length || d.items.length > 30) return { ok: false, error: 'Pedido vacío' };

  // precios SIEMPRE desde la hoja (no se confía en el navegador)
  const carta = construirCarta_();
  const prods = {};
  carta.categorias.forEach(c => c.productos.forEach(p => { prods[p.id] = p; }));
  const salsasValidas = carta.salsas.dulces.concat(carta.salsas.saladas);

  let subtotal = 0, platos = 0;
  const lineas = [];
  for (const it of d.items) {
    const p = prods[String(it.id)];
    if (!p) return { ok: false, error: 'Producto no existe: ' + it.id };
    const cant = Math.floor(Number(it.cantidad));
    if (!(cant >= 1 && cant <= 50)) return { ok: false, error: 'Cantidad no válida' };
    let precio, extra = [];
    if (p.tamanos) {
      const t = p.tamanos.find(x => x.nombre === String(it.tamano));
      if (!t) return { ok: false, error: 'Tamaño no válido en ' + p.nombre };
      if (t.disponible === false) return { ok: false, error: p.nombre + ' (' + t.nombre + ') está agotado' };
      precio = t.precio; extra.push(t.nombre);
      const salsas = Array.isArray(it.salsas) ? it.salsas.map(String).filter(s => salsasValidas.indexOf(s) >= 0) : [];
      if (t.salsas && salsas.length > t.salsas) return { ok: false, error: 'Demasiadas salsas' };
      if (salsas.length) extra.push('Salsas: ' + salsas.join(', '));
    } else {
      if (p.disponible === false) return { ok: false, error: p.nombre + ' está agotado' };
      precio = p.precio;
    }
    if (p.elegirArroz) extra.push(it.arroz === 'Arroz blanco' ? 'Arroz blanco' : 'Chaufa');
    subtotal += precio * cant; platos += cant;
    lineas.push(cant + ' x ' + (p.pedido || p.nombre) + (extra.length ? ' (' + extra.join(' · ') + ')' : '') + ' — ' + soles_(precio * cant));
  }
  const tapper = entrega === 'Comer en el local' ? 0 : platos * carta.negocio.tapper;
  const total = subtotal + tapper;

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const h = hoja_('Pedidos');
    const codigo = siguienteCodigo_(h, 'T');
    h.appendRow([new Date(), codigo, nombre, tel, entrega, direccion, lineas.join('\n'), subtotal, tapper, total, 'Nuevo', nota]);
    actualizarCliente_(tel, nombre, total);
    return { ok: true, codigo: codigo, subtotal: subtotal, tapper: tapper, total: total };
  } finally {
    lock.releaseLock();
  }
}

function actualizarCliente_(tel, nombre, total) {
  const h = hoja_('Clientes');
  const datos = h.getDataRange().getValues();
  const ahora = new Date();
  for (let i = 1; i < datos.length; i++) {
    if (String(datos[i][0]).replace(/\D/g, '') === tel) {
      h.getRange(i + 1, 2, 1, 3).setValues([[nombre, num_(datos[i][2]) + 1, num_(datos[i][3]) + total]]);
      h.getRange(i + 1, 6).setValue(ahora);
      return;
    }
  }
  h.appendRow([tel, nombre, 1, total, ahora, ahora]);
}

/* ====================== reservas ====================== */
function guardarReserva_(d, tel) {
  const nombre = txt_(d.nombre, 60);
  const personas = Math.floor(Number(d.personas));
  const dia = txt_(d.dia, 20), hora = txt_(d.hora, 10), nota = txt_(d.nota, 200);
  if (!nombre) return { ok: false, error: 'Falta el nombre' };
  if (!(personas >= 1 && personas <= 40)) return { ok: false, error: 'Número de personas no válido' };
  if (!dia || !hora) return { ok: false, error: 'Falta el día o la hora' };
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const h = hoja_('Reservas');
    const codigo = siguienteCodigo_(h, 'R');
    h.appendRow([new Date(), codigo, nombre, tel, personas, dia, hora, 'Nuevo', nota]);
    return { ok: true, codigo: codigo };
  } finally {
    lock.releaseLock();
  }
}

/* ====================== panel del dueño ====================== */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('TOTO')
    .addItem('Ver pedidos', 'irPedidos')
    .addItem('Ver reservas', 'irReservas')
    .addSeparator()
    .addItem('Actualizar la carta en la web ahora', 'limpiarCache')
    .addItem('Configurar la hoja (casillas y estados)', 'configurar')
    .addToUi();
}
function irPedidos() { libro_().setActiveSheet(hoja_('Pedidos')); }
function irReservas() { libro_().setActiveSheet(hoja_('Reservas')); }
function limpiarCache() {
  CacheService.getScriptCache().remove('carta');
  try { SpreadsheetApp.getActive().toast('La web mostrará los precios nuevos en unos segundos.', 'TOTO'); } catch (e) {}
}

/** Deja la hoja lista: casillas de "disponible", estados desplegables, formatos y colores. */
function configurar() {
  const max = 2000;
  // Carta: casillas en "disponible" y precios en soles
  const carta = hoja_('Carta');
  const cabC = carta.getRange(1, 1, 1, carta.getLastColumn()).getValues()[0].map(c => String(c).toLowerCase());
  const colDisp = cabC.indexOf('disponible') + 1, colPrecio = cabC.indexOf('precio') + 1, colArroz = cabC.indexOf('elegir_arroz') + 1;
  const filasC = Math.max(carta.getLastRow() - 1, 1);
  if (colDisp) carta.getRange(2, colDisp, filasC, 1).insertCheckboxes();
  if (colArroz) carta.getRange(2, colArroz, filasC, 1).insertCheckboxes();
  if (colPrecio) carta.getRange(2, colPrecio, filasC, 1).setNumberFormat('"S/ "0.00');

  const regla = SpreadsheetApp.newDataValidation().requireValueInList(ESTADOS, true).setAllowInvalid(false).build();
  [['Pedidos', 11, [1], [4], [8, 9, 10]], ['Reservas', 8, [1], [4], []]].forEach(([nom, colEstado, fechas, tels, soles]) => {
    const h = hoja_(nom);
    h.getRange(2, colEstado, max, 1).setDataValidation(regla);
    fechas.forEach(c => h.getRange(2, c, max, 1).setNumberFormat('dd/mm/yyyy hh:mm'));
    tels.forEach(c => h.getRange(2, c, max, 1).setNumberFormat('@'));
    soles.forEach(c => h.getRange(2, c, max, 1).setNumberFormat('"S/ "0.00'));
    const rango = h.getRange(2, 1, max, h.getLastColumn());
    const letra = String.fromCharCode(64 + colEstado);
    const reglas = [
      ['Nuevo', '#FFF2C2'], ['Confirmado', '#DDEBFF'], ['Entregado', '#DFF3E2'], ['Cancelado', '#EEEEEE']
    ].map(([v, color]) => SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$' + letra + '2="' + v + '"').setBackground(color).setRanges([rango]).build());
    h.setConditionalFormatRules(reglas);
  });
  const cli = hoja_('Clientes');
  cli.getRange(2, 1, max, 1).setNumberFormat('@');
  cli.getRange(2, 4, max, 1).setNumberFormat('"S/ "0.00');
  cli.getRange(2, 5, max, 2).setNumberFormat('dd/mm/yyyy hh:mm');

  ['Carta', 'Negocio', 'Pedidos', 'Clientes', 'Reservas'].forEach(n => {
    const h = hoja_(n);
    h.setFrozenRows(1);
    h.getRange(1, 1, 1, h.getLastColumn()).setFontWeight('bold').setBackground('#F4A51C');
  });
  limpiarCache();
}

/* ====================== pruebas desde el editor ====================== */
function probarCarta() { Logger.log(JSON.stringify(construirCarta_(), null, 2)); }
function probarPedido() {
  const r = guardarPedido_({
    nombre: 'Prueba', entrega: 'Recojo en el local', nota: 'PEDIDO DE PRUEBA, borrar',
    items: [{ id: 'broaster', cantidad: 2, arroz: 'Arroz blanco' }, { id: 'alitas', tamano: '8 alitas', cantidad: 1, salsas: ['BBQ ahumado', 'Acevichada'] }]
  }, '900000000');
  Logger.log(JSON.stringify(r));
}
