import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PeliculaService } from '../../core/services/pelicula.service';
import { PreventaService } from '../../core/services/preventa.service';
import { AlertaVentaService } from '../../core/services/alerta-venta.service';
import { Preventa } from '../../core/models/preventa.interface';
import { PeliculaCard } from '../../shared/componentes/pelicula-card/pelicula-card';

@Component({
  imports: [PeliculaCard],
  selector: 'app-proximamente',
  styleUrl: './proximamente.css',
  templateUrl: './proximamente.html',
})

export class Proximamente {
  private router = inject(Router);
  private peliculaService = inject(PeliculaService);
  private preventaService = inject(PreventaService);
  private alertaVentaService = inject(AlertaVentaService);

  peliculas = this.peliculaService.peliculas;
  preventas = signal<Record<number, Preventa | null>>({});
  mensajesAlerta = signal<Record<number, string>>({});
  activandoAlerta = signal<number | null>(null);

  peliculasProximas = computed(() => {
    const fechaActual = new Date().toISOString().split('T')[0];

    return this.peliculas().filter((pelicula) => pelicula.fecha_estreno > fechaActual);
  });

  constructor() {
    effect(() => {
      const peliculas = this.peliculasProximas();
      void this.cargarPreventas(peliculas.map((pelicula) => pelicula.id_pelicula));
    });
  }

  private async cargarPreventas(idsPelicula: number[]): Promise<void> {
    const entradas = await Promise.all(
      idsPelicula.map(async (idPelicula) => {
        const preventa = await this.preventaService.obtenerPorPelicula(idPelicula);
        return [idPelicula, preventa] as const;
      }),
    );

    this.preventas.set(Object.fromEntries(entradas));
  }

  tienePreventa(pelicula: Preventa | null): boolean {
    return !!pelicula?.habilitada;
  }

  alertaActivada(idPelicula: number): boolean {
    return this.alertaVentaService.tieneAlerta(idPelicula);
  }

  async activarAlerta(idPelicula: number): Promise<void> {
    const peliculaActual = this.peliculas().find((pelicula) => pelicula.id_pelicula === idPelicula);

    if (!peliculaActual || this.activandoAlerta() !== null) {
      return;
    }

    this.activandoAlerta.set(idPelicula);
    const resultado = await this.alertaVentaService.activar(peliculaActual);

    this.mensajesAlerta.update((mensajes) => ({
      ...mensajes,
      [idPelicula]: resultado.mensaje,
    }));

    this.activandoAlerta.set(null);
  }

  verDetalle(id: number): void {
    this.router.navigate(['/home/pelicula', id]);
  }
}