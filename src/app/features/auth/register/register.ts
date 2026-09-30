import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  standalone: true,
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})

export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm = this.fb.group({
    nombre: ['', [
      Validators.required,
      Validators.minLength(2)
    ]],
    apellido: ['', [
      Validators.required,
      Validators.minLength(2)
    ]],
    fechaNacimiento: ['', [
      Validators.required
    ]],
    email: ['', [
      Validators.required,
      Validators.email
    ]],
    password: ['', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/^[0-9]+$/)
    ]]
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const {nombre, apellido, fechaNacimiento, email, password} = this.registerForm.value;
    
    console.log('Datos registro:', {
      nombre,
      apellido,
      fechaNacimiento,
      email,
      password
    });

    try {
      const { data, error } = await this.authService.signUp(nombre!, apellido!, fechaNacimiento!, email!, password!);

      if (error) {
        throw error;
      }

      // Si Supabase devuelve un usuario sin identidades,
      // significa que el email ya estaba registrado.
      if (data.user?.identities?.length === 0) {
        this.errorMessage.set('Este email ya está registrado.');
      } else if (data.user) {
        this.successMessage.set('¡Registro exitoso! Por favor verifica tu email o inicia sesión');
        this.registerForm.reset();
      }

    } catch (error: any) {
      this.errorMessage.set('Error al registrarse.');
    } finally {
      this.isLoading.set(false);
    }
  }
}