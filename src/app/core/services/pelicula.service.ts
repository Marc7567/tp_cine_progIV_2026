import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { pelicula ,PeliculaMasVendida } from '../models/pelicula.interface';
import { RealtimeChannel } from '@supabase/supabase-js';

@Injectable({ 
    providedIn: 'root' 
})

export class PeliculaService {
    private supabase = inject(SupabaseService).client;
    private destroyRef = inject(DestroyRef);
    private peliculasSignal = signal<pelicula[]>([]);

    cargando = signal(false);
    peliculas = computed(() => this.peliculasSignal());

    private channel!: RealtimeChannel;

    constructor() {
        this.cargarPeliculasDesdeDB();
        this.channel = this.iniciarRealtime();

        // Limpiamos la suscripcion cuando el servicio se destruye
        this.destroyRef.onDestroy(() => {this.supabase.removeChannel(this.channel);});
    }

    // Cargamos peliculas desde Supabase
    private async cargarPeliculasDesdeDB(): Promise<void> {
        this.cargando.set(true);

        const { data, error } = await this.supabase
            .from('peliculas')
            .select(`*, pelicula_genero (generos (id_genero,nombre))`)
            .order('titulo', { ascending: true });

    if (error) {
        console.error( 'Error al cargar películas desde Supabase:', error.message);
    } else {
        const peliculas = (data || []).map((pelicula: any) => ({
            id_pelicula: pelicula.id_pelicula,
            titulo: pelicula.titulo,
            imagen: pelicula.imagen,
            sinopsis: pelicula.sinopsis,
            duracion_minutos: pelicula.duracion_minutos,
            fecha_estreno: pelicula.fecha_estreno,
            edad_minima: pelicula.edad_minima,
            disponible_principal: pelicula.disponible_principal,
            activa: pelicula.activa,

            generos: (pelicula.pelicula_genero || [])
                .map((relacion: any) => relacion.generos?.nombre)
                .filter((nombre: string | undefined) => nombre)
            }));

        this.peliculasSignal.set(peliculas);
    }

    this.cargando.set(false);
    }

    // REALTIME — Escucha cambios en la tabla 'peliculas'
    private iniciarRealtime(): RealtimeChannel {
        return this.supabase
            .channel('peliculas-realtime')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'peliculas' },
                (payload) => {
                console.log('Cambio en tiempo real:', payload.eventType, payload);
                switch (payload.eventType) {

                    // INSERT — se agregó una nueva película
                    case 'INSERT':
                    this.peliculasSignal.update(peliculas => [...peliculas, payload.new as pelicula]);
                    break;

                    // UPDATE — se modificó una película
                    case 'UPDATE':
                    this.peliculasSignal.update(peliculas =>
                        peliculas.map(p => p.id_pelicula === (payload.new as pelicula).id_pelicula? payload.new as pelicula: p)
                    );
                    break;

                    // DELETE — se eliminó una película
                    case 'DELETE':
                    this.peliculasSignal.update(peliculas =>
                        peliculas.filter(p => p.id_pelicula !== (payload.old as { id_pelicula: number }).id_pelicula)
                    );
                    break;
                }
            }
        )
        .subscribe();
    }
    
    async obtener3PelisMasVendidas(): Promise<PeliculaMasVendida[]> {
        const { data, error } = await this.supabase
            .from('entradas')
            .select(`id_funcion, funciones!inner(id_pelicula)`);

        if (error) {
            console.error('Error al obtener películas más vendidas:', error.message);
            return [];
        }

        const cantidades = new Map<number, number>();

        for (const entrada of data ?? []) {
            const funcion = Array.isArray(entrada.funciones) ? entrada.funciones[0] : entrada.funciones;

            if (!funcion) {
                continue;
            }

            const idPelicula = funcion.id_pelicula;

            cantidades.set(idPelicula, (cantidades.get(idPelicula) ?? 0) + 1);
        }

        return Array.from(cantidades.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([id_pelicula, cantidad_vendida]) => ({
                id_pelicula,
                cantidad_vendida
            }));
    }

    // Obtener una película por ID
    getPeliculaById(id: number) {
        return computed(() =>
            this.peliculasSignal().find(pelicula => pelicula.id_pelicula === id)
        );
    }
}