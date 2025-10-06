import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { db } from '../../lib/db';
import type { Trip } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import { Play, Square, Fuel } from '../Icons';
import RefillModal from '../modals/RefillModal';

const GpsStatusIndicator: React.FC = () => {
    const gpsStatus = useAppStore(state => state.gpsStatus);
    const gpsAccuracy = useAppStore(state => state.gpsAccuracy);
    
    const statusMap = {
        INITIALIZING: { text: "Initializing GPS...", color: "text-yellow-400" },
        ACQUIRING: { text: `Acquiring Signal... (Accuracy: ${gpsAccuracy?.toFixed(0)}m)`, color: "text-yellow-400" },
        READY: { text: `GPS Ready (Accuracy: ${gpsAccuracy?.toFixed(0)}m)`, color: "text-green-400" },
        ERROR: { text: "GPS Error", color: "text-red-400" },
        DENIED: { text: "GPS Permission Denied", color: "text-red-400" },
    };

    const currentStatus = statusMap[gpsStatus];

    return (
        <div className="text-center text-sm font-medium">
            <p className={currentStatus.color}>{currentStatus.text}</p>
        </div>
    );
};

const SpeedDisplay: React.FC = () => {
    const speedKmh = useAppStore(state => state.speedKmh);
    return (
        <div className="flex flex-col items-center justify-center my-4">
            <div className="relative flex items-center justify-center w-64 h-64 rounded-full bg-gradient-to-br from-gray-800 to-brand-surface shadow-2xl">
                <div className="absolute w-60 h-60 rounded-full border-4 border-brand-secondary"></div>
                <div className="absolute w-56 h-56 rounded-full bg-brand-bg flex items-center justify-center">
                    <span className="text-7xl font-mono font-bold text-brand-primary tracking-tighter">
                        {speedKmh.toFixed(0)}
                    </span>
                </div>
            </div>
            <span className="mt-2 text-lg font-semibold text-brand-text-muted">km/h</span>
        </div>
    );
};

const TripStats: React.FC = () => {
    const { distanceMeters, startTime } = useAppStore();
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        // FIX: Cannot find namespace 'NodeJS'. Replaced NodeJS.Timeout with the browser-compatible 
        // type `ReturnType<typeof setInterval>` to ensure correct type inference in a web environment.
        let interval: ReturnType<typeof setInterval> | null = null;
        if (startTime) {
            interval = setInterval(() => {
                setDuration(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        } else {
            setDuration(0);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [startTime]);
    
    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return (
        <div className="grid grid-cols-2 gap-4 text-center">
            <Card className="flex flex-col">
                <span className="text-2xl font-bold text-brand-text">{(distanceMeters / 1000).toFixed(2)}</span>
                <span className="text-sm text-brand-text-muted">km</span>
            </Card>
            <Card className="flex flex-col">
                <span className="text-2xl font-bold text-brand-text">{formatDuration(duration)}</span>
                <span className="text-sm text-brand-text-muted">Duration</span>
            </Card>
        </div>
    );
};


const FuelStatus: React.FC = () => {
    const { remainingFuel, vehicleAverageKmL, tankSize } = useAppStore();
    const remainingRange = remainingFuel * vehicleAverageKmL;
    const fuelPercentage = (remainingFuel / tankSize) * 100;

    return (
        <Card>
            <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Fuel Status</span>
                <span className="text-sm text-brand-text-muted">{remainingFuel.toFixed(1)} / {tankSize} L</span>
            </div>
            <div className="w-full bg-brand-secondary rounded-full h-2.5">
                <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${fuelPercentage}%` }}></div>
            </div>
            <p className="text-center mt-2 text-brand-text">
                Estimated Range: <span className="font-bold text-brand-primary">{remainingRange.toFixed(0)} km</span>
            </p>
        </Card>
    )
}

const SpeedometerView: React.FC = () => {
    const { isTripActive, actions, distanceMeters, startTime, speedKmh } = useAppStore();
    const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
    const tripDataRef = React.useRef({ maxSpeed: 0, speeds: [] as number[] });

    // Stabilize the onClose handler with useCallback to prevent the memoized RefillModal
    // from re-rendering unnecessarily when SpeedometerView updates.
    const handleCloseRefillModal = useCallback(() => {
        setIsRefillModalOpen(false);
    }, []);

    useEffect(() => {
      if(isTripActive) {
        if(speedKmh > tripDataRef.current.maxSpeed) {
            tripDataRef.current.maxSpeed = speedKmh;
        }
        tripDataRef.current.speeds.push(speedKmh);
      }
    }, [speedKmh, isTripActive])

    const handleToggleTrip = async () => {
        if (isTripActive) {
            actions.stopTrip();
            const duration = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
            const avgSpeed = tripDataRef.current.speeds.length > 0
                ? tripDataRef.current.speeds.reduce((a, b) => a + b, 0) / tripDataRef.current.speeds.length
                : 0;
            const fuelConsumed = (distanceMeters / 1000) / useAppStore.getState().vehicleAverageKmL;

            const trip: Trip = {
                date: Date.now(),
                totalDistance: distanceMeters,
                duration,
                avgSpeed,
                maxSpeed: tripDataRef.current.maxSpeed,
                fuelConsumed
            };
            await db.trips.add(trip);
            actions.resetTrip();
            tripDataRef.current = { maxSpeed: 0, speeds: [] };
        } else {
            actions.resetTrip();
            tripDataRef.current = { maxSpeed: 0, speeds: [] };
            actions.startTrip();
        }
    };
    
    return (
        <div className="flex flex-col justify-between h-full space-y-4">
            <GpsStatusIndicator />
            <SpeedDisplay />
            <TripStats />
            <FuelStatus />
            <div className="grid grid-cols-2 gap-4">
                <Button
                    onClick={() => setIsRefillModalOpen(true)}
                    variant="secondary"
                >
                    <Fuel className="w-5 h-5" /> Log Refill
                </Button>
                <Button onClick={handleToggleTrip}>
                    {isTripActive ? <Square className="w-5 h-5"/> : <Play className="w-5 h-5" />}
                    {isTripActive ? 'Stop Trip' : 'Start Trip'}
                </Button>
            </div>
            <RefillModal
                isOpen={isRefillModalOpen}
                onClose={handleCloseRefillModal}
            />
        </div>
    );
};

export default SpeedometerView;