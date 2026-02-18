import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { OrderService } from '../../core/services/order.service';
import { DeliveryModalComponent } from '../checkout/delivery-modal/delivery-modal.component';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, DeliveryModalComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {

  items$!: Observable<{ product: Product; quantity: number }[]>;

  comprobante: 'factura' | 'nota' | null = null;
  
  datosFactura: any = {
    ruc: '',
    razonSocial: '',
    direccionFiscal: '',
    correo: '',
    telefono: ''
  };
  
  procesando = false;
  pedidoConfirmado = false;
  cart: { product: Product; quantity: number }[] = [];

  subtotal = 0;
  tax = 0;
  total = 0;

  showDeliveryModal = false;

  constructor(private orderService: OrderService) {

    this.items$ = this.orderService.items$;

    this.items$.subscribe(items => {
      this.cart = items;
      this.subtotal = this.orderService.getSubtotal();
      this.tax = this.subtotal * 0.15;
      this.total = this.subtotal + this.tax;
    });

    const datos = this.orderService.getDatosFactura();
    if (datos) {
      this.datosFactura = datos;
    }
  }

  remove(id: string) {
    this.orderService.removeProduct(id);
  }

  openDeliveryModal() {
    this.showDeliveryModal = true;
  }

  closeDeliveryModal() {
    this.showDeliveryModal = false;
  }

  seleccionarComprobante(tipo: 'factura' | 'nota') {
    this.comprobante = tipo;
    this.orderService.setComprobante(tipo);

    if (tipo !== 'factura') {
      this.orderService.clearDatosFactura();
    }
  }

  confirmarDelivery(data: any) {
       
    this.procesando = true;

    setTimeout(() => {
      this.procesando = false;
      this.pedidoConfirmado = true;

      this.orderService.clearCart();
      this.showDeliveryModal = false;

      setTimeout(() => {
        this.pedidoConfirmado = false;
      }, 3000);

    }, 2000);

     // Vaciar carrito al confirmar
    this.orderService.clearCart();

    this.showDeliveryModal = false;


  }

  updateDatosFactura() {
    this.orderService.setDatosFactura(this.datosFactura);
  }

  get carritoVacio(): boolean {
    return this.cart.length === 0;
  }

   // aqui va el proceo para en envio de whatsapp, pero lo dejare para el final
  enviarWhatsApp() {

    if (this.carritoVacio) return;

  const telefonoNegocio = '+5493772655931'; // 🔥 CAMBIA POR TU NÚMERO

  const ticket = this.generarNumeroTicket();
  const fecha = new Date().toLocaleString();

  let mensaje = `🎟 *Ticket:* ${ticket}%0A`;
  mensaje += `🕒 ${fecha}%0A%0A`;

  mensaje += '🍽️ *Detalle del Pedido*%0A%0A';

  this.cart.forEach(item => {
    mensaje += `• ${item.product.name} x${item.quantity} - $${item.product.price * item.quantity}%0A`;
  });

  mensaje += `%0A`;
  mensaje += `Subtotal: $${this.subtotal}%0A`;
  mensaje += `IVA (15%): $${this.tax}%0A`;
  mensaje += `*Total: $${this.total}*%0A%0A`;

  // Comprobante
  if (this.comprobante) {
    mensaje += `🧾 Comprobante: ${this.comprobante}%0A`;
  }

  // Datos factura
  if (this.comprobante === 'factura' && this.datosFactura) {
    mensaje += `%0A📋 *Datos de Factura*%0A`;
    mensaje += `RUC: ${this.datosFactura.ruc}%0A`;
    mensaje += `Razón Social: ${this.datosFactura.razonSocial}%0A`;
    mensaje += `Dirección Fiscal: ${this.datosFactura.direccionFiscal}%0A`;
    mensaje += `Correo: ${this.datosFactura.correo}%0A`;
    mensaje += `Teléfono: ${this.datosFactura.telefono}%0A%0A`;
  }

  mensaje += `🙏 Gracias por su pedido.`;

  const url = `https://wa.me/${telefonoNegocio}?text=${mensaje}`;

  window.open(url, '_blank');
  }

  generarNumeroTicket(): string {
  const fecha = new Date();

  const año = fecha.getFullYear().toString().slice(-2);
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dia = fecha.getDate().toString().padStart(2, '0');

  const random = Math.floor(Math.random() * 900 + 100); // 3 dígitos

  return `TK-${año}${mes}${dia}-${random}`;
}

}