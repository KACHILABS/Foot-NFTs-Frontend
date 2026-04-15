import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  fullWidth = true,
  className = '',
  disabled = false
}) => {
  const baseStyles = "py-4 px-6 rounded-2xl font-black transition-all duration-300 active:scale-[0.98] disabled:opacity-50 text-center flex items-center justify-center gap-2";
  
  const variants = {
    // Both primary and secondary use the same green
    primary: "bg-[#22c55e] text-black hover:bg-[#1e9e4e] hover:scale-105 shadow-[0_20px_50px_rgba(34,197,94,0.3)]",
    secondary: "bg-[#22c55e] text-black hover:bg-[#1e9e4e] hover:scale-105 shadow-[0_20px_50px_rgba(34,197,94,0.3)]",
    outline: "border-2 border-white/20 text-white hover:border-[#22c55e] hover:text-[#22c55e] bg-transparent"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;