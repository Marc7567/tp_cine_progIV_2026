import { Component, effect, input, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PeliculaService } from '../../core/services/pelicula.service';
import { ResenaService } from '../../core/services/resena.service';
import { Resena } from '../../core/models/resenas.interface';

import { FechaResenaPipe } from '../../shared/pipes/resena.pipe'

@Component({
  imports: [FechaResenaPipe],
  selector: 'app-resenas',
  styleUrl: './resenas.css',
  templateUrl: './resenas.html',
})

export class Resenas {
  id = input.required<string>();

  private peliculaService = inject(PeliculaService);
  private resenaService = inject(ResenaService);
  private router = inject(Router);

  pelicula = signal<any>(null);
  resenas = signal<Resena[]>([]);
  promedio = signal(0);
  cantidad = signal(0);

  constructor() {
    effect(() => {
      const idPelicula = Number(this.id());
      const pelicula = this.peliculaService.getPeliculaById(idPelicula)();

      if (!pelicula) {
        return;
      }

      this.pelicula.set(pelicula);

      this.cargarResenas();
    });
  }

  async cargarResenas(): Promise<void> {
    const idPelicula = Number(this.id());

    this.resenas.set(await this.resenaService.obtenerTodas(idPelicula));

    const resumen = await this.resenaService.obtenerResumen(idPelicula);

    this.promedio.set(resumen.promedio);
    this.cantidad.set(resumen.cantidad);
  }

  volver(): void {
    this.router.navigate(['/home']);
  }
}
