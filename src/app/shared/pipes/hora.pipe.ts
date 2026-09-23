import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'hora',
})

export class HoraPipe implements PipeTransform {
    transform(hora: string): string {
        return hora.slice(0, 5);
    }
}