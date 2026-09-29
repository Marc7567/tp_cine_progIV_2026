import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Funcion } from '../models/funcion.interface';
import { PreventaService } from './preventa.service';
import { PeliculaService } from './pelicula.service';

@Injectable({
    providedIn: 'root',
})

export class FuncionesService {
    private supabase = inject(SupabaseService).client;
    private preventaService = inject(PreventaService);
    private peliculaService = inject(PeliculaService);
    private funcionesSignal = signal<Funcion[]>([]);

    cargando = signal(false);
    funciones = this.funcionesSignal.asReadonly();

    async cargarFuncionesPorPelicula(idPelicula: number): Promise<void> {
        this.cargando.set(true);

        const { data, error } = await this.supabase
            .from('funciones')
            .select('*')
            .eq('id_pelicula', idPelicula)
            .order('fecha', { ascending: true })
            .order('hora_inicio', { ascending: true });

        if (error) {
            this.funcionesSignal.set([]);
        } else {
            const peliculaActual = this.peliculaService
                .peliculas()
                .find((pelicula) => pelicula.id_pelicula === idPelicula);

            const funcionesPreparadas = await Promise.all(
                (data || []).map((funcion: Funcion) =>
                    this.preventaService.prepararFuncion(funcion, peliculaActual)
                )
            );

            this.funcionesSignal.set(funcionesPreparadas);
        }

            this.cargando.set(false);
    }

    async obtenerFuncionPorId(idFuncion: number): Promise<Funcion | null> {
        const { data, error } = await this.supabase
            .from('funciones')
            .select('*')
            .eq('id_funcion', idFuncion)
            .single();

        if (error) {
            return null;
        }

        const peliculaActual = this.peliculaService
            .peliculas()
            .find((pelicula) => pelicula.id_pelicula === data.id_pelicula);

        return this.preventaService.prepararFuncion(data as Funcion, peliculaActual);
    }
}