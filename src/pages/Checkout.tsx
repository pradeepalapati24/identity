import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || ''
      }));
    }
  }, [user]);
  const navigate = useNavigate();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setLoading(true);

    try {
      // Direct Firestore save (Simulating an order placement)
      await addDoc(collection(db, 'orders'), {
        customerDetails: formData,
        items: cart.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant || null
        })),
        totalAmount: cartTotal,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setStatus('success');
      clearCart();
    } catch (error) {
      console.error('Order Submission Error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-7xl mx-auto px-10 py-40 text-center space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <div className="space-y-4">
          <h1 className="text-5xl font-black uppercase tracking-tighter">Order Received</h1>
          <p className="text-text-gray text-sm font-medium uppercase tracking-[0.1em] max-w-md mx-auto">
            Your selection has been logged in our systems. Our team will contact you for verification and fulfillment details.
          </p>
        </div>
        <Link to="/shop" className="btn-premium">Return to Collection</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-10 py-20 min-h-screen">
      <button 
        onClick={() => navigate('/cart')}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-gray hover:text-ink mb-10 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Bag
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        <div className="lg:col-span-7 space-y-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-black uppercase tracking-tighter">Identity Details</h1>
            <p className="text-text-gray text-[10px] font-black uppercase tracking-[0.4em]">Fulfillment Protocol</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 ml-1">Full Name</label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Alexander Identity"
                  className="w-full bg-muted border-none p-4 rounded-xl text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-ink transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 ml-1">Email Address</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="alex@identity.com"
                  className="w-full bg-muted border-none p-4 rounded-xl text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-ink transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 ml-1">Phone Number</label>
              <input
                required
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 000 000 0000"
                className="w-full bg-muted border-none p-4 rounded-xl text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-ink transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 ml-1">Shipping Address</label>
              <textarea
                required
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={4}
                placeholder="Identity Tower, Floor 88..."
                className="w-full bg-muted border-none p-4 rounded-xl text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-ink transition-all resize-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || cart.length === 0}
              className="w-full py-6 bg-ink text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-xl flex items-center justify-center gap-4 hover:bg-accent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing Order...
                </>
              ) : (
                <>
                  <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />
                  Complete Order Selection
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-muted p-10 rounded-3xl sticky top-24 space-y-8">
            <h2 className="text-xl font-black uppercase tracking-tighter border-b border-black/5 pb-6 text-ink">Order Selection</h2>
            
            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
              {cart.map(item => (
                <div key={item.cartId} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-16 bg-white rounded-lg overflow-hidden border border-black/5">
                      <img src={item.imageUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-tight text-ink">{item.name}</p>
                      <div className="flex gap-2 items-center">
                        <p className="text-[10px] font-bold text-black/30 uppercase">QTY: {item.quantity}</p>
                        {item.variant && (
                          <p className="text-[10px] font-bold text-accent uppercase tracking-widest">({item.variant})</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-black text-ink">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-black/5">
              <div className="flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-widest text-ink">Total Valuation</span>
                <span className="text-3xl font-black text-ink">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
