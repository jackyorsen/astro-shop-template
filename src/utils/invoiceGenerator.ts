import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define Interface locally to strictly match what we expect
interface InvoiceOrder {
    id: string;
    createdAt: any;
    status: string;
    items: any[];
    amount: number;
    currency: string;
    customerName: string;
    customerEmail: string;
    paymentDetails?: string;
    shippingAddress?: {
        name: string;
        street: string;
        zip: string;
        city: string;
        country: string;
    };
    metadata?: {
        coupon_code?: string;
        discount_amount?: string;
        [key: string]: any;
    };
}

export const generateInvoice = (order: InvoiceOrder) => {
    try {
        const doc = new jsPDF();

        // Brand Colors
        const colorPrimary = '#1f3a34'; // Mamoru Green
        const colorSecondary = '#666666';

        // Helper for Currency - independent of current site context!
        const currency = (order.currency || 'EUR').toUpperCase();

        // Fix: Ensure amount is a number and valid
        const safeAmount = typeof order.amount === 'number' ? order.amount : 0;
        const finalTotal = safeAmount / 100;

        // Check for discount
        const discountStr = order.metadata?.discount_amount;
        const couponCode = order.metadata?.coupon_code;
        const discountAmount = discountStr ? parseFloat(discountStr) : 0;
        const subtotal = finalTotal + discountAmount;

        const formatInvoiceMoney = (val: number) => {
            return new Intl.NumberFormat(currency === 'CHF' ? 'de-CH' : 'de-DE', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2
            }).format(val);
        };

        // --- HEADER ---
        doc.setFontSize(24);
        doc.setTextColor(colorPrimary);
        doc.setFont('helvetica', 'bold');
        doc.text('MAMORU', 20, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('MOEBEL', 62, 20); // Small suffix

        // Company Address (Right Aligned)
        doc.setFontSize(9);
        doc.setTextColor(colorSecondary);
        doc.text([
            'mamoruCH Herrscher',
            'Rathausplatz 3',
            '8853 Lachen',
            'Schweiz',
            'aureliusherrscher@gmail.com'
        ], 190, 20, { align: 'right' });

        // --- INFO BLOCK ---
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 35, 190, 35); // Separator Line

        // Customer Address (Left)
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        // Date formatting helper - ROBUST
        let dateStr = new Date().toLocaleDateString('de-DE');
        if (order.createdAt) {
            try {
                const dateObj = order.createdAt.seconds ? new Date(order.createdAt.seconds * 1000) : new Date(order.createdAt);
                if (!isNaN(dateObj.getTime())) {
                    dateStr = dateObj.toLocaleDateString('de-DE');
                }
            } catch (e) {
                console.warn('Date parsing error', e);
            }
        }

        const addressY = 50;
        const safeName = order.customerName || 'Kunde';
        const safeEmail = order.customerEmail || '';

        if (order.shippingAddress) {
            doc.text(order.shippingAddress.name || safeName, 20, addressY);
            doc.text(order.shippingAddress.street || '', 20, addressY + 5);
            doc.text(`${order.shippingAddress.zip || ''} ${order.shippingAddress.city || ''}`, 20, addressY + 10);
            const country = order.shippingAddress.country || '';
            // Display full country name if it's a code
            doc.text(country === 'CH' ? 'Schweiz' : (country === 'DE' ? 'Deutschland' : country), 20, addressY + 15);
        } else {
            doc.text(safeName, 20, addressY);
            doc.text(safeEmail, 20, addressY + 5);
        }

        // Invoice Details (Right)
        doc.setFontSize(10);
        const orderIdDisplay = (order.id || '???').substring(0, 8).toUpperCase();
        doc.text('Rechnungsnummer:', 140, addressY);
        doc.text(`#${orderIdDisplay}`, 190, addressY, { align: 'right' });

        doc.text('Datum:', 140, addressY + 6);
        doc.text(dateStr, 190, addressY + 6, { align: 'right' });

        // Title
        doc.setFontSize(16);
        doc.setTextColor(colorPrimary);
        doc.setFont('helvetica', 'bold');
        doc.text('Rechnung', 20, 85);

        // --- TABLE ---
        // Prepare table data - ROBUST
        const safeItems = Array.isArray(order.items) ? order.items : [];
        const tableRows = safeItems.map(item => [
            item.name || item.title || 'Produkt',
            item.sku || '-',
            item.quantity || 1,
            formatInvoiceMoney((item.price || 0) * (item.quantity || 1)) // Price string per row
        ]);

        // Use autoTable types properly - FUNCTIONAL CALL is safer in Vite
        autoTable(doc, {
            startY: 95,
            head: [['Produkt', 'Artikel-Nr.', 'Menge', 'Preis']],
            body: tableRows,
            theme: 'grid',
            headStyles: {
                fillColor: colorPrimary,
                textColor: 255,
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 90 }, // Product Name
                3: { halign: 'right' } // Price right aligned
            },
            styles: {
                textColor: 50,
                fontSize: 9
            }
        });

        // --- TOTALS ---
        let finalY = (doc as any).lastAutoTable.finalY + 10;

        // Calculation Box
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        // Subtotal (only if discount exists)
        if (discountAmount > 0) {
            doc.setFont('helvetica', 'normal');
            doc.text('Zwischensumme:', 140, finalY);
            doc.text(formatInvoiceMoney(subtotal), 190, finalY, { align: 'right' });
            finalY += 6;

            doc.setTextColor(43, 71, 54); // Green for discount
            doc.text(`Rabatt (${couponCode || 'Gutschein'}):`, 140, finalY);
            doc.text(`-${formatInvoiceMoney(discountAmount)}`, 190, finalY, { align: 'right' });
            finalY += 6;
            doc.setTextColor(0, 0, 0); // Reset color
        }

        // Final Total
        doc.setFont('helvetica', 'bold');
        doc.text('Gesamtbetrag:', 140, finalY);
        doc.setFontSize(12);
        doc.text(formatInvoiceMoney(finalTotal), 190, finalY, { align: 'right' });

        // Payment Info
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colorSecondary);

        const paymentY = finalY + 20;
        doc.text('Zahlungsmethode:', 20, paymentY);
        doc.setTextColor(0, 0, 0);
        doc.text(order.paymentDetails || 'Stripe / Online', 60, paymentY);

        const statusY = paymentY + 6;
        doc.setTextColor(colorSecondary);
        doc.text('Status:', 20, statusY);
        doc.setTextColor(0, 150, 0); // Green
        doc.text('Bezahlt', 60, statusY);


        // --- FOOTER ---
        doc.setFontSize(8);
        doc.setTextColor(150);
        const pageHeight = doc.internal.pageSize.height;
        doc.text('Vielen Dank für Ihre Bestellung bei Mamoru Möbel.', 105, pageHeight - 15, { align: 'center' });
        doc.text('Es gelten unsere AGB.', 105, pageHeight - 10, { align: 'center' });

        // OPEN PDF IN NEW TAB
        const pdfOutput = doc.output('bloburl');
        window.open(pdfOutput, '_blank');

    } catch (error: any) {
        console.error("Invoice Generation Error:", error);
        alert(`Fehler beim Erstellen der Rechnung: ${error.message || 'Unbekannter Fehler'}`);
    }
};
