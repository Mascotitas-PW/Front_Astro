import { useStore } from "../hooks/useStore";
import Sidebar from "../layout/Sidebar";
import Hero from "../layout/Hero";
import ContextSection from "../layout/ContextSection";
import Footer from "../layout/Footer";
import ProductoCard from "../components/ProductoCard";
import Skeleton from "../components/Skeleton";

export function Home() {
  const {
    productos,
    categoriaSeleccionada,
    busqueda,
    seleccionarCategoria,
    seleccionarProducto,
    cargando,
    error,
  } = useStore();

  const categorias = [...new Set(productos.map((producto) => producto.categoria).filter(Boolean))];

  const productosVisibles = productos.filter((producto) => {
    const coincideCategoria = !categoriaSeleccionada || producto.categoria === categoriaSeleccionada;
    return coincideCategoria && producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
  });

  return (
    <div className="layout">
      <div className="layout-body">
        <Sidebar
          categorias={categorias}
          categoriaSeleccionada={categoriaSeleccionada}
          onElegirCategoria={seleccionarCategoria}
        />
        <main id="contenido">
          <Hero />

          {error && (
            <p className="error" role="alert">
              Ocurrió un error: {error}
            </p>
          )}

          <h2 className="sr-only">
            {categoriaSeleccionada ? `Productos de ${categoriaSeleccionada}` : "Todos los productos"}
          </h2>

          <p className="sr-only" role="status" aria-live="polite">
            {cargando ? "Cargando productos" : `${productosVisibles.length} productos encontrados`}
          </p>

          <section className="grid-productos" aria-busy={cargando} aria-label="Catálogo de productos">
            {cargando
              ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} />)
              : productosVisibles.length === 0
                ? <p>No se encontraron productos.</p>
                : productosVisibles.map((producto, index) => (
                    <ProductoCard
                      key={producto.id}
                      producto={producto}
                      prioridad={index < 2}
                      onVer={() => seleccionarProducto(producto)}
                    />
                  ))}
          </section>
          <ContextSection />
        </main>
      </div>
      <Footer />
    </div>
  );
}