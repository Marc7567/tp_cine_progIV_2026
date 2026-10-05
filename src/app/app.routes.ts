import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '', redirectTo: '/home', pathMatch: 'full'},
  {
    path: 'home',
    loadComponent: () => import('./features/home/home').then(c => c.Home),
    children: [{
      path: 'pelicula/:id',
      loadComponent: () => import('./features/pelicula-detail/pelicula-detail').then(c => c.PeliculaDetail)
    }]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(c => c.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(c => c.Register)
  },
  {
    path: 'proximamente',
    loadComponent: () => import('./features/proximamente/proximamente').then(c => c.Proximamente)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./features/perfil-usu/perfil-usu').then(c => c.PerfilUsu),
    canActivate: [authGuard]
  },
  {
    path: 'mis-compras',
    loadComponent: () => import('./features/mis-compras/mis-compras').then(c => c.MisCompras),
    canActivate: [authGuard]
  },
  {
    path: 'resenas/:id',
    loadComponent: () => import('./features/resenas/resenas').then(c => c.Resenas)
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
  // Rutas solo para empleados
  {
    path: 'empleado',
    loadComponent: () => import('./features/empleado/validacion-empleado/validacion-empleado').then(c => c.ValidacionEmpleado),
    canActivate: [authEmpleadoGuard]
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];