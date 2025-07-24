// src/pages/landlord/property/types/propertyTypes.ts
export interface Photo {
  id: string;
  url: string;
}

export interface Unit {
  id: string;
  label: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  chargePerHead: boolean;
  pricePerHead: number | null;
  pricePerUnit: number | null;
  photos: Photo[];
  maxOccupancy: number;
  isNegotiable: boolean;
}

export interface UnitStatusCount {
  AVAILABLE: number;
  OCCUPIED: number;
  MAINTENANCE: number;
}

export interface ApplicationStatusCount {
  PENDING: number;
  REVIEWED: number;
  APPROVED: number;
  REJECTED: number;
  WITHDRAWN: number;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  street: string;
  zipCode: string;
  barangay: string;
  city: string;
  municipality: string;
  province: string;
  requiresScreening: boolean;
  isListed: boolean;
  amenities: string[];
  photos: Photo[];
  unitCount: number;
  unitStatusCount: UnitStatusCount;
  applicationStatusCount: ApplicationStatusCount;
  priceRangePerUnit: [number, number] | null;
  priceRangePerHead: [number, number] | null;
  units: Unit[];
}