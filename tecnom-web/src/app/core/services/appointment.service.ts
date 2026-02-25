import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Appointment, CreateAppointmentRequest } from '../models/appointment.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppointmentService {

  private baseUrl = '/api/Appointment';

  constructor(private http: HttpClient) {}

  create(data: CreateAppointmentRequest): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

   getAll(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.baseUrl);
  }
}

