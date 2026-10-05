import { Component, input, inject, computed, effect, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PeliculaService } from '../../core/services/pelicula.service';
import { FuncionesService } from '../../core/services/funciones.service';
import { ResenaService } from '../../core/services/resena.service';
import { PreventaService } from '../../core/services/preventa.service';
import { AlertaVentaService } from '../../core/services/alerta-venta.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { Resena } from '../../core/models/resenas.interface';

import { EdadMinimaPipe } from '../../shared/pipes/edad-minima.pipe';
import { DuracionPipe } from '../../shared/pipes/duracion.pipe';
import { FechaEstrenoPipe } from '../../shared/pipes/fecha-estreno.pipe';
import { HoraPipe } from '../../shared/pipes/hora.pipe';

@Component({
  imports: [EdadMinimaPipe, DuracionPipe, FechaEstrenoPipe, HoraPipe],
  selector: 'app-pelicula-detail',
  templateUrl: './pelicula-detail.html',
  styleUrl: './pelicula-detail.css',
})

export class PeliculaDetail {
  id = input.required<string>();

  private peliculaService = inject(PeliculaService);
  private funcionesService = inject(FuncionesService);
  private resenaService = inject(ResenaService);
  private preventaService = inject(PreventaService);
  private alertaVentaService = inject(AlertaVentaService);
  private supabase = inject(SupabaseService).client;
  private router = inject(Router);

  pelicula = computed(() => {
    const todasLasPeliculas = this.peliculaService.peliculas();

    return todasLasPeliculas.find(
      (pelicula) => pelicula.id_pelicula === Number(this.id())
    );
  });

  funciones = this.funcionesService.funciones;

  resenas = signal<Resena[]>([]);
  promedio = signal(0);
  cantidadResenas = signal(0);

  mensajeAlerta = signal('');
  activandoAlerta = signal(false);

  // Datos de la nueva reseña
  estrellasSeleccionadas = signal(0);
  comentarioResena = signal('');
  mensajeResena = signal('');
  guardandoResena = signal(false);

  // Usuario autenticado
  idUsuarioActual = signal<string | null>(null);

  estadoVenta = computed(() => {
    const peliculaActual = this.pelicula();

    if (!peliculaActual) {
      return 'no-disponible';
    }

    return this.preventaService.determinarEstado(peliculaActual);
  });

  mostrarBotonAlerta = computed(() => {
    const peliculaActual = this.pelicula();
    return !!peliculaActual && this.estadoVenta() === 'no-disponible';
  });

  alertaActivada = computed(() => {
    const peliculaActual = this.pelicula();
    return peliculaActual? this.alertaVentaService.tieneAlerta(peliculaActual.id_pelicula) : false;
  });

  constructor() {
    void this.cargarUsuarioActual();

    effect(() => {
      const idPelicula = Number(this.id());
      const peliculaActual = this.pelicula();

      if (!peliculaActual) {
        return;
      }

      this.funcionesService.cargarFuncionesPorPelicula(idPelicula);
      this.cargarResenas(idPelicula);
    });
  }

  private async cargarUsuarioActual(): Promise<void> {
    const { data, error } = await this.supabase.auth.getUser();

    if (error) {
      this.idUsuarioActual.set(null);
      return;
    }

    this.idUsuarioActual.set(data.user?.id ?? null);
  }

  private async cargarResenas(idPelicula: number): Promise<void> {
    const [resenas, resumen] = await Promise.all([
      this.resenaService.obtenerPrimerasTres(idPelicula),
      this.resenaService.obtenerResumen(idPelicula),
    ]);

    this.resenas.set(resenas);
    this.promedio.set(resumen.promedio);
    this.cantidadResenas.set(resumen.cantidad);
  }

  seleccionarEstrellas(cantidad: number): void {
    if (cantidad < 1 || cantidad > 5) {
      return;
    }

    this.estrellasSeleccionadas.set(cantidad);
    this.mensajeResena.set('');
  }

  actualizarComentario(comentario: string): void {
    this.comentarioResena.set(comentario);
    this.mensajeResena.set('');
  }

  async guardarResena(): Promise<void> {
    const idUsuario = this.idUsuarioActual();
    const peliculaActual = this.pelicula();
    const estrellas = this.estrellasSeleccionadas();
    const comentario = this.comentarioResena().trim();

    if (!idUsuario) {
      this.mensajeResena.set('Debes iniciar sesión para dejar una reseña.');
      return;
    }

    if (!peliculaActual) {
      return;
    }

    if (estrellas < 1 || estrellas > 5) {
      this.mensajeResena.set('selecione una cantidad de estrellas.');
      return;
    }

    if (comentario.length > 200) {
      this.mensajeResena.set('El comentario no puede superar los 200 caracteres.');
      return;
    }

    if (this.guardandoResena()) {
      return;
    }

    this.guardandoResena.set(true);
    this.mensajeResena.set('');

    const resena = await this.resenaService.guardarResena(
      idUsuario,
      peliculaActual.id_pelicula,
      estrellas,
      comentario,
    );

    if (!resena) {
      this.mensajeResena.set('No se pudo guardar la resena');
      this.guardandoResena.set(false);
      return;
    }

    this.estrellasSeleccionadas.set(0);
    this.comentarioResena.set('');
    this.mensajeResena.set('La reseña se guardó correctamente.');

    await this.cargarResenas(peliculaActual.id_pelicula);
    this.guardandoResena.set(false);
  }

  async activarAlerta(): Promise<void> {
    const peliculaActual = this.pelicula();

    if (!peliculaActual || this.activandoAlerta()) {
      return;
    }

    this.activandoAlerta.set(true);

    const resultado = await this.alertaVentaService.activar(peliculaActual);

    this.mensajeAlerta.set(resultado.mensaje);
    this.activandoAlerta.set(false);
  }

  verResenas(): void {
    this.router.navigate(['/resenas', this.id()]);
  }

  comprarEntrada(idFuncion: number): void {
    const funcion = this.funciones().find(
      (item) => item.id_funcion === idFuncion
    );

    if (!funcion?.puede_comprar) {
      return;
    }

    this.router.navigate(['/compra-entrada', idFuncion]);
  }

  volver(): void {
    this.router.navigate(['/home']);
  }
}