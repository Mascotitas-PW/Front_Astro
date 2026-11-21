const ui = {
  es: {
    buscar: 'Buscar productos...', historial: 'Mi historial de compras', historialAdmin: 'Historial de compras',
    domicilios: 'Mis domicilios', facturas: 'Mis facturas', dashboard: 'Dashboard', carrito: 'Carrito',
    salir: 'Salir', entrar: 'Iniciar sesión', heroTitulo: 'Todo lo que necesita tu mascota',
    heroSub: 'Envío a domicilio, pago en línea seguro.', todas: 'Todas', categorias: 'Categorías',
    agotado: 'Agotado', envioGratis: 'Envío gratis en compras mayores a $500 MXN',
    legalTerminos: 'Términos y condiciones', legalPrivacidad: 'Aviso de privacidad',
    navPrincipal: 'Navegación principal', navLegal: 'Información legal', inicio: 'Mascotitas, inicio',
    offline: 'Sin conexión: mostrando lo que ya visitaste. Pagar y cotizar requieren internet.',
    sinRed: 'Sin conexión a internet. Inténtalo cuando vuelvas a estar en línea.',
    idioma: 'English',
  },
  en: {
    buscar: 'Search products...', historial: 'My order history', historialAdmin: 'Order history',
    domicilios: 'My addresses', facturas: 'My invoices', dashboard: 'Dashboard', carrito: 'Cart',
    salir: 'Log out', entrar: 'Log in', heroTitulo: 'Everything your pet needs',
    heroSub: 'Home delivery, secure online payment.', todas: 'All', categorias: 'Categories',
    agotado: 'Sold out', envioGratis: 'Free shipping on orders over $500 MXN',
    legalTerminos: 'Terms and conditions', legalPrivacidad: 'Privacy notice',
    navPrincipal: 'Main navigation', navLegal: 'Legal information', inicio: 'Mascotitas, home',
    offline: 'You are offline: showing what you already visited. Checkout and shipping quotes need internet.',
    sinRed: 'No internet connection. Try again when you are back online.',
    idioma: 'Español',
  },
};

// Nombres de categoría que vienen de la BD (los desconocidos se muestran tal cual)
const categorias = {
  en: { Alimentos: 'Food', Juguetes: 'Toys', Accesorios: 'Accessories' },
};

let loc = 'es';
export const setLocale = (l) => { loc = ui[l] ? l : 'es'; };
export const getLocale = () => loc;
export const t = (k) => ui[loc][k] ?? ui.es[k] ?? k;
export const categoria = (nombre) => categorias[loc]?.[nombre] ?? nombre;

const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const urlOtroIdioma = () => (loc === 'es' ? `${base}/en/` : `${base}/`);
export const otroIdioma = () => (loc === 'es' ? 'en' : 'es');