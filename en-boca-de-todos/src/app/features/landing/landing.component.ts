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
  categories: string[] = [];
  groupedProducts: any = {};
  activeCategory: string | null = null;

  ngOnInit() {
    this.categories = [...new Set(this.products.map(p => p.category))] as string[];

    this.categories.forEach(cat => {
      this.groupedProducts[cat] = this.products.filter(p => p.category === cat);
    });
  }
  
  scrollTo(category: string) {
    document.getElementById(category)?.scrollIntoView({
      behavior: 'smooth'
    });
  }



  toggleCategory(category: string, event: any) {
      this.activeCategory =
        this.activeCategory === category ? null : category;

      // 🔥 centra el item seleccionado
      const el = event.currentTarget;
      el.scrollIntoView({
        behavior: 'smooth',
        inline: 'center'
      });
    }

}