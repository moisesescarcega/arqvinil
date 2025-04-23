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
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text(`Orden #${index + 1}: ${item.id.slice(-6)}`, 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.text(`Diseño: ${item.order.selectedVinil} | Color: ${item.color} | Cantidad: ${item.order.totalViniles}`, 20, yPosition);
    yPosition += 7;
    
    // if ('kit' in item.order.figures && item.order.figures.kit) {
    //   doc.text(`Kit predefinido: ${item.order.figures.kit}`, 20, yPosition);
    //   yPosition += 7;
    // } else {
    //   doc.text(`Figuras: ${('standing_man' in item.order.figures) ? `Hombre de pie: ${item.order.figures.standing_man}, ` : ''}` +
    //           `${('standing_woman' in item.order.figures) ? `Mujer de pie: ${item.order.figures.standing_woman}, ` : ''}` +
    //           `${('sitting' in item.order.figures) ? `Sentado: ${item.order.figures.sitting}, ` : ''}` +
    //           `${('walking' in item.order.figures) ? `Caminando: ${item.order.figures.walking}` : ''}`, 20, yPosition);
    //   yPosition += 7;
    // }
    
    doc.text(`Dimensiones: ${item.order.vinilDimensions}`, 20, yPosition);
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
  
  // Configurar pie de página
//   const pageCount = doc.internal.getNumberOfPages();
//   for (let i = 1; i <= pageCount; i++) {
//     doc.setPage(i);
//     doc.setFontSize(10);
//     doc.setFont('helvetica', 'normal');
//     doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: "center" });
//   }
  
  return doc;
}

// Función para generar y descargar el PDF
export function downloadOrderPDF(items: CartItem[], totalAmount: number, orderId?: string) {
  const doc = generateOrderPDF(items, totalAmount, orderId);
  doc.save(`orden_${orderId || new Date().getTime()}.pdf`);
}