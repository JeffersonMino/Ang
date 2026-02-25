import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { AppointmentService } from '../../core/services/appointment.service';
import { WorkshopService } from '../../core/services/workshop.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { AppointmentsComponent } from "../getappointments/getappointments.component";

@Component({
  standalone: true,
  selector: 'app-create-appointment',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    AppointmentsComponent
],
  templateUrl: './create-appointment.component.html',  
  styleUrls: ['./create-appointment.component.scss']
  
})
export class CreateAppointmentComponent implements OnInit {

  workshops: any[] = [];
  form!: FormGroup; 

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private workshopService: WorkshopService
  ) {}

  ngOnInit(): void {

    this.form = this.fb.group({
      placeId: ['', Validators.required],
      appointmentAt: ['', Validators.required],
      serviceType: ['', Validators.required],
      contact: this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required]
      })
    });

    this.workshopService.getAll().subscribe(data => {
      this.workshops = data;
    });
  }

  submit() {
    if (this.form.invalid) return;

    const value = this.form.value;

    const payload = {
      ...value,
      appointmentAt: new Date(value.appointmentAt!).toISOString()
    };

    this.appointmentService.create(payload as any)
      .subscribe({
        next: () => alert('Turno creado'),
        error: err => console.log(err)
      });
  }
}