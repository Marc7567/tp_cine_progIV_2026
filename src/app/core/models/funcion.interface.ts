export interface Funcion {
  id_funcion: number;
  id_pelicula: number;
  id_sala: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  modalidad: string;
  idioma: string;
  precio_base: number;
  precio_preventa: number;
  activa: boolean;

  // Datos calculados para la venta
  precio_venta?: number;
  estado_venta?: EstadoVenta;
  puede_comprar?: boolean;
}

export type EstadoVenta = 'no-disponible' | 'preventa' | 'normal';