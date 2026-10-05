import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CompraService } from '../../core/services/compra.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-metodo-pago',
  styleUrl: './metodo-pago.css',
  templateUrl: './metodo-pago.html',
})

export class MetodoPago implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private compraService = inject(CompraService);

  total = signal(Number(this.route.snapshot.queryParamMap.get('total')) || 0);
  pagoRealizado = signal(false);
  metodoSeleccionado = signal<string | null>(null);

  // credito
  creditoDisponible = signal(0);
  usarCredito = signal(false);
  montoCredito = signal(0);
  creditoUsado = signal(0);
  ingresandoCredito = signal(false);

  totaFinal = computed(() =>
    Math.max(this.total() - this.creditoUsado(), 0)
  );

  usuRegistrado = computed(() => {
    return this.authService.currentUserData() !== null;
  });

  // Formulario de tarjeta de crédito
  formularioTarjeta = new FormGroup({
    titular: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required, 
        Validators.minLength(3)
      ]}),

    numero: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required, 
        Validators.pattern(/^\d{10}$/)
      ]}),
  });

  async ngOnInit(): Promise<void> {
    if (!this.usuRegistrado()) {
      return;
    }
    
    const credito = await this.compraService.obtenerCreditoDisponible();
    this.creditoDisponible.set(credito);
  }

  seleccionarMetodo(metodo: string): void {
    this.metodoSeleccionado.set(metodo);
  }

  seleccionarUsoCredito(usar: boolean): void {
    this.usarCredito.set(usar);

    if (usar) {
      this.ingresandoCredito.set(true);
    } else {
      this.creditoUsado.set(0);
      this.ingresandoCredito.set(false);
    }
  }
    
  aplicarCredito(): void {
    if (!this.creditoValido()) {
      return;
    }

    this.creditoUsado.update(credito => credito + this.montoCredito());
    this.montoCredito.set(0);
    this.ingresandoCredito.set(false);
  }

  cambiarMontoCredito(event: Event): void {
    const input = event.target as HTMLInputElement;
    const monto = Number(input.value);

    this.montoCredito.set(Number.isNaN(monto) ? 0 : monto);
  }

  usarTodoElCredito(): void {
    const creditoRestante = this.creditoDisponible() - this.creditoUsado();
    const totalRestante = this.total() - this.creditoUsado();

    const monto = Math.min(creditoRestante, totalRestante);

    this.montoCredito.set(monto);
  }

  creditoValido(): boolean {
    if (!this.usarCredito()) {
      return true;
    }

    const monto = this.montoCredito();
    const nuevoTotalCredito = this.creditoUsado() + monto;

    if (monto <= 0) {
      return false;
    }

    if (monto < 100) {
      return false;
    }

    if (nuevoTotalCredito > this.creditoDisponible()) {
      return false;
    }

    if (nuevoTotalCredito > this.total()) {
      return false;
    }

    return true;
  }

  usarMasCredito(): void {
    this.ingresandoCredito.set(true);
  }

  async pagar(): Promise<void> {
    /*
     * Si después de utilizar el crédito todavía
     * queda dinero por pagar, validamos la tarjeta.
     */
    if (this.totaFinal() > 0) {
      if (this.formularioTarjeta.invalid) {
        this.formularioTarjeta.markAllAsTouched();
        return;
      }
    }

    const montoCredito = this.creditoUsado();

    const registrado = await this.compraService.registrarCompra(montoCredito);

    if (!registrado) {
      return;
    }

    this.pagoRealizado.set(true);
  }

  generarPDF(): void {
    this.router.navigate(['/generar-pdf']);
  }
}