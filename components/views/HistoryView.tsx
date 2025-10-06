
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import type { Trip, Refill } from '../../types';
import Card from '../common/Card';

const TripItem: React.FC<{ trip: Trip }> = ({ trip }) => {
    return (
        <Card className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg">Trip</span>
                <span className="text-sm text-brand-text-muted">{new Date(trip.date).toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <p><span className="text-brand-text-muted">Distance:</span> {(trip.totalDistance / 1000).toFixed(2)} km</p>
                <p><span className="text-brand-text-muted">Duration:</span> {new Date(trip.duration * 1000).toISOString().slice(11, 19)}</p>
                <p><span className="text-brand-text-muted">Avg Speed:</span> {trip.avgSpeed.toFixed(1)} km/h</p>
                <p><span className="text-brand-text-muted">Max Speed:</span> {trip.maxSpeed.toFixed(1)} km/h</p>
                <p><span className="text-brand-text-muted">Fuel Used:</span> {trip.fuelConsumed.toFixed(2)} L</p>
            </div>
        </Card>
    );
};

const RefillItem: React.FC<{ refill: Refill }> = ({ refill }) => {
    return (
        <Card className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg">Fuel Refill</span>
                <span className="text-sm text-brand-text-muted">{new Date(refill.date).toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <p><span className="text-brand-text-muted">Litres:</span> {refill.litresAdded.toFixed(2)} L</p>
                <p><span className="text-brand-text-muted">Total Cost:</span> ₹{refill.totalCost.toFixed(2)}</p>
                <p><span className="text-brand-text-muted">Price/Litre:</span> ₹{refill.pricePerLitre.toFixed(2)}</p>
            </div>
        </Card>
    );
};

const HistoryView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'trips' | 'refills'>('trips');

    const trips = useLiveQuery(() => db.trips.orderBy('date').reverse().toArray(), []);
    const refills = useLiveQuery(() => db.refills.orderBy('date').reverse().toArray(), []);

    return (
        <div className="flex flex-col h-full">
            <h1 className="text-2xl font-bold mb-4 text-center">History</h1>
            <div className="flex justify-center mb-4 bg-brand-surface rounded-lg p-1">
                <button 
                    onClick={() => setActiveTab('trips')}
                    className={`w-full py-2 px-4 rounded-md transition-colors ${activeTab === 'trips' ? 'bg-brand-primary text-white' : 'text-brand-text-muted'}`}
                >
                    Trips
                </button>
                <button
                    onClick={() => setActiveTab('refills')}
                    className={`w-full py-2 px-4 rounded-md transition-colors ${activeTab === 'refills' ? 'bg-brand-primary text-white' : 'text-brand-text-muted'}`}
                >
                    Refills
                </button>
            </div>
            <div className="flex-grow overflow-y-auto">
                {activeTab === 'trips' && (
                    <div>
                        {trips && trips.length > 0 ? (
                            trips.map(trip => <TripItem key={trip.id} trip={trip} />)
                        ) : (
                            <p className="text-center text-brand-text-muted mt-8">No trip history found.</p>
                        )}
                    </div>
                )}
                {activeTab === 'refills' && (
                    <div>
                        {refills && refills.length > 0 ? (
                             refills.map(refill => <RefillItem key={refill.id} refill={refill} />)
                        ) : (
                            <p className="text-center text-brand-text-muted mt-8">No refill history found.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryView;
