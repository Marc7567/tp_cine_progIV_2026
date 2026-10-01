import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CanjePerfil, Perfil, PeliculaVista } from '../../core/models/perfil.interface';
import { PerfilService } from '../../core/services/perfil.service';
import { DatePipe } from '@angular/common';

@Component({
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  standalone: true,
  selector: 'app-perfil-usu',
  styleUrl: './perfil-usu.css',
  templateUrl: './perfil-usu.html',
})

export class PerfilComponent implements OnInit {
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

  perfilForm = this.fb.group({
    nombre: ['', [
      Validators.required, 
      Validators.minLength(2)]
    ],
    apellido: ['', [
      Validators.required, 
      Validators.minLength(2)]
    ],
    fechaNacimiento: ['', [
      Validators.required]
    ]
  });

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
        fechaNacimiento: perfil.fecha_nacimiento,
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
      fechaNacimiento: perfil.fecha_nacimiento
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
      return
    }

    this.guardando.set(true);
    this.mensaje.set('');
    this.error.set('');

    const { nombre, apellido, fechaNacimiento } = this.perfilForm.getRawValue();

    try {
      const perfilActualizado = await this.perfilService.actualizarPerfil(nombre!, apellido!, fechaNacimiento!);

      if (!perfilActualizado) {
        this.error.set('No se pudieron guardar los cambios.');
        return
      }

      this.perfil.set(perfilActualizado);

      this.perfilForm.patchValue({
        nombre: perfilActualizado.nombre,
        apellido: perfilActualizado.apellido,
        fechaNacimiento: perfilActualizado.fecha_nacimiento
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