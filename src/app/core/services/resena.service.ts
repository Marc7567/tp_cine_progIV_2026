import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Resena } from '../models/resenas.interface';

@Injectable({
    providedIn: 'root',
})

export class ResenaService {
    private supabase = inject(SupabaseService).client;

    async obtenerResenas(idPelicula: number, limite?: number): Promise<Resena[]> {
        let consulta = this.supabase
            .from('resenas')
            .select(`*, usuarios (nombre, apellido) `)
            .eq('id_pelicula', idPelicula)
            .order('fecha', { ascending: false });

        if (limite) {
            consulta = consulta.limit(limite);
        }

        const { data, error } = await consulta;

        if (error) {
            return [];
        }

        return (data ?? []).map((resena: any) => ({
            id_resena: resena.id_resena,
            id_usuario: resena.id_usuario,
            id_pelicula: resena.id_pelicula,
            estrellas: resena.estrellas,
            comentario: resena.comentario,
            fecha: resena.fecha,
            nombre_publico: resena.nombre_publico,
            usuario: resena.usuarios,
        }));
    }

    async obtenerPrimerasTres(idPelicula: number): Promise<Resena[]> {
        return this.obtenerResenas(idPelicula, 3);
    }

    async obtenerTodas(idPelicula: number): Promise<Resena[]> {
        return this.obtenerResenas(idPelicula);
    }

    async obtenerResumen(idPelicula: number): Promise<{ promedio: number; cantidad: number }> {
        const { data, error } = await this.supabase
            .from('resenas')
            .select('estrellas')
            .eq('id_pelicula', idPelicula);

        if (error) {
            return { promedio: 0, cantidad: 0 };
        }

        const cantidad = data?.length ?? 0;

        if (cantidad === 0) {
            return { promedio: 0, cantidad: 0 };
        }

        const suma = data.reduce((total, resena) => total + Number(resena.estrellas), 0);

        return { promedio: Number((suma / cantidad).toFixed(1)), cantidad };
    }

    async guardarResena(
        idUsuario: string,
        idPelicula: number,
        estrellas: number,
        comentario: string,
    ): Promise<Resena | null> {
        const { data, error } = await this.supabase
        .from('resenas')
        .upsert(
            {
            id_usuario: idUsuario,
            id_pelicula: idPelicula,
            estrellas,
            comentario: comentario.trim() || null,
            nombre_publico: null,
            },
            {onConflict: 'id_usuario,id_pelicula' },
        )
        .select()
        .single();

        if (error) {
            return null;
        }

        return data;
    }

    async guardarResenaPublica(
        idPelicula: number,
        estrellas: number,
        comentario: string,
        nombrePublico: string,
        ): Promise<Resena | null> {
        const { data, error } = await this.supabase
            .from('resenas')
            .insert({
                id_usuario: null,
                id_pelicula: idPelicula,
                estrellas,
                comentario: comentario.trim() || null,
                nombre_publico: nombrePublico.trim() || null,
            })
            .select()
            .single();

        if (error) {
            return null;
        }

        return data;
    }
}
