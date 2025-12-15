import React from 'react';
import { Product } from '../types';
import { Play } from 'lucide-react';

interface SocialFeedProps {
  products: Product[];
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ products }) => {
  const videoProducts = products.filter(p => p.videoUrl);

  if (videoProducts.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-xl md:text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <div className="bg-orange-100 p-2 rounded-full">
            <Play size={18} className="text-orange-600 fill-orange-600" />
          </div>
          Historias
        </h2>
        <span className="text-sm text-neutral-400 font-medium">Ver todo</span>
      </div>
      
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-2 snap-x">
        {videoProducts.map((product) => (
          <div key={product.id} className="flex-none w-32 md:w-40 snap-start relative group cursor-pointer transition-transform hover:-translate-y-1">
            
            <div className="relative rounded-2xl overflow-hidden aspect-[9/16] bg-neutral-200 border-2 border-transparent group-hover:border-orange-400 transition-colors shadow-sm">
                <video 
                src={product.videoUrl} 
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                onMouseOver={e => e.currentTarget.play()}
                onMouseOut={e => e.currentTarget.pause()}
                />
                
                {/* Overlay Info */}
                <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-[10px] font-bold truncate text-white mb-1">{product.name}</p>
                    <span className="text-[10px] bg-white text-black font-bold px-1.5 py-0.5 rounded-sm">S/ {product.price}</span>
                </div>

                <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-md p-1.5 rounded-full">
                    <Play size={8} fill="white" className="text-white" />
                </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};