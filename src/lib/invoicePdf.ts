import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface InvoicePdfInput {
  invoice: {
    invoice_number: string;
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    tax_percentage: number;
    total_amount: number;
    paid_amount: number;
    due_amount: number;
    notes?: string | null;
    created_at: string;
  };
  salon?: {
    name?: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    gst_number?: string | null;
  } | null;
  customer?: {
    full_name?: string;
    phone?: string | null;
    email?: string | null;
  } | null;
  services: Array<{
    name?: string;
    price: number;
    duration_minutes?: number;
  }>;
}

// Luxury dark theme palette
const COLORS = {
  bg: [10, 10, 12] as [number, number, number],
  card: [22, 22, 28] as [number, number, number],
  border: [60, 60, 70] as [number, number, number],
  text: [240, 240, 245] as [number, number, number],
  muted: [160, 160, 170] as [number, number, number],
  accent: [232, 121, 198] as [number, number, number], // neon pink
};

const fmt = (n: number) => `Rs. ${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export const generateInvoicePdf = (input: InvoicePdfInput) => {
  const { invoice, salon, customer, services } = input;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Background
  doc.setFillColor(...COLORS.bg);
  doc.rect(0, 0, W, H, 'F');

  // Header band
  doc.setFillColor(...COLORS.card);
  doc.rect(0, 0, W, 110, 'F');
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(2);
  doc.line(0, 110, W, 110);

  // Salon name
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(salon?.name || 'Salon', 40, 50);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  const salonLines = [
    salon?.address,
    salon?.phone ? `Phone: ${salon.phone}` : '',
    salon?.email || '',
    salon?.gst_number ? `GST: ${salon.gst_number}` : '',
  ].filter(Boolean) as string[];
  salonLines.forEach((line, i) => doc.text(line, 40, 70 + i * 11));

  // Invoice meta (right)
  doc.setTextColor(...COLORS.accent);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('INVOICE', W - 40, 50, { align: 'right' });

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`No. ${invoice.invoice_number}`, W - 40, 68, { align: 'right' });
  doc.setTextColor(...COLORS.muted);
  doc.text(new Date(invoice.created_at).toLocaleDateString('en-IN'), W - 40, 82, { align: 'right' });

  // Bill to
  doc.setTextColor(...COLORS.accent);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', 40, 145);
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(11);
  doc.text(customer?.full_name || 'Customer', 40, 162);
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (customer?.phone) doc.text(customer.phone, 40, 176);
  if (customer?.email) doc.text(customer.email, 40, 188);

  // Services table
  autoTable(doc, {
    startY: 215,
    theme: 'plain',
    head: [['Service', 'Duration', 'Amount']],
    body: services.map((s) => [
      s.name || '—',
      s.duration_minutes ? `${s.duration_minutes} min` : '—',
      fmt(s.price),
    ]),
    headStyles: {
      fillColor: COLORS.card,
      textColor: COLORS.accent,
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 8,
    },
    bodyStyles: {
      fillColor: COLORS.bg,
      textColor: COLORS.text,
      fontSize: 10,
      cellPadding: 8,
    },
    alternateRowStyles: { fillColor: [16, 16, 20] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 90, halign: 'right' },
      2: { cellWidth: 100, halign: 'right' },
    },
    margin: { left: 40, right: 40 },
  });

  // Totals
  const lastY = (doc as any).lastAutoTable.finalY + 16;
  const totalsX = W - 240;
  const labelX = totalsX;
  const valueX = W - 40;

  const drawRow = (label: string, value: string, y: number, accent = false) => {
    doc.setFontSize(accent ? 12 : 10);
    doc.setFont('helvetica', accent ? 'bold' : 'normal');
    doc.setTextColor(...(accent ? COLORS.accent : COLORS.muted));
    doc.text(label, labelX, y);
    doc.setTextColor(...(accent ? COLORS.accent : COLORS.text));
    doc.text(value, valueX, y, { align: 'right' });
  };

  drawRow('Subtotal', fmt(invoice.subtotal), lastY);
  drawRow('Discount', `- ${fmt(invoice.discount_amount)}`, lastY + 18);
  drawRow(`Tax (${invoice.tax_percentage}%)`, fmt(invoice.tax_amount), lastY + 36);
  doc.setDrawColor(...COLORS.border);
  doc.line(totalsX, lastY + 46, valueX, lastY + 46);
  drawRow('Total', fmt(invoice.total_amount), lastY + 64, true);
  drawRow('Paid', fmt(invoice.paid_amount), lastY + 84);
  drawRow('Due', fmt(invoice.due_amount), lastY + 102, invoice.due_amount > 0);

  // Notes
  if (invoice.notes) {
    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(9);
    doc.text('Notes:', 40, lastY + 64);
    const split = doc.splitTextToSize(invoice.notes, 280);
    doc.text(split, 40, lastY + 78);
  }

  // Footer
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(8);
  doc.text('Thank you for your visit', W / 2, H - 30, { align: 'center' });

  doc.save(`Invoice-${invoice.invoice_number}.pdf`);
};
