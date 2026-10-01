import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { CanjePerfil, Perfil, PeliculaVista } from '../../core/models/perfil.interface';
import { PerfilService } from '../../core/services/perfil.service';
import { DatePipe } from '@angular/common';


@Component({
  imports: [ReactiveFormsModule, DatePipe],
  standalone: true,
  selector: 'app-perfil-usu',
  styleUrl: './perfil-usu.css',
  templateUrl: './perfil-usu.html',
})

export class PerfilUsu implements OnInit {
  private fb = inject(FormBuilder);
  private perfilService = inject(PerfilService);
  private router = inject(Router);

  perfil = signal<Perfil | null>(null);
  canjes = signal<CanjePerfil[]>([]);
  peliculasVistas = signal<PeliculaVista[]>([]);

  cargando = signal(true);
  guardando = signal(false);

  mensaje = signal('');
  error = signal('');

  modoEdicion = signal(false);

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

  perfilForm = this.fb.group({
    nombre: ['', [
      Validators.required, 
      Validators.minLength(2)
    ]],
    apellido: ['', [
      Validators.required, 
      Validators.minLength(2)
    ]],
    fechaNacimiento: ['', [
      Validators.required,
      this.validarFechaNacimiento
    ]]
  });

  formatearFecha(event: Event): void {
    const input = event.target as HTMLInputElement;
    let numeros = input.value.replace(/\D/g, '');

    // Máximo: dd/mm/yyyy
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
    this.perfilForm.get('fechaNacimiento')?.setValue(resultado, { emitEvent: true });
  }

  async ngOnInit(): Promise<void> {
    await this.cargarPerfil();
  }

  async cargarPerfil(): Promise<void> {
    this.cargando.set(true);
    this.error.set('');

    try {
      const perfil = await this.perfilService.obtenerPerfil();

      if (!perfil) {
        this.error.set('No se pudo obtener la información del perfil.');
        return;
      }

      this.perfil.set(perfil);

      this.perfilForm.patchValue({
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        fechaNacimiento: this.convertirFechaParaMostrar(perfil.fecha_nacimiento)
      });

      const [canjes, peliculas] = await Promise.all([
        this.perfilService.obtenerCanjes(),
        this.perfilService.obtenerPeliculasVistas()
      ]);

      this.canjes.set(canjes);
      this.peliculasVistas.set(peliculas);
    } catch (error) {
      this.error.set('No se pudo cargar el perfil.');

    } finally {
      this.cargando.set(false);
    }
  }

  private convertirFechaParaMostrar(fecha: string): string {
    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
  }

  convertirFechaParaBD(fecha: string): string {
    const [dia, mes, anio] = fecha.split('/');

    return `${anio}-${mes}-${dia}`;
  }

  EditarPerfil(): void {
    this.mensaje.set('');
    this.error.set('');
    this.modoEdicion.set(true);
  }

  cancelarEdicion(): void {
    const perfil = this.perfil();

    if (!perfil) {
      return;
    }

    this.perfilForm.patchValue({
      nombre: perfil.nombre,
      apellido: perfil.apellido,
      fechaNacimiento: this.convertirFechaParaMostrar(perfil.fecha_nacimiento)
    });

    this.mensaje.set('');
    this.error.set('');
    this.modoEdicion.set(false);
  }

  async guardarCambios(): Promise<void> {
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    if (this.guardando()) {
      return;
    }

    this.guardando.set(true);
    this.mensaje.set('');
    this.error.set('');

    const { nombre, apellido, fechaNacimiento } = this.perfilForm.getRawValue();

    try {
      const fechaNacimientoBD = this.convertirFechaParaBD(fechaNacimiento!);

      const perfilActualizado = await this.perfilService.actualizarPerfil(nombre!, apellido!, fechaNacimientoBD);

      if (!perfilActualizado) {
        this.error.set('No se pudieron guardar los cambios.');
        return;
      }

      this.perfil.set(perfilActualizado);

      this.perfilForm.patchValue({
        nombre: perfilActualizado.nombre,
        apellido: perfilActualizado.apellido,
        fechaNacimiento: this.convertirFechaParaMostrar(perfilActualizado.fecha_nacimiento)
      });

      this.modoEdicion.set(false);
      this.mensaje.set('Los datos se actualizaron correctamente.');

    } catch (error) {
      this.error.set('No se pudieron guardar los cambios.');

    } finally {
      this.guardando.set(false);
    }
  }

  volverHome(): void {
    this.router.navigate(['/home']);
  }
}