export interface CanjePerfil {
    id_canje: number;
    puntos_utilizados: number;
    fecha: string;
    estado: string;

    recompensa: {
        id_recompensa: number;
        nombre: string;
        descripcion: string | null;
        tipo: string;
        valor: number | null;
        costo_puntos: number;
        activa: boolean;
    };
}

export interface PeliculaVista {
    id_entrada: number;
    fecha_uso: string | null;
    fecha_funcion: string;
    hora_inicio: string;
    titulo: string;
    imagen: string | null;
    estrellas: number | null;
    comentario: string | null;
}
