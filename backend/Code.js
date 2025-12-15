// -----------------------------------------------------------
// GOOGLE APPS SCRIPT BACKEND FOR TIENDAWOW
// -----------------------------------------------------------
// 1. Create a Google Sheet.
// 2. Create tab "Productos" with columns: id, name, price, oldPrice, stock, imageUrl, videoUrl, description
// 3. Create tab "Pedidos" with columns: orderId, date, customerName, phone, total, items, paymentMethod, status
// 4. Extensions > Apps Script. Paste this code.
// 5. Deploy > New Deployment > Web App > Execute as: Me > Who has access: Anyone.
// -----------------------------------------------------------

function doGet(e) {
  const params = e.parameter;
  const action = params.action;
  
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
    if (data[i][0] == id) {
      return responseJSON({ status: 'success', data: Number(data[i][4]) });
    }
  }
  return responseJSON({ status: 'error', data: 0 });
}

function getOrder(orderId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Pedidos');
  // Assuming column A (index 0) is orderId, column C (index 2) is Name, column H (index 7) is Status
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    // Loose equality to catch number vs string differences
    if (data[i][0] == orderId) { 
      return responseJSON({ 
        status: 'success', 
        data: {
          id: data[i][0],
          customerName: data[i][2],
          total: Number(data[i][4]),
          status: data[i][7] // The status column
        } 
      });
    }
  }
  return responseJSON({ status: 'error', message: 'Pedido no encontrado' });
}

function createOrder(order) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const productSheet = ss.getSheetByName('Productos');
  const orderSheet = ss.getSheetByName('Pedidos');
  const lock = LockService.getScriptLock();
  
  // Try to obtain lock to prevent race conditions during stock updates
  try {
    lock.waitLock(10000); // Wait up to 10 seconds
  } catch (e) {
    return responseJSON({ status: 'error', message: 'Server busy, try again.' });
  }

  const productData = productSheet.getDataRange().getValues();
  const items = order.items;
  const updates = []; // Store updates to apply them all at once if validation passes

  // 1. Validate Stock for ALL items
  for (let k = 0; k < items.length; k++) {
    let item = items[k];
    let productRowIndex = -1;
    let currentStock = 0;
    
    for (let i = 1; i < productData.length; i++) {
      if (productData[i][0] == item.id) {
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
      return responseJSON({ status: 'error', message: `Stock insuficiente para ${item.name}. Disponibles: ${currentStock}` });
    }
    
    // Store the update plan: [rowIndex, newStock]
    updates.push({ rowIndex: productRowIndex, newStock: currentStock - item.quantity });
  }
  
  // 2. Deduct Stock (All checks passed)
  for (let u = 0; u < updates.length; u++) {
    productSheet.getRange(updates[u].rowIndex, 5).setValue(updates[u].newStock);
  }
  
  // 3. Save Order
  const orderId = 'ORD-' + Math.floor(Math.random() * 100000);
  const date = new Date();
  
  orderSheet.appendRow([
    orderId,
    date,
    order.customerName,
    order.customerPhone,
    order.total,
    JSON.stringify(order.items), // Save full JSON of items
    order.paymentMethod,
    'PENDING' // Initial status
  ]);
  
  lock.releaseLock();
  return responseJSON({ status: 'success', data: { orderId: orderId } });
}

function responseJSON(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// -----------------------------------------------------------
// UTILITY: SEED DATABASE (Run this manually once)
// -----------------------------------------------------------
function seedDatabase() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Productos');
  if (!sheet) {
    throw new Error('La hoja "Productos" no existe. Créala primero.');
  }
  
  // Clear existing data but keep headers if they exist, or reset completely
  sheet.clear();
  
  // Headers
  const headers = ['id', 'name', 'price', 'oldPrice', 'stock', 'imageUrl', 'videoUrl', 'description'];
  sheet.appendRow(headers);
  
  const categories = [
    { name: 'Audífonos', adj: ['Bluetooth', 'Pro', 'Cancelación de Ruido', 'Gamer', 'Sport', 'Bass'] },
    { name: 'Smartwatch', adj: ['T500', 'Serie 8', 'Deportivo', 'Elegante', 'Fit', 'Ultra'] },
    { name: 'Zapatillas', adj: ['Urbanas', 'Running', 'Flow', 'Retro', 'Chunky', 'Air'] },
    { name: 'Mochila', adj: ['Antirrobo', 'USB', 'Impermeable', 'Laptop', 'Viajera', 'Minimalista'] },
    { name: 'Parlante', adj: ['Portátil', 'RGB', 'Waterproof', 'Mini', 'Boombox', 'Stereo'] },
    { name: 'Aro de Luz', adj: ['LED', 'RGB', '26cm', 'Profesional', 'Selfie', 'Tripode'] },
    { name: 'Case', adj: ['iPhone', 'Samsung', 'Transparente', 'Antigolpes', 'Silicona', 'Magsafe'] },
    { name: 'Cámara', adj: ['Seguridad', 'Wifi', 'Espía', 'Deportiva', '4K', 'Baby Monitor'] }
  ];

  const descriptions = [
    "La mejor calidad precio del mercado. Ideal para tu día a día en Lima.",
    "Diseño exclusivo y materiales de alta durabilidad. Envío rápido.",
    "Perfecto para regalo o uso personal. Garantía de tienda.",
    "Última tendencia en tecnología. Stock limitado por lanzamiento.",
    "Comodidad y estilo en un solo producto. Compra segura."
  ];
  
  const videoUrls = [
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "", "", "" // Only some have videos
  ];

  const newRows = [];
  
  for (let i = 1; i <= 50; i++) {
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const adj = cat.adj[Math.floor(Math.random() * cat.adj.length)];
    const name = `${cat.name} ${adj} ${Math.floor(Math.random() * 100) + 2024}`;
    
    const id = `P${String(i).padStart(3, '0')}`;
    const price = Math.floor(Math.random() * 200) + 30; // 30 to 230
    const hasDiscount = Math.random() > 0.4; // 60% chance of discount
    const oldPrice = hasDiscount ? Math.floor(price * (1.2 + Math.random() * 0.5)) : '';
    const stock = Math.random() > 0.1 ? Math.floor(Math.random() * 50) + 2 : 0; // 10% chance of 0 stock
    
    // Generate a consistent random image based on ID
    // We use picsum with a specific seed so the image doesn't change on reload
    const imageUrl = `https://picsum.photos/seed/${id}/500/500`;
    
    const video = videoUrls[Math.floor(Math.random() * videoUrls.length)];
    const desc = descriptions[Math.floor(Math.random() * descriptions.length)];

    newRows.push([id, name, price, oldPrice, stock, imageUrl, video, desc]);
  }
  
  // Batch write for performance
  sheet.getRange(2, 1, newRows.length, 8).setValues(newRows);
}