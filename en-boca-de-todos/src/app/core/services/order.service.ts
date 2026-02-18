import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private comprobante: 'factura' | 'nota' | null = null;
  private items: { product: Product; quantity: number }[] = [];
  private datosFactura: any = {
    ruc: '',
    razonSocial: '',
    direccionFiscal: '',
    correo: '',
    telefono: ''
  };
  private itemsSubject = new BehaviorSubject(this.items);
  items$ = this.itemsSubject.asObservable();

  addProduct(product: Product) {

    const existing = this.items.find(i => i.product.id === product.id);

    if (existing) {
      existing.quantity++;
    } else {
      this.items.push({ product, quantity: 1 });
    }

    this.itemsSubject.next(this.items);
  }

  removeProduct(productId: string) {
    this.items = this.items.filter(i => i.product.id !== productId);
    this.itemsSubject.next(this.items);
  }

  getSubtotal(): number {
    return this.items.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    );
  }

  clearCart() {
    this.items = [];
    this.itemsSubject.next(this.items);
  }


  setComprobante(tipo: 'factura' | 'nota' | null) {
    this.comprobante = tipo;
  }

  getComprobante() {
    return this.comprobante;
  }

  setDatosFactura(datos: any) {
    this.datosFactura = { ...this.datosFactura, ...datos };
  }

  getDatosFactura() {
    return this.datosFactura ?? {
      ruc: '',
      razonSocial: '',
      direccionFiscal: '',
      correo: '',
      telefono: ''
    };
  }

  clearDatosFactura() {
    this.datosFactura = {
      ruc: '',
      razonSocial: '',
      direccionFiscal: '',
      correo: '',
      telefono: ''
    };
  }
 
}