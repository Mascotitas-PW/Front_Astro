export default function Sidebar({ categorias, categoriaSeleccionada, onElegirCategoria }) {
  return (
    <aside className="sidebar">
      <h3>Categorías</h3>
      <ul>
        <li
          className={!categoriaSeleccionada ? "categoria-activa" : ""}
          onClick={() => onElegirCategoria(null)}
        >
          Todas
        </li>
        {categorias.map((categoria) => (
          <li
            key={categoria}
            className={categoriaSeleccionada === categoria ? "categoria-activa" : ""}
            onClick={() => onElegirCategoria(categoria)}
          >
            {categoria}
          </li>
        ))}
      </ul>
    </aside>
  );
}