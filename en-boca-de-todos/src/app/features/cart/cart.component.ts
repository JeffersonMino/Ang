import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../core/services/order.service';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {

  items$: typeof this.orderService.items$;

  subtotal = 0;
  tax = 0;
  total = 0;

  constructor(private orderService: OrderService) {
    this.items$ = this.orderService.items$;
    this.items$.subscribe(items => {
      this.subtotal = this.orderService.getSubtotal();
      this.tax = this.subtotal * 0.15;
      this.total = this.subtotal + this.tax;
    });
  }

  remove(id: string) {
    this.orderService.removeProduct(id);
  }
}