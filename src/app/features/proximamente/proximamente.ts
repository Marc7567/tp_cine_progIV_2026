import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PeliculaService } from '../../core/services/pelicula.service';
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

  peliculas = this.peliculaService.peliculas;
  
  peliculasProximas = computed(() => {
    const fecha_actual = new Date().toISOString().split('T')[0];

    return this.peliculas().filter(pelicula =>
      pelicula.fecha_estreno > fecha_actual
    );
  });
  
  verDetalle(id: number): void {
    this.router.navigate(['/home/pelicula', id]);
  }
}
