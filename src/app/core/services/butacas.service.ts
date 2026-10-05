import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { RealtimeChannel } from '@supabase/supabase-js';
import { ButacaDisponibilidad } from '../models/butaca.interface';

@Injectable({
  providedIn: 'root',
})

export class ButacasService {
    private supabase = inject(SupabaseService).client;
    private butacasSignal = signal<ButacaDisponibilidad[]>([]);
    private canalRealtime: RealtimeChannel | null = null;

    cargando = signal(false);
    butacas = this.butacasSignal.asReadonly();

    async cargarButacasPorFuncion(idFuncion: number, idSala: number): Promise<void> {
        this.cargando.set(true);

        const { data: butacas, error: errorButacas } =
            await this.supabase
                .from('butacas')
                .select('*')
                .eq('id_sala', idSala)
                .order('fila', { ascending: true })
                .order('columna', { ascending: true });

        if (errorButacas) {
            this.butacasSignal.set([]);
            this.cargando.set(false);
            return;
        }

        const { data: butacasOcupadas, error: errorOcupadas } = await this.supabase.rpc('obtener_butacas_ocupadas', {id_funcion_param: idFuncion});

        if (errorOcupadas) {
            this.butacasSignal.set([]);
            this.cargando.set(false);
            return;
        }

        const idsButacasOcupadas = new Set(
            (butacasOcupadas || []).map((butacaOcupada: { id_butaca: number }) => butacaOcupada.id_butaca)
        );

        const butacasConDisponibilidad: ButacaDisponibilidad[] =
            (butacas || []).map((butaca) => ({
                ...butaca,
                ocupada: idsButacasOcupadas.has(butaca.id_butaca),
            }));

        this.butacasSignal.set(butacasConDisponibilidad);
        this.cargando.set(false);
    }

    ActualizacionRealTime(idFuncion: number, idSala: number): void {
        this.detenerActualizacionRealTime();

        this.canalRealtime = this.supabase
            .channel(`butacas-funcion-${idFuncion}`)
            .on('postgres_changes', {event: 'INSERT', schema: 'public', table: 'entradas', filter: `id_funcion=eq.${idFuncion}`},
                () => {void this.cargarButacasPorFuncion(idFuncion, idSala)})
            .subscribe((status) => {
                if (status === 'CHANNEL_ERROR') {
                    console.error('Error: No se pudo conectar con tiempo real.');
                }
                if (status === 'TIMED_OUT') {
                    console.error('Error: La conexión con tiempo real ha expirado. Se intentará reconectar automáticamente.');
                }
            }
        );
    }

    detenerActualizacionRealTime(): void {
        if (!this.canalRealtime) {
            return;
        }

        void this.supabase.removeChannel(this.canalRealtime);
        this.canalRealtime = null;
    }
}