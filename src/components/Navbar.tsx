import { ShoppingCart, Menu, X, User, Search as SearchIcon, ArrowRight, History, TrendingUp, ShoppingBag } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });
  const [liveResults, setLiveResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user, logout, loginWithGoogle, error: authError } = useAuth();
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Join Failed:", err);
      // Feedback is handled via authError or locally
    } finally {
      setIsJoining(false);
    }
  };

  const popularTags = ['Essential', 'Noir', 'Oversized', 'Heavy Cotton', 'Minimal'];

  useEffect(() => {
    async function fetchAllForSearch() {
      const q = query(collection(db, 'products'), orderBy('name', 'asc'), limit(20));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      setAllProducts(docs);
    }
    fetchAllForSearch();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      setLiveResults(filtered);
    } else {
      setLiveResults([]);
    }
  }, [searchQuery, allProducts]);

  const saveSearch = (term: string) => {
    const newRecent = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));
  };

  const handleSearch = (e?: FormEvent, customTerm?: string) => {
    if (e) e.preventDefault();
    const term = customTerm || searchQuery;
    if (term.trim()) {
      saveSearch(term.trim());
      navigate(`/shop?q=${encodeURIComponent(term.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border h-[70px]">
        <div className="max-w-7xl mx-auto px-10 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center">
              <Link to="/" className="text-[24px] font-[900] tracking-[-1px] uppercase text-ink">
                IDENTITY
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-[30px]">
              <Link to="/" className="nav-link text-ink">New Arrivals</Link>
              <Link to="/shop" className="nav-link text-ink">Collection</Link>
              {user && <Link to="/admin" className="nav-link text-ink">Dashboard</Link>}
            </div>

            <div className="hidden md:flex items-center gap-[20px]">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="text-[13px] font-medium uppercase tracking-[1px] hover:text-accent font-sans text-ink cursor-pointer flex items-center gap-2 group"
              >
                <SearchIcon size={14} className="group-hover:scale-110 transition-transform" />
                Search
              </button>
              <Link 
                to="/cart" 
                className="text-[13px] font-medium uppercase tracking-[1px] hover:text-accent font-sans text-ink flex items-center gap-2 group"
              >
                <div className="relative">
                  <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
                Bag
              </Link>
                            {user ? (
                <div className="flex items-center gap-4">
                  <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden border border-border group hover:border-ink transition-all">
                    <img 
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=random`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                      alt="" 
                    />
                  </Link>
                  <button 
                    onClick={() => logout()}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 hover:text-red-500 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-end">
                  <button 
                    disabled={isJoining}
                    onClick={handleJoin}
                    className="text-[11px] font-black uppercase tracking-[0.2em] px-4 py-2 border border-ink rounded-lg hover:bg-ink hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isJoining ? 'Joining...' : 'Join'}
                  </button>
                  {authError && (
                    <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest mt-1 max-w-[100px] text-right">
                      {authError.includes('popup-closed-by-user') ? 'Popup closed' : 'Join failed'}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="md:hidden flex items-center gap-4">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-ink"
              >
                <SearchIcon size={20} />
              </button>
              <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-ink">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden bg-white border-b border-border absolute w-full z-40"
            >
              <div className="px-10 pt-4 pb-10 space-y-6">
                <Link to="/" onClick={() => setIsOpen(false)} className="block text-xl font-black uppercase tracking-tighter">Home</Link>
                <Link to="/shop" onClick={() => setIsOpen(false)} className="block text-xl font-black uppercase tracking-tighter">Shop</Link>
                <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-xl font-black uppercase tracking-tighter">Admin</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto pt-40 px-10 pb-20">
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="fixed top-10 right-10 p-3 hover:bg-muted rounded-full transition-all group"
              >
                <X size={32} className="group-hover:rotate-90 transition-transform" />
              </button>

              <div className="space-y-12">
                <form onSubmit={handleSearch} className="relative group">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search for t-shirts, styles or brands..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-3xl md:text-5xl font-black border-b-[6px] border-ink/10 focus:border-ink py-6 outline-none uppercase tracking-tighter transition-all placeholder:text-muted/50 pr-20"
                  />
                  <div className="absolute right-0 bottom-6 flex items-center gap-4">
                    {searchQuery && (
                      <button 
                        type="button" 
                        onClick={() => setSearchQuery('')}
                        className="text-text-gray hover:text-ink transition-colors p-2"
                      >
                        <X size={24} />
                      </button>
                    )}
                    <button type="submit" className="p-2 text-ink hover:scale-110 transition-transform">
                      <SearchIcon size={32} />
                    </button>
                  </div>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  {/* Left: Suggestions & History */}
                  <div className="space-y-10">
                    <section>
                      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-gray mb-6 flex items-center gap-2">
                        <TrendingUp size={14} />
                        Recent Searches
                      </h3>
                      {recentSearches.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {recentSearches.map((s, i) => (
                            <button 
                              key={i} 
                              onClick={() => handleSearch(undefined, s)}
                              className="px-5 py-2.5 bg-muted rounded-full text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-white transition-all flex items-center gap-2"
                            >
                              <History size={12} />
                              {s}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] uppercase font-bold text-black/20 tracking-widest">No history yet</p>
                      )}
                    </section>

                    <section>
                      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-gray mb-6">Popular Tags</h3>
                      <div className="flex flex-wrap gap-3">
                        {popularTags.map(tag => (
                          <button 
                            key={tag} 
                            onClick={() => handleSearch(undefined, tag)}
                            className="px-5 py-2.5 border border-border rounded-full text-xs font-bold uppercase tracking-widest hover:border-ink hover:bg-muted transition-all"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* Right: Live Results */}
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-gray mb-6">
                      {searchQuery.length > 1 ? 'Live Suggestions' : 'Quick Access'}
                    </h3>
                    <div className="space-y-4">
                      {liveResults.length > 0 ? (
                        liveResults.map(p => (
                          <Link 
                            key={p.id}
                            to={`/product/${p.id}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="flex items-center gap-5 p-3 hover:bg-muted rounded-xl transition-all group"
                          >
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                              <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-black uppercase tracking-tight">{p.name}</p>
                              <p className="text-xs font-bold text-accent">${p.price.toFixed(2)}</p>
                            </div>
                            <ArrowRight size={16} className="text-black/10 group-hover:text-ink transition-all group-hover:translate-x-1" />
                          </Link>
                        ))
                      ) : searchQuery.length > 1 ? (
                        <p className="text-[10px] uppercase font-bold text-black/20 tracking-widest py-4">No matching items</p>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-[10px] uppercase font-bold text-black/20 tracking-widest leading-relaxed">
                            Start typing to reveal elite inventory selections. <br />
                            Experience identity through structure.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
