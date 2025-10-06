
import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

const haversineDistance = (
  coords1: { latitude: number; longitude: number },
  coords2: { latitude: number; longitude: number }
): number => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371e3; // metres

  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);
  const lat1 = toRad(coords1.latitude);
  const lat2 = toRad(coords2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const useGeolocation = () => {
  const { actions, isTripActive } = useAppStore();
  const { setSpeed, addDistance, setGpsStatus, setGpsAccuracy, consumeFuel } = actions;
  const vehicleAverageKmL = useAppStore(state => state.vehicleAverageKmL);

  const watchIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<GeolocationPosition | null>(null);
  const smoothedSpeedRef = useRef<number>(0);
  const EMA_ALPHA = 0.3; // Smoothing factor for speed

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const { coords } = position;
    const { latitude, longitude, speed, accuracy } = coords;

    setGpsAccuracy(accuracy);

    if (accuracy > 20) {
      if (useAppStore.getState().gpsStatus !== 'ACQUIRING') {
        setGpsStatus('ACQUIRING');
      }
      return;
    }
    
    if (useAppStore.getState().gpsStatus !== 'READY') {
        setGpsStatus('READY');
    }

    const speedMs = speed || 0;
    const currentSpeedKmh = speedMs * 3.6;
    
    // Exponential Moving Average for smoothing
    smoothedSpeedRef.current = EMA_ALPHA * currentSpeedKmh + (1 - EMA_ALPHA) * smoothedSpeedRef.current;
    setSpeed(smoothedSpeedRef.current);

    if (isTripActive && lastPositionRef.current) {
      const distanceIncrement = haversineDistance(
        lastPositionRef.current.coords,
        coords
      );
      
      if(distanceIncrement > 0) {
        addDistance(distanceIncrement);
        const fuelConsumed = (distanceIncrement / 1000) / vehicleAverageKmL;
        consumeFuel(fuelConsumed);
      }
    }

    lastPositionRef.current = position;
  }, [setGpsAccuracy, setGpsStatus, setSpeed, isTripActive, addDistance, consumeFuel, vehicleAverageKmL]);

  const handleError = useCallback((error: GeolocationPositionError) => {
    if (error.code === error.PERMISSION_DENIED) {
      setGpsStatus('DENIED');
    } else {
      setGpsStatus('ERROR');
    }
  }, [setGpsStatus]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('ERROR');
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [handleSuccess, handleError, setGpsStatus]);

  return null;
};

export default useGeolocation;
