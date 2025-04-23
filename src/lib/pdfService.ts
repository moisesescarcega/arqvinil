import jsPDF from 'jspdf';
import type { CartItem } from './cartStore';

export function generateOrderPDF(items: CartItem[], totalAmount: number, orderId?: string): jsPDF {
  // Crear un nuevo documento PDF
  const doc = new jsPDF();
  
  // Configurar encabezado
  doc.setFontSize(20);
  doc.text("Resumen de Pedido", 105, 20, { align: "center" });
  
  if (orderId) {
    doc.setFontSize(12);
    doc.text(`ID del pedido: ${orderId}`, 105, 30, { align: "center" });
  }
  
  doc.setFontSize(12);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 105, 40, { align: "center" });
  
  // Dibujar línea separadora
  doc.line(20, 45, 190, 45);
  
  // Configurar contenido
  let yPosition = 55;
  
  // Iterar sobre cada elemento del carrito
  items.forEach((item, index) => {
    // Verificar si hay espacio suficiente en la página actual
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text(`Orden #${index + 1}: ${item.id.slice(-6)}`, 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.text(`Diseño: ${item.order.selectedVinil} | Color: ${item.order.vinilColor} | Cantidad: ${item.order.totalViniles}`, 20, yPosition);
    yPosition += 7;
    
    doc.text(`Dimensiones: ${item.order.vinilDimensions} cm`, 20, yPosition);
    yPosition += 7;
    
    doc.text(`Subtotal: $${item.order.totalAmount.toFixed(2)} MXN`, 20, yPosition);
    yPosition += 10;
    
    // Dibujar línea separadora entre productos
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;
  });
  
  // Configurar el total
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: $${totalAmount.toFixed(2)} MXN`, 150, yPosition);
  
  // Configurar contenido extra
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Depósito a la cuenta: Banco Santander, a nombre de Moisés Alonso Escárcega Olivares,`, 20, yPosition + 16);
  doc.text(`CLABE: 014180605800654909 Envía este documento junto con tu voucher al correo:`, 20, yPosition + 22);
  doc.text(`moi.escarcega@outlook.es | Espera respuesta, para programar la entrega en`, 20, yPosition + 28);
  doc.text(`el vestíbulo de la Facultad de Arquitectura (1 a 2 días después de tu pedido)`, 20, yPosition + 34);
  doc.setFontSize(10);
  doc.text(`* Puedes depositar el total del monto, o una parcialidad que prefieras.`, 20, yPosition + 42);
  doc.text(`O indicarme en el mail si prefieres pago contra entrega. ¡Gracias por tu compra!`, 20, yPosition + 47);
  
  // Configurar pie de página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Personaliza con vinil. Sistema creado por Moisés Escárcega. Página ${i} de ${pageCount}`, 105, 290, { align: "center" });
  }
  
  return doc;
}

// Función para generar y descargar el PDF
export function downloadOrderPDF(items: CartItem[], totalAmount: number, orderId?: string) {
  const doc = generateOrderPDF(items, totalAmount, orderId);
  doc.save(`orden_${orderId || new Date().getTime()}.pdf`);
}