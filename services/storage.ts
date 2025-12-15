import { Order } from '../types';

const STORAGE_KEY = 'tiendawow_order_history';

export const saveLocalOrder = (order: Order) => {
  try {
    const currentHistory = getLocalOrders();
    // Add new order to the beginning of the array
    const updatedHistory = [order, ...currentHistory];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Error saving order to local storage", error);
  }
};

export const getLocalOrders = (): Order[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error reading local orders", error);
    return [];
  }
};

export const getOrderById = (id: string): Order | undefined => {
    const orders = getLocalOrders();
    // Búsqueda insensible a mayúsculas/minúsculas
    return orders.find(o => o.id && o.id.toLowerCase().trim() === id.toLowerCase().trim());
}