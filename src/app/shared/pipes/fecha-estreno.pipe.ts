import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaEstreno',
})

export class FechaEstrenoPipe implements PipeTransform {
    transform(fecha: string): string {
        const fechaEstreno = new Date(fecha + 'T00:00:00');
        return fechaEstreno.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
}