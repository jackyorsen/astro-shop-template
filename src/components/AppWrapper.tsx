import React, { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

interface AppWrapperProps {
  children: ReactNode;
}

export const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  return (
    <AuthProvider>
      <CartProvider>
        {/* Using MemoryRouter inside Astro because HTML history is handled by Astro Pages */}
        <MemoryRouter>
          {children}
        </MemoryRouter>
      </CartProvider>
    </AuthProvider>
  );
};
