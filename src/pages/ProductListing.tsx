import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ProductCard from '../components/ProductCard';
import { motion } from 'motion/react';
import { useSearchParams, Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export default function ProductListing() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const queryTerm = searchParams.get('q');

  useEffect(() => {
    async function fetchProducts() {
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
    }

    fetchProducts();
  }, []);

  useEffect(() => {
    if (queryTerm) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(queryTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [queryTerm, products]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-10 py-20 min-h-screen">
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tighter uppercase"
          >
            {queryTerm ? `Search: ${queryTerm}` : 'All Collections'}
          </motion.h1>
          <p className="mt-4 text-text-gray text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3">
            <span className="w-8 h-[1px] bg-border" />
            {filteredProducts.length} Results Filtered
          </p>
        </div>
        
        {queryTerm && (
          <Link to="/shop" className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline">
            View All Collection
          </Link>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="max-w-4xl mx-auto text-center py-40 space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto text-black/10">
              <Search size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase tracking-tighter">
                {queryTerm ? 'No results found.' : 'Initial Index Empty.'}
              </h2>
              <p className="text-text-gray text-sm font-medium uppercase tracking-[0.1em] max-w-sm mx-auto">
                {queryTerm 
                  ? `We couldn't find anything matching "${queryTerm}". Try a different term or explore categories.` 
                  : 'The current collection is reaching finality. Sign up for the next drop.'}
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Men', 'Women', 'Oversized'].map(cat => (
              <Link 
                key={cat}
                to={`/shop?q=${cat}`}
                className="p-10 border border-border rounded-2xl hover:bg-black hover:text-white transition-all group"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity mb-2">Explore</p>
                <p className="text-xl font-black uppercase tracking-tighter">{cat}</p>
              </Link>
            ))}
          </div>

          {!queryTerm && (
            <div className="pt-10">
              <button className="btn-premium">Notify via Core</button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {filteredProducts.map((product) => {
            return (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                imageUrl={product.imageUrl}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// Ensure Search is imported from lucide-react if needed, or use the icon from the scope
import { Search } from 'lucide-react';
