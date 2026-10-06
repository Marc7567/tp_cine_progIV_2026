import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmpleadoService } from '../../../core/services/empleado.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-validar-entrada',
  styleUrl: './validar-entrada.css',
  templateUrl: './validar-entrada.html',
})

export class ValidarEntrada {
  private fb = inject(FormBuilder);
  private empleadoService = inject(EmpleadoService);
  modoValidacion = signal<'seleccionar' | 'codigo' | 'escaner'>('seleccionar');

  compra = signal<any | null>(null);
  error = signal('');
  mensaje = signal('');
  cargando = signal(false);

  codigoForm = this.fb.group({
    codigo: ['', [Validators.required]],
  });

  async validarCodigo(): Promise<void> {
      if (this.codigoForm.invalid || this.cargando()) {
        this.codigoForm.markAllAsTouched();
        return;
      }

      const codigo = this.codigoForm.getRawValue().codigo?.trim();

      if (!codigo) {
        return;
      }

      await this.validarCompra(codigo);
  }

  private async validarCompra(codigo: string): Promise<void> {
    this.cargando.set(true);
    this.error.set('');
    this.compra.set(null);

    try {
        const compra = await this.empleadoService.obtenerCompraPorCodigo(codigo);

        if (!compra) {
            this.error.set('No se encontro una compra valida con ese codigo');
            return;
        }

        if (compra.codigo_usu) {
            this.error.set('Esta operacion ya fue utilizada');
            return;
        }

        this.compra.set(compra);
    } catch (error) {
        console.error(error);
        this.error.set('No se pudo validar la operacion');
    } finally {
        this.cargando.set(false);
    }
  }

  async confirmarOperacion(): Promise<void> {
    const compraActual = this.compra();

    if (!compraActual || this.cargando()) {
      return;
    }

    if (compraActual.codigo_usu) {
      this.error.set('Esta operacion ya fue utilizada');
      return;
    }

    this.cargando.set(true);
    this.error.set('');
    this.mensaje.set('');

    try {
      const confirmada = await this.empleadoService.CompraUtilizada(
        compraActual.id_compra
      );

      if (!confirmada) {
        this.error.set('No se pudo confirmar la operacion');
        return;
      }

      this.compra.update(compra => {
        if (!compra) {
          return compra;
        }

        return {
          ...compra,
          codigo_usu: true,
          entradas: compra.entradas?.map((entrada: any) => ({
            ...entrada,
            utilizada: true,
            fecha_uso: new Date().toISOString()
          }))
        };
      });

      this.mensaje.set('Operacion confirmada correctamente');
    } catch (error) {
      this.error.set('No se pudo confirmar la operacion');
    } finally {
      this.cargando.set(false);
    }
  }

    volverSeleccion(): void {
    this.modoValidacion.set('seleccionar');
    this.error.set('');
    this.compra.set(null);
    this.mensaje.set('');
    this.codigoForm.reset();
  }

  mostrarCodigo(): void {
    this.modoValidacion.set('codigo');
    this.error.set('');
    this.mensaje.set('');
    this.compra.set(null);
  }

  async iniciarEscaneo(): Promise<void> {
    this.modoValidacion.set('escaner');
  }
}
