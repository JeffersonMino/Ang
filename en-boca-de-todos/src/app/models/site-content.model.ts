export type PromotionAccent = 'gold' | 'blue' | 'red';
export type LocationKind = 'store' | 'delivery-zone' | 'manual';

export interface PromotionBlock {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  ctaLabel: string;
  imageUrl: string;
  accent: PromotionAccent;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VideoBlock {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocationOption {
  id: string;
  name: string;
  address: string;
  zone: string;
  details: string;
  kind: LocationKind;
  active: boolean;
  latitude?: number;
  longitude?: number;
}

export interface SiteContent {
  promotions: PromotionBlock[];
  videos: VideoBlock[];
  locations: LocationOption[];
}
