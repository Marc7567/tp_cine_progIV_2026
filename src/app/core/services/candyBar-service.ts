import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Producto } from '../models/producto.interface';
import { Combo, ComboProducto } from '../models/combos.interface';

@Injectable({
    providedIn: 'root',
})

export class CandyBarService {
    private supabase = inject(SupabaseService).client;
    private productosSignal = signal<Producto[]>([]);
    private combosSignal = signal<Combo[]>([]);
    private combosProductosSignal = signal<ComboProducto[]>([]);
    private productosSeleccionadosSignal = signal<{ producto: Producto; cantidad: number }[]>([]);
    private combosSeleccionadosSignal = signal<{ combo: Combo; cantidad: number }[]>([]);

    cargando = signal(false);
    productos = this.productosSignal.asReadonly();
    combos = this.combosSignal.asReadonly();
    combosProductos = this.combosProductosSignal.asReadonly();
    productosSeleccionados = this.productosSeleccionadosSignal.asReadonly();
    combosSeleccionados = this.combosSeleccionadosSignal.asReadonly();

    async cargarProductos(): Promise<void> {
        const { data, error } = await this.supabase
            .from('productos')
            .select('*')
            .eq('activo', true)
            .gt('stock', 0)
            .order('nombre', { ascending: true });

        if (error) {
            console.error('Error al cargar los productos de Candy Bar:', error.message);
            this.productosSignal.set([]);
            return;
        }

        this.productosSignal.set(data || []);
    }

    async cargarCombos(): Promise<void> {
        const { data, error } = await this.supabase
            .from('combos')
            .select('*')
            .eq('activo', true)
            .order('nombre', { ascending: true });

        if (error) {
            console.error('Error al cargar los combos de Candy Bar:', error.message);
            this.combosSignal.set([]);
            return;
        }

        this.combosSignal.set(data || []);
    }

    async cargarRelacionCombosProductos(): Promise<void> {
        const { data, error } = await this.supabase.from('combo_producto').select('*');

        if (error) {
            console.error('Error al cargar la relación entre combos y productos:', error.message);
            this.combosProductosSignal.set([]);
            return;
        }

        this.combosProductosSignal.set(data || []);
    }

    async cargarDatosCandyBar(): Promise<void> {
        this.cargando.set(true);

        await Promise.all([
            this.cargarProductos(),
            this.cargarCombos(),
            this.cargarRelacionCombosProductos(),
        ]);

        this.cargando.set(false);
    }

    obtenerProductosDeCombo(idCombo: number): ComboProducto[] {
        return this.combosProductosSignal().filter(
            (comboProducto) => comboProducto.id_combo === idCombo,
        );
    }

    obtenerProductoPorId(idProducto: number): Producto | undefined {
        return this.productosSignal().find((producto) => producto.id_producto === idProducto);
    }

    obtenerComboPorId(idCombo: number): Combo | undefined {
        return this.combosSignal().find((combo) => combo.id_combo === idCombo);
    }
    
    // 
    guardarSeleccionCandyBar(
        productos: { producto: Producto; cantidad: number }[],
        combos: { combo: Combo; cantidad: number }[]
    ): void {
        this.productosSeleccionadosSignal.set(productos);
        this.combosSeleccionadosSignal.set(combos);
    }

    vaciarSeleccionCandyBar(): void {
        this.productosSeleccionadosSignal.set([]);
        this.combosSeleccionadosSignal.set([]);
    }
}
