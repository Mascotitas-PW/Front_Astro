# Mascotitas — Frontend

Tienda en línea de productos para mascotas, construida con **Astro** y **React**, instalable como **PWA** y desplegada en GitHub Pages.

**Sitio:** https://mascotitas-pw.github.io/Front_Astro/

## Tecnologías

| Área | Tecnología |
|---|---|
| Framework | Astro + React (renderizado en cliente con `client:only="react"`) |
| Estilos | Tailwind CSS y estilo neumórfico propio (`Neumorfismo.css`, `global.css`) |
| Datos | GraphQL por `fetch` y subscriptions en vivo con `graphql-ws` |
| Estado | Store propio con `useSyncExternalStore` (`useStore`) |
| Gráficas | Recharts |
| Pagos | Mercado Pago (Card Payment Brick), efectivo y transferencia |
| Otros servicios | Google Sign-In, Google Maps (mapa de entrega) |
| PWA | `@vite-pwa/astro` (manifiesto y Service Worker con Workbox) |
| CI/CD | GitHub Actions, despliegue a GitHub Pages |

## Funcionalidades actuales

**Cliente**
- Catálogo con búsqueda por nombre y filtro por categoría.
- Detalle de producto con control de cantidad según el stock disponible.
- Carrito con subtotal, envío y total (envío gratis arriba de $500 MXN, de lo contrario $99 MXN).
- Registro e inicio de sesión con correo y contraseña o con Google.
- Checkout con datos de entrega, mapa que ubica la dirección y tres métodos de pago: tarjeta, efectivo contra entrega y transferencia SPEI.
- Historial de compras con el detalle de cada pedido.
- Stock actualizado en tiempo real.

**Administrador**
- Panel con estadísticas (ventas totales, pedidos, ticket promedio, ventas de los últimos 30 días, productos más vendidos y ventas por categoría).
- Vista de stock con indicadores de disponibilidad.
- Crear, actualizar y eliminar productos, con subida de imagen.
- Historial con todas las compras de los clientes.

**PWA**
- Manifiesto web y Service Worker generados en cada compilación; la app se puede instalar y sus recursos estáticos se sirven desde el precaché.

## Estructura

```text
src/
├── pages/index.astro        # Punto de entrada (<head>, manifiesto y <App client:only="react" />)
├── App.jsx                  # Navegación entre pantallas según el estado
├── auth/                    # Sesión (sessionStorage), botón de Google y estilos de login
├── components/              # CartModal, DetalleProducto, ProductoCard, PayPalButton, Mapa, Skeleton
├── graphql/client.js        # Endpoint, token y fetchGraphQL
├── hooks/                   # useStore, useBrickMercadoPago
├── layout/                  # TopBar, Sidebar, Hero, ContextSection, Footer
├── screens/                 # Home, Login, Register, Checkout, Historial, Dashboard, Estadisticas, etc.
├── services/                # pedidos, productosAdmin, imagenes, stockEnVivo
└── screens|components/styles/  # Neumorfismo.css, global.css
```

La navegación no usa rutas: `useStore` guarda la pantalla actual (`HOME`, `LOGIN`, `REGISTER`, `DETALLE_PRODUCTO`, `CHECKOUT`, `HISTORIAL`, `DASHBOARD`) y `App.jsx` muestra la que corresponde.

## Variables de entorno

Se definen en un archivo `.env` local (que está en `.gitignore`) y, para el despliegue, en las variables del repositorio de GitHub.

| Variable | Uso |
|---|---|
| `PUBLIC_GRAPHQL_URL` | URL del backend GraphQL (si falta usa `https://back-astro.onrender.com/graphql`) |
| `PUBLIC_MP_KEY` | Llave pública de Mercado Pago |
| `PUBLIC_GOOGLE_CLIENT_ID` | Client ID para el inicio de sesión con Google |
| `PUBLIC_GOOGLE_MAPS_KEY` | Llave de Google Maps (si falta, el mapa no se muestra) |
| `PUBLIC_PAYPAL_CLIENT_ID` | Client ID de PayPal |
| `PUBLIC_PAYPAL_ENVIRONMENT` | `sandbox` (por defecto) o `production` |
| `PUBLIC_PAYPAL_API_URL` | Base de la API de pagos de PayPal (por defecto, la del backend) |

Ejemplo de `.env`:

```env
PUBLIC_GRAPHQL_URL=http://localhost:5097/graphql
PUBLIC_MP_KEY=tu_llave_publica
PUBLIC_GOOGLE_CLIENT_ID=tu_client_id
PUBLIC_GOOGLE_MAPS_KEY=tu_llave_de_maps
```

## Ejecución local

Requisitos: Node.js 22 y el backend en ejecución (ver `README_back.md`).

```bash
npm install
npm run dev        # servidor de desarrollo
npm run build      # compilación de producción en dist/
npm run preview    # vista previa de la compilación
```

Mientras se desarrolla, si el backend remoto no responde, el catálogo intenta conectarse a `http://localhost:5097/graphql`.

## PWA y rutas base

El sitio se publica en el subdirectorio `/Front_Astro/` (`base: '/Front_Astro/'` en `astro.config.mjs`). Por eso el manifiesto, el `scope` y el `start_url` deben respetar ese prefijo, y los recursos propios se enlazan con `import.meta.env.BASE_URL` en lugar de rutas absolutas desde `/`.

Para verificarla: abre el sitio, entra a DevTools → Application → Service Workers y Manifest, y comprueba que el Service Worker esté activo y que `manifest.webmanifest` cargue con estado 200.

## CI/CD

El workflow `Front CI/CD` se ejecuta en cada push y pull request a `main`: instala con `npm ci` (Node 22) y compila con las variables `PUBLIC_GRAPHQL_URL` y `PUBLIC_MP_KEY`. En `main`, además, despliega `dist/` en GitHub Pages. El lint y las pruebas están comentados por ahora.

## Notas

- La sesión (token y datos de usuario) se guarda en `sessionStorage`, así que se pierde al cerrar la pestaña.
- El carrito vive en memoria y se vacía al cerrar sesión.
- El componente `PayPalButton` y los endpoints de PayPal del backend ya existen, pero el botón todavía no está integrado en la pantalla de checkout.
