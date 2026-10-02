import { Component, input, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CompraService } from '../../core/services/compra.service';

@Component({
  imports: [],
  selector: 'app-resumen-compra',
  styleUrl: './resumen-compra.css',
  templateUrl: './resumen-compra.html',
})
export class ResumenCompra implements OnInit {
  private router = inject(Router);
  private compraService = inject(CompraService);

  funcion = input<any>();
  pelicula = input<any>();
  butaca = input<any>();
  comprador = input<any>();
  productos = input<any[]>([]);
  combos = input<any[]>([]);
  totalCandyBar = input<number>(0);
  
  esPrimeraCompra = signal(false);
  
  // total de la compra (sin descuento)
  totalCompra = computed(() => {
    const funcionActual = this.funcion();
    const butacaActual = this.butaca();

    if (!funcionActual || !butacaActual) {
      return this.totalCandyBar();
    }
    return funcionActual.precio_base + butacaActual.precio_extra + this.totalCandyBar();
  });
  
  // Descuento del 20% para la primera compra
  descuentoPrimeraCompra = computed(() => {
    if (!this.esPrimeraCompra()) {
      return 0;
    }
    return Math.round(this.totalCompra() * 0.2 * 100) / 100;
  });
  
  // Total con el descuento aplicado
  totalFinal = computed(() => {
    return Math.round((this.totalCompra() - this.descuentoPrimeraCompra()) * 100) / 100;
  });

  async ngOnInit(): Promise<void> {
    const primeraCompra = await this.compraService.verificarPrimeraCompra();
    this.esPrimeraCompra.set(primeraCompra);
  }

  continuarAlPago(): void {
    const funcionActual = this.funcion();
    const peliculaActual = this.pelicula();
    const butacaActual = this.butaca();
    const compradorActual = this.comprador();
    
    if (!funcionActual || !peliculaActual || !butacaActual || !compradorActual) {
      return;
    }

    this.compraService.guardarCompra({
      funcion: funcionActual,
      pelicula: peliculaActual,
      butaca: butacaActual,
      comprador: {
        nombre: compradorActual.nombre,
        apellido: compradorActual.apellido,
        dni: compradorActual.dni,
        email: compradorActual.email,
      },
      productos: this.productos(),
      combos: this.combos(),
      totalCandyBar: this.totalCandyBar(),
      // Guardamos el total con el descuento aplicado
      totalCompra: this.totalFinal()
    });

    this.router.navigate(['/metodo-pago'], { queryParams: { total: this.totalFinal() } });
  }
}
