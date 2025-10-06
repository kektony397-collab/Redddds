
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-brand-surface rounded-xl p-4 shadow-lg ${className}`}>
      {children}
    </div>
  );
};

export default Card;
