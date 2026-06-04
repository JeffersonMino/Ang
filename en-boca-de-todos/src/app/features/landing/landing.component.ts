import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  NgZone,
  OnInit,
  PLATFORM_ID,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PRODUCTS } from '../../models/product.data';
import { OrderNotification } from '../../models/order-notification.model';
import { Order } from '../../models/order.model';
import { Product } from '../../models/product.model';
import { OrderStoreService } from '../../core/services/order-store.service';
import { SiteContentService } from '../../core/services/site-content.service';
import { ChatbotComponent } from '../../chatbot/chatbot.component';
import { CartComponent } from '../cart/cart.component';
import { ProductCardComponent } from '../products/product-card/product-card.component';
import {
  LocationOption,
  PromotionBlock,
  SiteContent,
  VideoBlock
} from '../../models/site-content.model';

declare const google: any;

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ProductCardComponent,
    CartComponent,
    ChatbotComponent
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);
  private map: any;
  private marker: any;
  private geocoder: any;

  products = PRODUCTS;
  categories: string[] = [];
  groupedProducts: Record<string, Product[]> = {};
  activeCategory = '';
  expandedCategory = '';
  recentOrders: Order[] = [];
  customerNotifications: OrderNotification[] = [];
  content: SiteContent = {
    promotions: [],
    videos: [],
    locations: []
  };
  selectedLocation: LocationOption | null = null;
  selectedMapAddress = '';
  mapReady = false;
  mapStatus = 'Haz clic en el mapa o mueve el pin para seleccionar tu direccion.';

  constructor(
    private readonly orderStore: OrderStoreService,
    private readonly siteContent: SiteContentService,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.categories = [...new Set(this.products.map((product) => product.category))];
    this.groupedProducts = this.categories.reduce<Record<string, Product[]>>(
      (groups, category) => {
        groups[category] = this.products.filter(
          (product) => product.category === category
        );
        return groups;
      },
      {}
    );
    this.activeCategory = this.categories[0] ?? '';
    this.expandedCategory = this.activeCategory;

    this.orderStore.orders$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((orders) => {
        this.recentOrders = orders.slice(0, 3);
      });

    this.orderStore.notifications$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((notifications) => {
        this.customerNotifications = notifications
          .filter((notification) => notification.audience === 'customer')
          .slice(0, 3);
      });

    this.siteContent.content$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((content) => {
        this.content = content;
      });

    this.siteContent.selectedLocation$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((location) => {
        this.selectedLocation = location;
        this.selectedMapAddress = location?.address ?? this.selectedMapAddress;
      });
  }

  ngAfterViewInit() {
    if (!this.isBrowser) {
      return;
    }

    window.setTimeout(() => this.initDeliveryMap(), 250);
  }

  goToMenu() {
    this.scrollToElement('menu-section');
  }

  scrollTo(sectionId: string) {
    this.scrollToElement(sectionId);
  }

  focusCategory(category: string) {
    this.toggleCategory(category);
  }

  toggleCategory(category: string) {
    if (this.expandedCategory === category) {
      this.expandedCategory = '';
      return;
    }

    this.activeCategory = category;
    this.expandedCategory = category;
  }

  isCategoryExpanded(category: string): boolean {
    return this.expandedCategory === category;
  }

  getCategoryCount(category: string): number {
    return this.groupedProducts[category]?.length ?? 0;
  }

  activePromotions(): PromotionBlock[] {
    return this.content.promotions.filter((promotion) => promotion.active);
  }

  activeVideos(): VideoBlock[] {
    return this.content.videos.filter((video) => video.active);
  }

  safeVideoUrl(video: VideoBlock): SafeResourceUrl | null {
    if (!video.videoUrl.trim()) {
      return null;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(video.videoUrl);
  }

  useCurrentLocation() {
    if (!this.isBrowser || !navigator.geolocation) {
      this.mapStatus = 'Tu navegador no permite geolocalizacion. Selecciona el punto directamente en el mapa.';
      return;
    }

    this.mapStatus = 'Buscando tu ubicacion actual...';
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.zone.run(() => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          this.moveMapPin(coords, true);
        });
      },
      () => {
        this.zone.run(() => {
          this.mapStatus = 'No pudimos obtener tu ubicacion. Puedes hacer clic en el mapa.';
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 9000
      }
    );
  }

  getStatusLabel(order: Order): string {
    return this.orderStore.getStatusLabel(order.status);
  }

  getProgress(order: Order): number {
    switch (order.status) {
      case 'new':
        return 20;
      case 'confirmed':
        return 40;
      case 'preparing':
        return 65;
      case 'dispatched':
        return 85;
      case 'delivered':
        return 100;
      case 'cancelled':
        return 0;
      default:
        return 0;
    }
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('es-EC', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(date));
  }

  private scrollToElement(elementId: string) {
    if (!this.isBrowser) {
      return;
    }

    document.getElementById(elementId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  private initDeliveryMap() {
    const mapElement = document.getElementById('landing-map');

    if (!mapElement) {
      return;
    }

    if (typeof google === 'undefined' || !google.maps) {
      this.mapReady = false;
      this.mapStatus = 'El mapa no cargo. Revisa la clave de Google Maps o la conexion.';
      return;
    }

    const defaultLocation = {
      lat: this.selectedLocation?.latitude ?? -0.1807,
      lng: this.selectedLocation?.longitude ?? -78.4678
    };

    this.geocoder = new google.maps.Geocoder();
    this.map = new google.maps.Map(mapElement, {
      center: defaultLocation,
      zoom: 15,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true
    });
    this.marker = new google.maps.Marker({
      position: defaultLocation,
      map: this.map,
      draggable: true,
      title: 'Direccion de entrega'
    });

    this.mapReady = true;
    this.map.addListener('click', (event: any) => {
      this.zone.run(() => {
        this.moveMapPin({
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        }, true);
      });
    });
    this.marker.addListener('dragend', () => {
      this.zone.run(() => {
        const position = this.marker.getPosition();
        this.moveMapPin({
          lat: position.lat(),
          lng: position.lng()
        }, true);
      });
    });
  }

  private moveMapPin(coords: { lat: number; lng: number }, persist: boolean) {
    if (this.map) {
      this.map.setCenter(coords);
      this.map.setZoom(16);
    }

    if (this.marker) {
      this.marker.setPosition(coords);
    }

    this.resolveAddress(coords, persist);
  }

  private resolveAddress(coords: { lat: number; lng: number }, persist: boolean) {
    if (!this.geocoder) {
      this.saveMapSelection(
        `Lat ${coords.lat.toFixed(6)}, Lng ${coords.lng.toFixed(6)}`,
        coords,
        persist
      );
      return;
    }

    this.geocoder.geocode({ location: coords }, (results: any[], status: string) => {
      const address =
        status === 'OK' && results?.[0]?.formatted_address
          ? results[0].formatted_address
          : `Lat ${coords.lat.toFixed(6)}, Lng ${coords.lng.toFixed(6)}`;

      this.zone.run(() => {
        this.saveMapSelection(address, coords, persist);
      });
    });
  }

  private saveMapSelection(
    address: string,
    coords: { lat: number; lng: number },
    persist: boolean
  ) {
    this.selectedMapAddress = address;
    this.mapStatus = 'Direccion seleccionada. El checkout usara este punto.';

    if (persist) {
      this.siteContent.saveMapLocation(address, coords.lat, coords.lng);
    }
  }
}
