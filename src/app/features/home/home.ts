import { Component, signal, computed, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { PeliculaService } from '../../core/services/pelicula.service';
import { PeliculaCard } from '../../shared/componentes/pelicula-card/pelicula-card';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, PeliculaCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})

export class Home {
  // inject() — forma moderna de inyectar dependencias
  private peliculaService = inject(PeliculaService);
  private router = inject(Router);

  // Las películas vienen del SERVICIO
  peliculas = this.peliculaService.peliculas;

  // signal() — estado mutable para el filtro de búsqueda
  filtroBusqueda = signal('');

  // computed() — estado derivado: filtra las películas
  peliculasFiltradas = computed(() => {
    const termino = this.filtroBusqueda().toLowerCase();

    if (!termino) {
      return this.peliculas();
    }

    return this.peliculas().filter(pelicula =>
      pelicula.titulo.toLowerCase().includes(termino)
    );
  });

  constructor() {
    console.log('Home iniciado');
    effect(() => {
          console.log(`Películas recibidas:`, this.peliculas());

      console.log(
        `Filtro activo: "${this.filtroBusqueda()}" → ${this.peliculasFiltradas().length} resultados`
      );
    });
  }
}