import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { CompraService } from '../../core/services/compra.service';

@Component({
  imports: [],
  selector: 'app-generar-pdf',
  templateUrl: './generar-pdf.html',
  styleUrl: './generar-pdf.css',
})

export class GenerarPdf implements OnInit {
  private compraService = inject(CompraService);
  private router = inject(Router);

  compra = this.compraService.compra;
  pdfGenerado = signal(false);

  ngOnInit(): void {
    this.generarPDF();
  }

  private async generarPDF(): Promise<void> {
    const compraActual = this.compra();

    if (!compraActual) {
      return;
    }

    try {
      const qr = await QRCode.toDataURL(compraActual.codigoCompra, {
        width: 200,
        margin: 1,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      let y = 20;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);

      pdf.text('TICKET DE CINE', 105, y, {
        align: 'center',
      });

      y += 10;

      pdf.setLineWidth(0.5);
      pdf.line(30, y, 180, y);

      y += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);

      pdf.text(`Código: ${compraActual.codigoCompra}`, 30, y);

      y += 10;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);

      pdf.text('COMPRADOR', 30, y);

      y += 7;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);

      pdf.text(
        `Nombre: ${compraActual.comprador.nombre} ${compraActual.comprador.apellido}`,
        30,
        y,
      );

      y += 6;

      pdf.text(`DNI: ${compraActual.comprador.dni}`, 30, y);

      y += 6;

      pdf.text(`Email: ${compraActual.comprador.email}`, 30, y);

      y += 10;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);

      pdf.text('FUNCION', 30, y);

      y += 7;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);

      pdf.text(`Película: ${compraActual.pelicula.titulo}`, 30, y);

      y += 6;

      pdf.text(`Fecha: ${compraActual.funcion.fecha}`, 30, y);

      y += 6;

      pdf.text(
        `Horario: ${compraActual.funcion.hora_inicio} - ${compraActual.funcion.hora_fin}`,
        30,
        y,
      );

      y += 6;

      pdf.text(`Sala: ${compraActual.funcion.id_sala}`, 30, y);

      y += 6;

      pdf.text(`Butaca: ${compraActual.butaca.fila}${compraActual.butaca.columna}`, 30, y);

      y += 6;

      pdf.text(`Tipo: ${compraActual.butaca.tipo}`, 30, y);

      y += 10;

      if (compraActual.combos.length > 0 || compraActual.productos.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);

        pdf.text('CANDY BAR', 30, y);

        y += 7;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);

        for (const combo of compraActual.combos) {
          const subtotal = combo.combo.precio * combo.cantidad;

          pdf.text(`${combo.cantidad} x ${combo.combo.nombre}`, 30, y);

          pdf.text(`$${subtotal}`, 170, y, {
            align: 'right',
          });

          y += 6;
        }

        for (const producto of compraActual.productos) {
          const subtotal = producto.producto.precio * producto.cantidad;

          pdf.text(`${producto.cantidad} x ${producto.producto.nombre}`, 30, y);

          pdf.text(`$${subtotal}`, 170, y, {
            align: 'right',
          });

          y += 6;
        }

        y += 4;
      }

      pdf.setLineWidth(0.5);

      pdf.line(30, y, 180, y);

      y += 9;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);

      pdf.text('TOTAL:', 30, y);

      pdf.text(`$${compraActual.totalCompra}`, 170, y, {
        align: 'right',
      });

      y += 15;

      pdf.setFontSize(10);

      pdf.text('Código QR de la compra', 105, y, {
        align: 'center',
      });

      y += 5;

      pdf.addImage(qr, 'PNG', 80, y, 50, 50);

      y += 58;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);

      pdf.text('Presentar este ticket para validar la entrada.', 105, y, {
        align: 'center',
      });

      pdf.save('ticket.pdf');

      this.pdfGenerado.set(true);
    } catch (error) {
      console.error('No se pudo generar el PDF:', error);
    }
  }

  VolverMenu(): void {
    this.compraService.vaciarCompra();
    this.router.navigate(['/']);
  }
}