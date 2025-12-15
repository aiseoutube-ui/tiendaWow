// -----------------------------------------------------------
// GOOGLE APPS SCRIPT BACKEND FOR TIENDAWOW
// -----------------------------------------------------------
// IMPORTANTE:
// Cada vez que actualices este código, debes ir a:
// "Implementar" (Deploy) > "Gestionar implementaciones" > "Editar"
// > Versión: "NUEVA VERSIÓN" (New Version) > "Implementar".
// Si no creas una nueva versión, los cambios NO se aplicarán.
// -----------------------------------------------------------

function doGet(e) {
  const params = e.parameter;
  const action = params.action;
  
  // CORS Headers for all responses
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (action === 'getProducts') {
    return getProducts();
  } else if (action === 'checkStock') {
    return checkStock(params.id);
  } else if (action === 'getOrder') {
    return getOrder(params.orderId);
  }
  
  return responseJSON({ status: 'error', message: 'Invalid action' });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'createOrder') {
      return createOrder(data.payload);
    }
    
    return responseJSON({ status: 'error', message: 'Invalid action' });
  } catch (err) {
    return responseJSON({ status: 'error', message: err.toString() });
  }
}

// --- LOGIC ---

function getProducts() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Productos');
  if (!sheet) return responseJSON({ status: 'error', message: 'Tab Productos missing' });

  const data = sheet.getDataRange().getValues();
  const headers = data.shift(); // Remove headers
  
  const products = data.map(row => {
    return {
      id: row[0],
      name: row[1],
      price: Number(row[2]),
      oldPrice: row[3] ? Number(row[3]) : null,
      stock: Number(row[4]),
      imageUrl: row[5],
      videoUrl: row[6],
      description: row[7]
    };
  });
  
  return responseJSON({ status: 'success', data: products });
}

function checkStock(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Productos');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) == String(id)) {
      return responseJSON({ status: 'success', data: Number(data[i][4]) });
    }
  }
  return responseJSON({ status: 'error', data: 0 });
}

function getOrder(orderId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Pedidos');
  if (!sheet) return responseJSON({ status: 'error', message: 'Tab Pedidos missing' });

  // Column A (0) is OrderID
  const data = sheet.getDataRange().getValues();
  
  // Limpiamos el input
  const searchId = String(orderId).trim().toLowerCase();

  for (let i = 1; i < data.length; i++) {
    // Convertimos ambos a string, trim y lower para comparación robusta
    const rowId = String(data[i][0]).trim().toLowerCase();
    
    if (rowId == searchId) { 
      return responseJSON({ 
        status: 'success', 
        data: {
          id: data[i][0], // Retornamos el ID original con mayúsculas correctas
          customerName: data[i][2],
          total: Number(data[i][4]),
          status: data[i][7] // Status column (H)
        } 
      });
    }
  }
  return responseJSON({ status: 'error', message: 'Pedido no encontrado en Sheet' });
}

function createOrder(order) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const productSheet = ss.getSheetByName('Productos');
  const orderSheet = ss.getSheetByName('Pedidos');
  const lock = LockService.getScriptLock();
  
  try {
    lock.waitLock(10000); 
  } catch (e) {
    return responseJSON({ status: 'error', message: 'Servidor ocupado, intenta de nuevo.' });
  }

  const productData = productSheet.getDataRange().getValues();
  const items = order.items;
  const updates = []; 

  // 1. Validate Stock
  for (let k = 0; k < items.length; k++) {
    let item = items[k];
    let productRowIndex = -1;
    let currentStock = 0;
    
    for (let i = 1; i < productData.length; i++) {
      if (String(productData[i][0]) == String(item.id)) {
        productRowIndex = i + 1;
        currentStock = Number(productData[i][4]);
        break;
      }
    }

    if (productRowIndex === -1) {
       lock.releaseLock();
       return responseJSON({ status: 'error', message: `Producto ${item.name} no encontrado.` });
    }

    if (currentStock < item.quantity) {
      lock.releaseLock();
      return responseJSON({ status: 'error', message: `Stock insuficiente para ${item.name}. Disp: ${currentStock}` });
    }
    
    updates.push({ rowIndex: productRowIndex, newStock: currentStock - item.quantity });
  }
  
  // 2. Deduct Stock
  for (let u = 0; u < updates.length; u++) {
    productSheet.getRange(updates[u].rowIndex, 5).setValue(updates[u].newStock);
  }
  
  // 3. Save Order
  const orderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000); // 5 digits
  const date = new Date();
  
  orderSheet.appendRow([
    orderId,
    date,
    order.customerName,
    order.customerPhone,
    order.total,
    JSON.stringify(order.items), 
    order.paymentMethod,
    'PENDING' 
  ]);
  
  lock.releaseLock();
  return responseJSON({ status: 'success', data: { orderId: orderId } });
}

function responseJSON(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}