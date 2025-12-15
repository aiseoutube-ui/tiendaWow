import { Product } from './types';

// Configuración del Backend (Google Apps Script)
export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxeSXkG3XNtqPdjMdYDMdL5cwHk0ORDwE_-Y5haCPun6SsB9kaI19aMjGBUwhhoQy4Q/exec";

// Cambiar a FALSE para usar los datos reales de tu Google Sheet
export const USE_MOCK_DATA = false;

export const YAPE_QR_URL = "https://picsum.photos/300/300?grayscale"; // Placeholder QR
export const PLIN_QR_URL = "https://picsum.photos/300/300?blur=2"; // Placeholder QR

// Datos de respaldo por si falla la conexión o para modo prueba
export const MOCK_PRODUCTS: Product[] = [
  {
    id: "P001",
    name: "Zapatillas Urban Flow",
    price: 89.90,
    oldPrice: 120.00,
    stock: 15,
    imageUrl: "https://picsum.photos/seed/shoe/400/400",
    description: "Estilo urbano para caminar por Lima. Suela resistente.",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" 
  },
  {
    id: "P002",
    name: "Audífonos Bluetooth Pro",
    price: 45.00,
    stock: 5,
    imageUrl: "https://picsum.photos/seed/headphone/400/400",
    description: "Bajos potentes, batería de 8 horas.",
  },
  {
    id: "P003",
    name: "Reloj SmartWatch T500",
    price: 65.00,
    oldPrice: 90.00,
    stock: 0, // Out of stock test
    imageUrl: "https://picsum.photos/seed/watch/400/400",
    description: "Notificaciones de WhatsApp y control de ritmo cardíaco.",
  },
  {
    id: "P004",
    name: "Mochila Antirrobo USB",
    price: 55.00,
    stock: 20,
    imageUrl: "https://picsum.photos/seed/bag/400/400",
    description: "Carga tu celular mientras caminas. Material impermeable.",
  },
  {
    id: "P005",
    name: "Aro de Luz LED 26cm",
    price: 35.00,
    stock: 10,
    imageUrl: "https://picsum.photos/seed/light/400/400",
    description: "Perfecto para tus TikToks y Reels.",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
  }
];