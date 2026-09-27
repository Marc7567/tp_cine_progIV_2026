import { Component, input, computed } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-resumen-compra',
  styleUrl: './resumen-compra.css',
  templateUrl: './resumen-compra.html',
})

export class ResumenCompra {
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
}
