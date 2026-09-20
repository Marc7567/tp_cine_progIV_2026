import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'edadMinima',
})

export class EdadMinimaPipe implements PipeTransform {
    transform(edad: number): string {
        if (edad === 0) {
            return 'ATP';
        }
            return `+${edad}`;
    }
}