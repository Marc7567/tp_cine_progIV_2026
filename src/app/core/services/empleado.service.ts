import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
    providedIn: 'root'
})

export class EmpleadoService {
    private supabase = inject(SupabaseService).client;

    async obtenerCompraPorCodigo(codigoQr: string): Promise<any | null> {
        const codigo = codigoQr.trim();

        if (!codigo) {
            return null;
        }

        const { data, error } = await this.supabase
            .from('compras')
            // obtenemos datos de la compra de la base de datos
            .select(`id_compra, id_usuario, fecha_compra, subtotal, descuento, credito_utilizado, total, medio_pago, estado, codigo_qr, codigo_usu,
                datos_comprador (id_compra, nombre, apellido, dni, email),

                usuarios (id_usuario, nombre, apellido, fecha_nacimiento, email, credito, puntos, primera_compra, creado_en, rol,
                    canjes (id_canje, puntos_utilizados, fecha, estado,
                        recompensas (id_recompensa, nombre, descripcion, tipo, valor, costo_puntos, activa)
                    )
                ),
                entradas (id_entrada, id_funcion, id_butaca, precio, codigo_qr, utilizada, fecha_uso,
                    butacas (id_butaca, fila, columna, tipo, precio_extra),
                    funciones (id_funcion, id_pelicula, id_sala, fecha, hora_inicio, hora_fin, modalidad, idioma, precio_base, precio_preventa, activa,
                        peliculas (id_pelicula, titulo, imagen, sinopsis, duracion_minutos, fecha_estreno, edad_minima)
                    )
                ),
                detalle_compra (id_detalle, id_compra, id_producto, id_combo, cantidad, precio_unitario, subtotal,
                    productos (id_producto, nombre, descripcion, categoria),
                    combos (id_combo, nombre, descripcion, precio, cantidad_entradas, imagen, activo)
                )
            `)
            .eq('codigo_qr', codigo)
            .eq('estado', 'confirmada')
            .maybeSingle();

        if (error || !data) {
            console.error('Error al obtener compra:', error);
            return null;
        }

        console.log('Compra obtenida:', data);
        console.log('Usuario de la compra:', data.usuarios);

        return data;
    }

    async CompraUtilizada(idCompra: number): Promise<boolean> {
        const { data, error } = await this.supabase
            .from('compras')
            .update({
                codigo_usu: true
            })
            .eq('id_compra', idCompra)
            .eq('codigo_usu', false)
            .select('id_compra, codigo_usu')
            .maybeSingle();

        if (error || !data) {
            console.error('Error al utilizar la compra:', error);
            return false;
        }

        const { error: errorEntrada } = await this.supabase
            .from('entradas')
            .update({utilizada: true, fecha_uso: new Date().toISOString()})
            .eq('id_compra', idCompra)
            .eq('utilizada', false);

        if (errorEntrada) {
            console.error('Error al utilizar las entradas:', errorEntrada);
            return false;
        }

        return true;
    }
}