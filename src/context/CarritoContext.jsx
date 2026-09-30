import { createContext, useContext, useState } from "react";

const CarritoContext = createContext(null);

export function CarritoProvider({ children }) {
  const [items, setItems] = useState([]); // [{ productoId, nombre, precio, cantidad }]

  function agregar(producto, cantidad) {
    setItems((prev) => {
      const existe = prev.find((i) => i.productoId === producto.id);
      if (existe) {
        return prev.map((i) =>
          i.productoId === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i
        );
      }
      return [...prev, { productoId: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad }];
    });
  }

  function quitar(productoId) {
    setItems((prev) => prev.filter((i) => i.productoId !== productoId));
  }

  function vaciar() {
    setItems([]);
  }

  const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  return (
    <CarritoContext.Provider value={{ items, agregar, quitar, vaciar, total }}>
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  return useContext(CarritoContext);
}