import { useStore } from './store/useStore';

export function useCartStore() {
  const {
    carrito,
    eliminarDelCarrito,
    actualizarCantidad,
    totalCarrito
  } = useStore();

  const getSubtotal = () => totalCarrito;
  const getShippingCost = () => totalCarrito >= 500 ? 0 : 80;
  const getTotalPrice = () => getSubtotal() + getShippingCost();

  return {
    cart: carrito,
    removeFromCart: eliminarDelCarrito,
    updateQuantity: actualizarCantidad,
    getSubtotal,
    getShippingCost,
    getTotalPrice
  };
}