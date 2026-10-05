export interface pelicula {
  id_pelicula: number;
  titulo: string;
  imagen: string | null;
  sinopsis: string | null;
  duracion_minutos: number;
  fecha_estreno: string;
  edad_minima: number;
  disponible_principal: boolean;
  activa: boolean;
  generos: string[];
}

export interface PeliculaMasVendida {
  id_pelicula: number;
  cantidad_vendida: number;
}