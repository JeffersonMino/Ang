import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../core/services/appointment.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Appointment } from '../../core/models/appointment.model';

@Component({
  standalone: true,
  selector: 'app-getappointments',
  imports: [CommonModule, MatCardModule],
  templateUrl: './getappointments.component.html',  
  styleUrls: ['./getappointments.component.scss']
  
})
export class AppointmentsComponent implements OnInit {

  appointments: Appointment[] = [];

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.appointmentService.getAll()
      .subscribe(data => {
        this.appointments = data;
      });
  }
}