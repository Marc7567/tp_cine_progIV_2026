import { Injectable, inject, signal } from '@angular/core';
import { PeliculaService } from './pelicula.service';
import { PreventaService } from './preventa.service';
import { pelicula } from '../models/pelicula.interface';

interface AlertaVenta {
  id_pelicula: number;
  creada_en: string;
  notificada: boolean;
}

@Injectable({
  providedIn: 'root',
})

export class AlertaVentaService {
  private readonly storageKey = 'Cine-alertas-venta';
  private readonly intervaloMs = 30_000;
  private peliculaService = inject(PeliculaService);
  private preventaService = inject(PreventaService);

  alertas = signal<AlertaVenta[]>(this.cargarDesdeStorage());

  constructor() {
    void this.revisarAlertas();

    if (typeof window !== 'undefined') {
      window.setInterval(() => void this.revisarAlertas(), this.intervaloMs);
    }
  }

  tieneAlerta(idPelicula: number): boolean {
    return this.alertas().some((alerta) => alerta.id_pelicula === idPelicula && !alerta.notificada);
  }

  async activar(peliculaActual: pelicula): Promise<{ ok: boolean; mensaje: string }> {
    if (this.tieneAlerta(peliculaActual.id_pelicula)) {
      return { ok: true, mensaje: 'La alerta ya está activada para esta película.' };
    }

    if (typeof window === 'undefined' || !('Notification' in window)) {
      return {
        ok: false,
        mensaje: 'Este navegador no permite notificaciones.',
      };
    }

    let permiso = Notification.permission;

    if (permiso === 'default') {
      permiso = await Notification.requestPermission();
    }

    if (permiso !== 'granted') {
      return {
        ok: false,
        mensaje:
          'Las notificaciones están bloqueadas. Podés habilitarlas desde la configuración del navegador.',
      };
    }

    const nuevasAlertas = [
      ...this.alertas().filter((alerta) => alerta.id_pelicula !== peliculaActual.id_pelicula),
      {
        id_pelicula: peliculaActual.id_pelicula,
        creada_en: new Date().toISOString(),
        notificada: false,
      },
    ];

    this.guardar(nuevasAlertas);

    const disponible = await this.preventaService.hayVentaDisponible(peliculaActual.id_pelicula);

    if (disponible) {
      await this.notificar(peliculaActual);
      this.marcarNotificada(peliculaActual.id_pelicula);
      return { ok: true, mensaje: 'Las entradas ya están disponibles.' };
    }

    return {
      ok: true,
      mensaje: 'Alerta activada. Te avisaremos cuando las entradas estén disponibles.',
    };
  }

  private cargarDesdeStorage(): AlertaVenta[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const guardadas = localStorage.getItem(this.storageKey);
      return guardadas ? (JSON.parse(guardadas) as AlertaVenta[]) : [];
    } catch {
      return [];
    }
  }

  private guardar(alertas: AlertaVenta[]): void {
    this.alertas.set(alertas);

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(alertas));
    }
  }

  private marcarNotificada(idPelicula: number): void {
    this.guardar(
      this.alertas().map((alerta) =>
        alerta.id_pelicula === idPelicula ? { ...alerta, notificada: true } : alerta,
      ),
    );
  }

  private async revisarAlertas(): Promise<void> {
    const pendientes = this.alertas().filter((alerta) => !alerta.notificada);

    for (const alerta of pendientes) {
      const peliculaActual = this.peliculaService
        .peliculas()
        .find((pelicula) => pelicula.id_pelicula === alerta.id_pelicula);

      if (!peliculaActual) {
        continue;
      }

      const disponible = await this.preventaService.hayVentaDisponible(alerta.id_pelicula);

      if (disponible) {
        await this.notificar(peliculaActual);
        this.marcarNotificada(alerta.id_pelicula);
      }
    }
  }

  private async notificar(peliculaActual: pelicula): Promise<void> {
    if (typeof window === 'undefined' || Notification.permission !== 'granted') {
      return;
    }

    new Notification('Entradas disponibles', {
      body: `Ya podes comprar entradas para ${peliculaActual.titulo}.`,
      ...(peliculaActual.imagen? { icon: peliculaActual.imagen }: {})
    });
  }
}
