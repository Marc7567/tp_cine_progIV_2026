export interface Preventa {
    id_preventa: number;
    id_pelicula: number;
    fecha_inicio: string;
    fecha_fin: string;
    precio_especial: number;
    habilitada: boolean;
}

export type EstadoVenta = 'no-disponible' | 'preventa' | 'normal';