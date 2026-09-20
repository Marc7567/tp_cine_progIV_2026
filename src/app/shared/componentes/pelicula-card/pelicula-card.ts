import { Component, input } from '@angular/core';
import { pelicula } from '../../../core/models/pelicula.interface';
import { DuracionPipe } from '../../pipes/duracion.pipe';
import { EdadMinimaPipe } from '../../pipes/edad-minima.pipe';

@Component({
  imports: [DuracionPipe, EdadMinimaPipe],
  selector: 'app-pelicula-card',
  templateUrl: './pelicula-card.html',
  styleUrl: './pelicula-card.css'
})
export class PeliculaCard {
  pelicula = input.required<pelicula>();
}