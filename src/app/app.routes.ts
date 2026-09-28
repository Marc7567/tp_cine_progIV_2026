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
    path: 'candy-bar/:idFuncion/:idButaca',
    loadComponent: () => import('./features/candy-bar/candy-bar').then(c => c.CandyBar)
  },
  {
    path: 'form-compra/:idFuncion/:idButaca',
    loadComponent: () => import('./features/form-compra/form-compra').then(c => c.FormCompra)
  },
  {
    path: 'metodo-pago',
    loadComponent: () => import('./features/metodo-pago/metodo-pago').then(c => c.MetodoPago)
  },
  {
    path: 'generar-pdf',
    loadComponent: () => import('./features/generar-pdf/generar-pdf').then(c => c.GenerarPdf)
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];