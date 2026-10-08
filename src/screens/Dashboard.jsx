import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { fetchGraphQL } from "../graphql/client";        
import { obtenerUsuarioSesion } from '../auth/auth';    

const Q_TODOS = `query TodosLosPedidos { pedidos { id fecha status total usuarioId } }`;

const dinero = (n) => Number(n).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
const esCancelado = (p) => String(p.status).toLowerCase() === 'cancelado';
const tarjeta = { background: 'white', borderRadius: 12, padding: '1rem 1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' };

export function Dashboard() {
  const usuario = obtenerUsuarioSesion();
  const esAdmin = usuario?.rol?.toLowerCase() === 'admin';

  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!esAdmin) return;
    fetchGraphQL(Q_TODOS)
      .then((d) => setPedidos(d.pedidos))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [esAdmin]);

  // Todo se calcula en el front a partir de la lista cruda de pedidos
  const { porDia, porEstatus, ingresosTotales, comprasTotales } = useMemo(() => {
    const dias = new Map();
    const estatus = new Map();
    let ingresos = 0;
    let compras = 0;

    for (const p of pedidos) {
      estatus.set(p.status, (estatus.get(p.status) ?? 0) + 1);
      if (esCancelado(p)) continue; // cancelados no cuentan como ingreso ni como compra

      const dia = String(p.fecha).slice(0, 10); // YYYY-MM-DD
      const fila = dias.get(dia) ?? { dia, ingresos: 0, compras: 0 };
      fila.ingresos += Number(p.total);
      fila.compras += 1;
      dias.set(dia, fila);

      ingresos += Number(p.total);
      compras += 1;
    }

    return {
      porDia: [...dias.values()].sort((a, b) => a.dia.localeCompare(b.dia)),
      porEstatus: [...estatus.entries()].map(([nombre, cantidad]) => ({ nombre, cantidad })),
      ingresosTotales: ingresos,
      comprasTotales: compras,
    };
  }, [pedidos]);

  if (!esAdmin) return <p style={{ padding: '2rem' }}>Acceso restringido a administradores.</p>;
  if (cargando) return <p style={{ padding: '2rem' }}>Cargando dashboard...</p>;
  if (error) return <p style={{ padding: '2rem', color: '#A32D2D' }}>{error}</p>;

  return (
    <section style={{ maxWidth: 1000, margin: '2rem auto', padding: '0 1rem' }}>
      <h2 style={{ color: '#4A3623' }}>Dashboard</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ ...tarjeta, flex: 1, minWidth: 200 }}>
          <small>Ingresos (sin cancelados)</small>
          <h3 style={{ margin: '0.25rem 0 0' }}>{dinero(ingresosTotales)}</h3>
        </div>
        <div style={{ ...tarjeta, flex: 1, minWidth: 200 }}>
          <small>Compras (sin cancelados)</small>
          <h3 style={{ margin: '0.25rem 0 0' }}>{comprasTotales}</h3>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        <div style={tarjeta}>
          <h4>Ingresos por día</h4>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={porDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip formatter={(v) => dinero(v)} />
              <Line type="monotone" dataKey="ingresos" stroke="#E8734A" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={tarjeta}>
          <h4>Cantidad de compras por día</h4>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={porDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="compras" fill="#E8B93E" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tercera gráfica provisional con datos que ya existen.
            Cuando agregues Usuario.FechaRegistro, se reemplaza por "Nuevos usuarios por día". */}
        <div style={tarjeta}>
          <h4>Pedidos por estatus</h4>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={porEstatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#4A3623" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}