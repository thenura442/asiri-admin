import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api/api.service';
import { Vehicle, VehicleListResponse, CreateVehicleDto } from '@core/models/vehicle.model';

export interface VehicleParams {
  page?:        number;
  limit?:       number;
  status?:      'available' | 'busy' | 'offline';
  branchId?:    string;
  vehicleType?: 'van' | 'car';
  search?:      string;
  [key: string]: string | number | boolean | undefined; // ← add this
}

export interface UpdateVehicleDto {
  plateNumber?:       string;
  chassisNumber?:     string;
  vehicleIdCode?:     string | null;
  makeModel?:         string | null;
  yearOfManufacture?: number | null;
  color?:             string | null;
  vehicleType?:       'van' | 'car';
  branchId?:          string;
  notes?:             string | null;
  insuranceProvider?: string | null;
  insuranceExpiry?:   string | null;
  revenueLicExpiry?:  string | null;
  lastServiceDate?:   string | null;
  mileageKm?:         number | null;
  nextServiceKm?:     number | null;
  insuranceCertUrl?:  string | null;
  status?:            'available' | 'busy' | 'offline';
}

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private api = inject(ApiService);

  getAll(params?: VehicleParams): Observable<VehicleListResponse> {
    return this.api.get<VehicleListResponse>('/vehicles', { params });
  }

  getById(id: string): Observable<Vehicle> {
    return this.api.get<Vehicle>(`/vehicles/${id}`);
  }

  create(dto: CreateVehicleDto): Observable<Vehicle> {
    return this.api.post<Vehicle>('/vehicles', dto);
  }

  update(id: string, dto: UpdateVehicleDto): Observable<Vehicle> {
    return this.api.patch<Vehicle>(`/vehicles/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/vehicles/${id}`);
  }

  assignDriver(vehicleId: string, driverId: string | null): Observable<Vehicle> {
    return this.api.post<Vehicle>(`/vehicles/${vehicleId}/assign-driver`, { driverId });
  }
}