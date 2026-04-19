import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/Admin';
import CartPage from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Layout>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<ProductListing />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Layout>
      </CartProvider>
    </AuthProvider>
  </Router>
);
}
