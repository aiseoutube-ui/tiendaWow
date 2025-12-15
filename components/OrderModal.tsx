import React, { useState } from 'react';
import { CartItem, Order } from '../types';
import { X, CheckCircle, Smartphone, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { submitOrder } from '../services/api';
import { saveLocalOrder } from '../services/storage';
import { YAPE_QR_URL, PLIN_QR_URL } from '../constants';

interface OrderModalProps {
  items: CartItem[];
  total: number;
  onClose: () => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ items, total, onClose, onRemoveItem, onClearCart }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Cart/Details, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState<'YAPE' | 'PLIN'>('YAPE');
  const [orderId, setOrderId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Snapshot of order details to persist data for WhatsApp after cart is cleared
  const [confirmedDetails, setConfirmedDetails] = useState<{items: CartItem[], total: number} | null>(null);

  const handleNextToPayment = async () => {
    if (!customerInfo.name || !customerInfo.phone) return;
    if (items.length === 0) return;
    setErrorMessage(null);
    setStep(2);
  };

  const handleConfirmOrder = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const orderData: Order = {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        items: items,
        total: total,
        paymentMethod,
        status: 'PENDING',
        date: new Date().toISOString()
      };
      
      const id = await submitOrder(orderData);
      if (id === 'ERROR') throw new Error("Error en el servidor");
      
      const finalOrder = { ...orderData, id };
      
      setOrderId(id);
      // Save snapshot BEFORE clearing cart so WhatsApp button has data
      setConfirmedDetails({ items: [...items], total }); 
      
      // Save to Local History
      saveLocalOrder(finalOrder);

      onClearCart(); // Clear local cart on success
      setStep(3);
    } catch (e: any) {
      setErrorMessage(e.message || "Hubo un error al procesar el pedido. Verifica el stock.");
      setStep(1); // Go back to edit
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsappRedirect = () => {
    // Use stored details if available (Step 3), otherwise use props
    const currentItems = confirmedDetails ? confirmedDetails.items : items;
    const currentTotal = confirmedDetails ? confirmedDetails.total : total;

    const itemsList = currentItems.map(i => `- ${i.quantity}x ${i.name}`).join('%0A');
    const message = `Hola, mi pedido es *${orderId}*.%0A%0ADetalle:%0A${itemsList}%0A%0ATotal: S/ ${currentTotal.toFixed(2)}%0A%0AAdjunto mi constancia de pago.`;
    
    // Open WhatsApp
    window.open(`https://wa.me/14383904989?text=${message}`, '_blank');
    
    // Auto-close modal after a short delay to allow the pop-up/tab to trigger
    setTimeout(() => {
        onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
            {step === 1 && "Tu Carrito"}
            {step === 2 && "Pago Seguro"}
            {step === 3 && "¡Pedido Confirmado!"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-neutral-50">
          
          {step === 1 && (
            <div className="space-y-6">
              
              {/* Items List */}
              <div className="space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-neutral-400 mb-4">Tu carrito está vacío.</p>
                    <button onClick={onClose} className="text-orange-600 font-bold hover:underline">Seguir comprando</button>
                  </div>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="flex gap-4 bg-white p-3 rounded-2xl shadow-sm border border-neutral-100">
                      <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-neutral-100" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-neutral-900 text-sm line-clamp-1">{item.name}</h4>
                          <button onClick={() => onRemoveItem(item.id)} className="text-neutral-400 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                           <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">Cant: {item.quantity}</span>
                           <span className="text-neutral-900 font-bold">S/ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total */}
              {items.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm flex justify-between items-center">
                    <span className="text-neutral-500 font-medium">Total a Pagar</span>
                    <span className="text-2xl font-black text-neutral-900">S/ {total.toFixed(2)}</span>
                </div>
              )}

              {errorMessage && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex gap-3 items-center text-sm">
                  <AlertCircle size={18} className="shrink-0" /> 
                  <span>{errorMessage}</span>
                </div>
              )}

              {items.length > 0 && (
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wider ml-1">Datos de Envío</h4>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 space-y-4">
                  <div>
                    <label className="block text-xs text-neutral-400 font-bold mb-1 ml-1">NOMBRE</label>
                    <input 
                      type="text" 
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-all placeholder:text-neutral-400"
                      placeholder="Ej: Juan Pérez"
                      value={customerInfo.name}
                      onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 font-bold mb-1 ml-1">CELULAR</label>
                    <input 
                      type="tel" 
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-neutral-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-all placeholder:text-neutral-400"
                      placeholder="Ej: 999 999 999"
                      value={customerInfo.phone}
                      onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              )}

              <button 
                onClick={handleNextToPayment}
                disabled={items.length === 0 || !customerInfo.name || !customerInfo.phone}
                className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2 mt-4"
              >
                Continuar
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                <p className="text-neutral-500 mb-4 text-sm">Monto a transferir:</p>
                <p className="text-4xl font-black text-neutral-900 mb-6">S/ {total.toFixed(2)}</p>
                
                <div className="flex justify-center gap-3 mb-6">
                  <button 
                    onClick={() => setPaymentMethod('YAPE')}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all text-sm border ${paymentMethod === 'YAPE' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}
                  >
                    Yape
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('PLIN')}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all text-sm border ${paymentMethod === 'PLIN' ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}
                  >
                    Plin
                  </button>
                </div>

                <div className="bg-neutral-50 p-4 rounded-xl inline-block mx-auto mb-4 border border-neutral-200">
                  <img src={paymentMethod === 'YAPE' ? YAPE_QR_URL : PLIN_QR_URL} alt="QR Pago" className="w-40 h-40 object-cover mix-blend-multiply" />
                </div>

                <div className="flex justify-center items-center gap-2 text-neutral-900 font-mono font-bold text-lg">
                  <span>+14383904989</span>
                </div>
              </div>

              <button 
                onClick={handleConfirmOrder}
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 active:scale-95 transition-all flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Confirmar Transferencia"}
              </button>
              
              <button onClick={() => setStep(1)} className="text-neutral-500 text-sm hover:text-neutral-900 underline">
                Regresar
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 text-center py-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle size={48} className="text-green-600" />
              </div>
              <div>
                <h4 className="text-3xl font-bold text-neutral-900 mb-2">¡Stock Reservado!</h4>
                <p className="text-neutral-500 text-sm mb-4">Tu pedido <span className="text-neutral-900 font-mono font-bold">#{orderId}</span> está pendiente de validación.</p>
                <div className="inline-block bg-orange-50 text-orange-800 text-xs px-3 py-1 rounded-full border border-orange-100 font-bold">
                   Estado Actual: PENDIENTE
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-2xl text-sm text-yellow-800 text-left">
                <p className="font-bold mb-1">IMPORTANTE:</p>
                <p>El pedido NO se procesará hasta que envíes la constancia de pago. Una vez verificada, el estado cambiará a "CONFIRMADO".</p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleWhatsappRedirect}
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all flex justify-center items-center gap-3"
                >
                  <Smartphone size={24} />
                  Enviar Constancia Ahora
                </button>
                
                <button 
                  onClick={onClose}
                  className="w-full text-neutral-400 hover:text-neutral-600 font-medium py-2 text-sm transition-colors"
                >
                  Volver a la tienda
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};