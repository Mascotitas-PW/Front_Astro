import { useState } from 'react';
import { subirImagen, urlImagen } from '../services/imagenes';

const campo = { display: 'grid', gap: 4, marginBottom: '0.9rem' };
const entrada = { padding: '0.6rem', borderRadius: 8, border: '1px solid #D9C9A0', fontSize: '1rem' };
const boton = { border: 0, borderRadius: 8, padding: '0.6rem 1.2rem', cursor: 'pointer', color: '#fff', fontWeight: 600 };

const VACIO = { nombre: '', precio: '', stock: '', categoriaId: '', imagen: '' };

export function FormularioProducto({
  inicial = null, categorias = [], guardando = false,
  textoBoton = 'Guardar', onGuardar, onCancelar,
}) {
  const [datos, setDatos] = useState(
    inicial
      ? {
          nombre: inicial.nombre ?? '',
          precio: inicial.precio ?? '',
          stock: inicial.stock ?? '',
          categoriaId: inicial.categoriaId ?? '',
          imagen: inicial.imagen ?? '',
        }
      : VACIO,
  );
  const [archivo, setArchivo] = useState(null);
  const [vista, setVista] = useState(null);
  const [error, setError] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const cambiar = (e) => setDatos((d) => ({ ...d, [e.target.name]: e.target.value }));

  function elegirArchivo(e) {
    const f = e.target.files?.[0];
    setArchivo(f ?? null);
    setVista(f ? URL.createObjectURL(f) : null);
  }

  async function enviar(e) {
    e.preventDefault();
    setError(null);

    if (datos.nombre.trim().length < 2) return setError('Escribe el nombre del producto.');
    if (!(Number(datos.precio) > 0)) return setError('El precio debe ser mayor a 0.');
    if (!Number.isInteger(Number(datos.stock)) || Number(datos.stock) < 0)
      return setError('El stock debe ser un entero de 0 o más.');
    if (!datos.categoriaId) return setError('Elige una categoría.');
    if (!archivo && !datos.imagen) return setError('Sube una imagen del producto.');

    try {
      let imagen = datos.imagen;
      if (archivo) {
        setSubiendo(true);
        imagen = await subirImagen(archivo);
      }

      const ok = await onGuardar({ ...datos, imagen });

      if (ok && !inicial) {
        setDatos(VACIO);
        setArchivo(null);
        setVista(null);
        e.target.reset();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubiendo(false);
    }
  }

  const ocupado = guardando || subiendo;
  const previa = vista || (datos.imagen ? urlImagen(datos.imagen) : null);

  return (
  <form onSubmit={enviar} className="neu-card grid w-full max-w-6xl gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_300px]">
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="grid gap-2 font-semibold sm:col-span-2">Nombre
        <input className="neu-inset px-4 py-3" name="nombre" value={datos.nombre} onChange={cambiar} />
      </label>
      <label className="grid gap-2 font-semibold">Precio (MXN)
        <input className="neu-inset px-4 py-3" name="precio" type="number" step="0.01" min="0" value={datos.precio} onChange={cambiar} />
      </label>
      <label className="grid gap-2 font-semibold">Stock
        <input className="neu-inset px-4 py-3" name="stock" type="number" step="1" min="0" value={datos.stock} onChange={cambiar} />
      </label>
      <label className="grid gap-2 font-semibold sm:col-span-2">Categoría
        <select className="neu-inset px-4 py-3" name="categoriaId" value={datos.categoriaId} onChange={cambiar}>
          <option value="">Selecciona…</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </label>
    </div>

    <div className="grid content-start gap-4">
      <label className="grid gap-2 font-semibold">Imagen (JPG, PNG o WEBP, máx. 5 MB)
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={elegirArchivo} className="neu-inset p-3 text-sm" />
      </label>
      <div className="neu-inset grid h-56 place-items-center overflow-hidden p-3">
        {previa ? <img src={previa} alt="Vista previa" className="h-full w-full object-contain" /> : <span className="text-sm opacity-60">Vista previa</span>}
      </div>
    </div>

    <div className="grid gap-3 lg:col-span-2">
      {error && <p className="font-semibold text-red-700">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={ocupado} className="neu-btn neu-btn-primary">
          {subiendo ? 'Subiendo imagen…' : guardando ? 'Guardando…' : textoBoton}
        </button>
        {onCancelar && <button type="button" onClick={onCancelar} className="neu-btn">Cancelar</button>}
      </div>
    </div>
  </form>
);
}
export default FormularioProducto;