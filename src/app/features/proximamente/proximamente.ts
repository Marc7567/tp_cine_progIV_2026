import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PeliculaService } from '../../core/services/pelicula.service';
import { AlertaVentaService } from '../../core/services/alerta-venta.service';
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
  private alertaVentaService = inject(AlertaVentaService);

  peliculas = this.peliculaService.peliculas;
  mensajesAlerta = signal<Record<number, string>>({});
  activandoAlerta = signal<number | null>(null);

  peliculasProximas = computed(() => {
    const fechaActual = new Date().toISOString().split('T')[0];

    return this.peliculas().filter((pelicula) => pelicula.fecha_estreno > fechaActual);
  });

  PeliculaPreventa(pelicula: { fecha_estreno: string }): boolean {
    const diaActual = new Date();
    const estreno = new Date(pelicula.fecha_estreno + 'T00:00:00');

    const diaDiferencia = estreno.getTime() - diaActual.getTime();
    const diaEstreno = diaDiferencia / (1000 * 60 * 60 * 24);

    return diaEstreno <= 7;
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