export interface Butaca {
  id_butaca: number;
  id_sala: number;
  fila: string;
  columna: number;
  tipo: string;
  precio_extra: number;
}

// interface que nos dice si una butaca esta ocupada
// para una funcion
export interface ButacaDisponibilidad extends Butaca { 
    ocupada: boolean; 
}