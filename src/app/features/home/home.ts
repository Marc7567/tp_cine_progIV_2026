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
    effect(() => {
      console.log(
        `Filtro activo: "${this.filtroBusqueda()}" -> ${this.peliculasFiltradas().length} resultados`
      );
    });
  }

  verDetalle(peliculaId: number): void {
    this.router.navigate(['/home/pelicula', peliculaId]);
  }
}