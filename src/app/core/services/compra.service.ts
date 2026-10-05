import { Injectable, signal, inject } from '@angular/core';
import { CompraActual, ProductoComprado, ComboComprado } from '../models/compras.interface';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})

export class CompraService {
    private supabase = inject(SupabaseService).client;
    private authService = inject(AuthService);
    private compraSignal = signal<CompraActual | null>(null);
    private creditoUtilizadoSignal = signal(0);

    compra = this.compraSignal.asReadonly();
    creditoUtilizado = this.creditoUtilizadoSignal.asReadonly();

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

        this.creditoUtilizadoSignal.set(0);
    }
    
    async obtenerCreditoDisponible(): Promise<number> {
        const { data: { user }, error: authError } = await this.supabase.auth.getUser();

        if (authError || !user) {
            return 0;
        }

        const { data, error } = await this.supabase
            .from('usuarios')
            .select('credito, id_rol')
            .eq('id_usuario', user.id)
            .single();

        if (error || !data) {
            return 0;
        }

        if (data.id_rol !== 3) {
            return 0;
        }

        return Number(data.credito ?? 0);
    }

    // Guardamos la compra la base de datos
    async registrarCompra(creditoUtilizado: number = 0): Promise<boolean> {
        const compraActual = this.compraSignal();

        if (!compraActual) {
            console.log('ERROR: no existe compraActual');
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

        const { data: { user } } = await this.supabase.auth.getUser();
        const idUsuario = user?.id ?? null;

        const credito = Number(creditoUtilizado);

        let medioPago = 'tarjeta';

        if (credito > 0) {
            if (credito >= Number(compraActual.totalCompra)) {
                medioPago = 'credito';
            } else {
                medioPago = 'tarjeta + credito';
            }
        }

        const { data, error } = await this.supabase.rpc('registrar_compra',
            {
                p_id_usuario: idUsuario,
                p_id_funcion: compraActual.funcion.id_funcion,
                p_id_butaca: compraActual.butaca.id_butaca,
                p_medio_pago: medioPago,
                p_codigo_qr: compraActual.codigoCompra,
                p_productos: productos,
                p_combos: combos,
                p_credito_utilizado: credito
            }
        );

        if (error) {
            console.error('Error de registrar_compra:', error);
            return false;
        }

        if (!data || data.length === 0) {
            return false;
        }

        this.creditoUtilizadoSignal.set(Number(data[0].credito_utilizado ?? 0));

        this.compraSignal.set({
            ...compraActual,
            totalCompra: Number(data[0].total),
            pagoRealizado: true
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
            // Verificamos si el usuario es un clienteregistrado y si no ha realizado ninguna compra antes
            return data?.id_rol === 3 && data?.primera_compra === false;
        }

    vaciarCompra(): void {
        this.compraSignal.set(null);

        this.creditoUtilizadoSignal.set(0);
    }
}