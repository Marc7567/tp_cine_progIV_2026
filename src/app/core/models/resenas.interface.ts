export interface Resena {
    id_resena: number;
    id_usuario: string | null;
    id_pelicula: number;
    estrellas: number;
    comentario: string | null;
    fecha: string;
    nombre_publico: string | null;

    usuario?: {
        nombre: string;
        apellido: string;
    } | null;
}