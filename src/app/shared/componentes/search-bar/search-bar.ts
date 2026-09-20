import { Component, model } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css'
})
export class SearchBar {
  termino = model<string>('');

  // Limpia el texto de búsqueda
  limpiar(): void {
    this.termino.set('');
  }
}