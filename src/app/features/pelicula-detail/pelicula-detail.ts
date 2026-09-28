import { Component, input, inject, computed, effect, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PeliculaService } from '../../core/services/pelicula.service';
import { FuncionesService } from '../../core/services/funciones.service';
import { ResenaService } from '../../core/services/resena.service';
import { Resena } from '../../core/models/resenas.interface';

import { EdadMinimaPipe } from '../../shared/pipes/edad-minima.pipe';
import { DuracionPipe } from '../../shared/pipes/duracion.pipe';
import { FechaEstrenoPipe } from '../../shared/pipes/fecha-estreno.pipe';
import { HoraPipe } from '../../shared/pipes/hora.pipe';

@Component({
  selector: 'app-pelicula-detail',
  imports: [EdadMinimaPipe, DuracionPipe, FechaEstrenoPipe, HoraPipe],
  templateUrl: './pelicula-detail.html',
  styleUrl: './pelicula-detail.css',
})
export class PeliculaDetail {
  id = input.required<string>();

  private peliculaService = inject(PeliculaService);
  private funcionesService = inject(FuncionesService);
  private resenaService = inject(ResenaService);
  private router = inject(Router);

  pelicula = computed(() => {
    const todasLasPeliculas = this.peliculaService.peliculas();

    return todasLasPeliculas.find((pelicula) => pelicula.id_pelicula === Number(this.id()));
  });

  funciones = this.funcionesService.funciones;
  resenas = signal<Resena[]>([]);
  promedio = signal(0);
  cantidadResenas = signal(0);

  constructor() {
    effect(() => {
      const idPelicula = Number(this.id());

      this.funcionesService.cargarFuncionesPorPelicula(idPelicula);
      this.cargarResenas(idPelicula);
    });
  }

  private async cargarResenas(idPelicula: number): Promise<void> {
    const [resenas, resumen] = await Promise.all([
      this.resenaService.obtenerPrimerasTres(idPelicula),
      this.resenaService.obtenerResumen(idPelicula),
    ]);
    this.resenas.set(resenas);
    this.promedio.set(resumen.promedio);
    this.cantidadResenas.set(resumen.cantidad);
  }
  verResenas(): void {
    this.router.navigate(['/resenas', this.id()]);
  }

  comprarEntrada(idFuncion: number): void {
    this.router.navigate(['/compra-entrada', idFuncion]);
  }

  volver(): void {
    this.router.navigate(['/home']);
  }
}
