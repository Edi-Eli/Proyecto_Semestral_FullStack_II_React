import AuthProvider from './AuthProvider.jsx'
import CartProvider from './CartProvider.jsx'

function AppProviders({ children }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  )
}

export default AppProviders