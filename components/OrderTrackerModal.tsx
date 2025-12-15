import React, { useState } from 'react';
import { X, Search, Package, Clock, CheckCircle, Truck } from 'lucide-react';
import { fetchOrder } from '../services/api';
import { Order } from '../types';

interface OrderTrackerModalProps {
  onClose: () => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({ onClose }) => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    const result = await fetchOrder(orderId.trim());
    if (result) {
      setOrder(result);
    } else {
      setError('No encontramos ese código de pedido.');
    }
    setLoading(false);
  };

  const getStatusStep = (status?: string) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'CONFIRMED': return 2;
      case 'SHIPPED': return 3;
      case 'DELIVERED': return 4;
      default: return 0;
    }
  };

  const currentStep = getStatusStep(order?.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative p-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <X size={20} className="text-neutral-500" />
        </button>

        <h3 className="text-2xl font-bold text-neutral-900 mb-6 text-center">Rastrear Pedido</h3>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ej: ORD-84921" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="flex-1 bg-neutral-100 border-none rounded-xl px-4 py-3 text-neutral-900 focus:ring-2 focus:ring-orange-200 outline-none"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-neutral-900 text-white rounded-xl px-4 py-3 font-bold hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {loading ? <Clock className="animate-spin" /> : <Search />}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2 ml-1">{error}</p>}
        </form>

        {order && (
          <div className="animate-fade-in">
            <div className="bg-orange-50 p-4 rounded-xl mb-6 flex justify-between items-center">
               <div>
                 <p className="text-xs text-orange-600 font-bold uppercase">Cliente</p>
                 <p className="font-bold text-neutral-900">{order.customerName}</p>
               </div>
               <div className="text-right">
                 <p className="text-xs text-orange-600 font-bold uppercase">Total</p>
                 <p className="font-bold text-neutral-900">S/ {order.total.toFixed(2)}</p>
               </div>
            </div>

            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:h-full before:w-0.5 before:bg-neutral-100">
              
              {/* Step 1: Pending */}
              <div className="relative flex items-start gap-4">
                <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white border-neutral-200 text-neutral-300'}`}>
                  <Clock size={14} />
                </div>
                <div>
                  <h4 className={`font-bold text-sm ${currentStep >= 1 ? 'text-neutral-900' : 'text-neutral-400'}`}>Esperando Confirmación</h4>
                  <p className="text-xs text-neutral-500">Estamos verificando tu pago.</p>
                </div>
              </div>

              {/* Step 2: Confirmed */}
              <div className="relative flex items-start gap-4">
                <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white border-neutral-200 text-neutral-300'}`}>
                  <CheckCircle size={14} />
                </div>
                <div>
                  <h4 className={`font-bold text-sm ${currentStep >= 2 ? 'text-neutral-900' : 'text-neutral-400'}`}>Pago Confirmado</h4>
                  <p className="text-xs text-neutral-500">Tu pedido ha sido aprobado.</p>
                </div>
              </div>

              {/* Step 3: Shipped */}
              <div className="relative flex items-start gap-4">
                <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 3 ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white border-neutral-200 text-neutral-300'}`}>
                  <Truck size={14} />
                </div>
                <div>
                  <h4 className={`font-bold text-sm ${currentStep >= 3 ? 'text-neutral-900' : 'text-neutral-400'}`}>En Camino</h4>
                  <p className="text-xs text-neutral-500">Tu pedido va hacia tu dirección.</p>
                </div>
              </div>

              {/* Step 4: Delivered */}
              <div className="relative flex items-start gap-4">
                <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 4 ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-neutral-200 text-neutral-300'}`}>
                  <Package size={14} />
                </div>
                <div>
                  <h4 className={`font-bold text-sm ${currentStep >= 4 ? 'text-neutral-900' : 'text-neutral-400'}`}>Entregado</h4>
                  <p className="text-xs text-neutral-500">¡Gracias por tu compra!</p>
                </div>
              </div>

            </div>
            
            {order.status === 'PENDING' && (
               <div className="mt-6 p-3 bg-yellow-50 text-yellow-800 text-xs rounded-lg border border-yellow-200">
                  ⚠️ Si ya pagaste y sigue "Pendiente" por más de 1 hora, reenvía tu comprobante al WhatsApp.
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};