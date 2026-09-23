import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PeliculaService } from '../../core/services/pelicula.service';
import { FuncionesService } from '../../core/services/funciones.service';
import { ButacasService } from '../../core/services/butacas.service';
import { FechaEstrenoPipe } from '../../shared/pipes/fecha-estreno.pipe';
import { HoraPipe } from '../../shared/pipes/hora.pipe';

@Component({
  selector: 'app-compra-entrada',
  imports: [FechaEstrenoPipe, HoraPipe],
  templateUrl: './compra-entrada.html',
  styleUrl: './compra-entrada.css',
})

export class CompraEntrada {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private peliculaService = inject(PeliculaService);
  private funcionesService = inject(FuncionesService);
  private butacasService = inject(ButacasService);

  funcion = signal<any | null>(null);

  pelicula = computed(() => {
    const funcionActual = this.funcion();

    if (!funcionActual) {
      return undefined;
    }

    return this.peliculaService
      .peliculas()
      .find((pelicula) => pelicula.id_pelicula === funcionActual.id_pelicula);
  });

  butacas = this.butacasService.butacas;
  butacaSeleccionada = signal<number | null>(null);
  cargando = signal(true);

  constructor() {
    this.cargarDatos();
  }

  private async cargarDatos(): Promise<void> {
    const idFuncion = Number(this.route.snapshot.paramMap.get('idFuncion'));

    if (!idFuncion) {
      console.error('ID de función inválido.');
      this.cargando.set(false);
      return;
    }

    const funcion = await this.funcionesService.obtenerFuncionPorId(idFuncion);

    if (!funcion) {
      this.cargando.set(false);
      return;
    }

    this.funcion.set(funcion);
    await this.butacasService.cargarButacasPorFuncion(funcion.id_funcion, funcion.id_sala);
    this.cargando.set(false);
  }

  seleccionarButaca(idButaca: number): void {
    const butaca = this.butacas().find((butaca) => butaca.id_butaca === idButaca);

    if (!butaca || butaca.ocupada) {
      return;
    }
    this.butacaSeleccionada.set(idButaca);
  }

  volver(): void {
    this.router.navigate(['/home']);
  }
}
