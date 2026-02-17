import { InjectionToken } from '@angular/core';
import { appEnvironment } from './app.environment';

export const ENVIRONMENT = new InjectionToken('environment', {
  providedIn: 'root',
  factory: () => appEnvironment
});