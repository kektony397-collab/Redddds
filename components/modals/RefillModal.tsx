import React, { useState, memo } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { db } from '../../lib/db';
import { useAppStore } from '../../store/useAppStore';
import type { Refill } from '../../types';

interface RefillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Moved InputField outside the component to prevent it from being recreated on every render,
// which causes the input to lose focus.
const InputField = ({ label, value, onChange, placeholder, unit }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string, unit: string }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-brand-text-muted mb-1">{label}</label>
        <div className="flex items-center">
            <input
                type="number"
                inputMode="decimal" // Use a numeric keyboard with decimals on mobile
                step="any" // Allow any decimal value
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-brand-bg border border-brand-secondary rounded-md p-2 text-brand-text focus:ring-brand-primary focus:border-brand-primary"
            />
             <span className="ml-2 text-brand-text-muted">{unit}</span>
        </div>
    </div>
);


const RefillModal: React.FC<RefillModalProps> = ({ isOpen, onClose }) => {
  const { actions } = useAppStore();
  const [litres, setLitres] = useState('');
  const [cost, setCost] = useState('');
  const [isFullTank, setIsFullTank] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const litresAdded = parseFloat(litres);
    const totalCost = parseFloat(cost);
    const tankSize = useAppStore.getState().tankSize;

    if (isNaN(litresAdded) || isNaN(totalCost) || litresAdded <= 0 || totalCost <= 0) {
      alert('Please enter valid numbers for litres and cost.');
      return;
    }

    const refill: Refill = {
      date: Date.now(),
      litresAdded,
      totalCost,
      pricePerLitre: totalCost / litresAdded,
    };

    await db.refills.add(refill);

    if (isFullTank) {
      actions.setRemainingFuel(tankSize);
      await db.settings.put({ key: 'remainingFuel', value: tankSize });
    } else {
      actions.addFuel(litresAdded);
      const newFuelLevel = useAppStore.getState().remainingFuel;
      await db.settings.put({ key: 'remainingFuel', value: newFuelLevel });
    }

    setLitres('');
    setCost('');
    setIsFullTank(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Fuel Refill">
      <form onSubmit={handleSubmit}>
        <InputField label="Petrol Filled" value={litres} onChange={(e) => setLitres(e.target.value)} placeholder="e.g., 10.5" unit="Litres" />
        <InputField label="Total Cost" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="e.g., 1050" unit="INR" />
        
        <div className="flex items-center mb-6">
            <input 
                id="full-tank"
                type="checkbox"
                checked={isFullTank}
                onChange={(e) => setIsFullTank(e.target.checked)}
                className="w-4 h-4 text-brand-primary bg-gray-700 border-gray-600 rounded focus:ring-brand-primary"
            />
            <label htmlFor="full-tank" className="ml-2 text-sm font-medium text-brand-text">This was a full tank refill.</label>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Log Refill</Button>
        </div>
      </form>
    </Modal>
  );
};

// Memoize the component to prevent re-renders from the parent (SpeedometerView)
// which updates frequently. This preserves the input focus.
export default memo(RefillModal);