import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-darkCard rounded-2xl p-5 border border-[#22c55e]/20 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;