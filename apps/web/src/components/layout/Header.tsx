import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { WalletButton, WalletModal } from '@/components/wallet';
import { layout } from '@/lib/layout';
import { config } from '@/config';
import { getNetworkBadge, type BadgeVariant } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className={`bg-background border-b border-border ${className}`}>
      <div className={layout.container}>
        <div className={layout.flexBetween + ' h-16'}>
          {/* Logo and Brand */}
          <div className={layout.inline('md')}>
            <div className={layout.inline('sm')}>
              <img src="/autonomys-icon-dark.svg" alt="Autonomys" className="h-8 w-8" />
              <span className="text-h4 text-foreground">Autonomys Staking</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3 py-2 text-label transition-colors ${
                  isActive
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/operators"
              className={({ isActive }) =>
                `px-3 py-2 text-label transition-colors ${
                  isActive
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              Operators
            </NavLink>
          </nav>

          {/* Right side controls */}
          <div className={layout.inline('md') + ' items-center gap-3'}>
            {/* Mobile menu button */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(prev => !prev)}
            >
              <svg
                className={`h-6 w-6 ${mobileOpen ? 'hidden' : 'block'}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`h-6 w-6 ${mobileOpen ? 'block' : 'hidden'}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Network badge hidden on very small screens to save space */}
            <div className="hidden sm:flex">
              {(() => {
                const netId = config.network.defaultNetworkId;
                const { label, variant } = getNetworkBadge(netId);
                return (
                  <Badge variant={variant as BadgeVariant} className="uppercase tracking-wide">
                    {label}
                  </Badge>
                );
              })()}
            </div>
            <WalletButton onOpenModal={() => setWalletModalOpen(true)} />
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        <div
          className={`${mobileOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'} md:hidden overflow-hidden transition-all duration-200 ease-out`}
        >
          <nav className="pt-2 pb-4 space-y-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-label ${
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
              onClick={() => setMobileOpen(false)}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/operators"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-label ${
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
              onClick={() => setMobileOpen(false)}
            >
              Operators
            </NavLink>
          </nav>
        </div>
      </div>

      <WalletModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </header>
  );
};
