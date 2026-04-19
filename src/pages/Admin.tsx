import { useState, useEffect, useRef, FormEvent, ReactNode } from 'react';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  updateDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Trash2, 
  Edit3, 
  X,
  ChevronRight,
  User,
  Image as ImageIcon,
  TrendingUp
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  createdAt: any;
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: any;
  items: any[];
  customerDetails: {
    name: string;
    email: string;
  };
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Men');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !price || !image || !description || !category) {
      setStatus({ type: 'error', message: 'Please fill all fields.' });
      return;
    }

    setFormLoading(true);
    setStatus(null);

    try {
      // 1. Upload Image
      const storageRef = ref(storage, `products/${Date.now()}_${image.name}`);
      const uploadSnapshot = await uploadBytes(storageRef, image);
      const imageUrl = await getDownloadURL(uploadSnapshot.ref);

      // 2. Save to Firestore
      await addDoc(collection(db, 'products'), {
        name,
        price: parseFloat(price),
        category,
        description,
        imageUrl,
        createdAt: serverTimestamp()
      });

      setStatus({ type: 'success', message: 'Product Added Successfully' });
      // Reset Form
      setName('');
      setPrice('');
      setCategory('Men');
      setDescription('');
      setImage(null);
      setImagePreview(null);
      fetchProducts();

      // Clear Status after 3s
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      console.error("Error adding product:", error);
      setStatus({ type: 'error', message: 'Failed to add product.' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(p => p.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border h-screen sticky top-0 hidden lg:flex flex-col">
        <div className="p-8 border-b border-border">
          <Link to="/" className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            <Package className="text-accent" />
            CORE ADMIN
          </Link>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          <SidebarItem 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
            icon={<LayoutDashboard size={18} />} 
            label="Dashboard" 
          />
          <SidebarItem 
            active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')}
            icon={<Package size={18} />} 
            label="Products" 
          />
          <SidebarItem 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')}
            icon={<ShoppingCart size={18} />} 
            label="Orders" 
          />
          <SidebarItem 
            active={activeTab === 'analytics'} 
            onClick={() => setActiveTab('analytics')}
            icon={<BarChart3 size={18} />} 
            label="Analytics" 
          />
        </nav>

        <div className="p-6 border-t border-border mt-auto">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-[10px] font-bold">
              AD
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider">Admin Name</p>
              <p className="text-[9px] text-text-gray uppercase tracking-widest leading-none">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-[70px] bg-white border-b border-border flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-text-gray">
            Pages <ChevronRight size={12} /> Dashboard <ChevronRight size={12} /> 
            <span className="text-ink">Inventory</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
              <Search size={14} className="text-text-gray" />
              <input 
                type="text" 
                placeholder="Global Search..." 
                className="bg-transparent border-none outline-none text-[11px] font-medium uppercase tracking-widest w-40"
              />
            </div>
            <User size={18} className="text-text-gray cursor-pointer" />
            <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100">
              Live
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto w-full space-y-12">
          {activeTab === 'products' && (
            <>
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                  <h1 className="text-4xl font-black uppercase tracking-tighter">Inventory</h1>
                  <p className="text-text-gray text-xs font-bold uppercase tracking-[0.3em]">Manage your product catalog</p>
                </div>
                
                <div className="flex gap-4">
                  <button className="px-6 py-3 border border-border bg-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-muted transition-colors rounded-lg">
                    Export CSV
                  </button>
                  <button className="btn-premium py-3 px-8 text-[11px]">
                    Refresh Data
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                {/* Left: Add Product Form */}
                <div className="xl:col-span-4 space-y-8">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card-premium space-y-8 overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-3">
                        <Plus size={18} className="text-accent" />
                        New Entry
                      </h2>
                      {formLoading && <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <FieldLabel>Product Identity</FieldLabel>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="admin-input"
                          placeholder="e.g. Essential Noir Tee"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <FieldLabel>Price (USD)</FieldLabel>
                          <input
                            type="number"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="admin-input"
                            placeholder="0.00"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <FieldLabel>Category</FieldLabel>
                          <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="admin-input cursor-pointer"
                          >
                            <option value="Men">Men</option>
                            <option value="Women">Women</option>
                            <option value="Oversized">Oversized</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <FieldLabel>Description</FieldLabel>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="admin-input min-h-[100px] resize-none"
                          placeholder="Describe the material, fit, and style..."
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <FieldLabel>Visual Assets</FieldLabel>
                        <div className="relative border-2 border-dashed border-border p-6 text-center group hover:border-accent hover:bg-accent/5 transition-all cursor-pointer rounded-xl">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          {imagePreview ? (
                            <div className="relative aspect-video rounded-lg overflow-hidden border border-border shadow-sm">
                              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleImageChange(null); }}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              <Upload size={20} className="text-text-gray group-hover:text-accent transition-colors" />
                              <p className="text-[10px] uppercase font-bold tracking-widest text-text-gray">
                                Drags & Drops visual
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={formLoading}
                        className={`w-full py-5 text-[11px] font-black uppercase tracking-[3px] transition-all rounded-xl shadow-lg flex items-center justify-center gap-3 ${
                          formLoading 
                            ? 'bg-muted text-black/20 cursor-not-allowed' 
                            : 'bg-black text-white hover:bg-accent hover:-translate-y-1 active:translate-y-0'
                        }`}
                      >
                        {formLoading ? 'Processing...' : 'Publish to Store'}
                      </button>
                    </form>

                    <AnimatePresence>
                      {status && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`p-4 rounded-lg flex items-center gap-3 text-[10px] font-black uppercase tracking-widest ${
                            status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                          {status.message}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Right: Products List */}
                <div className="xl:col-span-8 space-y-6">
                  <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-[300px]">
                          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray" />
                          <input 
                            type="text" 
                            placeholder="Search Products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-xs font-medium outline-none focus:border-ink transition-colors"
                          />
                        </div>
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-gray flex items-center">
                        {filteredProducts.length} Items Indexed
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-[#fafafa] border-b border-border">
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-gray">Entry</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-gray">Tier</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-gray">Valuation</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-gray text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {loading ? (
                            <tr>
                              <td colSpan={4} className="px-6 py-20 text-center">
                                <div className="w-8 h-8 border-4 border-ink/10 border-t-ink rounded-full animate-spin mx-auto" />
                              </td>
                            </tr>
                          ) : filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-6 py-32 text-center">
                                <p className="text-xs font-bold uppercase tracking-widest text-text-gray">No items match selection</p>
                              </td>
                            </tr>
                          ) : (
                            filteredProducts.map((product) => (
                              <motion.tr key={product.id} className="hover:bg-muted/30 transition-colors group">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden border border-border group-hover:scale-105 transition-transform">
                                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-black uppercase tracking-tight">{product.name}</p>
                                      <p className="text-[9px] text-text-gray font-bold uppercase tracking-widest">{product.id.slice(0, 8)}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="px-3 py-1 bg-muted rounded-full text-[9px] font-black uppercase tracking-widest">{product.category}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-sm font-black tracking-tight">${product.price.toFixed(2)}</p>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button 
                                    onClick={() => setDeleteConfirm(product.id)}
                                    className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-text-gray hover:text-accent"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </motion.tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-12">
              <div className="space-y-1">
                <h1 className="text-4xl font-black uppercase tracking-tighter">Order Processing</h1>
                <p className="text-text-gray text-xs font-bold uppercase tracking-[0.3em]">Customer fulfillment logs</p>
              </div>

              <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                <table className="w-full text-left">
                   <thead className="bg-[#fafafa] border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-gray">Order Ref</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-gray">Customer</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-gray">Valuation</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-gray">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-gray text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-32 text-center">
                          <p className="text-xs font-bold uppercase tracking-widest text-text-gray">No order logs found</p>
                        </td>
                      </tr>
                    ) : (
                      orders.map(order => (
                        <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-1">Ref ID</p>
                            <p className="text-xs font-bold font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-black uppercase tracking-tight">{order.customerDetails.name}</p>
                            <p className="text-[10px] font-bold text-text-gray">{order.customerDetails.email}</p>
                          </td>
                          <td className="px-6 py-4 text-sm font-black">${order.totalAmount.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <select 
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-black/5 outline-none cursor-pointer ${
                                order.status === 'completed' ? 'bg-green-50 text-green-600' :
                                order.status === 'pending' ? 'bg-blue-50 text-blue-600' :
                                'bg-red-50 text-red-600'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                           <td className="px-6 py-4 text-right">
                            <button className="p-2 hover:bg-muted rounded-lg transition-all text-text-gray">
                              <MoreHorizontal size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-12">
                <div className="space-y-1">
                  <h1 className="text-4xl font-black uppercase tracking-tighter">Command Center</h1>
                  <p className="text-text-gray text-xs font-bold uppercase tracking-[0.3em]">Operational Overview</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {[
                    { label: 'Total Revenue', value: `$${orders.reduce((acc, o) => acc + (o.status === 'completed' ? o.totalAmount : 0), 0).toFixed(2)}`, trend: '+12%', icon: <BarChart3 className="text-green-500" /> },
                    { label: 'Active Orders', value: orders.filter(o => o.status === 'pending').length, trend: '8 New', icon: <ShoppingCart className="text-blue-500" /> },
                    { label: 'Core Inventory', value: products.length, trend: '3 Restock', icon: <Package className="text-purple-500" /> },
                    { label: 'Conversion', value: '3.4%', trend: '+0.4%', icon: <TrendingUp className="text-accent" /> }
                  ].map((stat, i) => (
                    <div key={i} className="card-premium p-8 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">{stat.icon}</div>
                        <span className="text-[9px] font-black text-green-500">{stat.trend}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-black/30">{stat.label}</p>
                        <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white max-w-md w-full rounded-2xl p-10 shadow-2xl space-y-8"
            >
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-accent mx-auto">
                <AlertCircle size={32} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Liquidate Asset?</h3>
                <p className="text-sm text-text-gray font-medium">This action will permanently delete the product from the core index. This cannot be undone.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-4 border border-border text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-4 bg-accent text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 group ${
        active 
          ? 'bg-ink text-white shadow-lg' 
          : 'text-text-gray hover:bg-muted hover:text-ink'
      }`}
    >
      <div className={`${active ? 'text-accent' : 'group-hover:text-accent'} transition-colors`}>
        {icon}
      </div>
      <span className="text-[11px] font-black uppercase tracking-[0.15em]">{label}</span>
      {active && <div className="ml-auto w-1 h-1 rounded-full bg-accent" />}
    </button>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-black/30 block mb-1">
      {children}
    </label>
  );
}

// Added internal Link mock or import if needed, assuming standard reach-router/react-router
