import jsPDF from 'jspdf';

interface InvoiceData {
  transactionId: string;
  tierName: string;
  amount: number;
  currency: string;
  duration: string;
  userEmail: string;
  paymentMethod: string;
  date: Date;
}

const BUSINESS_NAME = 'SmartHome IoT Solutions';
const BUSINESS_ADDRESS = 'Chennai, Tamil Nadu, India';
const BUSINESS_GSTIN = 'GSTIN: 33XXXXX1234X1ZX';
const BUSINESS_EMAIL = 'support@smarthome.io';

export async function generateInvoicePDF(data: InvoiceData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 20, 25);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(BUSINESS_NAME, 20, 35);

  doc.setFontSize(9);
  doc.text(`#${data.transactionId.slice(0, 8).toUpperCase()}`, pageWidth - 20, 25, { align: 'right' });
  doc.text(data.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), pageWidth - 20, 33, { align: 'right' });

  // Business Details
  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFontSize(8);
  let y = 60;
  doc.text('FROM', 20, y);
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(BUSINESS_NAME, 20, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(BUSINESS_ADDRESS, 20, y + 15);
  doc.text(BUSINESS_GSTIN, 20, y + 22);
  doc.text(BUSINESS_EMAIL, 20, y + 29);

  // Customer Details
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('BILL TO', pageWidth - 80, y);
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(data.userEmail, pageWidth - 80, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Transaction: ${data.transactionId.slice(0, 8).toUpperCase()}`, pageWidth - 80, y + 15);

  // Separator
  y = 105;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, y, pageWidth - 20, y);

  // Table Header
  y = 115;
  doc.setFillColor(248, 250, 252);
  doc.rect(20, y - 5, pageWidth - 40, 14, 'F');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('ITEM', 25, y + 3);
  doc.text('DURATION', 100, y + 3);
  doc.text('AMOUNT', pageWidth - 25, y + 3, { align: 'right' });

  // Table Row
  y = 130;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.tierName} Plan`, 25, y + 3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('SmartHome Premium Subscription', 25, y + 11);

  doc.text(data.duration, 100, y + 3);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`₹${data.amount.toLocaleString()}`, pageWidth - 25, y + 3, { align: 'right' });

  // Total Section
  y = 160;
  doc.setDrawColor(226, 232, 240);
  doc.line(120, y, pageWidth - 20, y);

  y = 170;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal', 120, y);
  doc.setTextColor(30, 41, 59);
  doc.text(`₹${data.amount.toLocaleString()}`, pageWidth - 25, y, { align: 'right' });

  y = 180;
  doc.setTextColor(100, 116, 139);
  doc.text('GST (included)', 120, y);
  doc.setTextColor(30, 41, 59);
  doc.text('₹0', pageWidth - 25, y, { align: 'right' });

  y = 192;
  doc.setDrawColor(226, 232, 240);
  doc.line(120, y - 3, pageWidth - 20, y - 3);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Total', 120, y + 3);
  doc.text(`₹${data.amount.toLocaleString()}`, pageWidth - 25, y + 3, { align: 'right' });

  // Payment Info
  y = 215;
  doc.setFillColor(248, 250, 252);
  doc.rect(20, y - 5, pageWidth - 40, 30, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('PAYMENT DETAILS', 25, y + 3);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.text(`Method: ${data.paymentMethod}`, 25, y + 12);
  doc.text(`Status: Confirmed`, 25, y + 20);
  doc.text(`Date: ${data.date.toLocaleDateString('en-IN')}`, 100, y + 12);
  doc.text(`Currency: ${data.currency}`, 100, y + 20);

  // Terms
  y = 258;
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.text('Terms & Conditions:', 20, y);
  doc.text('1. This is a one-time payment for the selected subscription plan.', 20, y + 8);
  doc.text('2. Perpetual plans never expire. Starter and Pro plans are time-bound as specified.', 20, y + 14);
  doc.text('3. For support, contact ' + BUSINESS_EMAIL, 20, y + 20);
  doc.text('4. This invoice is computer generated and does not require a signature.', 20, y + 26);

  // Save
  const fileName = `SmartHome_Invoice_${data.transactionId.slice(0, 8).toUpperCase()}.pdf`;
  doc.save(fileName);
}
