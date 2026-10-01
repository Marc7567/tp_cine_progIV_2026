import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
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

  private validarFechaNacimiento: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value?.trim();

    if (!valor) {
      return { required: true };
    }

    if (!/^[0-9/]*$/.test(valor)) {
      return { formatoInvalido: true };
    }

    const partes = valor.split('/');

    if (partes.length > 3) {
      return { formatoInvalido: true };
    }

    const diaTexto = partes[0] ?? '';
    const mesTexto = partes[1] ?? '';
    const anioTexto = partes[2] ?? '';

    // Validamos el día cuando está completo.
    if (diaTexto.length === 2) {
      const dia = Number(diaTexto);

      if (dia < 1 || dia > 31) {
        return { diaInvalido: true };
      }
    }

    // Validamos el mes cuando está completo.
    if (mesTexto.length === 2) {
      const mes = Number(mesTexto);

      if (mes < 1 || mes > 12) {
        return { mesInvalido: true };
      }
    }

    // Validamos la combinación día/mes.
    if (diaTexto.length === 2 && mesTexto.length === 2) {
      const dia = Number(diaTexto);
      const mes = Number(mesTexto);
      const diasDelMes = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

      if (dia > diasDelMes[mes - 1]) {
        return { diaInvalido: true };
      }
    }

    // Validamos el año cuando está completo.
    if (anioTexto.length === 4) {

      const anio = Number(anioTexto);

      if (anio < 1) {
        return { anioInvalido: true };
      }

      // Febrero depende del año.
      if (diaTexto.length === 2 && mesTexto.length === 2 && Number(mesTexto) === 2) {
        const dia = Number(diaTexto);
        const esBisiesto = anio % 4 === 0 && (anio % 100 !== 0 || anio % 400 === 0);
        const maximoFebrero = esBisiesto ? 29 : 28;

        if (dia > maximoFebrero) {
          return { diaInvalido: true };
        }
      }

      // La fecha no puede ser futura.
      if (diaTexto.length === 2 && mesTexto.length === 2) {

        const dia = Number(diaTexto);
        const mes = Number(mesTexto);
        const fecha = new Date(anio, mes - 1, dia);
        const hoy = new Date();

        if (fecha > hoy) {
          return { fechaFutura: true };
        }
      }
    }

    return null;
  };

  registerForm = this.fb.group({
    nombre: ['', [
      Validators.required, 
      Validators.minLength(2)]
    ],
    apellido: ['', [
      Validators.required, 
      Validators.minLength(2)]
    ],
    fechaNacimiento: ['', [
      Validators.required,
      this.validarFechaNacimiento
    ]],
    email: ['', [
      Validators.required, 
      Validators.email
    ]],
    password: ['', [
      Validators.required, 
      Validators.minLength(6), 
      Validators.pattern(/^[0-9]+$/)]
    ],
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  formatearFecha(event: Event): void {
    const input = event.target as HTMLInputElement;
    let numeros = input.value.replace(/\D/g, '');

    // Máximo: DDMMYYYY
    numeros = numeros.slice(0, 8);

    let resultado = '';

    if (numeros.length <= 2) {
      resultado = numeros;
    } else if (numeros.length <= 4) {
      resultado = numeros.slice(0, 2) + '/' + numeros.slice(2);
    } else {
      resultado = numeros.slice(0, 2) + '/' + numeros.slice(2, 4) + '/' + numeros.slice(4);
    }

    input.value = resultado;

    this.registerForm
      .get('fechaNacimiento')
      ?.setValue(resultado, { emitEvent: true });
  }

  private convertirFechaParaBD(fecha: string): string {
    const [dia, mes, anio] = fecha.split('/');
    return `${anio}-${mes}-${dia}`;
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { nombre, apellido, fechaNacimiento, email, password } = this.registerForm.getRawValue();

    try {
      const fechaNacimientoBD = this.convertirFechaParaBD(fechaNacimiento!);

      const { data, error } = await this.authService.signUp(nombre!, apellido!, fechaNacimientoBD, email!, password!);

      if (error) {
        throw error;
      }

      if (data.user?.identities?.length === 0) {
        this.errorMessage.set('Este email ya está registrado.');
      } else if (data.user) {
        this.successMessage.set('¡Registro exitoso! Verifica tu email o inicia sesión');
        this.registerForm.reset();
      }

    } catch (error: any) {
      this.errorMessage.set('Error al registrarse.');
    } finally {
      this.isLoading.set(false);
    }
  }
}