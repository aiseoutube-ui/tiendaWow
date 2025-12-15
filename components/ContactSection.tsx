import React, { useState } from 'react';
import { Send, Mail, Clock, MapPin, CheckCircle, Loader2 } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS'>('IDLE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('SENDING');
    
    // Simulating API call
    setTimeout(() => {
      console.log("Form submitted", formData);
      setStatus('SUCCESS');
      setFormData({ name: '', email: '', message: '' });
      
      // Reset status after 3 seconds
      setTimeout(() => setStatus('IDLE'), 5000);
    }, 1500);
  };

  return (
    <section id="contact-section" className="py-16 md:py-24 bg-white border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
          
          {/* Text / Info Side */}
          <div className="w-full md:w-1/3 space-y-8">
            <div>
              <span className="text-orange-600 font-bold tracking-wider text-sm uppercase mb-2 block">Hablemos</span>
              <h2 className="text-4xl font-bold text-neutral-900 mb-4">Contáctanos</h2>
              <p className="text-neutral-500 leading-relaxed">
                ¿Tienes preguntas sobre un producto o el estado de tu pedido? Estamos aquí para ayudarte.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-orange-50 p-3 rounded-xl text-orange-600">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900">Email</h4>
                  <p className="text-sm text-neutral-500">contacto@tiendawow.pe</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900">Horario</h4>
                  <p className="text-sm text-neutral-500">Lun - Vie: 9:00 AM - 6:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-neutral-100 p-3 rounded-xl text-neutral-600">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900">Oficina</h4>
                  <p className="text-sm text-neutral-500">Lima, Perú</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="w-full md:w-2/3 bg-neutral-50 rounded-3xl p-6 md:p-10 card-shadow border border-neutral-100">
             {status === 'SUCCESS' ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle size={40} className="text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">¡Mensaje Enviado!</h3>
                    <p className="text-neutral-500 max-w-xs">Gracias por escribirnos. Nuestro equipo te responderá a la brevedad posible.</p>
                    <button 
                      onClick={() => setStatus('IDLE')}
                      className="mt-8 text-neutral-900 font-bold underline hover:text-orange-600"
                    >
                      Enviar otro mensaje
                    </button>
                </div>
             ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-neutral-500 uppercase ml-1">Tu Nombre</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white border border-neutral-200 rounded-xl p-4 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                        placeholder="Ej: María Campos"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-neutral-500 uppercase ml-1">Tu Email</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-white border border-neutral-200 rounded-xl p-4 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                        placeholder="ejemplo@correo.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase ml-1">Mensaje</label>
                    <textarea 
                      required
                      rows={5}
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-white border border-neutral-200 rounded-xl p-4 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all resize-none"
                      placeholder="¿Cómo podemos ayudarte hoy?"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={status === 'SENDING'}
                    className="w-full bg-neutral-900 text-white font-bold py-4 rounded-xl hover:bg-neutral-800 transition-all shadow-xl hover:shadow-2xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {status === 'SENDING' ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Enviar Mensaje</>}
                  </button>
                </form>
             )}
          </div>

        </div>
      </div>
    </section>
  );
};