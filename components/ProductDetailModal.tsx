import React, { useState } from 'react';
import { Product } from '../types';
import { X, ShoppingBag, Truck, ShieldCheck, Star } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  const handleAdd = () => {
    onAddToCart(product, quantity);
    handleClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose}></div>
      
      <div className={`bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col md:flex-row max-h-[90vh] transition-transform duration-300 ${isClosing ? 'scale-95' : 'scale-100'}`}>
        
        <button onClick={handleClose} className="absolute top-4 right-4 z-20 p-2 bg-white/80 rounded-full hover:bg-neutral-100 transition-colors">
          <X size={24} className="text-neutral-600" />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 h-64 md:h-auto bg-neutral-100 relative group">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          {product.oldPrice && (
            <div className="absolute top-6 left-6 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              OFERTA
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto">
          <div className="mb-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Envío Inmediato</span>
              <div className="flex items-center gap-0.5">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="text-neutral-400 text-xs ml-1">(45)</span>
              </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 leading-tight mb-4">{product.name}</h2>
            
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-black text-neutral-900">S/ {product.price.toFixed(2)}</span>
              {product.oldPrice && (
                <span className="text-lg text-neutral-400 line-through">S/ {product.oldPrice.toFixed(2)}</span>
              )}
            </div>

            <p className="text-neutral-600 leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Truck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">Envíos a todo Lima</h4>
                  <p className="text-xs text-neutral-500">Recibe en 24-48 horas</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">Compra Segura</h4>
                  <p className="text-xs text-neutral-500">Garantía total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="border-t border-neutral-100 pt-6 mt-4">
             {product.stock > 0 ? (
               <div className="flex gap-4">
                 <div className="flex items-center border border-neutral-200 rounded-xl px-2">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-neutral-500 hover:text-orange-600 font-bold">-</button>
                    <span className="w-8 text-center font-bold text-neutral-900">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-3 text-neutral-500 hover:text-orange-600 font-bold">+</button>
                 </div>
                 <button 
                  onClick={handleAdd}
                  className="flex-1 bg-neutral-900 text-white font-bold rounded-xl py-4 hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/30 flex items-center justify-center gap-2"
                 >
                   <ShoppingBag size={20} />
                   Agregar al Carrito
                 </button>
               </div>
             ) : (
                <div className="w-full bg-neutral-100 text-neutral-400 font-bold text-center py-4 rounded-xl">
                  Producto Agotado
                </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};