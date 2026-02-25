import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PRODUCTS } from '../../models/product.data';
import { ProductCardComponent } from '../products/product-card/product-card.component';
import { CartComponent } from '../cart/cart.component';


@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, CartComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {

  products = PRODUCTS;

}