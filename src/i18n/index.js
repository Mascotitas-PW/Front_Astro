import { useSyncExternalStore } from 'react';

const T = [
  // ── comunes / layout ──
  ['buscar', 'Buscar productos...', 'Search products...'],
  ['historial', 'Mi historial de compras', 'My order history'],
  ['historialAdmin', 'Historial de compras', 'Order history'],
  ['domicilios', 'Mis domicilios', 'My addresses'],
  ['facturas', 'Mis facturas', 'My invoices'],
  ['dashboard', 'Dashboard', 'Dashboard'],
  ['carrito', 'Carrito', 'Cart'],
  ['salir', 'Salir', 'Log out'],
  ['entrar', 'Iniciar sesión', 'Log in'],
  ['heroTitulo', 'Todo lo que necesita tu mascota', 'Everything your pet needs'],
  ['heroSub', 'Envío a domicilio, pago en línea seguro.', 'Home delivery, secure online payment.'],
  ['todas', 'Todas', 'All'],
  ['categorias', 'Categorías', 'Categories'],
  ['agotado', 'Agotado', 'Sold out'],
  ['envioGratis', 'Envío gratis en compras mayores a $500 MXN', 'Free shipping on orders over $500 MXN'],
  ['legalTerminos', 'Términos y condiciones', 'Terms and conditions'],
  ['legalPrivacidad', 'Aviso de privacidad', 'Privacy notice'],
  ['navPrincipal', 'Navegación principal', 'Main navigation'],
  ['navLegal', 'Información legal', 'Legal information'],
  ['inicio', 'Mascotitas, inicio', 'Mascotitas, home'],
  ['offline', 'Sin conexión: mostrando lo que ya visitaste. Pagar y cotizar requieren internet.', 'You are offline: showing what you already visited. Checkout and shipping quotes need internet.'],
  ['sinRed', 'Sin conexión a internet. Inténtalo cuando vuelvas a estar en línea.', 'No internet connection. Try again when you are back online.'],
  ['idioma', 'English', 'Español'],
  ['cancelar', 'Cancelar', 'Cancel'],
  ['cerrar', 'Cerrar', 'Close'],
  ['cargando', 'Cargando...', 'Loading...'],
  ['masIva', '+ IVA', '+ VAT'],
  ['dias', '{n} días', '{n} days'],

  // ── Home ──
  ['home_cargando', 'Cargando productos', 'Loading products'],
  ['home_encontrados', '{n} productos encontrados', '{n} products found'],
  ['home_ninguno', 'No se encontraron productos.', 'No products found.'],
  ['home_error', 'Ocurrió un error: {e}', 'An error occurred: {e}'],
  ['home_todos', 'Todos los productos', 'All products'],
  ['home_de', 'Productos de {c}', 'Products in {c}'],
  ['home_catalogo', 'Catálogo de productos', 'Product catalog'],

  // ── DetalleProducto ──
  ['det_noEncontrado', 'Producto no encontrado.', 'Product not found.'],
  ['det_stock', 'Stock: {n} disponibles', 'Stock: {n} available'],
  ['det_cantidad', 'Cantidad:', 'Quantity:'],
  ['det_max', '(máx. {n})', '(max. {n})'],
  ['det_maxCarrito', '(máx. {n}, ya tienes {c} en el carrito)', '(max. {n}, you already have {c} in the cart)'],
  ['det_entrarAgregar', 'Inicia sesión para agregar', 'Log in to add'],
  ['det_todoCarrito', 'Ya tienes todo el stock en tu carrito', 'You already have all the stock in your cart'],
  ['det_agregar', 'Agregar al carrito', 'Add to cart'],
  ['det_volver', 'Volver al catálogo', 'Back to catalog'],

  // ── CartModal ──
  ['cart_titulo', 'Tu carrito', 'Your cart'],
  ['cart_cerrar', 'Cerrar carrito', 'Close cart'],
  ['cart_vacio', 'El carrito está vacío.', 'Your cart is empty.'],
  ['cart_cu', 'c/u', 'each'],
  ['cart_reducir', 'Reducir {x}', 'Decrease {x}'],
  ['cart_aumentar', 'Aumentar {x}', 'Increase {x}'],
  ['cart_eliminar', 'Eliminar {x}', 'Remove {x}'],
  ['cart_subtotal', 'Subtotal', 'Subtotal'],
  ['cart_envioIva', 'Envío e IVA', 'Shipping and VAT'],
  ['cart_seCalculan', 'Se calculan en checkout', 'Calculated at checkout'],
  ['cart_pagar', 'Proceder al pago', 'Proceed to payment'],

  // ── Checkout ──
  ['co_titulo', 'Confirmar compra', 'Confirm purchase'],
  ['co_entrarTit', 'Inicia sesión para pagar', 'Log in to pay'],
  ['co_entrarTxt', 'Necesitas una cuenta para completar tu compra.', 'You need an account to complete your purchase.'],
  ['co_irLogin', 'Ir a iniciar sesión', 'Go to log in'],
  ['co_paypal', 'Pagar con PayPal', 'Pay with PayPal'],
  ['co_carritoVacio', 'El carrito está vacío.', 'Your cart is empty.'],
  ['co_sinTarifas', 'No hay tarifas para esta dirección.', 'No rates for this address.'],
  ['co_noCotizo', 'No se pudo cotizar el envío.', 'Could not quote shipping.'],
  ['co_cotizaAntes', 'Cotiza el envío y selecciona una tarifa antes de pagar.', 'Get a shipping quote and select a rate before paying.'],
  ['co_cotizaSel', 'Cotiza el envío y selecciona una tarifa.', 'Get a shipping quote and select a rate.'],
  ['co_pagoSinPedido', 'El pago fue aprobado, pero no se pudo guardar el pedido: {e}', 'The payment was approved, but the order could not be saved: {e}'],
  ['co_noPago', 'No se pudo procesar el pago.', 'Could not process the payment.'],
  ['co_noPaypal', 'No se pudo completar el pago con PayPal.', 'Could not complete the PayPal payment.'],
  ['co_entrarCompra', 'Inicia sesión para completar tu compra.', 'Log in to complete your purchase.'],
  ['co_errConexion', 'Error de conexión con el servidor.', 'Server connection error.'],
  ['co_cpNoEncontrado', 'Código postal no encontrado.', 'Postal code not found.'],
  ['co_cpInvalido', 'Código postal inválido.', 'Invalid postal code.'],
  ['co_cpError', 'No se pudo consultar el código postal.', 'Could not look up the postal code.'],
  ['co_cpSinColonias', 'El código postal no tiene colonias disponibles.', 'This postal code has no neighborhoods available.'],
  ['co_alertCompra', 'Inicia sesión para continuar con tu compra.', 'Log in to continue your purchase.'],
  ['co_alertAgregar', 'Inicia sesión para agregar productos al carrito.', 'Log in to add products to the cart.'],
  ['co_alertStock', 'Solo hay {n} disponibles (ya tienes {c} en el carrito).', 'Only {n} available (you already have {c} in the cart).'],

  // ── validación de entrega (pedidos.js) ──
  ['v_nombre', 'Escribe tu nombre completo.', 'Enter your full name.'],
  ['v_direccion', 'Escribe una dirección de entrega válida.', 'Enter a valid delivery address.'],
  ['v_telefono', 'El teléfono debe tener 10 dígitos.', 'The phone number must have 10 digits.'],
  ['v_cp', 'El código postal debe tener 5 dígitos.', 'The postal code must have 5 digits.'],
  ['v_estadoCiudad', 'Completa estado, ciudad y colonia.', 'Fill in state, city and neighborhood.'],
  ['v_sesionCotizar', 'Inicia sesión para cotizar el envío.', 'Log in to quote shipping.'],
  ['v_sesionPagar', 'Inicia sesión para continuar con el pago.', 'Log in to continue with the payment.'],
  ['v_sinConfirmacion', 'No se recibió confirmación del pedido.', 'No order confirmation received.'],

  // ── FormularioEntrega ──
  ['ent_otro', '➕ Usar otro domicilio', '➕ Use another address'],
  ['ent_nombre', 'Nombre completo', 'Full name'],
  ['ent_phNombre', 'Ej. Juan Pérez', 'E.g. John Smith'],
  ['ent_direccion', 'Dirección de entrega', 'Delivery address'],
  ['ent_phDir', 'Calle y número', 'Street and number'],
  ['ent_cp', 'Código postal', 'Postal code'],
  ['ent_ph5', '5 dígitos', '5 digits'],
  ['ent_buscandoCp', 'Buscando código postal…', 'Looking up postal code…'],
  ['ent_manual', '{e}; completa los datos manualmente.', '{e}; fill in the details manually.'],
  ['ent_estado', 'Estado', 'State'],
  ['ent_ciudad', 'Ciudad o municipio', 'City or municipality'],
  ['ent_colonia', 'Colonia', 'Neighborhood'],
  ['ent_selColonia', 'Selecciona una colonia', 'Select a neighborhood'],
  ['ent_tel', 'Teléfono de contacto', 'Contact phone'],
  ['ent_ph10', '10 dígitos', '10 digits'],
  ['ent_consultando', 'Consultando tarifas…', 'Getting rates…'],
  ['ent_cotizar', 'Cotizar envío', 'Get shipping quote'],
  ['ent_paqueteria', 'Paquetería y servicio', 'Carrier and service'],
  ['ent_sinTarifas', 'No hay tarifas disponibles para esta dirección.', 'No rates available for this address.'],
  ['ent_guardar', 'Guardar este domicilio para mis próximas compras', 'Save this address for my next purchases'],
  ['ent_aliasLabel', 'Nombre del domicilio', 'Address name'],
  ['ent_phAlias', 'Casa, Trabajo...', 'Home, Work...'],
  ['ent_metodo', 'Método de pago', 'Payment method'],
  ['ent_tarjeta', 'Tarjeta de crédito / débito', 'Credit / debit card'],
  ['ent_efectivo', 'Efectivo contra entrega', 'Cash on delivery'],
  ['ent_procesando', 'Procesando pedido...', 'Processing order...'],
  ['ent_confirmar', 'Confirmar y enviar pedido', 'Confirm and place order'],

  // ── Mapa ──
  ['map_marca', 'Marca tu ubicación de entrega', 'Mark your delivery location'],
  ['map_usar', '📍 Usar mi ubicación', '📍 Use my location'],
  ['map_noCarga', 'No se pudo cargar el mapa.', 'Could not load the map.'],
  ['map_noEncontro', 'No encontramos esa dirección. Toca el mapa para marcar tu ubicación.', 'We could not find that address. Tap the map to mark your location.'],
  ['map_noBusco', 'No pudimos buscar la dirección. Toca el mapa para marcarla.', 'We could not search the address. Tap the map to mark it.'],
  ['map_sinGeo', 'Tu navegador no permite obtener la ubicación.', 'Your browser does not allow getting your location.'],
  ['map_noUbicacion', 'No pudimos obtener tu ubicación. Revisa los permisos o toca el mapa.', 'We could not get your location. Check permissions or tap the map.'],
  ['map_ok', '✓ La ubicación se guardará con tu pedido (puedes arrastrar el pin para ajustarla).', '✓ The location will be saved with your order (you can drag the pin to adjust it).'],
  ['map_osm', 'Abrir en OpenStreetMap', 'Open in OpenStreetMap'],

  // ── ResumenPedido / PedidoConfirmado ──
  ['res_titulo', 'Resumen del pedido', 'Order summary'],
  ['res_vacio', 'Tu carrito está vacío.', 'Your cart is empty.'],
  ['res_envio', 'Envío', 'Shipping'],
  ['res_cotiza', 'Cotiza para ver el costo', 'Get a quote to see the cost'],
  ['res_iva', 'IVA (16%)', 'VAT (16%)'],
  ['res_total', 'Total', 'Total'],
  ['ok_gracias', '¡Gracias por tu compra!', 'Thank you for your purchase!'],
  ['ok_pedido', 'Tu pedido #{id} fue registrado correctamente.', 'Your order #{id} was registered successfully.'],
  ['ok_cobrado', 'Total cobrado', 'Total charged'],
  ['ok_pagar', 'Total a pagar', 'Total to pay'],
  ['ok_estado', 'Estado', 'Status'],
  ['ok_volver', 'Volver a la tienda', 'Back to the store'],

  // ── Historial ──
  ['his_cargando', 'Cargando compras...', 'Loading orders...'],
  ['his_entrar', 'Inicia sesión para ver tus compras.', 'Log in to see your orders.'],
  ['his_vacio', 'Aún no hay compras registradas.', 'There are no orders yet.'],
  ['his_pedido', 'Pedido', 'Order'],
  ['his_fecha', 'Fecha', 'Date'],
  ['his_cliente', 'Cliente', 'Customer'],
  ['his_estatus', 'Estatus', 'Status'],
  ['his_ocultar', 'Ocultar', 'Hide'],
  ['his_ver', 'Ver detalle', 'View details'],
  ['his_facturarPedido', 'Facturar pedido', 'Invoice order'],
  ['his_facturarVenta', 'Facturar venta', 'Invoice sale'],
  ['his_nombre', 'Nombre:', 'Name:'],
  ['his_direccion', 'Dirección:', 'Address:'],
  ['his_telefono', 'Teléfono:', 'Phone:'],
  ['his_paqueteria', 'Paquetería:', 'Carrier:'],
  ['his_noReg', 'No registrado', 'Not provided'],
  ['his_productos', 'Productos', 'Products'],
  ['his_cargandoDet', 'Cargando detalle...', 'Loading details...'],
  ['his_producto', 'Producto {id}', 'Product {id}'],
  ['his_ubicacion', 'Ubicación de entrega', 'Delivery location'],
  ['his_sinMapa', 'Este pedido no tiene ubicación en el mapa.', 'This order has no location on the map.'],
  ['his_usuario', 'Usuario {id}', 'User {id}'],
  ['his_alertFactura', 'Factura {f} generada (estado: {e}). Puedes verla en "Facturas".', 'Invoice {f} generated (status: {e}). You can see it under "Invoices".'],
  ['his_alertVenta', 'Venta {f} facturada. Puedes verla en "Facturas".', 'Sale {f} invoiced. You can see it under "Invoices".'],

  // ── Facturas ──
  ['fac_tituloAdmin', 'Ventas facturadas', 'Invoiced sales'],
  ['fac_tituloCliente', 'Mis facturas', 'My invoices'],
  ['fac_entrar', 'Inicia sesión para ver tus facturas.', 'Log in to see your invoices.'],
  ['fac_cargando', 'Cargando facturas...', 'Loading invoices...'],
  ['fac_vacioAdmin', 'Aún no hay ventas facturadas.', 'There are no invoiced sales yet.'],
  ['fac_vacioCliente', 'Aún no hay facturas emitidas.', 'There are no invoices yet.'],
  ['fac_puedesAdmin', 'Factura la venta de un pedido entregado desde', 'Invoice the sale of a delivered order from'],
  ['fac_puedesCliente', 'Puedes solicitar la factura de un pedido entregado desde', 'You can request the invoice of a delivered order from'],
  ['fac_linkAdmin', 'el historial de compras', 'the order history'],
  ['fac_linkCliente', 'tu historial de compras', 'your order history'],
  ['fac_folio', 'Folio', 'Number'],
  ['fac_acciones', 'Acciones', 'Actions'],
  ['fac_ver', 'Ver', 'View'],
  ['fac_pdf', 'PDF / HTML', 'PDF / HTML'],
  ['fac_error', 'Error: {e}', 'Error: {e}'],

  // ── SolicitarFactura / RegistrarVenta ──
  ['sf_titulo', 'Solicitar factura — Pedido #{id}', 'Request invoice — Order #{id}'],
  ['sf_cargando', 'Cargando catálogos...', 'Loading catalogs...'],
  ['sf_guardados', 'Mis datos fiscales guardados', 'My saved tax details'],
  ['sf_otros', '➕ Usar otros datos', '➕ Use other details'],
  ['sf_rfc', 'RFC *', 'Tax ID (RFC) *'],
  ['sf_razon', 'Razón social o nombre *', 'Legal name *'],
  ['sf_regimen', 'Régimen fiscal *', 'Tax regime *'],
  ['sf_selecciona', 'Selecciona…', 'Select…'],
  ['sf_cp', 'Código postal fiscal *', 'Tax postal code *'],
  ['sf_dom', 'Domicilio fiscal (opcional)', 'Tax address (optional)'],
  ['sf_phDom', 'Calle, número, colonia, ciudad', 'Street, number, neighborhood, city'],
  ['sf_guardarChk', 'Guardar estos datos para mis próximas facturas', 'Save these details for my next invoices'],
  ['sf_perfil', 'Nombre de este perfil fiscal', 'Name of this tax profile'],
  ['sf_phPerfil', 'Mi empresa, RFC personal…', 'My company, personal RFC…'],
  ['sf_uso', 'Uso del CFDI *', 'CFDI use *'],
  ['sf_generando', 'Generando factura…', 'Generating invoice…'],
  ['sf_generar', 'Generar factura', 'Generate invoice'],
  ['rv_titulo', 'Facturar venta — Pedido #{id}', 'Invoice sale — Order #{id}'],
  ['rv_cliente', 'Cliente (opcional)', 'Customer (optional)'],
  ['rv_publico', 'Público en general', 'General public'],
  ['rv_forma', 'Forma de pago', 'Payment method'],
  ['rv_obs', 'Observaciones (opcional)', 'Notes (optional)'],
  ['rv_facturando', 'Facturando…', 'Invoicing…'],
  ['rv_facturar', 'Facturar venta', 'Invoice sale'],

  // ── Domicilios / Legal consent ──
  ['dom_titulo', 'Mis domicilios', 'My addresses'],
  ['dom_vacio', 'Aún no tienes domicilios guardados. Se guardan al comprar: marca “Guardar este domicilio” en el checkout.', 'You have no saved addresses yet. They are saved when you buy: check “Save this address” at checkout.'],
  ['dom_pred', 'Predeterminado', 'Default'],
  ['dom_conMapa', '✓ Con ubicación en el mapa', '✓ With map location'],
  ['dom_hacerPred', 'Hacer predeterminado', 'Make default'],
  ['dom_eliminar', 'Eliminar', 'Delete'],
  ['dom_confirmar', '¿Eliminar el domicilio "{a}"?', 'Delete the address "{a}"?'],
  ['dom_tienda', 'Ir a la tienda', 'Go to the store'],
  ['dom_tel', 'Tel.', 'Phone'],
  ['leg_titulo', 'Antes de continuar', 'Before you continue'],
  ['leg_txt', 'Para usar tu cuenta y comprar necesitas aceptar nuestros términos y el tratamiento de tus datos personales (nombre, contacto, domicilio, ubicación y datos fiscales).', 'To use your account and buy you need to accept our terms and the processing of your personal data (name, contact, address, location and tax details).'],
  ['leg_leerT', 'Leer términos y condiciones', 'Read terms and conditions'],
  ['leg_leerP', 'Leer aviso de privacidad', 'Read privacy notice'],
  ['leg_acepto', 'He leído y acepto los términos y condiciones y el aviso de privacidad.', 'I have read and accept the terms and conditions and the privacy notice.'],
  ['leg_no', 'No acepto', 'I do not accept'],
  ['leg_si', 'Aceptar y continuar', 'Accept and continue'],
  ['leg_guardando', 'Guardando...', 'Saving...'],

  // ── Login / Registro ──
  ['log_titulo', 'Iniciar sesión', 'Log in'],
  ['log_email', 'Email', 'Email'],
  ['log_phEmail', 'Ingresa tu email', 'Enter your email'],
  ['log_pass', 'Contraseña', 'Password'],
  ['log_phPass', 'Ingresa tu contraseña', 'Enter your password'],
  ['log_todos', 'Todos los campos son obligatorios.', 'All fields are required.'],
  ['log_malos', 'Usuario o contraseña incorrectos.', 'Wrong email or password.'],
  ['log_conexion', 'Error de conexión con el servidor de Mascotitas.', 'Connection error with the Mascotitas server.'],
  ['log_entrando', 'Entrando...', 'Logging in...'],
  ['log_o', 'o', 'or'],
  ['log_sinCuenta', '¿No tienes cuenta?', 'Do not have an account?'],
  ['log_registrarse', 'Registrarse', 'Sign up'],
  ['reg_titulo', 'Crear cuenta', 'Create account'],
  ['reg_usuario', 'Nombre de usuario', 'Username'],
  ['reg_phPass', 'Crea una contraseña', 'Create a password'],
  ['reg_pass2', 'Confirmar contraseña', 'Confirm password'],
  ['reg_phPass2', 'Repite tu contraseña', 'Repeat your password'],
  ['reg_noCoinciden', 'Las contraseñas no coinciden.', 'Passwords do not match.'],
  ['reg_corta', 'La contraseña debe tener al menos 6 caracteres.', 'The password must have at least 6 characters.'],
  ['reg_noConfirmo', 'El servidor no confirmó la creación de la cuenta.', 'The server did not confirm the account creation.'],
  ['reg_creada', 'Cuenta creada correctamente. Ahora inicia sesión.', 'Account created successfully. Now log in.'],
  ['reg_creando', 'Creando cuenta...', 'Creating account...'],
  ['reg_o', 'o regístrate con', 'or sign up with'],
  ['reg_yaTienes', '¿Ya tienes cuenta?', 'Already have an account?'],

  // ── Dashboard ──
  ['dash_estadisticas', 'Estadísticas', 'Statistics'],
  ['dash_stock', 'Stock en vivo', 'Live stock'],
  ['dash_crear', 'Crear producto', 'Create product'],
  ['dash_actualizar', 'Actualizar producto', 'Update product'],
  ['dash_eliminar', 'Eliminar producto', 'Delete product'],
  ['dash_restringido', 'Acceso restringido a administradores.', 'Access restricted to administrators.'],
  ['dash_producto', 'Producto', 'Product'],
  ['dash_categoria', 'Categoría', 'Category'],
  ['dash_precio', 'Precio', 'Price'],
  ['dash_stockCol', 'Stock', 'Stock'],
  ['dash_estado', 'Estado', 'Status'],
  ['dash_bajo', 'Bajo', 'Low'],
  ['dash_disponible', 'Disponible', 'Available'],
  ['dash_editar', 'Editar', 'Edit'],
  ['dash_actualizarDe', 'Actualizar: {n}', 'Update: {n}'],
  ['dash_guardarCambios', 'Guardar cambios', 'Save changes'],
  ['dash_descuenta', 'El stock se descuenta al instante cuando se confirma un pedido.', 'Stock is deducted instantly when an order is confirmed.'],
  ['dash_creado', 'Producto creado.', 'Product created.'],
  ['dash_actualizado', 'Producto actualizado.', 'Product updated.'],
  ['dash_eliminado', '"{n}" eliminado.', '"{n}" deleted.'],
  ['dash_confTit', '¿Eliminar producto?', 'Delete product?'],
  ['dash_confTxt', 'Se eliminará {n}. Esta acción no se puede deshacer.', '{n} will be deleted. This action cannot be undone.'],
  ['dash_si', 'Sí, eliminar', 'Yes, delete'],

  // ── FormularioProducto ──
  ['fp_nombre', 'Nombre', 'Name'],
  ['fp_precio', 'Precio (MXN)', 'Price (MXN)'],
  ['fp_peso', 'Peso del producto (kg)', 'Product weight (kg)'],
  ['fp_selecciona', 'Selecciona…', 'Select…'],
  ['fp_imagen', 'Imagen (JPG, PNG o WEBP, máx. 5 MB)', 'Image (JPG, PNG or WEBP, max. 5 MB)'],
  ['fp_vista', 'Vista previa', 'Preview'],
  ['fp_subiendo', 'Subiendo imagen…', 'Uploading image…'],
  ['fp_guardando', 'Guardando…', 'Saving…'],
  ['fp_eNombre', 'Escribe el nombre del producto.', 'Enter the product name.'],
  ['fp_ePrecio', 'El precio debe ser mayor a 0.', 'The price must be greater than 0.'],
  ['fp_eStock', 'El stock debe ser un entero de 0 o más.', 'Stock must be a whole number, 0 or more.'],
  ['fp_ePeso', 'El peso debe ser mayor a 0 kg.', 'The weight must be greater than 0 kg.'],
  ['fp_eCategoria', 'Elige una categoría.', 'Choose a category.'],
  ['fp_eImagen', 'Sube una imagen del producto.', 'Upload a product image.'],

  // ── Estadísticas ──
  ['est_titulo', 'Estadísticas', 'Statistics'],
  ['est_cargando', 'Cargando estadísticas...', 'Loading statistics...'],
  ['est_ventasTot', 'Ventas totales', 'Total sales'],
  ['est_pedidos', 'Pedidos', 'Orders'],
  ['est_ticket', 'Ticket promedio', 'Average ticket'],
  ['est_sinVentas', 'Aún no hay ventas registradas para graficar.', 'There are no sales to chart yet.'],
  ['est_30dias', 'Ventas de los últimos 30 días', 'Sales in the last 30 days'],
  ['est_ventas', 'Ventas', 'Sales'],
  ['est_topTit', 'Productos más vendidos (unidades)', 'Best-selling products (units)'],
  ['est_unidades', 'Unidades', 'Units'],
  ['est_porCat', 'Ventas por categoría', 'Sales by category'],
];

