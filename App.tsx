import React, { useEffect, useState, useRef } from 'react';
import { ShoppingBag, Search, Menu, Star, Sparkles, Instagram, Facebook, Truck, ArrowDownCircle, Info, Mail, History, X, Home } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { Product, CartItem } from './types';
import { fetchProducts } from './services/api';
import { ProductSkeleton } from './components/Skeleton';
import { SocialFeed } from './components/SocialFeed';
import { OrderModal } from './components/OrderModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { InfoModal } from './components/InfoModals';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { ContactSection } from './components/ContactSection';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Pagination State
  const [visibleCount, setVisibleCount] = useState(8);
  
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Navigation State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Modals State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Info Modals State
  const [infoModalType, setInfoModalType] = useState<'NONE' | 'ABOUT' | 'SHIPPING' | 'CONTACT'>('NONE');

  const productsRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchProducts();
      setProducts(data);
      setLoading(false);
    };
    loadData();

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP Animation for Product Grid (re-runs when visible count changes)
  useEffect(() => {
    if (!loading && productsRef.current) {
      // Only animate the newly added items if we already have items
      const cards = Array.from(productsRef.current.children);
      // Simple animation for all current cards to ensure smooth transition
      gsap.to(cards, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05 });
    }
  }, [loading, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 8);
  };

  const scrollToContact = () => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById('contact-section');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const openInfoModal = (type: 'ABOUT' | 'SHIPPING') => {
      setInfoModalType(type);
      setIsMobileMenuOpen(false);
  };

  // Cart Functions
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const visibleProducts = products.slice(0, visibleCount);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-[#FAFAF9]">
      
      {/* Navbar */}
      <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 border-b ${isScrolled ? 'bg-white/95 backdrop-blur-md border-neutral-200 py-3 shadow-sm' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-neutral-800 p-1">
                <Menu size={24} />
            </button>
            
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 cursor-pointer select-none flex items-center gap-1">
              Tienda<span className="text-orange-600 font-extrabold">Wow</span>.
            </h1>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6 ml-8">
                <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="text-sm font-bold text-neutral-600 hover:text-orange-600 transition-colors">Inicio</button>
                <button onClick={() => openInfoModal('ABOUT')} className="text-sm font-bold text-neutral-600 hover:text-orange-600 transition-colors">Nosotros</button>
                <button onClick={() => openInfoModal('SHIPPING')} className="text-sm font-bold text-neutral-600 hover:text-orange-600 transition-colors">Envíos</button>
                <button onClick={scrollToContact} className="text-sm font-bold text-neutral-600 hover:text-orange-600 transition-colors">Contacto</button>
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex relative">
                <input 
                    type="text" 
                    placeholder="Buscar producto..." 
                    className="bg-neutral-100 border-none rounded-full px-5 py-2.5 pl-11 text-sm text-neutral-700 w-64 focus:ring-2 focus:ring-orange-200 transition-all"
                />
                <Search className="absolute left-4 top-2.5 text-neutral-400 w-4 h-4" />
            </div>
            
            <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-3 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="absolute top-0 left-0 h-full w-[280px] bg-white shadow-2xl p-6 flex flex-col animate-slide-right">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold">Menú</h2>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-neutral-100 rounded-full text-neutral-500">
                        <X size={20} />
                    </button>
                </div>
                
                <nav className="flex flex-col gap-2">
                    <button onClick={() => { window.scrollTo({top:0, behavior:'smooth'}); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 p-4 rounded-xl hover:bg-orange-50 text-left font-bold text-neutral-700 hover:text-orange-600 transition-colors">
                        <Home size={20} /> Inicio
                    </button>
                    <button onClick={() => setIsHistoryOpen(true)} className="flex items-center gap-3 p-4 rounded-xl hover:bg-orange-50 text-left font-bold text-neutral-700 hover:text-orange-600 transition-colors">
                        <History size={20} /> Mis Pedidos
                    </button>
                     <button onClick={() => setIsTrackerOpen(true)} className="flex items-center gap-3 p-4 rounded-xl hover:bg-orange-50 text-left font-bold text-neutral-700 hover:text-orange-600 transition-colors">
                        <Truck size={20} /> Rastrear Pedido
                    </button>
                    <button onClick={() => openInfoModal('ABOUT')} className="flex items-center gap-3 p-4 rounded-xl hover:bg-orange-50 text-left font-bold text-neutral-700 hover:text-orange-600 transition-colors">
                        <Info size={20} /> Quiénes Somos
                    </button>
                     <button onClick={() => openInfoModal('SHIPPING')} className="flex items-center gap-3 p-4 rounded-xl hover:bg-orange-50 text-left font-bold text-neutral-700 hover:text-orange-600 transition-colors">
                        <Truck size={20} /> Envíos
                    </button>
                    <button onClick={scrollToContact} className="flex items-center gap-3 p-4 rounded-xl hover:bg-orange-50 text-left font-bold text-neutral-700 hover:text-orange-600 transition-colors">
                        <Mail size={20} /> Contacto
                    </button>
                </nav>

                <div className="mt-auto pt-6 border-t border-neutral-100">
                    <p className="text-xs text-center text-neutral-400">TiendaWow Lima v1.0</p>
                </div>
            </div>
        </div>
      )}

      <main className="flex-grow pt-28">
        
        {/* Warm & Clean Hero */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 mb-16">
            <div ref={heroRef} className="relative rounded-[2rem] overflow-hidden bg-[#F3F0E6] md:aspect-[2.5/1] aspect-[4/5] flex items-center">
                {/* Decorative Blobs */}
                <div className="absolute top-0 right-0 w-2/3 h-full bg-orange-100/50 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="relative z-10 w-full md:w-1/2 p-8 md:p-16 flex flex-col items-start">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-orange-700 text-xs font-bold shadow-sm mb-6 border border-orange-100">
                        <Sparkles size={12} /> Nueva Colección 2024
                    </span>
                    <h2 className="text-5xl md:text-7xl font-bold text-neutral-900 leading-[0.95] mb-6 tracking-tight">
                        Estilo que <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">conecta.</span>
                    </h2>
                    <p className="text-neutral-600 text-lg mb-8 max-w-sm leading-relaxed">
                        Descubre gadgets y accesorios seleccionados para simplificar tu día a día en Lima.
                    </p>
                    <button className="bg-neutral-900 text-white px-8 py-4 rounded-full font-bold text-sm shadow-xl hover:bg-neutral-800 hover:scale-105 transition-all flex items-center gap-2">
                        Ver Catálogo <ShoppingBag size={16} />
                    </button>
                </div>
                
                {/* Hero Image (Right Side) */}
                <div className="absolute right-0 bottom-0 w-full md:w-1/2 h-1/2 md:h-full">
                    <img 
                        src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000" 
                        alt="Hero Product" 
                        className="w-full h-full object-contain md:object-cover md:mask-image-gradient"
                        style={{maskImage: 'linear-gradient(to left, black 80%, transparent 100%)'}}
                        loading="eager"
                    />
                </div>
            </div>
        </div>

        {/* Stories / Social */}
        <div className="max-w-7xl mx-auto px-4 md:px-6">
             {!loading && <SocialFeed products={products} />}
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 mb-10">
            <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold text-neutral-900">Populares</h2>
                 {/* Filter Pills */}
                 <div className="flex gap-2">
                    {['Todo', 'Tech', 'Moda'].map((f, i) => (
                        <button key={i} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${i === 0 ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}>
                            {f}
                        </button>
                    ))}
                 </div>
            </div>
            
            {/* Grid */}
            <div ref={productsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {loading ? (
                Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            ) : (
                visibleProducts.map((product) => (
                <div 
                    key={product.id} 
                    className="group cursor-pointer bg-white rounded-2xl p-3 card-shadow border border-neutral-100 opacity-0 translate-y-4" // Initial state for GSAP
                    onClick={() => setSelectedProduct(product)}
                >
                    {/* Image Area */}
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-50 mb-4">
                        <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                        />
                        {product.oldPrice && (
                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur text-neutral-900 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                            -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                            </div>
                        )}
                        {/* New Stock Badge Design */}
                        {product.stock > 0 ? (
                           <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                               <Package size={10} className="text-orange-400" /> Stock: {product.stock}
                           </div>
                        ) : (
                           <div className="absolute bottom-2 right-2 bg-neutral-200 text-neutral-500 text-[10px] font-bold px-2 py-1 rounded-md">
                                Agotado
                           </div>
                        )}
                    </div>
                    
                    {/* Content */}
                    <div className="px-1">
                        <div className="flex justify-between items-start mb-1">
                             <h3 className="text-neutral-900 font-bold text-base leading-tight group-hover:text-orange-600 transition-colors">{product.name}</h3>
                        </div>
                        <p className="text-neutral-500 text-xs mb-3 line-clamp-1">{product.description}</p>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                {product.oldPrice && <span className="text-[10px] text-neutral-400 line-through">S/ {product.oldPrice.toFixed(2)}</span>}
                                <span className="text-lg font-black text-neutral-900">S/ {product.price.toFixed(2)}</span>
                            </div>
                            <button className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors">
                                <ShoppingBag size={14} />
                            </button>
                        </div>
                    </div>
                </div>
                ))
            )}
            </div>

            {/* Load More Button */}
            {!loading && visibleCount < products.length && (
              <div className="mt-12 flex justify-center">
                 <button 
                  onClick={handleLoadMore}
                  className="group bg-white border border-neutral-200 text-neutral-600 hover:border-orange-200 hover:text-orange-600 px-8 py-3 rounded-full font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                 >
                    Ver más productos <ArrowDownCircle size={18} className="group-hover:translate-y-1 transition-transform" />
                 </button>
              </div>
            )}
        </div>

        {/* Embedded Contact Section (Replaces Modal for Form) */}
        <ContactSection />

      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-neutral-100 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">TiendaWow.</h2>
                <p className="text-neutral-500 text-sm max-w-sm leading-relaxed">
                    Redefiniendo la experiencia de compra en Lima. Calidad, velocidad y confianza en cada pedido.
                </p>
            </div>
            <div>
                <h4 className="font-bold text-neutral-900 mb-4 text-sm uppercase tracking-wider">Cliente</h4>
                <ul className="space-y-3 text-sm text-neutral-500">
                    <li>
                      <button onClick={() => setIsHistoryOpen(true)} className="hover:text-orange-600 transition-colors flex items-center gap-2">
                         <History size={14} /> Mis Pedidos
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setIsTrackerOpen(true)} className="hover:text-orange-600 transition-colors flex items-center gap-2">
                         <Truck size={14} /> Rastrear Pedido
                      </button>
                    </li>
                    <li>
                        <button onClick={() => openInfoModal('SHIPPING')} className="hover:text-orange-600 transition-colors flex items-center gap-2">
                           Envíos y Devoluciones
                        </button>
                    </li>
                    <li>
                        <button onClick={() => openInfoModal('ABOUT')} className="hover:text-orange-600 transition-colors flex items-center gap-2">
                           <Info size={14} /> Quiénes Somos
                        </button>
                    </li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-neutral-900 mb-4 text-sm uppercase tracking-wider">Social</h4>
                <div className="flex gap-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-orange-100 hover:text-orange-600 transition-colors"><Instagram size={20} /></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"><Facebook size={20} /></a>
                </div>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-400">
            <p>© 2024 TiendaWow Lima. Hecho con ❤️ para emprendedores.</p>
            <div className="flex gap-4">
                <span>Privacidad</span>
                <span>Términos</span>
            </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)}
            onAddToCart={addToCart}
        />
      )}

      {isCartOpen && (
        <OrderModal 
          items={cart}
          total={cartTotal}
          onRemoveItem={removeFromCart}
          onClearCart={() => setCart([])}
          onClose={() => setIsCartOpen(false)} 
        />
      )}

      {isTrackerOpen && (
        <OrderTrackerModal onClose={() => setIsTrackerOpen(false)} />
      )}
      
      {isHistoryOpen && (
        <OrderHistoryModal onClose={() => setIsHistoryOpen(false)} />
      )}

      {infoModalType !== 'NONE' && (
        <InfoModal 
            type={infoModalType} 
            onClose={() => setInfoModalType('NONE')} 
        />
      )}
    </div>
  );
}

// Helper component for Package icon since it wasn't imported in previous scope but used in code
const Package: React.FC<{size?: number, className?: string}> = ({size, className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22v-9"/></svg>
);

export default App;