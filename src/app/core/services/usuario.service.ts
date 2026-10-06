import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { CanjePerfil, PeliculaVista } from '../models/perfil.interface';
import { Usuario } from '../models/usuario.interface';

@Injectable({
    providedIn: 'root',
})

export class UsuarioService {
    private supabase = inject(SupabaseService).client;

    async obtenerPerfil(): Promise<Usuario | null> {
        const { data: { user }, error: authError } = await this.supabase.auth.getUser();

        if (authError || !user) {
            return null;
        }

        const { data, error } = await this.supabase
            .from('usuarios')
            .select(`id_usuario, nombre, apellido, fecha_nacimiento, email, rol, credito, puntos, primera_compra, creado_en`)
            .eq('id_usuario', user.id)
            .single();

        if (error) {
            return null;
        }

        return data as Usuario;
    }

    async actualizarPerfil(nombre: string, apellido: string, fechaNacimiento: string): Promise<Usuario | null> {
        const { data: { user } } = await this.supabase.auth.getUser();

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
            .select(`id_usuario, nombre, apellido, fecha_nacimiento, email, rol ,credito,puntos, primera_compra, creado_en`)
            .single();

        if (error) {
            return null;
        }
        return data as Usuario;
    }

    async obtenerCanjes(): Promise<CanjePerfil[]> {
        const { data: { user } } = await this.supabase.auth.getUser();

        if (!user) {
            return [];
        }

        const { data, error } = await this.supabase
            .from('canjes')
            .select(`id_canje, puntos_utilizados, fecha, estado, recompensas (id_recompensa, nombre, descripcion, tipo, valor, costo_puntos, activa)`)
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
        const { data: { user } } = await this.supabase.auth.getUser();

        if (!user) {
            return [];
        }

        const { data: compras, error: comprasError } =
            await this.supabase
                .from('compras')
                .select('id_compra')
                .eq('id_usuario', user.id);

        if (comprasError) {
            return [];
        }

        const idsCompras = (compras ?? []).map((compra) => compra.id_compra);

        if (idsCompras.length === 0) {
            return [];
        }

        const { data: entradasVistas, error: errorEntradas } =
            await this.supabase
                .from('entradas')
                .select(`id_entrada, fecha_uso, funciones (id_funcion, fecha, hora_inicio, peliculas (id_pelicula, titulo, imagen))`)
                .eq('utilizada', true)
                .in('id_compra', idsCompras);

        if (errorEntradas) {
            return [];
        }

        const { data: resenas, error: resenasError } =
            await this.supabase
                .from('resenas')
                .select(`id_pelicula, estrellas, comentario`)
                .eq('id_usuario', user.id);

        if (resenasError) {
            console.error(resenasError.message);
        }

        return (entradasVistas ?? []).map((entrada: any) => {
            const funcion = entrada.funciones;
            const pelicula = funcion?.peliculas;
            const resena = (resenas ?? []).find((item: any) => item.id_pelicula === pelicula?.id_pelicula);

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

    // Consulta los puntos del usuario autenticado.
    async obtenerMisPuntos(): Promise<number | null> {
        const { data, error } = await this.supabase.rpc('obtener_mis_puntos');

        if (error) {
            return null;
        }
        return Number(data ?? 0);
    }

    // Obtiene únicamente las recompensas activas.
    async obtenerRecompensas(): Promise<any[]> {
        const { data, error } = await this.supabase
            .from('recompensas')
            .select(`id_recompensa, nombre, descripcion, tipo, valor, costo_puntos, activa`)
            .eq('activa', true)
            .order('costo_puntos', {ascending: true});

        if (error) {
            return [];
        }
        return data ?? [];
    }

    async canjearRecompensa(idRecompensa: number): Promise<{data: any | null; errorMessage: string | null}> {
        const { data, error } =
            await this.supabase.rpc('canjear_recompensa', {p_id_recompensa: idRecompensa});

        if (error) {
            return {data: null, errorMessage: error.message};
        }

        return {data: data?.[0] ?? null, errorMessage: null};
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

    async obtenerMisCompras(): Promise<any[]> {
        const { data: { user }, error: authError } = await this.supabase.auth.getUser();

        if (authError || !user) {
            return [];
        }

        const { data, error } = await this.supabase
            .from('compras')
            .select(`id_compra, fecha_compra, subtotal, descuento, credito_utilizado, total, medio_pago, estado, codigo_qr,
                entradas (id_entrada, id_funcion, id_butaca, precio, codigo_qr, utilizada, fecha_uso,
                butacas (id_butaca, fila, columna),
                funciones (id_funcion, id_pelicula, fecha, hora_inicio, hora_fin, modalidad, idioma, precio_base,
                peliculas (id_pelicula, titulo, imagen)))
            `)
            .eq('id_usuario', user.id)
            .order('fecha_compra', { ascending: false });

        if (error) {
            return [];
        }

        return data ?? [];
    }

    async cancelarCompra(idCompra: number): Promise<{exito: boolean; mensaje: string; creditoGenerado: number; creditoTotal: number}> {
        // llamamos a la función 'cancelar_compra' en Supabase, pasando el id de la compra a cancelar
        const { data, error } = await this.supabase.rpc('cancelar_compra', {p_id_compra: idCompra});

        if (error) {
            return {exito: false, mensaje: error.message, creditoGenerado: 0, creditoTotal: 0};
        }

        if (!data || data.length === 0) {
            // Si no hay datos devueltos, significa que la compra no pudo ser cancelada
            return {exito: false, mensaje: 'No se pudo cancelar la compra.', creditoGenerado: 0, creditoTotal: 0};
        }
        
        // Si la compra fue cancelada correctamente, devolvemos un mensaje de éxito y los créditos generados
        return {exito: true, mensaje: 'Compra cancelada correctamente.', creditoGenerado: Number(data[0].credito_generado), creditoTotal: Number(data[0].credito_total)};
        }
}
