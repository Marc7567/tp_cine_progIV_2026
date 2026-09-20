import { Component, input } from '@angular/core';
import { pelicula } from '../../../core/models/pelicula.interface';
import { EdadMinimaPipe } from '../../pipes/edad-minima.pipe';
import { DuracionPipe } from '../../pipes/duracion.pipe';

@Component({
  selector: 'app-pelicula-card',
  imports: [EdadMinimaPipe, DuracionPipe],
  templateUrl: './pelicula-card.html',
  styleUrl: './pelicula-card.css'
})

export class PeliculaCard {
  pelicula = input.required<pelicula>();
}