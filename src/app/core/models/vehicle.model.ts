export type VehicleType   = 'van' | 'car';
export type VehicleStatus = 'available' | 'busy' | 'offline';

export interface Vehicle {
  id:                string;
  plateNumber:       string;
  chassisNumber:     string;
  vehicleIdCode:     string | null;
  makeModel:         string | null;
  yearOfManufacture: number | null;
  color:             string | null;
  vehicleType:       VehicleType;
  branchId:          string;
  branch:            { id: string; name: string };
  status:            VehicleStatus;
  currentDriverId:   string | null;
  currentDriver:     { id: string; fullName: string; phone: string } | null;
  notes:             string | null;
  insuranceProvider: string | null;
  insuranceExpiry:   string | null;
  revenueLicExpiry:  string | null;
  lastServiceDate:   string | null;
  mileageKm:         number | null;
  nextServiceKm:     number | null;
  insuranceCertUrl:  string | null;
  createdAt:         string;
  updatedAt:         string;
  deletedAt:         string | null;
}

export interface VehicleListResponse {
  data: Vehicle[];
  meta: {
    page:       number;
    limit:      number;
    total:      number;
    totalPages: number;
    hasNext:    boolean;
    hasPrev:    boolean;
    stats:      { available: number; busy: number; offline: number };
  };
}

export interface CreateVehicleDto {
  plateNumber:        string;
  chassisNumber:      string;
  vehicleType:        VehicleType;
  branchId:           string;
  vehicleIdCode?:     string | null;
  makeModel?:         string | null;
  yearOfManufacture?: number | null;
  color?:             string | null;
  notes?:             string | null;
  insuranceProvider?: string | null;
  insuranceExpiry?:   string | null;
  revenueLicExpiry?:  string | null;
  lastServiceDate?:   string | null;
  mileageKm?:         number | null;
  nextServiceKm?:     number | null;
  insuranceCertUrl?:  string | null;
}