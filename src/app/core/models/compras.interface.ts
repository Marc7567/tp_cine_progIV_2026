export interface ProductoComprado {
  producto: any;
  cantidad: number;
}

export interface ComboComprado {
  combo: any;
  cantidad: number;
}

export interface CompraActual {
  funcion: any;
  pelicula: any;
  butaca: any;

  comprador: {
    nombre: string;
    apellido: string;
    dni: string;
    email: string;
  };

  productos: ProductoComprado[];
  combos: ComboComprado[];
  totalCandyBar: number;
  totalCompra: number;
  codigoCompra: string;
  pagoRealizado: boolean;
}