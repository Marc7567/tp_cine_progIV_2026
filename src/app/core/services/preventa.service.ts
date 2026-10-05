import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { EstadoVenta } from '../models/funcion.interface';
import { pelicula } from '../models/pelicula.interface';
import { Funcion } from '../models/funcion.interface';

@Injectable({
    providedIn: 'root',
})

export class PreventaService {
    private supabase = inject(SupabaseService).client;

    private obtenerVentanaPreventa(peliculaActual: pelicula): { inicio: Date; fin: Date } | null {
        const estreno = new Date(`${peliculaActual.fecha_estreno}T00:00:00`);
        const inicio = new Date(estreno.getTime() - 7 * 24 * 60 * 60 * 1000);

        const fin = estreno;

        if (fin <= inicio) {
            return null;
        }

        return { inicio, fin };
    }

    determinarEstado(peliculaActual: pelicula, ahora = new Date()): EstadoVenta {
        const ventana = this.obtenerVentanaPreventa(peliculaActual);

        if (ventana && ahora >= ventana.inicio && ahora < ventana.fin) {
            return 'preventa';
        }

        const estreno = new Date(`${peliculaActual.fecha_estreno}T00:00:00`);

        if (ahora >= estreno) {
            return 'normal';
        }

        return 'no-disponible';
    }

    obtenerPrecio(funcion: Funcion, estado: EstadoVenta): number {
        if (estado === 'preventa') {
            return Number(funcion.precio_preventa);
        }

        return Number(funcion.precio_base);
    }

    async prepararFuncion(funcion: Funcion, peliculaActual: pelicula | undefined): Promise<Funcion> {
        if (!peliculaActual) {
            return {
                ...funcion,
                precio_venta: Number(funcion.precio_base),
                estado_venta: 'no-disponible',
                puede_comprar: false
            };
        }

        const estado = this.determinarEstado(peliculaActual);
        const precioVenta = this.obtenerPrecio(funcion, estado);

        return {
            ...funcion,
            precio_venta: precioVenta,
            estado_venta: estado,
            puede_comprar: estado !== 'no-disponible'
        };
    }

    async hayVentaDisponible(idPelicula: number): Promise<boolean> {
        const { data: peliculaData, error: peliculaError } =
            await this.supabase
                .from('peliculas')
                .select('id_pelicula, fecha_estreno')
                .eq('id_pelicula', idPelicula)
                .maybeSingle();

        if (peliculaError || !peliculaData) {
            return false;
        }

        const { data: funciones, error: funcionesError } =
            await this.supabase
                .from('funciones')
                .select('id_funcion')
                .eq('id_pelicula', idPelicula)
                .eq('activa', true)
                .gte('fecha', new Date().toISOString().split('T')[0])
                .limit(1);

        if (funcionesError || !funciones?.length) {
            return false;
        }

        const peliculaActual = peliculaData as pelicula;

        return this.determinarEstado(peliculaActual) !== 'no-disponible';
    }
}