import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duracion',
})

export class DuracionPipe implements PipeTransform {
    transform(minutos: number): string {
        const horas = Math.floor(minutos / 60);
        const minutosRestantes = minutos % 60;
        
        if(horas === 0) {
            return `${minutos} min`;
        }else if(minutosRestantes === 0) {
            return `${horas} h`;
        }
        return `${horas} h ${minutosRestantes} min`;
    }
}