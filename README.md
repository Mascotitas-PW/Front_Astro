# Mascotitas — Front-end

Interfaz de la tienda Mascotitas hecha con **Astro** y **React**. Es una aplicación de una sola URL con navegación por estado, estilo **neumórfico**, **responsiva**, **bilingüe (es/en)** e **instalable como PWA**.

## Tecnologías

|Área|Herramienta|
|---|---|
|Framework|Astro + `@astrojs/react` (isla `client:only="react"`)|
|i18n|Astro i18n: `es` (por defecto, sin prefijo) y `en` (`/en/`)|
|PWA|`@vite-pwa/astro` (manifest + service worker con Workbox)|
|Estado|Store propio con `useSyncExternalStore`|
|Datos|GraphQL por `fetch` + suscripciones con `graphql-ws`|
|Pagos|Mercado Pago (Brick de tarjeta) y PayPal (SDK v6)|
|Mapa|Leaflet + OpenStreetMap + Nominatim|
|Gráficas|Recharts|
|Inicio de sesión|Google Identity Services|
|Estilos|CSS propio (`global.css`, `Neumorfismo.css`, `fase1.css`)|

## Estructura

```text
Front_Astro/
├── astro.config.mjs          site, base '/Front_Astro/', i18n, PWA
├── public/                   favicon, icons/, productos/ (imágenes del catálogo)
└── src/
    ├── pages/
    │   ├── index.astro       → /Front_Astro/      (español)
    │   └── en/index.astro    → /Front_Astro/en/   (inglés)
    ├── layout/Base.astro     <head> único: viewport, lang, hreflang, manifest
    ├── App.jsx               Selecciona la pantalla según el estado
    ├── screens/              Home, Login, Register, Checkout, Historial, Dashboard,
    │                         Domicilios, Facturas, Estadisticas, Legal…
    ├── components/           CartModal, DetalleProducto, PayPalButton, Mapa,
    │                         ProductoCard, SolicitarFactura, ConsentimientoLegal…
    ├── layout/               TopBar, Sidebar, Hero, Footer, ContextSection
    ├── hooks/                useStore (estado global), useBrickMercadoPago
    ├── services/             pedidos, domicilios, facturas, imagenes,
    │                         productosAdmin, legal, stockEnVivo
    ├── graphql/client.js     Endpoint, token y fetchGraphQL
    ├── auth/                 auth.js (sesión), Btngoogle.jsx
    └── styles/               global.css, Neumorfismo.css, fase1.css, auth.css
```

## Instalación

Requisitos: **Node.js 18+** y el back-end en marcha (local o el de Render).

```bash
npm install
npm run dev        # http://localhost:4321/Front_Astro/
npm run build      # genera dist/ (incluye dist/en/index.html)
npm run preview    # sirve el build para probar la PWA
```

### Variables de entorno (`.env`)

|Variable|Descripción|
|---|---|
|`PUBLIC_GRAPHQL_URL`|URL de `/graphql` del back. Por defecto `https://back-astro.onrender.com/graphql`|
|`PUBLIC_GOOGLE_CLIENT_ID`|ID de cliente de Google (si falta, se muestra un aviso)|
|`PUBLIC_MP_KEY`|Public key de Mercado Pago|
|`PUBLIC_PAYPAL_CLIENT_ID`|Client ID de PayPal|
|`PUBLIC_PAYPAL_ENVIRONMENT`|`sandbox` (defecto) o `production`|

Ejemplo para desarrollo local:

```env
PUBLIC_GRAPHQL_URL=http://localhost:5097/graphql
PUBLIC_GOOGLE_CLIENT_ID=...
PUBLIC_MP_KEY=TEST-...
PUBLIC_PAYPAL_CLIENT_ID=...
```

> Las variables `PUBLIC_*` quedan visibles en el navegador: solo van claves públicas, nunca secretos.

## Pantallas

