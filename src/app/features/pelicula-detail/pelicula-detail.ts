import { Component, input, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PeliculaService } from '../../core/services/pelicula.service';
import { EdadMinimaPipe } from '../../shared/pipes/edad-minima.pipe';
import { DuracionPipe } from '../../shared/pipes/duracion.pipe';
import { FechaEstrenoPipe } from '../../shared/pipes/fecha-estreno.pipe';

@Component({
  selector: 'app-pelicula-detail',
  // Pipes personalizados para formatear edad minima y duracion
  imports: [EdadMinimaPipe, DuracionPipe, FechaEstrenoPipe],
  templateUrl: './pelicula-detail.html',
  styleUrl: './pelicula-detail.css'
})

export class PeliculaDetail {
  // input() de ruta — gracias a withComponentInputBinding(),
  // Angular recibe el parámetro ':id' de la URL directamente
  id = input.required<string>();

  // inject() — inyectamos el servicio para obtener las películas
  // y Router para volver al catálogo
  private peliculaService = inject(PeliculaService);
  private router = inject(Router);

  // computed() — obtiene la película correspondiente al ID
  // Como PeliculaService utiliza signals, este computed se actualiza
  // automáticamente cuando cambian las películas
  pelicula = computed(() => {
    const todasLasPeliculas = this.peliculaService.peliculas();

    return todasLasPeliculas.find(
      p => p.id_pelicula === Number(this.id())
    );
  });

  // Navegación programática — volver al listado
  volver(): void {
    this.router.navigate(['/home']);
  }
}