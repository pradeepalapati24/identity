import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { Package, Calendar, Tag, ChevronRight, User as UserIcon, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: any;
  items: OrderItem[];
}

export default function Profile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    async function fetchOrders() {
      try {
        const q = query(
          collection(db, 'orders'),
          where('customerDetails.email', '==', user.email),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-10 py-20 min-h-screen border-x border-border">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        {/* Left: User Card */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-muted p-10 rounded-3xl space-y-8 sticky top-24">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-[6px] border-white shadow-xl">
                 <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=random`} 
                  className="w-full h-full object-cover" 
                  alt="" 
                />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">{user.displayName || 'Anonymous User'}</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40">Member since 2026</p>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-black/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black/40">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Email</p>
                  <p className="text-sm font-bold">{user.email}</p>
                </div>
              </div>
             
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black/40">
                   <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Status</p>
                  <p className="text-sm font-bold uppercase tracking-tight">Verified Identity</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order History */}
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-4">
            <h1 className="text-5xl font-black uppercase tracking-tighter">Order Archives</h1>
            <p className="text-text-gray text-[10px] font-black uppercase tracking-[0.5em]">Transaction History & Archetype Tracking</p>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-muted p-20 rounded-3xl text-center space-y-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-black/10">
                <Package size={32} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-black/30">No transaction records found in archive.</p>
              <button 
                onClick={() => navigate('/shop')}
                className="px-8 py-4 bg-ink text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-accent transition-all"
              >
                Start Collection
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={order.id}
                  className="group bg-white border border-border rounded-3xl overflow-hidden hover:border-ink transition-all"
                >
                  <div className="p-8 space-y-6">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Order Ref:</span>
                          <span className="text-xs font-bold font-mono">#{order.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-text-gray">
                          <Calendar size={12} />
                          {order.createdAt?.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          order.status === 'completed' ? 'bg-green-50 text-green-600' :
                          order.status === 'pending' ? 'bg-blue-50 text-blue-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {order.status}
                        </div>
                        <div className="text-xl font-black">${order.totalAmount.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex-shrink-0 flex items-center gap-3 p-3 bg-muted rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-black/5">
                            <Tag size={16} className="text-black/20" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-tight leading-none">{item.name}</p>
                            <p className="text-[9px] font-bold text-black/30">QTY: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="px-8 py-4 bg-muted/30 border-t border-border flex justify-between items-center group-hover:bg-ink group-hover:text-white transition-all text-ink cursor-pointer">
                    <span className="text-[10px] font-black uppercase tracking-widest">Tracking Protocol</span>
                    <ChevronRight size={16} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
