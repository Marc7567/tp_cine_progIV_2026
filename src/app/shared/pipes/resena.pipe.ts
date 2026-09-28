import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'fechaResena',
})

export class FechaResenaPipe implements PipeTransform {
    transform(fecha: string): string {
        const fechaResena = new Date(fecha);
        
        return fechaResena.toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    }
}
