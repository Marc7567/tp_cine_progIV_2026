import { Component, input, computed, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { PeliculaService } from '../../core/services/pelicula.service';
import { FuncionesService } from '../../core/services/funciones.service';
import { EdadMinimaPipe } from '../../shared/pipes/edad-minima.pipe';
import { DuracionPipe } from '../../shared/pipes/duracion.pipe';
import { FechaEstrenoPipe } from '../../shared/pipes/fecha-estreno.pipe';
import { HoraPipe } from '../../shared/pipes/hora.pipe';

@Component({
  selector: 'app-pelicula-detail',
  imports: [EdadMinimaPipe, DuracionPipe, FechaEstrenoPipe, HoraPipe],
  templateUrl: './pelicula-detail.html',
  styleUrl: './pelicula-detail.css'
})

export class PeliculaDetail {
  id = input.required<string>();

  private peliculaService = inject(PeliculaService);
  private funcionesService = inject(FuncionesService);
  private router = inject(Router);

  pelicula = computed(() => {
    const todasLasPeliculas = this.peliculaService.peliculas();

    return todasLasPeliculas.find(
      pelicula => pelicula.id_pelicula === Number(this.id())
    );
  });

  funciones = this.funcionesService.funciones;

  constructor() {
    effect(() => {
      const idPelicula = Number(this.id());
      this.funcionesService.cargarFuncionesPorPelicula(idPelicula);
    });
  }

  volver(): void {
    this.router.navigate(['/home']);
  }
}