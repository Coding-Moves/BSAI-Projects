// src/components/Bill/BillActions.jsx
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Printer, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function BillActions({ billRef, invoiceNumber, orderDate }) {
  const handlePrint = useReactToPrint({
    content: () => billRef.current,
    documentTitle: `Invoice-${invoiceNumber}`,
    onAfterPrint: () => toast.success('Bill sent to printer'),
  });

  const handleDownloadPDF = async () => {
    if (!billRef.current) return;
    const toastId = toast.loading('Generating PDF…');
    try {
      const canvas = await html2canvas(billRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');

      // A5 size in mm: 148 x 210
      const pdf   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
      const pdfW  = pdf.internal.pageSize.getWidth();
      const pdfH  = (canvas.height * pdfW) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);

      const dateStr = orderDate ? format(new Date(orderDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      pdf.save(`Invoice-${invoiceNumber}-${dateStr}.pdf`);
      toast.success('PDF downloaded', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF', { id: toastId });
    }
  };

  return (
    <div className="flex gap-3 print-hide no-print">
      <button onClick={handlePrint} className="btn-secondary">
        <Printer className="w-4 h-4" />
        Print Bill
      </button>
      <button onClick={handleDownloadPDF} className="btn-primary">
        <Download className="w-4 h-4" />
        Download PDF
      </button>
    </div>
  );
}
