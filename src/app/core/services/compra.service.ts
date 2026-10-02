import { Injectable, signal, inject } from '@angular/core';
import { CompraActual, ProductoComprado, ComboComprado } from '../models/compras.interface';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root',
})

export class CompraService {
    private supabase = inject(SupabaseService).client;
    private authService = inject(AuthService);
    private compraSignal = signal<CompraActual | null>(null);

    compra = this.compraSignal.asReadonly();

    guardarCompra(datos: {
        funcion: any;
        pelicula: any;
        butaca: any;
        comprador: {
            nombre: string;
            apellido: string;
            dni: string;
            email: string;
        };
        productos: ProductoComprado[];
        combos: ComboComprado[];
        totalCandyBar: number;
        totalCompra: number;
    }): void {
    const codigoCompra = `QR-${crypto.randomUUID()}`;

    this.compraSignal.set({
        funcion: datos.funcion,
        pelicula: datos.pelicula,
        butaca: datos.butaca,
        comprador: {
            nombre: datos.comprador.nombre,
            apellido: datos.comprador.apellido,
            dni: datos.comprador.dni,
            email: datos.comprador.email
        },
        productos: datos.productos,
        combos: datos.combos,
        totalCandyBar: datos.totalCandyBar,
        totalCompra: datos.totalCompra,
        codigoCompra: codigoCompra,
        pagoRealizado: false
        });
    }

    async registrarCompraEnSupabase(): Promise<boolean> {
        const compraActual = this.compraSignal();

        if (!compraActual) {
            return false;
        }

        const productos = compraActual.productos.map((item) => ({
            id_producto: item.producto.id_producto,
            cantidad: item.cantidad
        }));

        const combos = compraActual.combos.map((item) => ({
            id_combo: item.combo.id_combo,
            cantidad: item.cantidad
        }));
        
        // Obtenemos el usuario autenticado desde Supabase
        const { data: { user } } = await this.supabase.auth.getUser();

        const { data, error } = await this.supabase.rpc('registrar_compra', {
            p_id_usuario: user?.id ?? null,
            p_id_funcion: compraActual.funcion.id_funcion,
            p_id_butaca: compraActual.butaca.id_butaca,
            p_medio_pago: 'tarjeta',
            p_codigo_qr: compraActual.codigoCompra,
            p_productos: productos,
            p_combos: combos
        });

        if (error) {
            return false;
        }

        if (!data || data.length === 0) {
            return false;
        }

        this.compraSignal.set({
            ...compraActual,
            totalCompra: Number(data[0].total),
            pagoRealizado: true,
        });

        return true;
    }

    async verificarPrimeraCompra(): Promise<boolean> {
        const usuario = this.authService.currentUser();

        if (!usuario) {
            return false;
        }

        const { data, error } = await this.supabase
            .from('usuarios')
            .select('primera_compra, id_rol')
            .eq('id_usuario', usuario.id)
            .single();

        if (error) {
            return false;
        }
            // Verificamos si el usuario es un cliente registrado (id_rol === 3) y si no ha realizado ninguna compra antes (primera_compra === false)
            return data?.id_rol === 3 && data?.primera_compra === false;
        }

    vaciarCompra(): void {
        this.compraSignal.set(null);
    }
}