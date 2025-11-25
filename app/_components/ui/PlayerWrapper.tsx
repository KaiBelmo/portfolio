'use client';

import { ReactNode, MouseEvent } from 'react';

export default function PlayerWrapper({ 
  children,
  className = '' 
}: { 
  children: ReactNode;
  className?: string;
}) {
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    // Prevent click from reaching the parent Link
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div 
      className={className}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}
