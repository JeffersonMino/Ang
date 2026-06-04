import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  LocationOption,
  PromotionBlock,
  SiteContent,
  VideoBlock
} from '../../models/site-content.model';

@Injectable({
  providedIn: 'root'
})
export class SiteContentService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly contentKey = 'ebdt_site_content_v1';
  private readonly selectedLocationKey = 'ebdt_selected_location_v1';

  private readonly contentSubject = new BehaviorSubject<SiteContent>(
    this.defaultContent()
  );
  readonly content$ = this.contentSubject.asObservable();

  private readonly selectedLocationSubject =
    new BehaviorSubject<LocationOption | null>(null);
  readonly selectedLocation$ = this.selectedLocationSubject.asObservable();

  constructor() {
    this.hydrate();
  }

  get content(): SiteContent {
    return this.contentSubject.value;
  }

  get selectedLocation(): LocationOption | null {
    return this.selectedLocationSubject.value;
  }

  upsertPromotion(
    input: Omit<PromotionBlock, 'id' | 'createdAt' | 'updatedAt'>
  ): PromotionBlock {
    const now = new Date().toISOString();
    const promotion: PromotionBlock = {
      ...input,
      id: this.generateId('promo'),
      createdAt: now,
      updatedAt: now
    };

    this.setContent({
      ...this.content,
      promotions: [promotion, ...this.content.promotions]
    });

    return promotion;
  }

  removePromotion(id: string) {
    this.setContent({
      ...this.content,
      promotions: this.content.promotions.filter((promotion) => promotion.id !== id)
    });
  }

  upsertVideo(input: Omit<VideoBlock, 'id' | 'createdAt' | 'updatedAt'>): VideoBlock {
    const now = new Date().toISOString();
    const video: VideoBlock = {
      ...input,
      videoUrl: this.normalizeVideoUrl(input.videoUrl),
      id: this.generateId('video'),
      createdAt: now,
      updatedAt: now
    };

    this.setContent({
      ...this.content,
      videos: [video, ...this.content.videos]
    });

    return video;
  }

  removeVideo(id: string) {
    this.setContent({
      ...this.content,
      videos: this.content.videos.filter((video) => video.id !== id)
    });
  }

  selectLocation(location: LocationOption) {
    this.selectedLocationSubject.next(location);
    this.persist(this.selectedLocationKey, location);
  }

  saveMapLocation(address: string, latitude: number, longitude: number): LocationOption {
    const location: LocationOption = {
      id: 'map-location',
      name: 'Direccion del mapa',
      address: address.trim(),
      zone: 'Punto seleccionado',
      details: `Coordenadas: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      kind: 'manual',
      active: true,
      latitude,
      longitude
    };

    this.selectLocation(location);
    return location;
  }

  private hydrate() {
    if (!this.isBrowser) {
      return;
    }

    const storedContent = this.readStorage<SiteContent>(this.contentKey);
    const storedLocation = this.readStorage<LocationOption>(this.selectedLocationKey);

    if (storedContent) {
      this.contentSubject.next(this.mergeContent(storedContent));
    }

    if (storedLocation) {
      this.selectedLocationSubject.next(storedLocation);
    }
  }

  private setContent(content: SiteContent) {
    this.contentSubject.next(content);
    this.persist(this.contentKey, content);
  }

  private readStorage<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  private persist<T>(key: string, value: T) {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(key, JSON.stringify(value));
  }

  private mergeContent(content: SiteContent): SiteContent {
    const fallback = this.defaultContent();

    return {
      promotions: Array.isArray(content.promotions)
        ? content.promotions
        : fallback.promotions,
      videos: Array.isArray(content.videos) ? content.videos : fallback.videos,
      locations: Array.isArray(content.locations)
        ? content.locations
        : fallback.locations
    };
  }

  private normalizeVideoUrl(url: string): string {
    const trimmed = url.trim();
    const watchMatch = trimmed.match(/youtube\.com\/watch\?v=([^&]+)/);
    const shortMatch = trimmed.match(/youtu\.be\/([^?]+)/);

    if (watchMatch?.[1]) {
      return `https://www.youtube.com/embed/${watchMatch[1]}`;
    }

    if (shortMatch?.[1]) {
      return `https://www.youtube.com/embed/${shortMatch[1]}`;
    }

    return trimmed;
  }

  private defaultContent(): SiteContent {
    const now = new Date().toISOString();

    return {
      promotions: [
        {
          id: 'promo-frontera',
          title: 'Combo frontera',
          subtitle: 'Publicidad destacada',
          body: 'Hamburguesa, papas y bebida con energia Ecuador-Argentina para activar la venta del dia.',
          ctaLabel: 'Ver combo',
          imageUrl: '/Fondo1.png',
          accent: 'gold',
          active: true,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'promo-delivery',
          title: 'Delivery inteligente',
          subtitle: 'Seguimiento por WhatsApp',
          body: 'El cliente marca su direccion en el mapa, confirma pedido y recibe seguimiento desde el admin.',
          ctaLabel: 'Pedir a domicilio',
          imageUrl: '/Fondo2.png',
          accent: 'blue',
          active: true,
          createdAt: now,
          updatedAt: now
        }
      ],
      videos: [
        {
          id: 'video-brand',
          title: 'Presentacion del negocio',
          description: 'Espacio editable para insertar reels, videos de cocina o publicidad.',
          videoUrl: '',
          thumbnailUrl: '/Fondo1.png',
          active: true,
          createdAt: now,
          updatedAt: now
        }
      ],
      locations: [
        {
          id: 'quito-centro',
          name: 'Quito centro',
          address: 'Quito centro, Ecuador',
          zone: 'Zona principal',
          details: 'Ideal para retiro o entregas cercanas.',
          kind: 'store',
          active: true
        },
        {
          id: 'quito-norte',
          name: 'Quito norte',
          address: 'Quito norte, Ecuador',
          zone: 'Cobertura delivery',
          details: 'Selecciona esta zona y ajusta tu direccion en checkout.',
          kind: 'delivery-zone',
          active: true
        },
        {
          id: 'quito-sur',
          name: 'Quito sur',
          address: 'Quito sur, Ecuador',
          zone: 'Cobertura delivery',
          details: 'Selecciona esta zona y ajusta tu direccion en checkout.',
          kind: 'delivery-zone',
          active: true
        }
      ]
    };
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
