import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { PeliculaService } from '../../core/services/pelicula.service';
import { FuncionesService } from '../../core/services/funciones.service';
import { ButacasService } from '../../core/services/butacas.service';
import { CandyBarService } from '../../core/services/candyBar-service';
import { ResumenCompra } from '../resumen-compra/resumen-compra';

@Component({
  imports: [ReactiveFormsModule, ResumenCompra],
  selector: 'app-form-compra',
  styleUrl: './form-compra.css',
  templateUrl: './form-compra.html',
})

export class FormCompra {
  private route = inject(ActivatedRoute);
  private peliculaService = inject(PeliculaService);
  private funcionesService = inject(FuncionesService);
  private butacasService = inject(ButacasService);
  private candyBarService = inject(CandyBarService);

  funcion = signal<any | null>(null);
  butaca = signal<any | null>(null);
  cargando = signal(true);
  mostrarCandyBar = signal(false);
  
  productosComprados = this.candyBarService.productosSeleccionados;
  combosComprados = this.candyBarService.combosSeleccionados;

  mostrarResumen = signal(false);
  
  // Formulario del comprador (validamos los datos)
  formularioCompra = new FormGroup({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(20)
      ]
    }),

    apellido: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(20)
      ]
    }),

    dni: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^\d{8}$/)
      ]
    }),

    email: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email
      ]
    })
  });

  pelicula = computed(() => {
    const funcionActual = this.funcion();

    if (!funcionActual) {
      return undefined;
    }

    return this.peliculaService
      .peliculas()
      .find(pelicula => pelicula.id_pelicula === funcionActual.id_pelicula);
  });

  totalCandyBar = computed(() => {
    const totalProductos = this.productosComprados().reduce((total, seleccionado) =>
      total + seleccionado.producto.precio * seleccionado.cantidad, 0
    );

    const totalCombos = this.combosComprados().reduce((total, seleccionado) =>
      total + seleccionado.combo.precio * seleccionado.cantidad, 0
    );

    return totalProductos + totalCombos;
  });

  constructor() {
    this.cargarDatos();
  }

  private async cargarDatos(): Promise<void> {
    // tomamos el id de la funcion del url del sitio
    const idFuncion = Number(
      this.route.snapshot.paramMap.get('idFuncion')
    );
    
    // tomamos el id de la butaca del url del sitio
    const idButaca = Number(
      this.route.snapshot.paramMap.get('idButaca')
    );

    // Verificamos que los datos esten guardados correctamente
    if (!idFuncion || !idButaca) {
      console.error('Los datos de la compra son inválidos.');
      this.cargando.set(false);
      return;
    }

    const funcion = await this.funcionesService.obtenerFuncionPorId(idFuncion);

    if (!funcion) {
      console.error('No se encontró la función.');
      this.cargando.set(false);
      return;
    }

    this.funcion.set(funcion);

    await this.butacasService.cargarButacasPorFuncion(
      funcion.id_funcion,
      funcion.id_sala
    );

    const butacaSeleccionada = this.butacasService
      .butacas()
      .find(butaca => butaca.id_butaca === idButaca);

    if (!butacaSeleccionada) {
      console.error('No se encontró la butaca seleccionada.');
      this.cargando.set(false);
      return;
    }

    this.butaca.set(butacaSeleccionada);
    this.cargando.set(false);
  }

  irResumenCompra(): void {
    // marcamos los campos con datos no validos y mostramos errores
    if (this.formularioCompra.invalid) {
      this.formularioCompra.markAllAsTouched();
      return;
    }
    // si los datos esta bien seteamos mostrarResumen como true
    this.mostrarResumen.set(true);
  }
}
