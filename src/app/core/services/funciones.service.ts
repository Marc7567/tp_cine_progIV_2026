import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Funcion } from '../models/funcion.interface';

@Injectable({
  providedIn: 'root'
})

export class FuncionesService {
    private supabase = inject(SupabaseService).client;
    private funcionesSignal = signal<Funcion[]>([]);

    cargando = signal(false);
    funciones = this.funcionesSignal.asReadonly();

    async cargarFuncionesPorPelicula(idPelicula: number): Promise<void> {
        this.cargando.set(true);

        const { data, error } = await this.supabase
            .from('funciones')
            .select('*')
            .eq('id_pelicula', idPelicula)
            .order('fecha', { ascending: true })
            .order('hora_inicio', { ascending: true });

        if (error) {
            console.error('Error al cargar funciones desde Supabase:', error.message);
            this.funcionesSignal.set([]);
        } else {
            this.funcionesSignal.set(data || []);
            console.log(`Se cargaron ${data?.length || 0} funciones para la película ${idPelicula}`);
        }
            this.cargando.set(false);
    }

    // obtenemos los datos de cada funcion 
    async obtenerFuncionPorId(idFuncion: number): Promise<Funcion | null> {
        const { data, error } = await this.supabase
            .from('funciones')
            .select('*')
            .eq('id_funcion', idFuncion)
            .single();

        if (error) {
            console.error('Error al obtener la función:', error.message);
            return null;
        }
        return data;
    }
}