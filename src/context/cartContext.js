import { createContext, useContext } from 'react'

const CartContext = createContext(null)

export function useCart() {
  const contexto = useContext(CartContext)
  if (!contexto) {
    throw new Error('useCart debe usarse dentro de <CartProvider>')
  }
  return contexto
}

export default CartContext