import { EstadoVenta } from './preventa.interface';

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
  activa: boolean;

  // Datos calculados para la venta
  precio_venta?: number;
  estado_venta?: EstadoVenta;
  puede_comprar?: boolean;
}