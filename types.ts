
export interface Trip {
  id?: number;
  date: number; // Stored as timestamp
  totalDistance: number; // in meters
  duration: number; // in seconds
  avgSpeed: number; // in km/h
  maxSpeed: number; // in km/h
  fuelConsumed: number; // in litres
}

export interface Refill {
  id?: number;
  date: number; // Stored as timestamp
  litresAdded: number;
  totalCost: number;
  pricePerLitre: number;
}

export interface SettingsEntry {
  key: string;
  value: string | number | boolean;
}

export type GpsStatus = 'INITIALIZING' | 'ACQUIRING' | 'READY' | 'ERROR' | 'DENIED';
