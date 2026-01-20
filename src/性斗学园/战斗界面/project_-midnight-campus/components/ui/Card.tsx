import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, hover = false }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-deepblue/60 
        backdrop-blur-md 
        border border-white/10 
        rounded-xl 
        p-4 
        shadow-xl
        ${hover ? 'hover:bg-deepblue/80 hover:border-neonblue/30 hover:shadow-neonblue/20 cursor-pointer transition-all duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
