import { Component, signal, computed, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { PeliculaCard } from '../../shared/componentes/pelicula-card/pelicula-card';
import { SearchBar } from '../../shared/componentes/search-bar/search-bar';
import { PeliculaService } from '../../core/services/pelicula.service';

@Component({
  selector: 'app-home',
  imports: [PeliculaCard, SearchBar, RouterOutlet],
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
  // automáticamente cuando cambia el término de búsqueda o la lista
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
    // effect() — muestra en consola el estado actual del filtro
    effect(() => {
      console.log(
        `🎬 Filtro activo: "${this.filtroBusqueda()}" → ${this.peliculasFiltradas().length} resultados`
      );
    });
  }
}