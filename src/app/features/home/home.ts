import { Component, signal, computed, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { PeliculaService } from '../../core/services/pelicula.service';
import { PeliculaCard } from '../../shared/componentes/pelicula-card/pelicula-card';
import { SearchBar } from '../../shared/componentes/search-bar/search-bar';
import { pelicula, PeliculaMasVendida } from '../../core/models/pelicula.interface';

interface PeliculaTop extends pelicula {
  cantidad_vendida: number;
}

@Component({
  imports: [PeliculaCard, SearchBar, RouterOutlet],
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css'
})

export class Home {
  private peliculaService = inject(PeliculaService);
  private router = inject(Router);

  peliculas = this.peliculaService.peliculas;

  filtroBusqueda = signal('');
  generoSeleccionado = signal('');

  top3peliculas = signal<PeliculaMasVendida[]>([]);
  cargarPeliculasMasVendidas = signal(false);

  generos = computed(() => {
    const todosLosGeneros = this.peliculas().flatMap((pelicula) => pelicula.generos);
    return [...new Set(todosLosGeneros)].sort();
  });

  peliculasFiltradas = computed(() => {
    const termino = this.filtroBusqueda().toLowerCase();
    const genero = this.generoSeleccionado();
    const diaActual = new Date();
    const fechaLimite = new Date(diaActual);
    
    fechaLimite.setDate(fechaLimite.getDate() + 7);

    const peliculasDisponibles = this.peliculas().filter((pelicula) => {
      const estreno = new Date(pelicula.fecha_estreno + 'T00:00:00');

      return estreno <= fechaLimite;
    });

    if (!termino && !genero) {
      return peliculasDisponibles;
    }

    return peliculasDisponibles.filter(
      (pelicula) =>
        (!termino || pelicula.titulo.toLowerCase().includes(termino)) &&
        (!genero || pelicula.generos.includes(genero)),
    );
  });

  PeliculasMasVendidas = computed<PeliculaTop[]>(() => {
    return this.top3peliculas().map((item) => {
        const peliculaActual = this.peliculas().find(
          (pelicula) => pelicula.id_pelicula === item.id_pelicula
        );

        if (!peliculaActual) {
          return null;
        }

        return {
          ...peliculaActual, 
          cantidad_vendida: item.cantidad_vendida};
      })

      .filter((pelicula): pelicula is PeliculaTop => pelicula !== null);
  });

  constructor() {
    void this.cargar3peliculasMasVendidas();

    effect(() => {
      // Para verificar 
      console.log(`Filtros activos: busqueda: "${this.filtroBusqueda()}" -
      género: "${this.generoSeleccionado()}" - 
      resultados: ${this.peliculasFiltradas().length}`);
    });
  }

  private async cargar3peliculasMasVendidas(): Promise<void> {
    this.cargarPeliculasMasVendidas.set(true);

    const resultado = await this.peliculaService.obtener3PelisMasVendidas();

    this.top3peliculas.set(resultado);
    this.cargarPeliculasMasVendidas.set(false);
  }

  verDetalle(id: number): void {
    this.router.navigate(['/home/pelicula', id]);
  }
}
