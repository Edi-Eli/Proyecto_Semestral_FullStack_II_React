import AuthProvider from './AuthProvider.jsx'
import CartProvider from './CartProvider.jsx'

/**
 * Orden de providers:
 *   CartProvider (externo) → AuthProvider (interno)
 *
 * Se invierte a propósito para que AuthProvider pueda usar `useCart()` y así
 * vaciar el carrito en el `logout()`.
 * CartProvider no depende de la sesión (la capa de red en `client.js` es la
 * que inyecta el token), por lo que el nuevo orden es seguro.
 */
function AppProviders({ children }) {
  return (
    <CartProvider>
      <AuthProvider>{children}</AuthProvider>
    </CartProvider>
  )
}

export default AppProviders
