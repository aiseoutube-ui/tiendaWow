import { GOOGLE_SCRIPT_URL, MOCK_PRODUCTS, USE_MOCK_DATA } from '../constants';
import { Product, ApiResponse, Order } from '../types';

export const fetchProducts = async (): Promise<Product[]> => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_PRODUCTS), 1500); // Simulate network latency
    });
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
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
       setTimeout(() => resolve({
          id: orderId,
          customerName: "Cliente Prueba",
          customerPhone: "+14383904989",
          total: 150.00,
          status: 'PENDING',
          items: [],
          paymentMethod: 'YAPE'
       }), 1000);
    });
  }

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getOrder&orderId=${orderId}`);
    const json: ApiResponse<Order> = await response.json();
    return json.status === 'success' && json.data ? json.data : null;
  } catch (error) {
    console.error("Error fetching order", error);
    return null;
  }
};

export const submitOrder = async (order: Order): Promise<string> => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => setTimeout(() => resolve(`ORD-${Date.now()}`), 2000));
  }

  try {
    // Google Apps Script requires text/plain for POST to avoid complex CORS preflight issues 
    // in some browser environments when using simple triggers, but standard fetch handles JSON
    // with proper GAS setup. We use no-cors if strict CORS fails, but we want the response.
    // The standard way for GAS Web App:
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'createOrder', payload: order })
    });
    
    const json: ApiResponse<{orderId: string}> = await response.json();
    return json.data?.orderId || 'ERROR';
  } catch (error) {
    console.error(error);
    throw new Error('No se pudo procesar el pedido');
  }
};