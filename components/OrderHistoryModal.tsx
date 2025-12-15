import React, { useEffect, useState } from 'react';
import { X, Package, Calendar, ChevronRight, ShoppingBag } from 'lucide-react';
import { getLocalOrders } from '../services/storage';
import { Order } from '../types';

interface OrderHistoryModalProps {
  onClose: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ onClose }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(getLocalOrders());
  }, []);

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return 'Fecha desc.';
    const d = new Date(isoDate);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
        case 'CONFIRMED': return 'bg-green-100 text-green-700 border-green-200';
        case 'SHIPPED': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'PENDING': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
        default: return 'bg-neutral-100 text-neutral-600 border-neutral-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        
        <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h3 className="text-xl font-bold text-neutral-900">Mis Pedidos</h3>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-neutral-50 flex-1">
          {orders.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
               <div className="bg-neutral-200 p-4 rounded-full mb-4">
                  <ShoppingBag size={32} className="text-neutral-400" />
               </div>
               <h4 className="font-bold text-neutral-900 mb-1">Aún no tienes pedidos</h4>
               <p className="text-neutral-500 text-sm mb-6">Tus compras recientes aparecerán aquí.</p>
               <button onClick={onClose} className="text-orange-600 font-bold hover:underline">
                  Empezar a comprar
               </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 group transition-all hover:shadow-md">
                   <div className="flex justify-between items-start mb-3">
                      <div>
                          <p className="font-mono font-bold text-neutral-900 text-lg">{order.id}</p>
                          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                             <Calendar size={12} /> {formatDate(order.date)}
                          </div>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                         {order.status || 'PENDING'}
                      </div>
                   </div>
                   
                   <div className="space-y-2 mb-4">
                      {order.items.slice(0, 2).map((item, i) => (
                          <div key={i} className="flex justify-between text-sm text-neutral-600">
                             <span className="line-clamp-1">{item.quantity}x {item.name}</span>
                          </div>
                      ))}
                      {order.items.length > 2 && (
                          <p className="text-xs text-neutral-400 italic">... y {order.items.length - 2} más</p>
                      )}
                   </div>

                   <div className="pt-3 border-t border-neutral-50 flex justify-between items-center">
                       <span className="font-black text-neutral-900">S/ {order.total.toFixed(2)}</span>
                       
                       {/* In a real app, this could open the detailed tracker. For now it's visual */}
                       <div className="flex items-center gap-1 text-xs text-orange-600 font-bold">
                           Ver Estado <ChevronRight size={14} />
                       </div>
                   </div>
                </div>
              ))}
              
              <p className="text-center text-xs text-neutral-400 mt-6 bg-neutral-100 py-2 rounded-lg">
                Historial guardado en este dispositivo
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};