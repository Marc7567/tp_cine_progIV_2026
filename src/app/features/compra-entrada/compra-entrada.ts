import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Funcion } from '../../core/models/funcion.interface';

import { PeliculaService } from '../../core/services/pelicula.service';
import { FuncionesService } from '../../core/services/funciones.service';
import { ButacasService } from '../../core/services/butacas.service';
import { AuthService } from '../../core/services/auth.service';

import { FechaEstrenoPipe } from '../../shared/pipes/fecha-estreno.pipe';
import { HoraPipe } from '../../shared/pipes/hora.pipe';

@Component({
  selector: 'app-compra-entrada',
  imports: [FechaEstrenoPipe, HoraPipe],
  templateUrl: './compra-entrada.html',
  styleUrl: './compra-entrada.css',
})

export class CompraEntrada {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private peliculaService = inject(PeliculaService);
  private funcionesService = inject(FuncionesService);
  private butacasService = inject(ButacasService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  funcion = signal<Funcion | null>(null);
  butacaSeleccionada = signal<number | null>(null);
  mensajeEdad = signal<string | null>(null);
  ContinuarCompraEdad = signal(true);
  butacas = this.butacasService.butacas;
  cargando = signal(true);
  ventaNoDisponible = signal(false);

  pelicula = computed(() => {
    const funcionActual = this.funcion();

    if (!funcionActual) {
      return undefined;
    }

    return this.peliculaService
      .peliculas()
      .find((pelicula) => pelicula.id_pelicula === funcionActual.id_pelicula);
  });

  // computed: al selecionar una butaca de la funcion
  butacaSeleccionadaDatos = computed(() => {
    const idButaca = this.butacaSeleccionada();

    if (idButaca === null) {
        return null;
    }

    const butaca = this.butacas().find(butaca => butaca.id_butaca === idButaca);

    if (!butaca || butaca.ocupada) {
        return null;
    }

    return butaca;
  });

  constructor() {
    this.cargarDatos();
    
    this.destroyRef.onDestroy(() => {this.butacasService.detenerActualizacionRealTime();});
  }

  private async cargarDatos(): Promise<void> {
    const idFuncion = Number(this.route.snapshot.paramMap.get('idFuncion'));

    if (!idFuncion) {
      console.error('ID de función inválido.');
      this.cargando.set(false);
      return;
    }

    const funcion = await this.funcionesService.obtenerFuncionPorId(idFuncion);

    if (!funcion) {
      this.cargando.set(false);
      return;
    }

    this.funcion.set(funcion);

    if (funcion.puede_comprar === false) {
      this.ventaNoDisponible.set(true);
      this.cargando.set(false);
      return;
    }

    await this.butacasService.cargarButacasPorFuncion(funcion.id_funcion, funcion.id_sala);
    
    this.butacasService.ActualizacionRealTime(funcion.id_funcion, funcion.id_sala);

    this.cargando.set(false);
  }

  private verificarEdad(): void {
    const usuario = this.authService.currentUserData();
    const peliculaActual = this.pelicula();

    if (!peliculaActual) {
      this.ContinuarCompraEdad.set(false);
      this.mensajeEdad.set('No se pudo obtener la película.');
      return;
    }

    if (!usuario) {
      this.ContinuarCompraEdad.set(true);
      this.mensajeEdad.set(null);
      return;
    }

    const fechaNacimiento = new Date(usuario.fecha_nacimiento);
    const hoy = new Date();

    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();

    const mes = hoy.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }

    if (edad < peliculaActual.edad_minima) {
      this.ContinuarCompraEdad.set(false);
      this.mensajeEdad.set('El usuario no cumple con la edad mínima requerida para esta película.');
      return;
    }

    this.ContinuarCompraEdad.set(true);

    if (edad < 18) {
      this.mensajeEdad.set('Debe ir acompañado por un adulto para poder ver la película.');
    } else {
      this.mensajeEdad.set(null);
    }
  }

  seleccionarButaca(idButaca: number): void {
    const butaca = this.butacas().find((butaca) => butaca.id_butaca === idButaca);

    if (!butaca || butaca.ocupada) {
      return;
    }
    this.butacaSeleccionada.set(idButaca);
    this.verificarEdad();
  }

  irCandyBar(): void {
    const idButaca = this.butacaSeleccionada();
    const funcionActual = this.funcion();

    if (idButaca === null) {
      return;
    }

    if (!funcionActual) {
      return;
    }

    this.router.navigate(['/candy-bar', funcionActual.id_funcion, idButaca]);
  }

  volver(): void {
    this.router.navigate(['/home']);
  }
}