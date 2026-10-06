import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmpleadoService } from '../../../core/services/empleado.service';
import { DatePipe } from '@angular/common';

@Component({
  imports: [ReactiveFormsModule, DatePipe],
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
    this.mensaje.set('');
    this.compra.set(null);

    try {
        const compra = await this.empleadoService.obtenerCompraPorCodigo(codigo);

        if (!compra) {
            this.error.set('No se encontro una compra con ese codigo');
            return;
        }

        if (compra.codigo_usu) {
            this.error.set('Esta compra ya fue utilizada');
            return;
        }

        this.compra.set(compra);
    } catch (error) {
        console.error(error);
        this.error.set('No se pudo validar la compra');
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
      this.error.set('Esta compra ya fue utilizada');
      return;
    }

    this.cargando.set(true);
    this.error.set('');
    this.mensaje.set('');

    try {
      const confirmada = await this.empleadoService.CompraUtilizada(compraActual.id_compra);

      if (!confirmada) {
        this.error.set('No se pudo confirmar la compra');
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

      this.mensaje.set('Compra confirmada');
    } catch (error) {
      this.error.set('No se pudo confirmar la compra');
    } finally {
      this.cargando.set(false);
    }
  }

  async reclamarCanje(canje: any): Promise<void> {
    if (!canje || canje.reclamado || this.cargando()) {
      return;
    }

    this.cargando.set(true);
    this.error.set('');
    this.mensaje.set('');

    try {
      const reclamado = await this.empleadoService.ReclamarCanjes(canje.id_canje);

      if (!reclamado) {
        this.error.set('No se pudo reclamar su recompensa');
        return;
      }

      this.compra.update(compra => {
        if (!compra?.usuarios?.canjes) {
          return compra;
        }

        return {
          ...compra,
          usuarios: {
            ...compra.usuarios,
            canjes: compra.usuarios.canjes.map((item: any) =>
              item.id_canje === canje.id_canje ? { ...item, reclamado: true } : item
            )
          }
        };
      });

      this.mensaje.set('Recompensa reclamada');

    } catch (error) {
      this.error.set('No se pudo reclamar su recompensa');
    
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
