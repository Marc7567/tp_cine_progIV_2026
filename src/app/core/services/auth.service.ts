import { Injectable, inject, signal } from '@angular/core';
import { Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Usuario } from '../models/usuario.interface';

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    private supabase = inject(SupabaseService).client;

    currentUser = signal<User | null>(null);
    currentSession = signal<Session | null>(null);
    currentUserData = signal<Usuario | null>(null);

    constructor() {
        this.iniciarAuthSession();
    }

    // Inicializa la sesión y escucha cambios (login, logout, token refresh)
    private iniciarAuthSession(): void {
        this.supabase.auth.getSession().then(({ data: { session } }) => {
            this.currentSession.set(session);
            this.currentUser.set(session?.user ?? null);

            if (session?.user) {
                this.cargarDatosUsuario(session.user.id);
            }
        });
        
        // Escuchar cambios de estado en la autenticación
        this.supabase.auth.onAuthStateChange((_event, session) => {
            this.currentSession.set(session);
            this.currentUser.set(session?.user ?? null);

            if (session?.user) {
                this.cargarDatosUsuario(session.user.id);
            } else {
                this.currentUserData.set(null);
            }
        });
    }
    
    // Cargar los datos del usuario desde la tabla 'usuarios'
    async cargarDatosUsuario(userId: string): Promise<Usuario | null> {
        const { data, error } = await this.supabase
            .from('usuarios')
            .select('*')
            .eq('id_usuario', userId)
            .single();

        if (error || !data) {
            this.currentUserData.set(null);
            return null;
        }

        const usuario = data as Usuario;

        this.currentUserData.set(usuario);

        return usuario;
    }
    
    // Registrar un nuevo usuario (retorna una promesa con la respuesta de Supabase)
    async signUp(nombre: string, apellido: string, fechaNacimiento: string, email: string, password: string) {
        return this.supabase.auth.signUp({
            options: {data: {nombre, apellido, fecha_nacimiento: fechaNacimiento}},
            password,
            email
        });
    }
    
    // Iniciar sesión
    async signIn(email: string, password: string) {
        const resultado = await this.supabase.auth.signInWithPassword({email, password});

        if (resultado.error || !resultado.data.user) {
            return resultado;
        }

        await this.cargarDatosUsuario(resultado.data.user.id);

        return resultado;
    }
    
    // Cerrar sesión
    async signOut() {
        return this.supabase.auth.signOut();
    }
}