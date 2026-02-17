import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../models/product.model';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {

 @Input() product!: Product;

  added = false;

  constructor(private orderService: OrderService) {}

  add() {
    this.orderService.addProduct(this.product);

    this.added = true;
    setTimeout(() => this.added = false, 500);
  }
}

