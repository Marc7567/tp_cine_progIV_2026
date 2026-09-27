export interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  imagen: string;
  stock: number;
  activo: boolean;
}