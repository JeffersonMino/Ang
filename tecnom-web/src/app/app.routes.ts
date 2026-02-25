import { Routes } from '@angular/router';
import { WorkshopsComponent } from './features/pages/workshops/workshops.component';
import { CreateAppointmentComponent } from './features/create-appointment/create-appointment.component';
import { AppointmentsComponent } from './features/getappointments/getappointments.component';

export const routes: Routes = [
  { path: '', component: WorkshopsComponent },
  { path: 'new', component: CreateAppointmentComponent },
  { path: 'appointments', component: AppointmentsComponent }
];