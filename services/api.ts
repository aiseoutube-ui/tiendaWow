import { GOOGLE_SCRIPT_URL, MOCK_PRODUCTS, USE_MOCK_DATA } from '../constants';
import { Product, ApiResponse, Order } from '../types';
import { getOrderById } from './storage';

export const fetchProducts = async (): Promise<Product[]> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(MOCK_PRODUCTS);
  }

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getProducts`);
    if (!response.ok) throw new Error('Error de red');
    const json: ApiResponse<Product[]> = await response.json();
    return json.data || [];
  } catch (error) {
    console.error("Failed to fetch products", error);
    return []; 
  }
};

export const checkStock = async (id: string): Promise<number> => {
  if (USE_MOCK_DATA) {
    const p = MOCK_PRODUCTS.find(p => p.id === id);
    return p ? p.stock : 0;
  }

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=checkStock&id=${id}`);
    const json: ApiResponse<number> = await response.json();
    return typeof json.data === 'number' ? json.data : 0;
  } catch (error) {
    return 0;
  }
};

export const fetchOrder = async (orderId: string): Promise<Order | null> => {
  // 1. Recuperar versión local (memoria del navegador)
  const localOrder = getOrderById(orderId);
  
  if (USE_MOCK_DATA) {
    // Lógica Mock (sin cambios)
    if (localOrder) return Promise.resolve(localOrder);
    
    const lastDigit = orderId.slice(-1);
    let mockStatus: any = 'PENDING';
    if (['2', '6'].includes(lastDigit)) mockStatus = 'CONFIRMED';
    else if (['3', '7'].includes(lastDigit)) mockStatus = 'SHIPPED';
    else if (['4', '8'].includes(lastDigit)) mockStatus = 'DELIVERED';

    return Promise.resolve({
        id: orderId,
        customerName: "Cliente Demo",
        customerPhone: "+51 900 000 000",
        total: 129.90,
        status: mockStatus,
        items: [{ ...MOCK_PRODUCTS[0], quantity: 1 }],
        paymentMethod: 'YAPE',
        date: new Date().toISOString()
    });
  }

  // 2. Intentar consultar a Google Sheets
  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getOrder&orderId=${orderId}`);
    const json: ApiResponse<Order> = await response.json();
    
    if (json.status === 'success' && json.data) {
        const orderData = json.data;
        // Si la API devuelve el pedido pero sin items (para ahorrar datos), 
        // y tenemos los items en local, los fusionamos.
        if ((!orderData.items || orderData.items.length === 0) && localOrder) {
            orderData.items = localOrder.items;
        }
        // Asegurar array vacío si no hay info
        if (!orderData.items) orderData.items = [];
        
        return orderData;
    }
    
    // CASO CLAVE: La API respondió "success: false" (No encontrado o Error).
    // PERO, si nosotros acabamos de crear el pedido, lo tenemos en localOrder.
    // En lugar de devolver null (que muestra "No encontrado"), devolvemos el local.
    if (localOrder) {
        console.warn("Pedido no encontrado en API (posible retraso), usando versión local.");
        return localOrder;
    }
    
    return null;

  } catch (error) {
    console.error("Error conectando con API, usando fallback local", error);
    // Si falla la red o el script, devolvemos lo que tengamos en local
    return localOrder || null;
  }
};

export const submitOrder = async (order: Order): Promise<string> => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(`ORD-${Math.floor(10000 + Math.random() * 90000)}`);
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'createOrder', payload: order })
    });
    
    const json: ApiResponse<{orderId: string}> = await response.json();
    
    if (json.status === 'error') {
        throw new Error(json.message || 'Error en el script');
    }

    return json.data?.orderId || 'ERROR';
  } catch (error) {
    console.error(error);
    throw new Error('No se pudo procesar el pedido. Intenta nuevamente.');
  }
};