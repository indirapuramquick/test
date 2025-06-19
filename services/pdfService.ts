
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // Ensure this is imported for autoTable
import { Order, OrderItem } from '../types';
import { RESTAURANT_NAME, RESTAURANT_ADDRESS_LINE1, RESTAURANT_PHONE } from '../constants';

// Extend jsPDF interface to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateInvoicePdf = (order: Order): jsPDF => {
  const pdf = new jsPDF('p', 'pt', 'a4'); // A4 Portrait: 595.28 x 841.89 points
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 30;
  let yPos = margin;

  // Restaurant Header
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(RESTAURANT_NAME, pageWidth / 2, yPos, { align: 'center' });
  yPos += 20;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(RESTAURANT_ADDRESS_LINE1, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;
  pdf.text(`Phone: ${RESTAURANT_PHONE}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 30;

  // Invoice Title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVOICE', pageWidth / 2, yPos, { align: 'center' });
  yPos += 30;

  // Customer and Order Details
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const col1X = margin;
  const col2X = pageWidth / 2 + margin/2;

  pdf.text(`Customer Name: ${order.customerName}`, col1X, yPos);
  pdf.text(`Invoice No: ${order.id}`, col2X, yPos);
  yPos += 15;
  pdf.text(`Phone: ${order.customerPhone}`, col1X, yPos);
  pdf.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, col2X, yPos);
  yPos += 15;
  if(order.orderType === "Delivery" && order.customerAddress) {
    pdf.text(`Address: ${order.customerAddress}`, col1X, yPos, {maxWidth: pageWidth/2 - margin - 5});
     const addressLines = pdf.splitTextToSize(`Address: ${order.customerAddress}`, pageWidth/2 - margin - 5);
     yPos += (addressLines.length > 1 ? (addressLines.length * 10) : 0);
  }
  pdf.text(`Order Type: ${order.orderType}`, col2X, yPos);
  yPos += 30;


  // Items Table
  const tableColumn = ["S.No.", "Item Name", "Qty", "Rate", "Amount"];
  const tableRows: (string | number)[][] = [];

  order.items.forEach((item, index) => {
    const itemData = [
      index + 1,
      item.nameAtOrder,
      item.quantity,
      item.priceAtOrder.toFixed(2),
      (item.quantity * item.priceAtOrder).toFixed(2),
    ];
    tableRows.push(itemData);
  });

  pdf.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: yPos,
    theme: 'grid',
    headStyles: { fillColor: [230, 92, 0] }, // Orange color similar to theme
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: {
        0: {cellWidth: 40, halign: 'center'}, // S.No.
        1: {cellWidth: 'auto'}, // Item Name
        2: {cellWidth: 40, halign: 'center'}, // Qty
        3: {cellWidth: 60, halign: 'right'}, // Rate
        4: {cellWidth: 70, halign: 'right'}  // Amount
    }
  });

  // @ts-ignore (jspdf-autotable's typings for lastAutoTable are sometimes problematic)
  yPos = pdf.lastAutoTable.finalY + 20;

  // Total Amount
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Total Amount:', pageWidth - margin - 150, yPos, { align: 'left' });
  pdf.text(`Rs. ${order.totalAmount.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 30;

  // Thank you note
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Thank you for your order!', pageWidth / 2, yPos, { align: 'center' });

  return pdf;
};


export const sharePdf = async (pdf: jsPDF, fileName: string): Promise<void> => {
  try {
    const pdfBlob = pdf.output('blob');
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      await navigator.share({
        files: [pdfFile],
        title: 'Invoice',
        text: `Invoice from ${RESTAURANT_NAME}`,
      });
    } else {
      // Fallback to download for browsers that don't support navigator.share or can't share files
      pdf.save(fileName);
    }
  } catch (error) {
    console.error('Error sharing PDF:', error);
    // Fallback to download on any error during sharing
    pdf.save(fileName);
    alert('Could not share PDF. It has been downloaded instead.');
  }
};
