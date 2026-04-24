import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Printer, Download, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { generateInvoicePdf } from '@/lib/invoicePdf';

interface InvoiceViewProps {
  invoice: {
    id: string;
    invoice_number: string;
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    tax_percentage: number;
    total_amount: number;
    paid_amount: number;
    due_amount: number;
    created_at: string;
    notes?: string;
    appointment?: {
      appointment_date: string;
      start_time: string;
      customer?: {
        full_name: string;
        phone: string;
        email?: string;
        address?: string;
      };
    };
  };
  salon: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    gst_number?: string;
  };
  services: Array<{
    name: string;
    price: number;
    duration_minutes: number;
  }>;
  payments: Array<{
    amount: number;
    payment_method: string;
    created_at: string;
    transaction_id?: string;
  }>;
  onClose: () => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({
  invoice,
  salon,
  services,
  payments,
  onClose,
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = invoiceRef.current?.innerHTML;
    const printWindow = window.open('', '_blank');
    if (printWindow && printContent) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - ${invoice.invoice_number}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #e91e8c; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
              th { background: #f5f5f5; }
              .total-row { font-weight: bold; font-size: 16px; }
              .gst-info { font-size: 12px; color: #666; }
              .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
              @media print { body { print-color-adjust: exact; } }
            </style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const cgst = invoice.tax_amount / 2;
  const sgst = invoice.tax_amount / 2;

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button variant="outline" size="sm" onClick={() => generateInvoicePdf({ invoice, salon, customer: invoice.appointment?.customer, services })}>
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Invoice Content */}
      <div ref={invoiceRef} className="bg-white text-black rounded-lg p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#e91e8c] mb-2">{salon.name}</h1>
          {salon.address && <p className="text-gray-600">{salon.address}</p>}
          <div className="flex justify-center gap-4 text-sm text-gray-600 mt-2">
            {salon.phone && <span>📞 {salon.phone}</span>}
            {salon.email && <span>✉️ {salon.email}</span>}
          </div>
          {salon.gst_number && (
            <p className="text-sm mt-2">GSTIN: {salon.gst_number}</p>
          )}
        </div>

        <Separator className="bg-gray-300" />

        {/* Invoice Info */}
        <div className="grid grid-cols-2 gap-4 my-6">
          <div>
            <h3 className="font-bold text-gray-700 mb-2">Bill To:</h3>
            <p className="font-medium">{invoice.appointment?.customer?.full_name}</p>
            <p className="text-gray-600">{invoice.appointment?.customer?.phone}</p>
            {invoice.appointment?.customer?.email && (
              <p className="text-gray-600">{invoice.appointment?.customer?.email}</p>
            )}
            {invoice.appointment?.customer?.address && (
              <p className="text-gray-600">{invoice.appointment?.customer?.address}</p>
            )}
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">Invoice #{invoice.invoice_number}</p>
            <p className="text-gray-600">
              Date: {format(new Date(invoice.created_at), 'dd MMM yyyy')}
            </p>
            {invoice.appointment && (
              <p className="text-gray-600">
                Service Date: {format(new Date(invoice.appointment.appointment_date), 'dd MMM yyyy')}
              </p>
            )}
          </div>
        </div>

        {/* Services Table */}
        <table className="w-full mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-3">Service</th>
              <th className="text-center p-3">Duration</th>
              <th className="text-right p-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="p-3">{service.name}</td>
                <td className="text-center p-3">{service.duration_minutes} min</td>
                <td className="text-right p-3">₹{service.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-₹{invoice.discount_amount.toFixed(2)}</span>
              </div>
            )}
            {invoice.tax_amount > 0 && (
              <>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>CGST ({invoice.tax_percentage / 2}%):</span>
                  <span>₹{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>SGST ({invoice.tax_percentage / 2}%):</span>
                  <span>₹{sgst.toFixed(2)}</span>
                </div>
              </>
            )}
            <Separator className="bg-gray-300" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>₹{invoice.total_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Paid:</span>
              <span>₹{invoice.paid_amount.toFixed(2)}</span>
            </div>
            {invoice.due_amount > 0 && (
              <div className="flex justify-between text-red-600 font-bold">
                <span>Due:</span>
                <span>₹{invoice.due_amount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment History */}
        {payments.length > 0 && (
          <div className="mt-8">
            <h4 className="font-bold text-gray-700 mb-3">Payment History:</h4>
            <div className="space-y-2">
              {payments.map((payment, index) => (
                <div
                  key={index}
                  className="flex justify-between text-sm p-2 bg-gray-50 rounded"
                >
                  <span>
                    {format(new Date(payment.created_at), 'dd MMM yyyy HH:mm')} -{' '}
                    <span className="capitalize">{payment.payment_method}</span>
                    {payment.transaction_id && ` (${payment.transaction_id})`}
                  </span>
                  <span className="font-medium">₹{payment.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center text-sm text-gray-600">
          <Separator className="bg-gray-300 mb-4" />
          <p>Thank you for choosing {salon.name}!</p>
          <p className="mt-1">We look forward to serving you again.</p>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};