|Pantalla (`pantalla`)|Acceso|Descripción|
|---|---|---|
|`HOME`|Público|Catálogo con búsqueda, categorías y stock en vivo|
|`DETALLE_PRODUCTO`|Público|Ficha del producto y selector de cantidad|
|`LOGIN` / `REGISTER`|Público|Correo/contraseña o Google|
|`CHECKOUT`|Sesión|Entrega, cotización de envío, método de pago|
|`HISTORIAL`|Sesión|Pedidos con detalle, mapa y botón de facturar|
|`DOMICILIOS`|Sesión|Domicilios guardados|
|`FACTURAS`|Sesión|Facturas emitidas (XML, PDF/HTML)|
|`DASHBOARD`|Admin|Estadísticas, stock en vivo y CRUD de productos|
|`TERMINOS` / `PRIVACIDAD`|Público|Textos legales (versionados en `legal.js`)|

Para ir a otra pantalla se usa `cambiarPantalla('NOMBRE')` del store. La tienda no tiene rutas internas.

## Funcionamiento

- **Sesión:** el token JWT y los datos del usuario se guardan en `localStorage` (`auth.js`). Se sincronizan entre pestañas con el evento `storage`.
- **Catálogo:** se guarda en caché local para mostrarse al instante y se refresca en segundo plano; se actualiza solo con las suscripciones `onStockActualizado` y `onProductoCambiado`.
- **Checkout:** el total que se muestra es informativo; el back recalcula el monto real. El pago con tarjeta usa el Brick de Mercado Pago, el de PayPal crea y captura la orden en el back.
- **Consentimiento legal:** la primera vez (y cada vez que sube `VERSION_LEGAL`) se pide aceptar términos y aviso de privacidad.
- **Carrito:** vive en memoria; se vacía al cerrar sesión o recargar la página.

## Responsive, idiomas y PWA (Práctica 12)

- **Viewport:** `width=device-width, initial-scale=1, viewport-fit=cover`.
- **CSS mobile-first** con puntos de ajuste en **360 / 768 / 1200 px**, sin scroll horizontal.
- **Orientación y altura:** unidades `dvh`; ajustes para `landscape` de poca altura.
- **Safe areas:** `env(safe-area-inset-*)` en barra superior, carrito, modales y pie.
- **i18n:** `defaultLocale: 'es'`, `locales: ['es','en']`, `prefixDefaultLocale: false`; `<html lang>`, `hreflang` y `x-default` en `Base.astro`; selector de idioma en la barra superior.
- **PWA:** `display: standalone`, `scope` y `start_url` en `/Front_Astro/`, íconos de 192 y 512 px (uno `maskable`). Para probarla, usa `npm run build && npm run preview`, instala desde el navegador y abre la ventana instalada.

## Despliegue (GitHub Pages)

`astro.config.mjs` define `site: 'https://mascotitas-pw.github.io'` y `base: '/Front_Astro/'`. Después de `npm run build`, se publica el contenido de `dist/`. Todos los enlaces a archivos públicos deben usar `import.meta.env.BASE_URL` para respetar la subcarpeta.

## Problemas conocidos

- Los nombres de producto y categoría no se traducen (vienen de la base de datos).
- Cambiar de idioma recarga la página y vacía el carrito; se recomienda guardarlo en `localStorage`.
- `Historial.jsx` solicita `guiaNumero`, `urlRastreo` y `envioEstado`, campos que el back aún no expone en `Pedido`; mientras tanto el botón **Facturar pedido** no aparece.
- `productosAdmin.js` repite el campo `productos` en la consulta `Q_PRODUCTOS` (la segunda versión sin `pesoKg`); debe quedar una sola.
- `ResumenPedido.jsx` dibuja dos filas de "Envío" y `Domicilios.jsx` dos párrafos de dirección por tarjeta; conviene dejar solo la versión completa.
- `useCartStore.js` calcula un envío fijo que ya no se usa (el costo real viene de la cotización).