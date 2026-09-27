import { Component, computed, inject, output, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CandyBarService } from '../../core/services/candyBar-service';
import { Producto } from '../../core/models/producto.interface';
import { Combo, ComboProducto } from '../../core/models/combos.interface';

interface ProductoSeleccionado {
  producto: Producto;
  cantidad: number;
}

interface ComboSeleccionado {
  combo: Combo;
  cantidad: number;
}

@Component({
  selector: 'app-candy-bar',
  imports: [],
  templateUrl: './candy-bar.html',
  styleUrl: './candy-bar.css',
})

export class CandyBar {
  private candyBarService = inject(CandyBarService);
  private router = inject(Router);
  private ruta = inject(ActivatedRoute);

  productos = this.candyBarService.productos;
  combos = this.candyBarService.combos;
  cargando = this.candyBarService.cargando;

  productosSeleccionados = signal<ProductoSeleccionado[]>([]);
  combosSeleccionados = signal<ComboSeleccionado[]>([]);

  seleccionCandyBar = output<{
    productos: ProductoSeleccionado[];
    combos: ComboSeleccionado[];
    total: number;
  }>();

  productosPorCategoria = computed(() => {
    const productos = this.productos();

    const categorias = new Map<string, Producto[]>();

    for (const producto of productos) {
      if (!categorias.has(producto.categoria)) {
        categorias.set(producto.categoria, []);
      }

      categorias.get(producto.categoria)!.push(producto);
    }

    return Array.from(categorias.entries()).map(([categoria, productos]) => ({
      categoria, productos,
    }));
  });

  combosDisponibles = computed(() => {
    return this.combos();
  });

  subtotalProductos = computed(() => {
    return this.productosSeleccionados().reduce(
      (total, seleccionado) => total + seleccionado.producto.precio * seleccionado.cantidad,
      0,
    );
  });

  subtotalCombos = computed(() => {
    return this.combosSeleccionados().reduce(
      (total, seleccionado) => total + seleccionado.combo.precio * seleccionado.cantidad,
      0,
    );
  });

  total = computed(() => {
    return this.subtotalProductos() + this.subtotalCombos();
  });

  cantidadTotal = computed(() => {
    const cantidadProductos = this.productosSeleccionados().reduce(
      (total, seleccionado) => total + seleccionado.cantidad,
      0,
    );

    const cantidadCombos = this.combosSeleccionados().reduce(
      (total, seleccionado) => total + seleccionado.cantidad,
      0,
    );

    return cantidadProductos + cantidadCombos;
  });

  constructor() {
    this.cargarDatos();
  }

  private async cargarDatos(): Promise<void> {
    await this.candyBarService.cargarDatosCandyBar();
  }

  cantidadProducto(idProducto: number): number {
    const seleccionado = this.productosSeleccionados().find(
      (p) => p.producto.id_producto === idProducto,
    );

    return seleccionado?.cantidad ?? 0;
  }

  agregarProducto(producto: Producto): void {
    const seleccionados = [...this.productosSeleccionados()];

    const indice = seleccionados.findIndex(
      (p) => p.producto.id_producto === producto.id_producto,
    );

    if (indice === -1) {
      seleccionados.push({
        producto,
        cantidad: 1,
      });
    } else {
      const seleccionado = seleccionados[indice];

      if (seleccionado.cantidad < producto.stock) {
        seleccionados[indice] = {
          ...seleccionado,
          cantidad: seleccionado.cantidad + 1,
        };
      }
    }

    this.productosSeleccionados.set(seleccionados);
    this.emitirSeleccion();
  }

  quitarProducto(producto: Producto): void {
    const seleccionados = [...this.productosSeleccionados()];

    const indice = seleccionados.findIndex(
      (item) => item.producto.id_producto === producto.id_producto,
    );

    if (indice === -1) {
      return;
    }

    const seleccionado = seleccionados[indice];

    if (seleccionado.cantidad > 1) {
      seleccionados[indice] = {
        ...seleccionado,
        cantidad: seleccionado.cantidad - 1,
      };
    } else {
      seleccionados.splice(indice, 1);
    }

    this.productosSeleccionados.set(seleccionados);
    this.emitirSeleccion();
  }

  // COMBOS
  cantidadCombo(idCombo: number): number {
    const seleccionado = this.combosSeleccionados().find((item) => item.combo.id_combo === idCombo);

    return seleccionado?.cantidad ?? 0;
  }

  agregarCombo(combo: Combo): void {
    const seleccionados = [...this.combosSeleccionados()];

    const indice = seleccionados.findIndex((item) => item.combo.id_combo === combo.id_combo);

    if (indice === -1) {
      seleccionados.push({
        combo,
        cantidad: 1,
      });
    } else {
      seleccionados[indice] = {
        ...seleccionados[indice],
        cantidad: seleccionados[indice].cantidad + 1,
      };
    }

    this.combosSeleccionados.set(seleccionados);
    this.emitirSeleccion();
  }

  quitarCombo(combo: Combo): void {
    const seleccionados = [...this.combosSeleccionados()];
    const indice = seleccionados.findIndex((item) => item.combo.id_combo === combo.id_combo);

    if (indice === -1) {
      return;
    }

    const seleccionado = seleccionados[indice];

    if (seleccionado.cantidad > 1) {
      seleccionados[indice] = {
        ...seleccionado,
        cantidad: seleccionado.cantidad - 1,
      };
    } else {
      seleccionados.splice(indice, 1);
    }

    this.combosSeleccionados.set(seleccionados);
    this.emitirSeleccion();
  }

  // Obtenemos la informacion de los combos 
  obtenerProductosDeCombo(combo: Combo): Producto[] {
    const relaciones: ComboProducto[] = this.candyBarService.obtenerProductosDeCombo(
      combo.id_combo,
    );

    return relaciones
      .map((relacion) => this.candyBarService.obtenerProductoPorId(relacion.id_producto))
      .filter((producto): producto is Producto => producto !== undefined);
  }

  cantidadProductoEnCombo(combo: Combo, producto: Producto): number {
    const relaciones = this.candyBarService.obtenerProductosDeCombo(combo.id_combo);

    const relacion = relaciones.find((item) => item.id_producto === producto.id_producto);

    return relacion?.cantidad ?? 0;
  }

  // carrito
  quitarProductoDelCarrito(producto: Producto): void {
    this.quitarProducto(producto);
  }

  quitarComboDelCarrito(combo: Combo): void {
    this.quitarCombo(combo);
  }

  vaciarCarrito(): void {
    this.productosSeleccionados.set([]);
    this.combosSeleccionados.set([]);
    this.emitirSeleccion();
  }

  private emitirSeleccion(): void {
    // guardas los productos que tengo en el carrito
    this.candyBarService.guardarSeleccionCandyBar(
      this.productosSeleccionados(),
      this.combosSeleccionados()
    );
    
    // 
    this.seleccionCandyBar.emit({
      productos: this.productosSeleccionados(),
      combos: this.combosSeleccionados(),
      total: this.total(),
    });
  }

  irFormulario(): void {
    const idFuncion = this.ruta.snapshot.paramMap.get('idFuncion');
    const idButaca = this.ruta.snapshot.paramMap.get('idButaca');

    this.router.navigate(['/form-compra', idFuncion, idButaca]);
  }
}
