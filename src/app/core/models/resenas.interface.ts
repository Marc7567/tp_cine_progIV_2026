export interface Resena {
    id_resena: number;
    id_usuario: string;
    id_pelicula: number;
    estrellas: number;
    comentario: string;
    fecha: string;
    usuario?: {
        nombre: string;
        apellido: string;
    };
}