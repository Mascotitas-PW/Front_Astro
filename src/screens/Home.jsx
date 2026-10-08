import { useStore } from "../store/useStore";
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
        <main>
          <Hero />
          {error && <p className="error">Ocurrió un error: {error}</p>}
          <section className="grid-productos">
            {cargando
              ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} />)
              : productosVisibles.length === 0
                ? <p>No se encontraron productos.</p>
                : productosVisibles.map((producto) => (
                    <ProductoCard
                      key={producto.id}
                      producto={producto}
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