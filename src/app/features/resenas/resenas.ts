import { Component, effect, input, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { PeliculaService } from '../../core/services/pelicula.service';
import { ResenaService } from '../../core/services/resena.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { Resena } from '../../core/models/resenas.interface';

import { FechaResenaPipe } from '../../shared/pipes/resena.pipe'

@Component({
  imports: [FechaResenaPipe],
  selector: 'app-resenas',
  styleUrl: './resenas.css',
  templateUrl: './resenas.html',
})

export class Resenas {
  id = input.required<string>();

  private peliculaService = inject(PeliculaService);
  private resenaService = inject(ResenaService);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  pelicula = signal<any>(null);
  resenas = signal<Resena[]>([]);
  promedio = signal(0);
  cantidad = signal(0);

  // Datos del formulario
  estrellasSeleccionadas = signal(0);
  comentario = signal('');

  // Estado del formulario
  guardando = signal(false);
  mensaje = signal('');

  constructor() {
    effect(() => {
      const idPelicula = Number(this.id());
      const pelicula = this.peliculaService.getPeliculaById(idPelicula)();

      if (!pelicula) {
        return;
      }

      this.pelicula.set(pelicula);
      this.cargarResenas();
    });
  }

  async cargarResenas(): Promise<void> {
    const idPelicula = Number(this.id());

    this.resenas.set(
      await this.resenaService.obtenerTodas(idPelicula)
    );

    const resumen = await this.resenaService.obtenerResumen(idPelicula);

    this.promedio.set(resumen.promedio);
    this.cantidad.set(resumen.cantidad);
  }

  seleccionarEstrellas(estrellas: number): void {
    this.estrellasSeleccionadas.set(estrellas);
  }

  actualizarComentario(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.comentario.set(textarea.value);
  }

  async guardarResena(): Promise<void> {
    if (this.guardando()) {
      return;
    }

    const estrellas = this.estrellasSeleccionadas();
    const comentario = this.comentario().trim();
    const idPelicula = Number(this.id());

    if (estrellas < 1 || estrellas > 5) {
      this.mensaje.set('Debe calificar la pelicula.');
      return;
    }

    if (!comentario) {
      this.mensaje.set('Debe escribir un comentario.');
      return;
    }

    this.guardando.set(true);
    this.mensaje.set('');

    try {
      const {
        data: { user },
      } = await this.supabaseService.client.auth.getUser();

      let resultado: Resena | null = null;

      if (user) {
        const { data: usuarioRegistrado } =
          await this.supabaseService.client
            .from('usuarios')
            .select('id_usuario')
            .eq('id_usuario', user.id)
            .maybeSingle();

        if (usuarioRegistrado) {
          resultado = await this.resenaService.guardarResena(
            user.id,
            idPelicula,
            estrellas,
            comentario
          );
        } else {
          resultado = await this.resenaService.guardarResenaAnonima(
            idPelicula,
            estrellas,
            comentario
          );
        }
      } else {
        resultado = await this.resenaService.guardarResenaAnonima(
          idPelicula,
          estrellas,
          comentario
        );
      }

      if (!resultado) {
        this.mensaje.set('No se pudo guardar la reseña.');
        return;
      }

      this.estrellasSeleccionadas.set(0);
      this.comentario.set('');
      this.mensaje.set('Reseña guardada correctamente.');

      await this.cargarResenas();
    } finally {
      this.guardando.set(false);
    }
  }

  volver(): void {
    this.router.navigate(['/home']);
  }
}