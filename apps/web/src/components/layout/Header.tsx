import React, { useState } from 'react';
import { WalletButton, WalletModal } from '@/components/wallet';

interface HeaderProps {
  className?: string;
  onNavigate?: (page: 'dashboard' | 'operators') => void;
  currentPage?: 'dashboard' | 'operators';
}

export const Header: React.FC<HeaderProps> = ({ className = '', onNavigate, currentPage }) => {
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const handleNavClick = (page: 'dashboard' | 'operators') => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <header className={`bg-background border-b border-border ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img src="/autonomys-icon-dark.svg" alt="Autonomys" className="h-8 w-8" />
              <span className="text-xl font-serif font-semibold text-foreground">
                Autonomys Staking
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`px-3 py-2 text-sm font-medium transition-colors font-sans ${
                currentPage === 'dashboard'
                  ? 'text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => handleNavClick('operators')}
              className={`px-3 py-2 text-sm font-medium transition-colors font-sans ${
                currentPage === 'operators'
                  ? 'text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Operators
            </button>
            <button
              onClick={() => handleNavClick('dashboard')}
              className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium transition-colors font-sans"
            >
              Portfolio
            </button>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            <WalletButton onOpenModal={() => setWalletModalOpen(true)} />
          </div>
        </div>
      </div>

      <WalletModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </header>
  );
};
