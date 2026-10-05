export interface Usuario {
    id_usuario: string;
    nombre: string;
    apellido: string;
    fecha_nacimiento: string;
    email: string;
    rol: 'cliente' | 'empleado' | 'administrador';
    credito: number;
    puntos: number;
    primera_compra: boolean;
    creado_en: string;
}