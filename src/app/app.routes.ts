import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home').then(c => c.Home),
    children: [{
      path: 'pelicula/:id',
      loadComponent: () => import('./features/pelicula-detail/pelicula-detail').then(c => c.PeliculaDetail)
    }]
  },
  {
    path: 'proximamente',
    loadComponent: () => import('./features/proximamente/proximamente').then(c => c.Proximamente)
  },
  {
    path: 'compra-entrada/:idFuncion',
    loadComponent: () => import('./features/compra-entrada/compra-entrada').then(c => c.CompraEntrada)
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];