import { Component, AfterViewInit, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../models/product.model';
import { OrderService } from '../../../core/services/order.service';

declare var google: any;

@Component({
  selector: 'app-delivery-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery-modal.component.html',
  styleUrls: ['./delivery-modal.component.scss']
})
export class DeliveryModalComponent implements AfterViewInit, OnInit {

  @Input() items: { product: Product; quantity: number }[] = [];
  @Input() total: number = 0;

  @Output() closeModal = new EventEmitter<void>();

  comprobanteSeleccionado: 'factura' | 'nota' | null = null;

  map: any;
  marker: any;

  direccionSeleccionada = '';
  correo = '';
  telefono = '';
  datosFactura: any = {
    ruc: '',
    razonSocial: '',
    direccionFiscal: '',
    correo: '',
    telefono: ''
  };
  constructor(private orderService: OrderService) {
    const datos = this.orderService.getDatosFactura();

    if (datos) {
      this.datosFactura = datos;
    }

    this.comprobanteSeleccionado = this.orderService.getComprobante();
  }

   
  
  ngOnInit() {
    this.comprobanteSeleccionado = this.orderService.getComprobante();
    this.comprobanteSeleccionado = this.orderService.getComprobante();
  }

  ngAfterViewInit(): void {
    const checkGoogle = setInterval(() => {
      if (typeof google !== 'undefined') {
        clearInterval(checkGoogle);
        this.initMap();
      }
    }, 200);
  }

  initMap() {
    const defaultLocation = { lat: -0.1807, lng: -78.4678 };

    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
        center: defaultLocation,
        zoom: 15
      }
    );

    this.marker = new google.maps.Marker({
      position: defaultLocation,
      map: this.map,
      draggable: true
    });

    this.obtenerDireccion(defaultLocation);

    this.marker.addListener('dragend', () => {
      const position = this.marker.getPosition();
      const coords = {
        lat: position.lat(),
        lng: position.lng()
      };
      this.obtenerDireccion(coords);
    });
  }

  obtenerDireccion(coords: any) {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ location: coords }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        this.direccionSeleccionada = results[0].formatted_address;
      }
    });
  }

  confirmarPedido() {

    if (!this.direccionSeleccionada || !this.correo || !this.telefono) {
      alert('Completa todos los campos');
      return;
    }

    console.log('Pedido confirmado', {
      productos: this.items,
      total: this.total,
      comprobante: this.comprobanteSeleccionado,
      direccion: this.direccionSeleccionada,
      correo: this.correo,
      telefono: this.telefono
    });

    const telefonoNegocio = '593999999999'; // 🔥 TU NÚMERO

      const ticket = this.generarTicket();
      const fecha = new Date().toLocaleString();

      let mensaje = `🎟 *Ticket:* ${ticket}%0A`;
      mensaje += `🕒 ${fecha}%0A%0A`;

      mensaje += '🍽️ *Pedido*%0A%0A';

      // 🛒 Productos
      this.items.forEach(item => {
        mensaje += `• ${item.product.name} x${item.quantity} - $${item.product.price * item.quantity}%0A`;
      });

      mensaje += `%0A💰 *Total:* $${this.total}%0A%0A`;

      // 🧾 Comprobante
      const comprobante = this.orderService.getComprobante();

      if (comprobante) {
        mensaje += `🧾 Comprobante: ${comprobante}%0A`;
      }

      // 🏢 Factura
      const datosFactura = this.orderService.getDatosFactura();

      if (comprobante === 'factura' && datosFactura) {
        mensaje += `%0A📋 *Datos de Factura*%0A`;
        mensaje += `RUC: ${datosFactura.ruc}%0A`;
        mensaje += `Razón Social: ${datosFactura.razonSocial}%0A`;
        mensaje += `Dirección Fiscal: ${datosFactura.direccionFiscal}%0A`;
        mensaje += `Correo: ${datosFactura.correo}%0A`;
        mensaje += `Teléfono: ${datosFactura.telefono}%0A`;
      }

      // 📍 DELIVERY
      mensaje += `%0A📍 *Entrega*%0A`;
      mensaje += `Dirección: ${this.direccionSeleccionada}%0A`;
      mensaje += `Correo: ${this.correo}%0A`;
      mensaje += `Teléfono: ${this.telefono}%0A%0A`;

      mensaje += `🙏 Gracias por su pedido`;

      const url = `https://wa.me/${telefonoNegocio}?text=${mensaje}`;

      window.open(url, '_blank');

      // 🔥 Limpieza total
      this.orderService.clearCart();
      this.orderService.clearDatosFactura();

      this.resetForm();
      this.closeModal.emit();
  }

  cerrar() {
    this.resetForm();
    this.closeModal.emit();
  }

  
  private resetForm() {
    this.direccionSeleccionada = '';
    this.correo = '';
    this.telefono = '';
  }

  updateDatosFactura() {
    this.orderService.setDatosFactura(this.datosFactura);
  }

  generarTicket(): string {
    const fecha = new Date();

    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');

    const random = Math.floor(Math.random() * 900 + 100);

    return `TK-${año}${mes}${dia}-${random}`;
  }
}