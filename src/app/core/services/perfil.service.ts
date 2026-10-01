import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { CanjePerfil, Perfil, PeliculaVista } from '../models/perfil.interface';

@Injectable({
    providedIn: 'root',
})
export class PerfilService {
    private supabase = inject(SupabaseService).client;

    async obtenerPerfil(): Promise<Perfil | null> {
        const {data: { user }, error: authError} = await this.supabase.auth.getUser();

        if (authError || !user) {
            return null;
        }

        const { data, error } = await this.supabase
            .from('usuarios')
            .select(`id_usuario, id_rol, nombre, apellido, fecha_nacimiento, email, credito, puntos, primera_compra_realizada, creado_en`)
            .eq('id_usuario', user.id)
            .single();

        if (error) {
            return null;
        }

        return data as Perfil;
    }

    async actualizarPerfil(nombre: string, apellido: string, fechaNacimiento: string): Promise<Perfil | null> {
        const {data: { user }} = await this.supabase.auth.getUser();

        if (!user) {
            return null;
        }

        const { data, error } = await this.supabase
            .from('usuarios')
            .update({
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                fecha_nacimiento: fechaNacimiento
            })
            .eq('id_usuario', user.id)
            .select(`id_usuario, id_rol, nombre, apellido, fecha_nacimiento, email, credito, puntos, primera_compra_realizada, creado_en`)
            .single();

        if (error) {
            return null;
        }

        return data as Perfil;
    }

    async obtenerCanjes(): Promise<CanjePerfil[]> {
        const {data: { user }} = await this.supabase.auth.getUser();

        if (!user) {
            return [];
        }

        const { data, error } = await this.supabase
            .from('canjes')
            .select(`id_canje, puntos_utilizados, fecha, estado,
                recompensas (id_recompensa, nombre, descripcion, tipo, valor, costo_puntos, activa)`)
            .eq('id_usuario', user.id)
            .order('fecha', { ascending: false });

        if (error) {
            return [];
        }

        return (data ?? []).map((canje: any) => ({
            id_canje: canje.id_canje,
            puntos_utilizados: canje.puntos_utilizados,
            fecha: canje.fecha,
            estado: canje.estado,
            recompensa: canje.recompensas
        }));
    }

    async obtenerPeliculasVistas(): Promise<PeliculaVista[]> {
        const {data: { user }} = await this.supabase.auth.getUser();

        if (!user) {
            return [];
        }

        const { data: compras, error: comprasError } = await this.supabase
            .from('compras')
            .select('id_compra')
            .eq('id_usuario', user.id);

        if (comprasError) {
            console.error('Error al obtener compras del usuario:', comprasError.message);
            return [];
        }

        const idsCompras = (compras ?? []).map((compra) => compra.id_compra);

        if (idsCompras.length === 0) {
            return [];
        }

        const { data: entradasVistas, error: errorEntradas } = await this.supabase
            .from('entradas')
            .select(`id_entrada, fecha_uso,
                funciones (id_funcion, fecha, hora_inicio,
                peliculas (id_pelicula, titulo, imagen))`)
            .eq('utilizada', true)
            .in('id_compra', idsCompras);

        if (errorEntradas) {
            return [];
        }

        const { data: resenas, error: resenasError } = await this.supabase
            .from('resenas')
            .select(`id_pelicula, estrellas, comentario`)
            .eq('id_usuario', user.id);

        if (resenasError) {
            console.error('Error al obtener calificaciones:', resenasError.message);
        }

        return (entradasVistas ?? []).map((entrada: any) => {
            const funcion = entrada.funciones;
            const pelicula = funcion?.peliculas;

            const resena = (resenas ?? []).find(
                (item: any) => item.id_pelicula === pelicula?.id_pelicula,
            );

            return {
                id_entrada: entrada.id_entrada,
                fecha_uso: entrada.fecha_uso,
                fecha_funcion: funcion?.fecha,
                hora_inicio: funcion?.hora_inicio,
                titulo: pelicula?.titulo ?? 'Película',
                imagen: pelicula?.imagen ?? null,
                estrellas: resena?.estrellas ?? null,
                comentario: resena?.comentario ?? null,
            };
        });
    }

    private async obtenerIdCompraDeUsuario(idUsuario: string): Promise<number> {
        const { data } = await this.supabase
            .from('compras')
            .select('id_compra')
            .eq('id_usuario', idUsuario)
            .limit(1)
            .maybeSingle();

        return data?.id_compra ?? 0;
    }
}
