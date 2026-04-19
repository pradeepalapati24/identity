import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative h-[calc(100vh-70px)] border-b border-border bg-linear-to-r from-[#f8f8f8] to-white">
        <div className="max-w-7xl mx-auto px-10 h-full grid grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col justify-center py-20 pr-10 border-r border-border">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-12"
            >
              <h1 className="hero-title tracking-[-2px]">
                Wear Your<br />Identity
              </h1>
              <p className="text-[18px] text-text-gray max-w-[500px] leading-[1.6] font-light">
                Engineered for comfort, designed for clarity. Our core collection features ethically sourced heavy cotton with a contemporary structured silhouette that stands the test of time.
              </p>
              <div>
                <Link to="/shop" className="btn-premium">
                  Shop Collection
                </Link>
              </div>
            </motion.div>
          </div>
          
          <div className="hidden lg:flex items-center justify-center p-20 bg-muted/50 select-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full aspect-square max-w-[600px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
            >
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=2000"
                alt="Hero T-Shirt"
                className="w-full h-full object-cover rounded-sm"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="border-y border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-border">
          {[
            { name: 'Essential Men', category: 'Men', img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=1000' },
            { name: 'Oversized Noir', category: 'Oversized', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=1000' },
            { name: 'Women Edition', category: 'Women', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000' }
          ].map((cat, i) => (
            <Link 
              key={i} 
              to={`/shop?category=${cat.category}`}
              className="group relative h-[600px] overflow-hidden bg-black"
            >
              <img 
                src={cat.img} 
                className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" 
                alt={cat.name} 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 p-12 flex flex-col justify-end">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <h3 className="text-white text-3xl font-black uppercase tracking-tighter mb-4">{cat.name}</h3>
                  <span className="text-white text-[10px] font-black uppercase tracking-[0.4em] inline-flex items-center gap-2">
                    Discover Selection
                    <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                  </span>
                </motion.div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-4 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="aspect-square bg-gray-100 overflow-hidden"
        >
          <img
            src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=1000"
            alt="Product Detail"
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <div className="space-y-8">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Established 2026</span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Minimalism as a<br />Statement.
          </h2>
          <p className="text-lg text-black/60 leading-relaxed font-light">
            We believe that what you wear is a reflection of who you are. Our pieces are designed with precision, focused on silhouette, fabric, and the understated power of simplicity.
          </p>
          <div className="pt-4">
            <Link to="/shop" className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-1 hover:border-accent transition-colors">
              Explore Collections
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
