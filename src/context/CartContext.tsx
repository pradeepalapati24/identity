import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  cartId: string;
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  variant?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity: number, variant?: string) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any, quantity: number, variant?: string) => {
    setCart(prev => {
      const cartId = `${product.id}-${variant || 'default'}`;
      const existing = prev.find(item => item.cartId === cartId);
      
      if (existing) {
        return prev.map(item => 
          item.cartId === cartId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { 
        cartId,
        productId: product.id, 
        name: product.name, 
        price: product.price, 
        imageUrl: product.imageUrl, 
        quantity,
        variant
      }];
    });
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.cartId === cartId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      cartCount, 
      cartTotal 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
