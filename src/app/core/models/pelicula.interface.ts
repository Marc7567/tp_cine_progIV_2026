export interface pelicula {
  id_pelicula: number;
  titulo: string;
  imagen: string;
  sinopsis: string;
  duracion_minutos: number;
  fecha_estreno: string;
  edad_minima: number;
  disponible_principal: boolean;
  activa: boolean;
  generos: string[];
}