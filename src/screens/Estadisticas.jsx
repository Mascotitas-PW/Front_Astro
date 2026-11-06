import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { fetchGraphQL } from '../graphql/client';

const QUERY = `
  query {
    estadisticas {
      totalVentas totalPedidos ticketPromedio
      ventasPorDia { fecha total pedidos }
      topProductos { productoId nombre unidades ingresos }
      ventasPorCategoria { categoria ingresos }
    }
  }`;

const COLORES = ['#E8734A', '#E8B93E', '#3B7A3B', '#4A3623', '#7A9E9F', '#B5651D'];

const dinero = (n) => Number(n).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
const diaCorto = (f) => { const [, m, d] = f.split('-'); return `${d}/${m}`; };

const tarjeta = { background: '#fff', borderRadius: 16, padding: '1.2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' };

function Kpi({ titulo, valor }) {
  return (
    <div style={{ ...tarjeta, flex: '1 1 180px' }}>
      <div style={{ fontSize: '0.85rem', color: '#7A6A55' }}>{titulo}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#4A3623' }}>{valor}</div>
    </div>
  );
}

function Panel({ titulo, children }) {
  return (
    <div style={{ ...tarjeta, minWidth: 0 }}>
      <h3 style={{ marginTop: 0, color: '#4A3623' }}>{titulo}</h3>
      <div style={{ width: '100%', height: 280 }}>{children}</div>
    </div>
  );
}

export function Estadisticas() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGraphQL(QUERY)
      .then((d) => setDatos(d.estadisticas))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p style={{ color: '#A32D2D' }}>{error}</p>;
  if (!datos) return <p>Cargando estadísticas...</p>;

  const sinVentas = datos.totalPedidos === 0;

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <h2 style={{ margin: 0 }}>Estadísticas</h2>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Kpi titulo="Ventas totales" valor={dinero(datos.totalVentas)} />
        <Kpi titulo="Pedidos" valor={datos.totalPedidos} />
        <Kpi titulo="Ticket promedio" valor={dinero(datos.ticketPromedio)} />
      </div>

      {sinVentas ? (
        <p>Aún no hay ventas registradas para graficar.</p>
      ) : (
        <>
          <Panel titulo="Ventas de los últimos 30 días">
            <ResponsiveContainer>
              <LineChart data={datos.ventasPorDia}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EADFC0" />
                <XAxis dataKey="fecha" tickFormatter={diaCorto} interval={4} />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  labelFormatter={diaCorto}
                  formatter={(v, nombre) => [nombre === 'Ventas' ? dinero(v) : v, nombre]}
                />
                <Line type="monotone" dataKey="total" name="Ventas" stroke="#E8734A" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            <Panel titulo="Productos más vendidos (unidades)">
              <ResponsiveContainer>
                <BarChart data={datos.topProductos} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EADFC0" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="nombre" width={130} />
                  <Tooltip />
                  <Bar dataKey="unidades" name="Unidades" fill="#E8B93E" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            <Panel titulo="Ventas por categoría">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={datos.ventasPorCategoria} dataKey="ingresos" nameKey="categoria" outerRadius={95} label>
                    {datos.ventasPorCategoria.map((_, i) => (
                      <Cell key={i} fill={COLORES[i % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => dinero(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

export default Estadisticas;