const ui = { es: {}, en: {} };
for (const [k, es, en] of T) { ui.es[k] = es; ui.en[k] = en; }

// Nombres de categoría que vienen de la BD (los desconocidos se muestran tal cual)
const categorias = { en: { Alimentos: 'Food', Juguetes: 'Toys', Accesorios: 'Accessories' } };

let loc = 'es';
const subs = new Set();
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const getLocale = () => loc;
export const otroIdioma = () => (loc === 'es' ? 'en' : 'es');
export const fechaLoc = () => (loc === 'en' ? 'en-US' : 'es-MX');
export const formatoFecha = (f) =>
  f ? new Date(f).toLocaleString(fechaLoc()) : '';

export function setLocale(l) {
  const nuevo = ui[l] ? l : 'es';
  if (nuevo === loc) return;
  loc = nuevo;
  if (typeof document !== 'undefined') document.documentElement.lang = nuevo;
  subs.forEach((f) => f());
}

// Cambia el idioma sin recargar y actualiza la URL (/ ↔ /en/)
export function toggleLocale() {
  const nuevo = otroIdioma();
  setLocale(nuevo);
  if (typeof history !== 'undefined') history.pushState(null, '', nuevo === 'en' ? `${base}/en/` : `${base}/`);
}

export const useLocale = () =>
  useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => loc, () => loc);

export function t(k, vars) {
  let s = ui[loc][k] ?? ui.es[k] ?? k;
  if (vars) for (const x in vars) s = s.replaceAll(`{${x}}`, vars[x]);
  return s;
}

export const categoria = (nombre) => categorias[loc]?.[nombre] ?? nombre;

// Estatus del pedido ("Pagado (PayPal)", "Pendiente de pago (Efectivo)", "Entregado"…)
export const estatus = (s = '') =>
  loc === 'en'
    ? s.replace('Pendiente de pago', 'Pending payment').replace('Pendiente', 'Pending')
        .replace('Pagado', 'Paid').replace('Entregado', 'Delivered').replace('Enviado', 'Shipped')
        .replace('Efectivo', 'Cash').replace('Tarjeta', 'Card')
    : s;