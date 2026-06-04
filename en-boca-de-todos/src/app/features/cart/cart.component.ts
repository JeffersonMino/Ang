import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  InvoiceData,
  OrderService
} from '../../core/services/order.service';
import { OrderStoreService } from '../../core/services/order-store.service';
import { SiteContentService } from '../../core/services/site-content.service';
import { BillingInfo, DeliveryInfo, Order } from '../../models/order.model';
import { Product } from '../../models/product.model';
import { LocationOption } from '../../models/site-content.model';
import { DeliveryModalComponent } from '../checkout/delivery-modal/delivery-modal.component';

type FeedbackTone = 'success' | 'warning';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, DeliveryModalComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  private readonly destroyRef = inject(DestroyRef);
  items$: Observable<{ product: Product; quantity: number }[]>;
  comprobante: 'factura' | 'nota' | null = null;
  datosFactura: InvoiceData = {
    ruc: '',
    razonSocial: '',
    direccionFiscal: '',
    correo: '',
    telefono: ''
  };
  customer = {
    name: '',
    phone: '',
    email: '',
    notes: ''
  };
  feedbackMessage = '';
  feedbackTone: FeedbackTone = 'success';
  pedidoConfirmado = false;
  cart: { product: Product; quantity: number }[] = [];
  subtotal = 0;
  tax = 0;
  total = 0;
  showDeliveryModal = false;
  selectedLocation: LocationOption | null = null;
  private feedbackTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly orderService: OrderService,
    private readonly orderStore: OrderStoreService,
    private readonly siteContent: SiteContentService
  ) {
    this.items$ = this.orderService.items$;

    this.items$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((items) => {
        this.cart = items;
        this.subtotal = this.orderService.getSubtotal();
        this.tax = this.subtotal * environment.billing.iva;
        this.total = this.subtotal + this.tax;
      });

    const datos = this.orderService.getDatosFactura();
    if (datos) {
      this.datosFactura = datos;
    }

    this.comprobante = this.orderService.getComprobante();

    this.siteContent.selectedLocation$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((location) => {
        this.selectedLocation = location;
      });
  }

  increase(product: Product) {
    this.orderService.addProduct(product);
  }

  decrease(productId: string) {
    this.orderService.decreaseProduct(productId);
  }

  remove(productId: string) {
    this.orderService.removeProduct(productId);
  }

  openDeliveryModal() {
    if (!this.validateCustomerBase()) {
      return;
    }

    if (!this.selectedLocation) {
      this.showFeedback(
        'Selecciona tu direccion en el mapa al final de la pagina antes de pedir delivery.',
        'warning'
      );
      this.scrollToDeliveryMap();
      return;
    }

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
      this.datosFactura = this.orderService.getDatosFactura();
    }
  }

  updateDatosFactura() {
    this.orderService.setDatosFactura(this.datosFactura);
  }

  enviarWhatsApp() {
    if (this.carritoVacio || !this.validateCustomerBase()) {
      return;
    }

    const order = this.orderStore.createOrder({
      items: this.cart,
      subtotal: this.subtotal,
      tax: this.tax,
      total: this.total,
      type: 'pickup',
      source: 'whatsapp',
      customer: this.getCustomerInfo(),
      delivery: this.getOrderLocationSnapshot('pickup'),
      billing: this.getBillingInfo()
    });

    const whatsappUrl = this.orderStore.buildBusinessWhatsAppUrl(order);

    if (environment.whatsapp.phone.trim()) {
      this.orderStore.openWhatsApp(whatsappUrl);
      this.showFeedback(
        `Pedido ${order.sequential} enviado por WhatsApp y registrado en el panel admin.`,
        'success'
      );
    } else {
      this.showFeedback(
        `Pedido ${order.sequential} registrado. Solo falta configurar el telefono de WhatsApp del negocio en environment.`,
        'warning'
      );
    }

    this.finishOrder();
  }

  onDeliveryOrderPlaced(order: Order) {
    this.showDeliveryModal = false;
    this.showFeedback(
      `Pedido ${order.sequential} confirmado. Ya aparece en el panel admin para preparacion y despacho.`,
      'success'
    );
    this.finishOrder();
  }

  get carritoVacio(): boolean {
    return this.cart.length === 0;
  }

  get selectedAddress(): string {
    return this.selectedLocation?.address ?? '';
  }

  get selectedReference(): string {
    if (!this.selectedLocation) {
      return this.customer.notes;
    }

    return [
      this.selectedLocation.name,
      this.selectedLocation.details,
      this.customer.notes
    ]
      .filter(Boolean)
      .join(' | ');
  }

  private validateCustomerBase(): boolean {
    if (!this.customer.name.trim() || !this.customer.phone.trim()) {
      this.showFeedback(
        'Completa nombre y telefono del cliente antes de confirmar el pedido.',
        'warning'
      );
      return false;
    }

    if (this.comprobante === 'factura') {
      const { ruc, razonSocial, direccionFiscal, correo, telefono } =
        this.datosFactura;

      if (![ruc, razonSocial, direccionFiscal, correo, telefono].every(Boolean)) {
        this.showFeedback(
          'Completa los datos de facturacion para emitir la factura.',
          'warning'
        );
        return false;
      }
    }

    return true;
  }

  private getCustomerInfo() {
    return {
      name: this.customer.name.trim(),
      phone: this.customer.phone.trim(),
      email: this.customer.email.trim() || undefined
    };
  }

  private getBillingInfo(): BillingInfo {
    return {
      type: this.comprobante,
      ruc: this.datosFactura.ruc,
      businessName: this.datosFactura.razonSocial,
      fiscalAddress: this.datosFactura.direccionFiscal,
      email: this.datosFactura.correo,
      phone: this.datosFactura.telefono
    };
  }

  private getOrderLocationSnapshot(mode: 'pickup' | 'delivery'): DeliveryInfo | undefined {
    if (!this.selectedLocation && !this.customer.notes.trim()) {
      return undefined;
    }

    return {
      address:
        this.selectedLocation?.address ??
        (mode === 'pickup' ? 'Retiro/local' : 'Direccion por confirmar'),
      notes: this.selectedReference || undefined
    };
  }

  private finishOrder() {
    this.pedidoConfirmado = true;
    this.orderService.clearCart();
    this.orderService.clearDatosFactura();
    this.orderService.setComprobante(null);
    this.comprobante = null;
    this.datosFactura = this.orderService.getDatosFactura();
    this.customer = {
      name: '',
      phone: '',
      email: '',
      notes: ''
    };

    setTimeout(() => {
      this.pedidoConfirmado = false;
    }, 3000);
  }

  private showFeedback(message: string, tone: FeedbackTone) {
    this.feedbackMessage = message;
    this.feedbackTone = tone;

    if (this.feedbackTimeoutId) {
      clearTimeout(this.feedbackTimeoutId);
    }

    this.feedbackTimeoutId = setTimeout(() => {
      this.feedbackMessage = '';
      this.feedbackTimeoutId = null;
    }, 4500);
  }

  private scrollToDeliveryMap() {
    if (typeof document === 'undefined') {
      return;
    }

    document.getElementById('mapa-entrega')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}
