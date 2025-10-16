import PDFDocument from 'pdfkit';

interface InvoiceData {
  invoice: {
    id: string;
    number: string;
    date: Date;
    dueDate: Date;
    status: string;
    totalAmount: number;
  };
  customer: {
    name: string;
    email: string;
    taxNumber?: string;
    address?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

export class PDFService {
  async generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks: Buffer[] = [];

        // Collect PDF chunks
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        this.generateHeader(doc);
        
        // Invoice details
        this.generateInvoiceInfo(doc, data.invoice);
        
        // Customer information
        this.generateCustomerInfo(doc, data.customer);
        
        // Invoice items table
        this.generateInvoiceTable(doc, data.items);
        
        // Total
        this.generateTotal(doc, data.invoice.totalAmount);
        
        // Footer
        this.generateFooter(doc);

        // Finalize PDF
        doc.end();
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  private generateHeader(doc: PDFKit.PDFDocument) {
    doc
      .fontSize(20)
      .fillColor('#2563eb')
      .text('INVOICE', 50, 50, { align: 'left' })
      .fontSize(10)
      .fillColor('#000000')
      .text('Invoice Management System', 50, 75)
      .moveDown();
  }

  private generateInvoiceInfo(doc: PDFKit.PDFDocument, invoice: InvoiceData['invoice']) {
    const topY = 130;
    
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Invoice Number:', 350, topY)
      .font('Helvetica')
      .text(invoice.number, 450, topY)
      .font('Helvetica-Bold')
      .text('Invoice Date:', 350, topY + 15)
      .font('Helvetica')
      .text(this.formatDate(invoice.date), 460, topY + 15)
      .font('Helvetica-Bold')
      .text('Due Date:', 350, topY + 30)
      .font('Helvetica')
      .text(this.formatDate(invoice.dueDate), 460, topY + 30)
      .font('Helvetica-Bold')
      .text('Status:', 350, topY + 45)
      .font('Helvetica')
      .fillColor(this.getStatusColor(invoice.status))
      .text(invoice.status, 460, topY + 45)
      .fillColor('black');
  }

  private generateCustomerInfo(doc: PDFKit.PDFDocument, customer: InvoiceData['customer']) {
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Bill To:', 50, 130)
      .font('Helvetica')
      .fontSize(10)
      .text(customer.name, 50, 150)
      .text(customer.email, 50, 165);

    if (customer.taxNumber) {
      doc.text(`Tax Number: ${customer.taxNumber}`, 50, 180);
    }

    if (customer.address) {
      doc.text(customer.address, 50, customer.taxNumber ? 195 : 180, { width: 250 });
    }

    doc.moveDown(3);
  }

  private generateInvoiceTable(doc: PDFKit.PDFDocument, items: InvoiceData['items']) {
    const tableTop = 280;
    const descriptionX = 50;
    const quantityX = 280;
    const priceX = 370;
    const totalX = 460;

    // Table header
    doc
      .fontSize(10)
      .fillColor('#4b5563')
      .font('Helvetica-Bold')
      .text('Description', descriptionX, tableTop)
      .text('Qty', quantityX, tableTop)
      .text('Unit Price', priceX, tableTop)
      .text('Total', totalX, tableTop)
      .font('Helvetica');

    // Line under header
    doc
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // Table rows
    let position = tableTop + 30;
    doc.fillColor('#000000');

    for (const item of items) {
      doc
        .fontSize(9)
        .text(item.description, descriptionX, position, { width: 210 })
        .text(item.quantity.toString(), quantityX, position)
        .text(`$${this.formatCurrency(item.unitPrice)}`, priceX, position)
        .text(`$${this.formatCurrency(item.total)}`, totalX, position);

      position += 25;

      // Add new page if needed
      if (position > 700) {
        doc.addPage();
        position = 50;
      }
    }

    // Line after items
    doc
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .moveTo(50, position)
      .lineTo(550, position)
      .stroke();

    return position + 10;
  }

  private generateTotal(doc: PDFKit.PDFDocument, totalAmount: number) {
    const position = doc.y + 20;

    doc
      .fontSize(12)
      .fillColor('#000000')
      .font('Helvetica-Bold')
      .text('Total Amount:', 370, position)
      .fontSize(14)
      .fillColor('#2563eb')
      .text(`$${this.formatCurrency(totalAmount)}`, 460, position)
      .font('Helvetica');
  }

  private generateFooter(doc: PDFKit.PDFDocument) {
    doc
      .fontSize(8)
      .fillColor('#6b7280')
      .text(
        'Thank you for your business!',
        50,
        750,
        { align: 'center', width: 500 }
      )
      .text(
        `Generated on ${this.formatDate(new Date())}`,
        50,
        765,
        { align: 'center', width: 500 }
      );
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private formatCurrency(amount: number): string {
    return Number(amount).toFixed(2);
  }

  private getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      DRAFT: '#6b7280',
      SENT: '#3b82f6',
      PAID: '#10b981',
      CANCELLED: '#ef4444',
    };
    return colors[status] || '#000000';
  }
}
