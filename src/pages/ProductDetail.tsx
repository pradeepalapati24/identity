import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { ChevronLeft, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface Product {
  name: string;
  price: number;
  imageUrl: string;
  description?: string;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (product && id) {
      addToCart({ ...product, id }, 1, selectedSize);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct(docSnap.data() as Product);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <button onClick={() => navigate('/shop')} className="mt-4 text-accent font-bold">Back to Shop</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-10 py-10 min-h-[calc(100vh-70px)] grid grid-cols-1 lg:grid-cols-2 gap-0 border-x border-border">
      {/* Image Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-10 flex items-center justify-center border-r border-border bg-white"
      >
        <div className="w-full aspect-square bg-muted flex items-center justify-center">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-h-full object-contain mix-blend-multiply"
            referrerPolicy="no-referrer"
          />
        </div>
      </motion.div>

      {/* Info Section */}
      <div className="p-10 bg-muted flex flex-col justify-center">
        <div className="mb-10">
          <div className="text-[11px] uppercase tracking-[1px] text-text-gray mb-4">
            Shop / Collection / T-Shirts
          </div>
          <h1 className="text-[32px] font-bold mb-2 uppercase tracking-tight">
            {product.name}
          </h1>
          <div className="text-[20px] font-light">${product.price.toFixed(2)}</div>
        </div>

        <div className="space-y-10">
          <div>
            <span className="text-[12px] font-bold uppercase mb-4 block">Select Size</span>
            <div className="flex gap-[10px]">
              {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleAddToCart}
            className={`add-btn flex items-center justify-center gap-3 transition-all duration-500 ${added ? 'bg-green-500 hover:bg-green-600' : ''}`}
          >
            {added ? (
              <>
                <Check size={18} />
                Added to Bag
              </>
            ) : (
              <>
                <ShoppingBag size={18} />
                Add to Bag
              </>
            )}
          </button>
          
          <div className="text-[12px] text-text-gray leading-[1.6]">
            Free shipping on orders over $150. Standard delivery 3-5 business days.
          </div>
        </div>
      </div>
    </div>
  );
}
