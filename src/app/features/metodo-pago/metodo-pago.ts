import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompraService } from '../../core/services/compra.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-metodo-pago',
  styleUrl: './metodo-pago.css',
  templateUrl: './metodo-pago.html',
})

export class MetodoPago {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private compraService = inject(CompraService);

  total = signal(Number(this.route.snapshot.queryParamMap.get('total')) || 0);
  pagoRealizado = signal(false);
  metodoSeleccionado = signal<string | null>(null);
  
  formularioTarjeta = new FormGroup({
    titular: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required, 
        Validators.minLength(3)
      ],
    }),
    numero: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required, 
        Validators.pattern(/^\d{10}$/)],
    }),
  });

  seleccionarMetodo(metodo: string): void {
    this.metodoSeleccionado.set(metodo);
  }

  async pagar(): Promise<void> {
    if (this.formularioTarjeta.invalid) {
      this.formularioTarjeta.markAllAsTouched();
      return;
    }

    const registrado = await this.compraService.registrarCompraEnSupabase();

    if (!registrado) {
      console.error('No se pudo registrar la compra.');
      return;
    }

    this.pagoRealizado.set(true);
  }

  generarPDF(): void {
    this.router.navigate(['/generar-pdf']);
  }
}