import { Routes } from '@angular/router';

export const routes: Routes = [

  // Redirección: la ruta vacía redirige a /home
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home').then(c => c.Home),
    children: [
      // Ruta hija con parámetro dinámico ':id'
      {
        path: 'pelicula/:id',
        loadComponent: () =>import('./features/pelicula-detail/pelicula-detail').then(c => c.PeliculaDetail)
      }]
  },
  // Wildcard: cualquier ruta no definida redirige a /home
  {
    path: '**',
    redirectTo: '/home'
  }
];