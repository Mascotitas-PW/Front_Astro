import { useState } from 'react';
import { subirImagen, urlImagen } from '../services/imagenes';

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
    const form = e.currentTarget;
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
        form.reset();
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
    <form onSubmit={enviar} className="neu-card form-producto">
      <div className="form-grid">
        <label className="field span-2">Nombre
          <input name="nombre" value={datos.nombre} onChange={cambiar} />
        </label>
        <label className="field">Precio (MXN)
          <input name="precio" type="number" step="0.01" min="0" value={datos.precio} onChange={cambiar} />
        </label>
        <label className="field">Stock
          <input name="stock" type="number" step="1" min="0" value={datos.stock} onChange={cambiar} />
        </label>
        <label className="field span-2">Categoría
          <select name="categoriaId" value={datos.categoriaId} onChange={cambiar}>
            <option value="">Selecciona…</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </label>
      </div>

      <div style={{ display: 'grid', gap: '1rem', alignContent: 'start' }}>
        <label className="field">Imagen (JPG, PNG o WEBP, máx. 5 MB)
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={elegirArchivo} />
        </label>
        <div className="neu-inset previa">
          {previa ? <img src={previa} alt="Vista previa" /> : <span className="nota">Vista previa</span>}
        </div>
      </div>

      <div className="span-2" style={{ gridColumn: '1 / -1', display: 'grid', gap: '1rem' }}>
        {error && <div className="alerta alerta-error">{error}</div>}
        <div className="acciones">
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
