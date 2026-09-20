import { Component, input } from '@angular/core';
import { pelicula } from '../../../core/models/pelicula.interface';

@Component({
  selector: 'app-pelicula-card',
  templateUrl: './pelicula-card.html',
  styleUrl: './pelicula-card.css'
})
export class PeliculaCard {
  pelicula = input.required<pelicula>();
}