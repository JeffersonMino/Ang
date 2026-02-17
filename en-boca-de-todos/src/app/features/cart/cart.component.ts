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
    console.log('Pedido confirmado:', data);

    // Vaciar carrito al confirmar
    this.orderService.clearCart();

    this.showDeliveryModal = false;
  }

  updateDatosFactura() {
    this.orderService.setDatosFactura(this.datosFactura);
  }

}