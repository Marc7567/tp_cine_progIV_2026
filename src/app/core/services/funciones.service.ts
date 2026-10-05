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
    
    /**
     * Determina si una función ya terminó.
     * Se compara la fecha y hora de finalización
     * con el momento actual.
     */
    private funcionTerminada(funcion: Funcion): boolean {
        const fechaFin = new Date(`${funcion.fecha}T${funcion.hora_fin}`);

        return fechaFin <= new Date();
    }

    async cargarFuncionesPorPelicula(idPelicula: number): Promise<void> {
        this.cargando.set(true);

        const { data, error } = await this.supabase
            .from('funciones')
            .select('*')
            .eq('id_pelicula', idPelicula)
            .eq('activa', true)
            .order('fecha', { ascending: true })
            .order('hora_inicio', { ascending: true });

        if (error) {
            this.funcionesSignal.set([]);
            this.cargando.set(false);
            return;

        } 
        // Solamente dejamos las funciones que todavía no terminaron.
        const funcionesVigentes = (data || []).filter((funcion: Funcion) => !this.funcionTerminada(funcion));

        const peliculaActual = this.peliculaService
            .peliculas()
            .find((pelicula) => pelicula.id_pelicula === idPelicula);

        const funcionesPreparadas = await Promise.all(
            funcionesVigentes.map((funcion: Funcion) => this.preventaService.prepararFuncion(funcion, peliculaActual))
        );

            this.funcionesSignal.set(funcionesPreparadas);
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

        const funcion = data as Funcion;

        // Si la funcion ya termino no la devolvemos
        if (this.funcionTerminada(funcion)) {
            return null;
        }

        const peliculaActual = this.peliculaService
            .peliculas()
            .find((pelicula) => pelicula.id_pelicula === data.id_pelicula);

        return this.preventaService.prepararFuncion(funcion, peliculaActual);
    }
}