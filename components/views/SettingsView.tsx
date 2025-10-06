import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { db } from '../../lib/db';
import Button from '../common/Button';
import Card from '../common/Card';
import Modal from '../common/Modal';

// FIX: Moved InputField outside the component to prevent it from being recreated on every render.
// This preserves input focus and stops the keyboard from closing unexpectedly.
const InputField = ({ label, value, onChange, type = 'number', inputMode, unit }: {
    label: string;
    value: number | string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    inputMode?: "decimal" | "numeric" | "text" | "search" | "email" | "tel" | "url";
    unit?: string;
}) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-brand-text-muted mb-1">{label}</label>
        <div className="flex items-center">
            <input
                type={type}
                inputMode={inputMode}
                value={value}
                onChange={onChange}
                className="w-full bg-brand-bg border border-brand-secondary rounded-md p-2 text-brand-text focus:ring-brand-primary focus:border-brand-primary"
            />
            {unit && <span className="ml-2 text-brand-text-muted">{unit}</span>}
        </div>
    </div>
);

const SettingsView: React.FC = () => {
    const { vehicleAverageKmL, tankSize, actions } = useAppStore();
    const { setVehicleAverage, setTankSize } = actions;
    
    // FIX: Use string state for inputs to avoid parsing issues on every keystroke.
    const [localAverage, setLocalAverage] = useState(vehicleAverageKmL.toString());
    const [localTankSize, setLocalTankSize] = useState(tankSize.toString());
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    
    // Petrol Calculator State
    const [calcAmount, setCalcAmount] = useState('');
    const [calcPrice, setCalcPrice] = useState('');
    const [calcResultLitres, setCalcResultLitres] = useState<number | null>(null);

    useEffect(() => {
        setLocalAverage(vehicleAverageKmL.toString());
        setLocalTankSize(tankSize.toString());
    }, [vehicleAverageKmL, tankSize]);

    const handleSaveSettings = async () => {
        // FIX: Parse string state to numbers on save and add validation.
        const avg = parseFloat(localAverage);
        const tank = parseFloat(localTankSize);

        if (isNaN(avg) || isNaN(tank) || avg <= 0 || tank <= 0) {
            alert("Please enter valid positive numbers for vehicle settings.");
            return;
        }

        setVehicleAverage(avg);
        setTankSize(tank);
        await db.settings.put({ key: 'vehicleAverageKmL', value: avg });
        await db.settings.put({ key: 'tankSize', value: tank });
        alert('Settings saved!');
    };

    const handleDeleteAllData = async () => {
        await db.trips.clear();
        await db.refills.clear();
        await db.settings.clear();
        // Reset state
        actions.setVehicleAverage(44);
        actions.setTankSize(12);
        actions.setRemainingFuel(10);
        actions.resetTrip();
        alert('All data has been deleted.');
        setDeleteModalOpen(false);
    };
    
    const calculateLitres = () => {
        const amount = parseFloat(calcAmount);
        const price = parseFloat(calcPrice);
        if(!isNaN(amount) && !isNaN(price) && price > 0) {
            setCalcResultLitres(amount / price);
        } else {
            setCalcResultLitres(null);
        }
    };
    
    useEffect(calculateLitres, [calcAmount, calcPrice]);

    return (
        <div className="flex flex-col h-full space-y-6">
            <h1 className="text-2xl font-bold text-center">Settings & Tools</h1>

            <Card>
                <h2 className="text-lg font-semibold mb-3">Vehicle Settings</h2>
                <InputField
                    label="Vehicle Average"
                    value={localAverage}
                    onChange={(e) => setLocalAverage(e.target.value)}
                    unit="km/L"
                    inputMode="decimal"
                />
                <InputField
                    label="Fuel Tank Size"
                    value={localTankSize}
                    onChange={(e) => setLocalTankSize(e.target.value)}
                    unit="Litres"
                    inputMode="decimal"
                />
                <Button onClick={handleSaveSettings} className="w-full">Save Settings</Button>
            </Card>

            <Card>
                <h2 className="text-lg font-semibold mb-3">Petrol Calculator</h2>
                <InputField
                    label="Amount"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(e.target.value)}
                    unit="INR"
                    inputMode="decimal"
                />
                <InputField
                    label="Price per Litre"
                    value={calcPrice}
                    onChange={(e) => setCalcPrice(e.target.value)}
                    unit="INR"
                    inputMode="decimal"
                />
                {calcResultLitres !== null && (
                    <div className="mt-4 text-center bg-brand-bg p-3 rounded-lg">
                        <p className="text-brand-text">You will get <span className="font-bold text-brand-primary text-lg">{calcResultLitres.toFixed(2)}</span> Litres.</p>
                    </div>
                )}
            </Card>

            <Card>
                <h2 className="text-lg font-semibold mb-3">Data Management</h2>
                <Button onClick={() => setDeleteModalOpen(true)} variant="danger" className="w-full">
                    Delete All Data
                </Button>
            </Card>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <p className="mb-4 text-brand-text-muted">Are you sure you want to delete all your trip and refill data? This action cannot be undone.</p>
                <div className="flex justify-end space-x-4">
                    <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteAllData}>Delete Data</Button>
                </div>
            </Modal>
        </div>
    );
};

export default SettingsView;