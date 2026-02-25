export interface Contact {
  name: string;
  email: string;
  phone: string;
}

export interface Vehicle {
  make: string;
  model: string;
  year: number;
  licensePlate?: string;
}

export interface CreateAppointmentRequest {
  placeId: number;
  appointmentAt: string;
  serviceType: string;
  contact: Contact;
  vehicle?: Vehicle;
}

export interface Appointment {
[x: string]: any;
  id: string;
  placeId: string;
  appointmentAt: string;
  serviceType: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
}