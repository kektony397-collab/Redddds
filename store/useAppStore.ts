
import { create } from 'zustand';
import type { GpsStatus } from '../types';

interface AppState {
  speedKmh: number;
  distanceMeters: number;
  startTime: number | null;
  isTripActive: boolean;
  gpsStatus: GpsStatus;
  gpsAccuracy: number | null;
  
  remainingFuel: number;
  vehicleAverageKmL: number;
  tankSize: number;

  actions: {
    setSpeed: (speed: number) => void;
    addDistance: (meters: number) => void;
    setGpsStatus: (status: GpsStatus) => void;
    setGpsAccuracy: (accuracy: number) => void;
    startTrip: () => void;
    stopTrip: () => void;
    resetTrip: () => void;
    
    setRemainingFuel: (litres: number) => void;
    addFuel: (litres: number) => void;
    consumeFuel: (litres: number) => void;
    setVehicleAverage: (avg: number) => void;
    setTankSize: (size: number) => void;
  };
}

export const useAppStore = create<AppState>((set) => ({
  speedKmh: 0,
  distanceMeters: 0,
  startTime: null,
  isTripActive: false,
  gpsStatus: 'INITIALIZING',
  gpsAccuracy: null,

  remainingFuel: 10,
  vehicleAverageKmL: 44,
  tankSize: 12,

  actions: {
    setSpeed: (speedKmh) => set({ speedKmh }),
    addDistance: (meters) => set((state) => ({ distanceMeters: state.distanceMeters + meters })),
    setGpsStatus: (gpsStatus) => set({ gpsStatus }),
    setGpsAccuracy: (gpsAccuracy) => set({ gpsAccuracy }),
    startTrip: () => set({ isTripActive: true, startTime: Date.now() }),
    stopTrip: () => set({ isTripActive: false }),
    resetTrip: () => set({ distanceMeters: 0, startTime: null, speedKmh: 0 }),
    
    setRemainingFuel: (remainingFuel) => set({ remainingFuel }),
    addFuel: (litres) => set((state) => ({ remainingFuel: Math.min(state.tankSize, state.remainingFuel + litres) })),
    consumeFuel: (litres) => set((state) => ({ remainingFuel: Math.max(0, state.remainingFuel - litres) })),
    setVehicleAverage: (vehicleAverageKmL) => set({ vehicleAverageKmL }),
    setTankSize: (tankSize) => set({ tankSize }),
  },
}));
