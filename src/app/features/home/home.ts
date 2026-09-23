import { Component, signal, computed, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { PeliculaService } from '../../core/services/pelicula.service';
import { PeliculaCard } from '../../shared/componentes/pelicula-card/pelicula-card';
import { SearchBar } from '../../shared/componentes/search-bar/search-bar';

@Component({
  selector: 'app-home',
  imports: [PeliculaCard, SearchBar, RouterOutlet],
  templateUrl: './home.html',
  styleUrl: './home.css',
})

export class Home {
  private peliculaService = inject(PeliculaService);
  private router = inject(Router);

  peliculas = this.peliculaService.peliculas;

  filtroBusqueda = signal('');
  generoSeleccionado = signal('');

  generos = computed(() => {
    const todosLosGeneros = this.peliculas().flatMap((pelicula) => pelicula.generos);
    return [...new Set(todosLosGeneros)].sort();
  });

  peliculasFiltradas = computed(() => {
    const termino = this.filtroBusqueda().toLowerCase();
    const genero = this.generoSeleccionado();
    
    if (!termino && !genero) {
      return this.peliculas();
    }
    return this.peliculas().filter(pelicula =>
        (!termino || pelicula.titulo.toLowerCase().includes(termino)) &&
        (!genero || pelicula.generos.includes(genero)),
    );
  });

  constructor() {
    effect(() => {
      console.log(
        `Filtros activos -> busqueda: "${this.filtroBusqueda()}" | género: "${this.generoSeleccionado()}" | resultados: ${this.peliculasFiltradas().length}`,
      );
    });
  }

  verDetalle(id: number): void {
    this.router.navigate(['/home/pelicula', id]);
  }
}
