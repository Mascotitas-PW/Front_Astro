import { useCallback, useEffect, useState } from 'react';
import { obtenerUsuarioSesion } from '../auth/auth';
import {
  listarProductosAdmin, listarCategorias,
  crearProducto, actualizarProducto, eliminarProducto,
} from '../services/productosAdmin';
import { suscribirStock, suscribirProductos } from '../services/stockEnVivo';
import { urlImagen, SIN_IMAGEN } from '../services/imagenes';
import { dinero } from '../services/pedidos';
import { FormularioProducto } from './FormularioProducto';
import { Estadisticas } from './Estadisticas';
import { useStore } from '../hooks/useStore';
import { t } from '../i18n';

const OPCIONES = [
  { id: 'estadisticas', etiqueta: 'Estadísticas' },
  { id: 'stock', etiqueta: 'Stock en vivo' },
  { id: 'crear', etiqueta: 'Crear producto' },
  { id: 'actualizar', etiqueta: 'Actualizar producto' },
  { id: 'eliminar', etiqueta: 'Eliminar producto' },
];

function InsigniaStock({ stock }) {
  const [clase, texto] = stock <= 0 ? ['badge-bad', 'Agotado'] : stock <= 5 ? ['badge-warn', 'Bajo'] : ['badge-ok', 'Disponible'];
  return <span className={`badge ${clase}`}>{t(texto)}</span>;
}

export function Dashboard() {
  const usuario = obtenerUsuarioSesion();
  const admin = usuario?.rol?.toLowerCase() === 'admin';

  const [opcion, setOpcion] = useState('estadisticas');
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [porEliminar, setPorEliminar] = useState(null);
  const [aviso, setAviso] = useState(null);
  const { recargarProductos } = useStore();

  const recargar = useCallback(async () => {
    try {
      const [prods, cats] = await Promise.all([listarProductosAdmin(), listarCategorias()]);
      setProductos(prods);
      setCategorias(cats);
    } catch (e) {
      setAviso({ tipo: 'error', texto: e.message });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (admin) recargar();
    else setCargando(false);
  }, [admin, recargar]);

  // En vivo: crear/editar/eliminar recarga la lista; el stock se actualiza al instante
  useEffect(() => {
    if (!admin) return undefined;
    const offProductos = suscribirProductos(() => recargar());
    const offStock = suscribirStock(({ productoId, stock }) =>
      setProductos((prev) => prev.map((p) => (p.id === productoId ? { ...p, stock } : p))));
    return () => { offProductos(); offStock(); };
  }, [admin, recargar]);

  async function ejecutar(accion, mensajeOk) {
    setGuardando(true);
    setAviso(null);
    try {
      await accion();
      setAviso({ tipo: 'ok', texto: mensajeOk });
      await recargar();
      return true;
    } catch (e) {
      setAviso({ tipo: 'error', texto: e.message });
      return false;
    } finally {
      setGuardando(false);
    }
  }

  function cambiarOpcion(id) {
    setOpcion(id);
    setEditando(null);
    setAviso(null);
  }

  if (!admin) return <main className="page">{t('Acceso restringido a administradores.')}</main>;

  const tablaProductos = (renderAccion, conEstado = false) => (
    <div className="tabla-wrap">
      <table className="tabla">
        <thead>
          <tr>
            <th></th>
            <th>{t('Producto')}</th>
            <th>{t('Categoría')}</th>
            <th>{t('Precio')}</th>
            <th>{t('Stock')}</th>
            {conEstado && <th>{t('Estado')}</th>}
            {renderAccion && <th></th>}
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>
                <img
                  src={urlImagen(p.imagen) || SIN_IMAGEN}
                  alt=""
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = SIN_IMAGEN; }}
                />
              </td>
              <td>{p.nombre}</td>
              <td>{p.categoria}</td>
              <td>{dinero(p.precio)}</td>
              <td><strong>{p.stock}</strong></td>
              {conEstado && <td><InsigniaStock stock={p.stock} /></td>}
              {renderAccion && <td>{renderAccion(p)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  let contenido;
  if (cargando) {
    contenido = <p>{t('Cargando...')}</p>;
  } else if (opcion === 'crear') {
    contenido = (
      <>
        <h2>{t('Crear producto')}</h2>
        <FormularioProducto
          categorias={categorias}
          guardando={guardando}
          textoBoton={t('Crear producto')}
          onGuardar={(datos) => ejecutar(() => crearProducto(datos), t('Producto creado.'))}
        />
      </>
    );
  } else if (opcion === 'actualizar') {
    contenido = editando ? (
      <>
        <h2>{t('Actualizar')}: {editando.nombre}</h2>
        <FormularioProducto
          key={editando.id}
          inicial={editando}
          categorias={categorias}
          guardando={guardando}
          textoBoton={t('Guardar cambios')}
          onCancelar={() => setEditando(null)}
          onGuardar={async (datos) => {
            const ok = await ejecutar(() => actualizarProducto(editando.id, datos), t('Producto actualizado.'));
            if (ok) setEditando(null);
            return ok;
          }}
        />
      </>
    ) : (
      <>
        <h2>{t('Actualizar producto')}</h2>
        {tablaProductos((p) => (
          <button className="neu-btn neu-btn-sm neu-btn-primary" onClick={() => setEditando(p)}>{t('Editar')}</button>
        ))}
      </>
    );
  } else if (opcion === 'eliminar') {
    contenido = (
      <>
        <h2>{t('Eliminar producto')}</h2>
        {tablaProductos((p) => (
          <button className="neu-btn neu-btn-sm neu-btn-danger" onClick={() => setPorEliminar(p)}>{t('Eliminar')}</button>
        ))}
      </>
    );
  } else if (opcion === 'stock') {
    contenido = (
      <>
        <h2>{t('Stock en vivo')}</h2>
        <p style={{ marginTop: 0 }}>{t('El stock se descuenta al instante cuando se confirma un pedido.')}</p>
        {tablaProductos(null, true)}
      </>
    );
  } else {
    contenido = <Estadisticas />;
  }

  return (
    <div className="dash">
      <aside className="neu-card dash-menu">
        <h3>{t('Dashboard')}</h3>
        <ul>
          {OPCIONES.map((o) => (
            <li key={o.id}>
              <button className={opcion === o.id ? 'activo' : ''} onClick={() => cambiarOpcion(o.id)}>
                {t(o.etiqueta)}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="dash-contenido">
        {aviso && <div className={`alerta ${aviso.tipo === 'ok' ? 'alerta-ok' : 'alerta-error'}`}>{aviso.texto}</div>}
        {contenido}
      </section>

      {porEliminar && (
        <div className="modal-fondo" onClick={() => setPorEliminar(null)}>
          <div className="neu-card modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t('¿Eliminar producto?')}</h3>
            <p>
              {t('Se eliminará')} <strong>{porEliminar.nombre}</strong>. {t('Esta acción no se puede deshacer.')}
            </p>
            <div className="acciones">
              <button className="neu-btn" onClick={() => setPorEliminar(null)}>{t('Cancelar')}</button>
              <button
                className="neu-btn neu-btn-danger"
                disabled={guardando}
                onClick={async () => {
                  const producto = porEliminar;
                  setPorEliminar(null);
                  await ejecutar(() => eliminarProducto(producto.id), `"${producto.nombre}" ${t('eliminado.')}`);
                  recargarProductos();
                }}
              >
                {t('Sí, eliminar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const AdminPanel = Dashboard;
export default Dashboard;