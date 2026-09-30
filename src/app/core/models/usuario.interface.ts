export interface Usuario {
    id_usuario: string;
    id_rol: number;
    nombre: string;
    apellido: string;
    fecha_nacimiento: string;
    email: string;
    credito: number;
    puntos: number;
    primera_compra_realizada: boolean;
    creado_en: string;
}