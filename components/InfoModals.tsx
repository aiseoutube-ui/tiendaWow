import React, { useState } from 'react';
import { X, Send, MapPin, Mail, Clock, ShieldCheck, Truck, CheckCircle } from 'lucide-react';

interface InfoModalProps {
  type: 'ABOUT' | 'SHIPPING' | 'CONTACT';
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ type, onClose }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we will eventually hook into GAS
    console.log("Form submitted", formData);
    setSent(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <X size={20} className="text-neutral-500" />
        </button>

        <div className="p-8 overflow-y-auto">
          
          {/* ABOUT US */}
          {type === 'ABOUT' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">Sobre Nosotros</h2>
                <div className="w-16 h-1 bg-orange-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="prose prose-neutral mx-auto">
                <p className="text-lg text-neutral-600 leading-relaxed mb-6">
                  Bienvenido a <span className="font-bold text-neutral-900">TiendaWow Lima</span>. Nacimos con una misión simple: democratizar el acceso a productos de tendencia y tecnología en Perú, eliminando las barreras de las compras online tradicionales.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 my-8">
                    <div className="bg-orange-50 p-6 rounded-2xl">
                        <h3 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
                            <ShieldCheck className="text-orange-600" /> Confianza
                        </h3>
                        <p className="text-sm text-neutral-600">
                            Más de 10,000 pedidos entregados en Lima Metropolitana. Tu satisfacción es nuestra prioridad #1.
                        </p>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-2xl">
                        <h3 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
                            <MapPin className="text-blue-600" /> Localización
                        </h3>
                        <p className="text-sm text-neutral-600">
                            Operamos desde el corazón de Lima, lo que nos permite ofrecer tiempos de entrega récord en la capital.
                        </p>
                    </div>
                </div>

                <p className="text-neutral-600">
                  No somos solo una tienda, somos tu partner para encontrar ese gadget que simplifica tu vida o ese accesorio que define tu estilo. Trabajamos directamente con proveedores verificados para asegurar calidad y precio.
                </p>
              </div>
            </div>
          )}

          {/* SHIPPING */}
          {type === 'SHIPPING' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">Envíos y Entregas</h2>
                <div className="w-16 h-1 bg-orange-500 mx-auto rounded-full"></div>
              </div>

              <div className="space-y-6">
                 <div className="flex gap-4 items-start bg-neutral-50 p-6 rounded-2xl">
                    <div className="bg-white p-3 rounded-full shadow-sm text-orange-600">
                        <Truck size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-neutral-900 text-lg">Lima Metropolitana</h3>
                        <p className="text-neutral-600 mt-1">
                            Entrega en <span className="font-bold">24 a 48 horas hábiles</span>.
                            <br/>
                            <span className="text-sm text-neutral-500">Costo: Tarifa plana o Gratis en compras mayores a S/ 200.</span>
                        </p>
                    </div>
                 </div>

                 <div className="flex gap-4 items-start bg-neutral-50 p-6 rounded-2xl">
                    <div className="bg-white p-3 rounded-full shadow-sm text-blue-600">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-neutral-900 text-lg">Provincias</h3>
                        <p className="text-neutral-600 mt-1">
                            Envíos vía Shalom o Olva Courier.
                            <br/>
                            <span className="text-sm text-neutral-500">Tiempo estimado: 3 a 5 días hábiles. Pago en destino disponible en agencias seleccionadas.</span>
                        </p>
                    </div>
                 </div>

                 <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <p className="text-sm text-yellow-800 font-medium">
                        Nota: Los pedidos realizados los domingos o feriados se procesan al siguiente día hábil.
                    </p>
                 </div>
              </div>
            </div>
          )}

          {/* CONTACT FORM */}
          {type === 'CONTACT' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">Contáctanos</h2>
                <p className="text-neutral-500">¿Tienes dudas o sugerencias? Escríbenos.</p>
              </div>

              {sent ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle size={32} className="text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900">¡Mensaje Enviado!</h3>
                      <p className="text-neutral-500 mt-2">Te responderemos a la brevedad posible.</p>
                  </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 mb-1 ml-1">NOMBRE</label>
                            <input 
                                required
                                type="text" 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:outline-none focus:border-orange-500 transition-colors"
                                placeholder="Tu nombre"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 mb-1 ml-1">EMAIL</label>
                            <input 
                                required
                                type="email" 
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:outline-none focus:border-orange-500 transition-colors"
                                placeholder="tu@email.com"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 mb-1 ml-1">MENSAJE</label>
                        <textarea 
                            required
                            rows={4}
                            value={formData.message}
                            onChange={e => setFormData({...formData, message: e.target.value})}
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                            placeholder="¿En qué podemos ayudarte?"
                        ></textarea>
                    </div>
                    
                    <button type="submit" className="w-full bg-neutral-900 text-white font-bold py-4 rounded-xl hover:bg-neutral-800 transition-all flex items-center justify-center gap-2">
                        <Send size={18} /> Enviar Mensaje
                    </button>
                    
                    <div className="flex justify-center gap-8 mt-8 pt-6 border-t border-neutral-100">
                        <div className="flex items-center gap-2 text-neutral-500 text-sm">
                            <Mail size={16} /> contacto@tiendawow.pe
                        </div>
                        <div className="flex items-center gap-2 text-neutral-500 text-sm">
                            <Clock size={16} /> Lun-Vie: 9am - 6pm
                        </div>
                    </div>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};