import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  standalone: true,
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [
      Validators.required, 
      Validators.email]
    ],
    password: ['', [
      Validators.required, 
      Validators.minLength(6), 
      Validators.pattern(/^[0-9]+$/)]],
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    try {
      const { error } = await this.authService.signIn(email!, password!);

      if (error) {
        throw error;
      }
      
      // Si el login es exitoso, redirigimos al home
      await this.router.navigate(['/home']);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Error al iniciar sesión.');
      
    } finally {
      this.isLoading.set(false);
    }
  }
}
