import { useCallback, useEffect, useState } from 'react';
import { obtenerUsuarioSesion } from '../auth/auth';
import {listarProductosAdmin, listarCategorias,
crearProducto, actualizarProducto, eliminarProducto,}from '../services/productosAdmin';
import { suscribirStock } from '../services/stockEnVivo';
import { urlImagen } from '../services/imagenes';
import { FormularioProducto } from './FormularioProducto';
import { Estadisticas } from './Estadisticas';
import { useStore } from '../store/useStore';

const OPCIONES = [
  { id: 'estadisticas', etiqueta: 'Estadísticas' },
  { id: 'stock', etiqueta: 'Stock' },
  { id: 'crear', etiqueta: 'Crear producto' },
  { id: 'actualizar', etiqueta: 'Actualizar producto' },
  { id: 'eliminar', etiqueta: 'Eliminar producto' },
];

const th = { textAlign: 'left', padding: '0.6rem', borderBottom: '2px solid #E8B93E' };
const td = { padding: '0.6rem', borderBottom: '1px solid #EADFC0', verticalAlign: 'middle' };
const boton = { border: 0, borderRadius: 8, padding: '0.4rem 0.9rem', cursor: 'pointer', color: '#fff' };

function InsigniaStock({ stock }) {
  const [fondo, texto] =
    stock <= 0 ? ['#A32D2D', 'Agotado'] : stock <= 5 ? ['#C98A00', 'Bajo'] : ['#3B7A3B', 'Disponible'];
  return (
    <span style={{ background: fondo, color: '#fff', borderRadius: 12, padding: '0.15rem 0.6rem', fontSize: '0.8rem' }}>
      {texto}
    </span>
  );
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
  const { recargarProductos } = useStore()

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

  // Mismo canal de stock que usa el detalle de producto; aquí se ve como tabla.
  useEffect(() => {
    if (!admin) return undefined;
    return suscribirStock(({ productoId, stock }) =>
      setProductos((prev) => prev.map((p) => (p.id === productoId ? { ...p, stock } : p))));
  }, [admin]);

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

  if (!admin) return <p style={{ padding: '2rem' }}>Acceso restringido a administradores.</p>;

  const tablaProductos = (renderAccion, conStock = false) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
      <thead>
        <tr>
          <th style={th}></th>
          <th style={th}>Producto</th>
          <th style={th}>Categoría</th>
          <th style={th}>Precio</th>
          <th style={th}>Stock</th>
          {conStock && <th style={th}>Estado</th>}
          {renderAccion && <th style={th}></th>}
        </tr>
      </thead>
      <tbody>
        {productos.map((p) => (
          <tr key={p.id}>
            <td style={td}>
              <img src={urlImagen(p.imagen)} alt="" style={{ width: 44, height: 44, objectFit: 'contain' }} />
            </td>
            <td style={td}>{p.nombre}</td>
            <td style={td}>{p.categoria}</td>
            <td style={td}>${Number(p.precio).toFixed(2)}</td>
            <td style={td}>{p.stock}</td>
            {conStock && <td style={td}><InsigniaStock stock={p.stock} /></td>}
            {renderAccion && <td style={td}>{renderAccion(p)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );

  let contenido = null;
  if (cargando) {
    contenido = <p>Cargando...</p>;
  } else if (opcion === 'crear') {
    contenido = (
      <>
        <h2>Crear producto</h2>
        <FormularioProducto
          categorias={categorias}
          guardando={guardando}
          textoBoton="Crear producto"
          onGuardar={(datos) => ejecutar(() => crearProducto(datos), 'Producto creado.')}
        />
      </>
    );
  } else if (opcion === 'actualizar') {
    contenido = editando ? (
      <>
        <h2>Actualizar: {editando.nombre}</h2>
        <FormularioProducto
          key={editando.id}
          inicial={editando}
          categorias={categorias}
          guardando={guardando}
          textoBoton="Guardar cambios"
          onCancelar={() => setEditando(null)}
          onGuardar={async (datos) => {
            const ok = await ejecutar(() => actualizarProducto(editando.id, datos), 'Producto actualizado.');
            if (ok) setEditando(null);
            return ok;
          }}
        />
      </>
    ) : (
      <>
        <h2>Actualizar producto</h2>
        {tablaProductos((p) => (
          <button style={{ ...boton, background: '#E8734A' }} onClick={() => setEditando(p)}>Editar</button>
        ))}
      </>
    );
  } else if (opcion === 'eliminar') {
    contenido = (
      <>
        <h2>Eliminar producto</h2>
        {tablaProductos((p) => (
          <button style={{ ...boton, background: '#A32D2D' }} onClick={() => setPorEliminar(p)}>Eliminar</button>
        ))}
      </>
    );
  } else if (opcion === 'stock') {
    contenido = (
      <>
        <h2>Stock <small style={{ fontSize: '0.8rem', color: '#3B7A3B' }}>● en vivo</small></h2>
        <p style={{ marginTop: 0 }}>El stock se descuenta cuando se confirma el pago de un pedido.</p>
        {tablaProductos(null, true)}
      </>
    );
  } else {
    contenido = <Estadisticas />;
  }

  return (
    <div style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem 2rem', alignItems: 'flex-start', color: '#3A2E22' }}>
      <aside style={{ background: '#fff', borderRadius: 20, padding: '1.5rem', width: 240, flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <h3 style={{ marginTop: 0, color: '#4A3623' }}>Panel de administración</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.4rem' }}>
          {OPCIONES.map((o) => (
            <li key={o.id}>
              <button
                onClick={() => cambiarOpcion(o.id)}
                style={{
                  width: '100%', textAlign: 'left', border: 0, cursor: 'pointer',
                  padding: '0.7rem 0.9rem', borderRadius: 12, fontWeight: 600, fontSize: '1rem',
                  background: opcion === o.id ? '#F3E3B8' : 'transparent', color: '#3A2E22',
                }}
              >
                {o.etiqueta}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section style={{ flex: 1, minWidth: 0 }}>
        {aviso && (
          <p style={{
            padding: '0.7rem 1rem', borderRadius: 8,
            background: aviso.tipo === 'ok' ? '#E3F1E3' : '#F7DCDC',
            color: aviso.tipo === 'ok' ? '#2E6B2E' : '#A32D2D',
          }}>
            {aviso.texto}
          </p>
        )}
        {contenido}
      </section>

      {porEliminar && (
        <div
          onClick={() => setPorEliminar(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', width: 'min(92vw, 400px)' }}>
            <h3 style={{ marginTop: 0 }}>¿Eliminar producto?</h3>
            <p>Se eliminará <strong>{porEliminar.nombre}</strong>. Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
              <button style={{ ...boton, background: '#888' }} onClick={() => setPorEliminar(null)}>Cancelar</button>
              <button
                style={{ ...boton, background: '#A32D2D' }}
                disabled={guardando}
                onClick={async () => {
                  const producto = porEliminar;
                  setPorEliminar(null);
                  await ejecutar(() => eliminarProducto(producto.id), `"${producto.nombre}" eliminado.`);
                  recargarProductos();
                }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Alias por si en otro archivo se importa como AdminPanel
export const AdminPanel = Dashboard;
export default Dashboard;
