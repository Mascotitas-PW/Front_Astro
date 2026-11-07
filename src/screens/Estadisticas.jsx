import { useCallback, useEffect, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { fetchGraphQL } from '../graphql/client';
import { suscribirPedidos } from '../services/stockEnVivo';
import { dinero } from '../services/pedidos';

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
const diaCorto = (f) => { const [, m, d] = f.split('-'); return `${d}/${m}`; };

function Kpi({ titulo, valor }) {
  return (
    <div className="neu-card">
      <div className="kpi-titulo">{titulo}</div>
      <div className="kpi-valor">{valor}</div>
    </div>
  );
}

function Panel({ titulo, children }) {
  return (
    <div className="neu-card panel">
      <h3>{titulo}</h3>
      <div className="panel-grafica">{children}</div>
    </div>
  );
}

export function Estadisticas() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);

  const cargar = useCallback(
    () => fetchGraphQL(QUERY).then((d) => { setDatos(d.estadisticas); setError(null); }).catch((e) => setError(e.message)),
    [],
  );

  // Se recalcula solo cuando entra un pedido nuevo (suscripción en vivo)
  useEffect(() => {
    cargar();
    return suscribirPedidos(() => cargar());
  }, [cargar]);

  if (error) return <div className="alerta alerta-error">{error}</div>;
  if (!datos) return <p>Cargando estadísticas...</p>;

  const sinVentas = datos.totalPedidos === 0;

  return (
    <>
      <h2>Estadísticas</h2>

      <div className="kpis">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#D6C49A" />
                <XAxis dataKey="fecha" tickFormatter={diaCorto} interval={4} />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip labelFormatter={diaCorto} formatter={(v) => [dinero(v), 'Ventas']} />
                <Line type="monotone" dataKey="total" name="Ventas" stroke="#E8734A" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>

          <div className="paneles">
            <Panel titulo="Productos más vendidos (unidades)">
              <ResponsiveContainer>
                <BarChart data={datos.topProductos} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D6C49A" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="nombre" width={140} />
                  <Tooltip />
                  <Bar dataKey="unidades" name="Unidades" fill="#E8B93E" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            <Panel titulo="Ventas por categoría">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={datos.ventasPorCategoria} dataKey="ingresos" nameKey="categoria" outerRadius={100} label>
                    {datos.ventasPorCategoria.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => dinero(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Panel>
          </div>
        </>
      )}
    </>
  );
}

export default Estadisticas;
