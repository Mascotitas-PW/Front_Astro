import { t, categoria as nombreCategoria } from '../i18n';

export default function Sidebar({ categorias, categoriaSeleccionada, onElegirCategoria }) {
  return (
    <aside className="sidebar">
      <h3>{t('categorias')}</h3>
      <ul>
        <li
          className={!categoriaSeleccionada ? "categoria-activa" : ""}
          onClick={() => onElegirCategoria(null)}
        >
          {t('todas')}
        </li>
        {categorias.map((categoria) => (
          <li
            key={categoria}
            className={categoriaSeleccionada === categoria ? "categoria-activa" : ""}
            onClick={() => onElegirCategoria(categoria)}
          >
            {nombreCategoria(categoria)}
          </li>
        ))}
      </ul>
    </aside>
  );
}