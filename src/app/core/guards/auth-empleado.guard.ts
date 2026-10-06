import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authEmpleadoGuard: CanActivateFn = async () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentUser();

    if (!user) {
        return router.createUrlTree(['/login']);
    }

    const usuario = authService.currentUserData()
        ?? await authService.cargarDatosUsuario(user.id);

    if (usuario?.rol === 'empleado') {
        return true;
    }

    return router.createUrlTree(['/home']);
};