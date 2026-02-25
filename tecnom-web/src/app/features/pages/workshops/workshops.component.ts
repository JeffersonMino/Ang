import { Component, OnInit } from '@angular/core';
import { WorkshopService } from '../../../core/services/workshop.service';
import { Workshop } from '../../../core/models/workshop.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { CreateAppointmentComponent } from "../../create-appointment/create-appointment.component";

@Component({
  standalone: true,
  selector: 'app-workshops',
  imports: [CommonModule, MatCardModule, CreateAppointmentComponent],
  templateUrl: './workshops.component.html',
  styleUrls: ['./workshops.component.scss']
})
export class WorkshopsComponent implements OnInit {

  workshops: Workshop[] = [];

  constructor(private workshopService: WorkshopService) {}

  ngOnInit(): void {
    this.workshopService.getAll().subscribe(data => {
      this.workshops = data;
    });
  }
}