import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { ButacaDisponibilidad } from '../models/butaca.interface';

@Injectable({
  providedIn: 'root',
})

export class ButacasService {
    private supabase = inject(SupabaseService).client;
    private butacasSignal = signal<ButacaDisponibilidad[]>([]);

    cargando = signal(false);
    butacas = this.butacasSignal.asReadonly();

    async cargarButacasPorFuncion(idFuncion: number, idSala: number): Promise<void> {
        this.cargando.set(true);

        // 1. Traemos todas las butacas de la sala
        const { data: butacas, error: errorButacas } = await this.supabase
            .from('butacas')
            .select('*')
            .eq('id_sala', idSala)
            .order('fila', { ascending: true })
            .order('columna', { ascending: true });

        if (errorButacas) {
            console.error('Error al cargar las butacas:', errorButacas.message);
            this.butacasSignal.set([]);
            this.cargando.set(false);
            return;
        }

        // 2- Traemos las butacas ocupadas de esa función
        const { data: butacasOcupadas, error: errorOcupadas } = await this.supabase.rpc(
            'obtener_butacas_ocupadas', { id_funcion_param: idFuncion,},
        );

        if (errorOcupadas) {
            console.error('Error al cargar las butacas ocupadas:', errorOcupadas.message);
            this.butacasSignal.set([]);
            this.cargando.set(false);
            return;
        }

        // 3- Obtenemos los IDs de las butacas ocupadas
        const idsButacasOcupadas = new Set(
            (butacasOcupadas || []).map(
                (butacaOcupada: { id_butaca: number }) => butacaOcupada.id_butaca,
            ),
        );

        // 4- Combinamos la informacion 
        const butacasConDisponibilidad: ButacaDisponibilidad[] = (butacas || []).map((butaca) => ({
            ...butaca,
            ocupada: idsButacasOcupadas.has(butaca.id_butaca),
        }));

        this.butacasSignal.set(butacasConDisponibilidad);
        this.cargando.set(false);
    }
}
