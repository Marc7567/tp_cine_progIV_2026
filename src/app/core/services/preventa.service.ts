import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Preventa, EstadoVenta } from '../models/preventa.interface';
import { pelicula } from '../models/pelicula.interface';
import { Funcion } from '../models/funcion.interface';

@Injectable({
    providedIn: 'root',
})
export class PreventaService {
    private supabase = inject(SupabaseService).client;

    async obtenerPorPelicula(idPelicula: number): Promise<Preventa | null> {
        const { data, error } = await this.supabase
            .from('preventas')
            .select('*')
            .eq('id_pelicula', idPelicula)
            .eq('habilitada', true)
            .order('fecha_inicio', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error('Error al obtener la preventa:', error.message);
            return null;
        }

        return data as Preventa | null;
    }

    private obtenerVentanaPreventa(
        peliculaActual: pelicula,
        preventa: Preventa | null,
    ): { inicio: Date; fin: Date } | null {
        if (!preventa?.habilitada) {
            return null;
        }

        const estreno = new Date(`${peliculaActual.fecha_estreno}T00:00:00`);

        const inicioMaximo = new Date(
            estreno.getTime() - 7 * 24 * 60 * 60 * 1000
        );

        const inicioConfigurado = new Date(preventa.fecha_inicio);
        const finConfigurado = new Date(preventa.fecha_fin);

        // La preventa no puede comenzar antes de los 7 días previos al estreno.
        const inicio =
            inicioConfigurado > inicioMaximo
                ? inicioConfigurado
                : inicioMaximo;

        // La preventa termina como máximo al comenzar el día del estreno.
        const fin =
            finConfigurado < estreno
                ? finConfigurado
                : estreno;

        if (fin <= inicio) {
            return null;
        }

        return { inicio, fin };
    }

    determinarEstado(
        peliculaActual: pelicula,
        preventa: Preventa | null,
        ahora = new Date(),
    ): EstadoVenta {
        const ventana = this.obtenerVentanaPreventa(
            peliculaActual,
            preventa
        );

        if (ventana && ahora >= ventana.inicio && ahora < ventana.fin) {
            return 'preventa';
        }

        const estreno = new Date(`${peliculaActual.fecha_estreno}T00:00:00`);

        if (ahora >= estreno) {
            return 'normal';
        }

        return 'no-disponible';
    }

    obtenerPrecio(
        precioBase: number,
        estado: EstadoVenta,
        preventa: Preventa | null,
    ): number {
        if (estado === 'preventa' && preventa) {
            return Number(preventa.precio_especial);
        }

        return Number(precioBase);
    }

    async prepararFuncion(
        funcion: Funcion,
        peliculaActual: pelicula | undefined,
    ): Promise<Funcion> {
        if (!peliculaActual) {
            return {
                ...funcion,
                precio_venta: Number(funcion.precio_base),
                estado_venta: 'no-disponible',
                puede_comprar: false,
            };
        }

        const preventa = await this.obtenerPorPelicula(
            peliculaActual.id_pelicula
        );

        const estado = this.determinarEstado(
            peliculaActual,
            preventa
        );

        const precioVenta = this.obtenerPrecio(
            funcion.precio_base,
            estado,
            preventa
        );

        return {
            ...funcion,
            precio_venta: precioVenta,
            estado_venta: estado,
            puede_comprar: estado !== 'no-disponible',
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
                .gte(
                    'fecha',
                    new Date().toISOString().split('T')[0]
                )
                .limit(1);

        if (funcionesError || !funciones?.length) {
            return false;
        }

        const peliculaActual = peliculaData as pelicula;
        const preventa = await this.obtenerPorPelicula(idPelicula);

        return (
            this.determinarEstado(
                peliculaActual,
                preventa
            ) !== 'no-disponible'
        );
    }
}