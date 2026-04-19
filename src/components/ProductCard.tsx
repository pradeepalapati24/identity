import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  key?: string | number;
}

export default function ProductCard({ id, name, price, imageUrl }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="group bg-white p-5 h-full flex flex-col items-center justify-between transition-all duration-300 hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] rounded-xl border border-transparent hover:border-border"
    >
      <Link to={`/product/${id}`} className="w-full flex flex-col items-center h-full">
        <div className="w-full aspect-[3/4] overflow-hidden mb-8 bg-muted relative rounded-lg shadow-inner group-hover:scale-[1.02] transition-transform duration-500">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover mix-blend-multiply drop-shadow-[0_15px_15px_rgba(0,0,0,0.15)]"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="w-full text-center space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 group-hover:text-accent transition-colors">
            {name}
          </h3>
          <p className="text-[18px] font-bold tracking-tight text-ink">${price.toFixed(2)}</p>
        </div>
      </Link>
    </motion.div>
  );
}
