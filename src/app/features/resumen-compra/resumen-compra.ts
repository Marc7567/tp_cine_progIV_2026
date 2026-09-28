import { Component, input, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CompraService } from '../../core/services/compra.service';

@Component({
  imports: [],
  selector: 'app-resumen-compra',
  styleUrl: './resumen-compra.css',
  templateUrl: './resumen-compra.html',
})

export class ResumenCompra {
  private router = inject(Router);
  private compraService = inject(CompraService);

  funcion = input<any>();
  pelicula = input<any>();
  butaca = input<any>();
  comprador = input<any>();
  productos = input<any[]>([]);
  combos = input<any[]>([]);
  totalCandyBar = input<number>(0);


  totalCompra = computed(() => {
    const funcionActual = this.funcion();
    const butacaActual = this.butaca();

    if (!funcionActual || !butacaActual) {
      return this.totalCandyBar();
    }

    return (
      funcionActual.precio_base +
      butacaActual.precio_extra +
      this.totalCandyBar()
    );
  });

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
        email: compradorActual.email
      },
      productos: this.productos(),
      combos: this.combos(),
      totalCandyBar: this.totalCandyBar(),
      totalCompra: this.totalCompra()
    });

    this.router.navigate(['/metodo-pago'], {
      queryParams: {
        total: this.totalCompra()
      }
    });
  }
}
