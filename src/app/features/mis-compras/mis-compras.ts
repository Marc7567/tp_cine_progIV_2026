import { Component, OnInit, inject, signal } from '@angular/core';
import { PerfilService } from '../../core/services/perfil.service';

@Component({
  imports: [],
  standalone: true,
  selector: 'app-mis-compras',
  styleUrl: './mis-compras.css',
  templateUrl: './mis-compras.html',
})
export class MisCompras implements OnInit {
  private perfilService = inject(PerfilService);

  compras = signal<any[]>([]);
  cargando = signal(true);
  error = signal('');
  cancelando = signal<number | null>(null);
  mensaje = signal('');

  async ngOnInit() {
    await this.cargarCompras();
  }

  async cargarCompras() {
    this.cargando.set(true);
    this.error.set('');

    try {
      const compras = await this.perfilService.obtenerMisCompras();
      this.compras.set(compras);

    } catch (error) {
      this.error.set('No se pudieron cargar tus compras.');
    
    } finally {
      this.cargando.set(false);
    }
  }

  async cancelarCompra(idCompra: number) {
    if (this.cancelando() !== null) {
      return;
    }

    this.cancelando.set(idCompra);
    this.mensaje.set('');
    this.error.set('');

    try {
      const resultado = await this.perfilService.cancelarCompra(idCompra);

      if (!resultado.exito) {
        this.error.set(resultado.mensaje);
        return;
      }

      this.mensaje.set(`Compra cancelada correctamente. Credito Agregados: $${resultado.creditoGenerado}.`,);
      await this.cargarCompras();

    } catch (error) {
      this.error.set('No se pudo cancelar la compra.');

    } finally {
      this.cancelando.set(null);
    }
  }
}