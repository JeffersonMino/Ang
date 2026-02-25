import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Workshop } from '../models/workshop.model';

@Injectable({ providedIn: 'root' })
export class WorkshopService {

  private baseUrl = '/api/workshops';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Workshop[]> {
    return this.http.get<Workshop[]>(this.baseUrl);
  }
}