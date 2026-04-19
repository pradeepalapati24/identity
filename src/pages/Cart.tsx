import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-10 py-40 text-center space-y-8">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto text-black/10">
          <ShoppingBag size={48} />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Your cart is empty</h1>
          <p className="text-text-gray text-sm font-medium uppercase tracking-[0.1em]">
            Looks like you haven't added any elite inventory selections yet.
          </p>
        </div>
        <Link to="/shop" className="btn-premium inline-flex items-center gap-3">
          Explore Collection
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-10 py-20 min-h-screen">
      <div className="mb-16 border-b border-border pb-10">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">Shopping Bag</h1>
        <p className="mt-4 text-text-gray text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3">
          <span className="w-8 h-[1px] bg-border" />
          {cart.length} Items in selection
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-8">
          {cart.map((item) => (
            <motion.div
              layout
              key={item.cartId}
              className="flex gap-6 p-6 bg-white rounded-2xl border border-border group hover:shadow-xl transition-all duration-500"
            >
              <div className="w-32 h-40 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                <img 
                  src={item.imageUrl} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  alt={item.name} 
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 mb-1">
                      Identity Selection
                    </h3>
                    <h2 className="text-xl font-black uppercase tracking-tighter">{item.name}</h2>
                    {item.variant && (
                      <p className="text-[10px] font-bold text-accent mt-1 uppercase tracking-widest">Size: {item.variant}</p>
                    )}
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.cartId)}
                    className="p-2 text-text-gray hover:text-accent hover:bg-muted rounded-full transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-4 bg-muted p-1 rounded-full">
                    <button 
                      onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-all text-ink"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-[12px] font-black w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-all text-ink"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="text-xl font-black tracking-tighter">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-4">
          <div className="bg-ink text-white p-10 rounded-3xl sticky top-24 space-y-8 shadow-2xl">
            <h2 className="text-2xl font-black uppercase tracking-tighter border-b border-white/10 pb-6">Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-white/40">
                <span>Subtotal</span>
                <span className="text-white">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-white/40">
                <span>Shipping</span>
                <span className="text-white">Complimentary</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between">
                <span className="text-sm font-black uppercase tracking-widest">Total</span>
                <span className="text-2xl font-black">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <Link 
              to="/checkout" 
              className="w-full py-5 bg-white text-ink text-[11px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 hover:bg-accent hover:text-white transition-all duration-300 group"
            >
              Secure Checkout
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <p className="text-[9px] text-white/20 text-center font-bold uppercase tracking-widest leading-loose">
              Taxes included. Secure processing guaranteed via Core systems.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
