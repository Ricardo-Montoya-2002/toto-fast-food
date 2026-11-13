/* =====================================================================
   CARTA DE TOTO FAST FOOD
   ---------------------------------------------------------------------
   Aquí están TODOS los precios y datos del negocio. Para cambiar un
   precio, cambia solo el número (sin "S/"). Ejemplo:  precio: 22
   También puedes abrir la web con  #precios  al final del enlace,
   cambiar los precios en pantalla y copiar este archivo ya actualizado.
   ===================================================================== */
window.CARTA = {
  "negocio": {
    "nombre": "TOTO Fast Food",
    "whatsapp": "51981535896",
    "telefono": "981 535 896",
    "direccion": "",
    "horario": "",
    "delivery": "El costo del delivery se confirma por WhatsApp según tu zona.",
    "tapper": 1,
    "videoPortada": ""
  },
  "salsas": {
    "dulces": ["BBQ ahumado", "BBQ picante", "Maracuyá picante", "Mojito", "Maracuyá", "Salsa Jack Daniels"],
    "saladas": ["Acevichada", "Olivo", "Crispy", "Pizzera", "Anticuchera", "Chimichurry", "Crispy picante", "Oriental"]
  },
  "categorias": [
    {
      "id": "c-brasa", "nombre": "Pollo a la Brasa", "estilo": "ladrillo",
      "incluye": "Papas crocantes · Ensalada · Cremas", "foto": "img/brasa_toto.webp",
      "productos": [
        { "id": "brasa-toto", "nombre": "Pollo a la Brasa Toto", "etiqueta": "Con chimichurri",
          "desc": "Papas crocantes, ensalada, chaufa al wok y full cremas.", "foto": "img/brasa_toto.webp",
          "tamanos": [ { "nombre": "1 pollo entero", "precio": 69 }, { "nombre": "1/2 pollo", "precio": 38 }, { "nombre": "1/4 de pollo", "precio": 22 }, { "nombre": "1/8 de pollo", "precio": 16 } ] },
        { "id": "brasa-clasico", "nombre": "Pollo a la Brasa Clásico",
          "desc": "Papas crocantes, ensalada y full cremas.", "foto": "img/brasa_clasico.webp",
          "tamanos": [ { "nombre": "1 pollo entero", "precio": 64 }, { "nombre": "1/2 pollo", "precio": 32 }, { "nombre": "1/4 de pollo", "precio": 17 }, { "nombre": "1/8 de pollo", "precio": 13 } ] }
      ]
    },
    {
      "id": "c-broaster", "nombre": "Broaster y parrilla", "eco": "Receta secreta",
      "incluye": "Con papas crocantes y ensalada", "foto": "img/parrilla.webp",
      "productos": [
        { "id": "broaster", "nombre": "Broaster Toto", "etiqueta": "Receta secreta", "precio": 22, "elegirArroz": true,
          "desc": "1/4 de pollo broaster, papas crocantes, chaufa o arroz blanco y ensalada fresca.", "foto": "img/broaster.webp" },
        { "id": "parrilla", "nombre": "Parrilla Ahumada Toto", "precio": 22, "elegirArroz": true,
          "desc": "1/4 de filete de pollo, papas crocantes, chaufa o arroz blanco y ensalada.", "foto": "img/parrilla.webp" },
        { "id": "chicharron", "nombre": "Chicharrón de Pollo", "precio": 20,
          "desc": "Con papas crocantes y ensalada.", "foto": "img/chicharron.webp" }
      ]
    },
    {
      "id": "c-salchi", "nombre": "Salchipapas", "incluye": "Todas con papas crocantes", "foto": "img/salchipapa.webp",
      "productos": [
        { "id": "salchi-clasica", "nombre": "Clásica", "pedido": "Salchipapa clásica", "precio": 11, "desc": "Papas crocantes y salchicha ahumada." },
        { "id": "salchi-royal", "nombre": "Royal", "pedido": "Salchipapa royal", "precio": 15, "desc": "Papas, salchicha ahumada y huevo frito." },
        { "id": "salchi-mixta", "nombre": "Mixta", "pedido": "Salchipapa mixta", "precio": 18, "desc": "Papas, salchicha y chorizo ahumados y huevo frito." },
        { "id": "salchipollo", "nombre": "Salchipollo", "precio": 18, "desc": "Papas, pollo deshilachado, salchicha ahumada y chaufa al wok." },
        { "id": "salchipollo-toto", "nombre": "Salchipollo Toto", "etiqueta": "La más completa", "precio": 22, "desc": "Papas, pollo deshilachado, salchicha ahumada, chaufa al wok y huevo frito." }
      ]
    },
    {
      "id": "c-hamb", "nombre": "Hamburguesas", "incluye": "Elige tu favorita", "foto": "img/hamburguesa.webp",
      "productos": [
        { "id": "hamb-brasa", "nombre": "Pollo a la brasa", "pedido": "Hamburguesa de pollo a la brasa", "precio": 15, "desc": "Hamburguesa de pollo a la brasa." },
        { "id": "hamb-saltado-pollo", "nombre": "Saltado de pollo", "pedido": "Hamburguesa de saltado de pollo", "precio": 15, "desc": "Hamburguesa de saltado de pollo." },
        { "id": "hamb-lomo", "nombre": "Lomo saltado", "pedido": "Hamburguesa de lomo saltado", "precio": 15, "desc": "Hamburguesa de lomo saltado." },
        { "id": "hamb-jq", "nombre": "Jamón y queso", "pedido": "Hamburguesa de jamón y queso", "precio": 12, "desc": "Hamburguesa de jamón y queso." }
      ]
    },
    {
      "id": "c-alitas", "nombre": "Alitas", "estilo": "ladrillo", "tipo": "alitas",
      "incluye": "Escoge tu salsa favorita", "foto": "img/alitas.webp",
      "productos": [
        { "id": "alitas", "nombre": "Alitas", "desc": "Elige la cantidad y tus salsas.", "foto": "img/alitas.webp",
          "tamanos": [
            { "nombre": "4 alitas", "precio": 17, "salsas": 1 }, { "nombre": "6 alitas", "precio": 22, "salsas": 1 },
            { "nombre": "8 alitas", "precio": 27, "salsas": 2 }, { "nombre": "10 alitas", "precio": 32, "salsas": 2 },
            { "nombre": "12 alitas", "precio": 38, "salsas": 3 }, { "nombre": "16 alitas", "precio": 50, "salsas": 4 },
            { "nombre": "20 alitas", "precio": 62, "salsas": 4 }, { "nombre": "30 alitas", "precio": 89, "salsas": 6 } ] }
      ]
    }
  ]
};
