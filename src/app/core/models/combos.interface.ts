export interface Combo {
  id_combo: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad_entradas: number;
  imagen: string;
  activo: boolean;
}

export interface ComboProducto {
  id_combo: number;
  id_producto: number;
  cantidad: number;
}