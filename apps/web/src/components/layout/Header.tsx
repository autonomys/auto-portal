import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { WalletButton, WalletModal } from '@/components/wallet';
import { Button } from '@/components/ui/button';
import { layout } from '@/lib/layout';
import { config } from '@/config';
import { getNetworkBadge, type BadgeVariant } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={`bg-background border-b border-border ${className}`}>
      <div className={layout.container}>
        <div className={layout.flexBetween + ' h-16'}>
          {/* Logo and Brand */}
          <div className={layout.inline('md')}>
            <div className={layout.inline('sm')}>
              <img src="/autonomys-icon-dark.svg" alt="Autonomys" className="h-8 w-8" />
              <span className="text-h4 text-foreground hidden sm:inline">Autonomys Staking</span>
            </div>
          </div>

          {/* Navigation */}
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

          {/* Wallet Connection and Network Badge */}
          <div className={'flex items-center gap-2'}>
            <div className="hidden sm:block">
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
            <Button
              variant="ghost"
              size="icon"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden"
              onClick={() => setMobileMenuOpen(prev => !prev)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-16 inset-x-0 z-50 bg-background border-b border-border">
            <nav className="px-4 py-4 space-y-2">
              <NavLink
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-label ${
                    isActive
                      ? 'text-foreground bg-muted'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/operators"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-label ${
                    isActive
                      ? 'text-foreground bg-muted'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`
                }
              >
                Operators
              </NavLink>
              <div className="pt-3 flex items-center justify-between">
                {(() => {
                  const netId = config.network.defaultNetworkId;
                  const { label, variant } = getNetworkBadge(netId);
                  return (
                    <Badge variant={variant as BadgeVariant} className="uppercase tracking-wide">
                      {label}
                    </Badge>
                  );
                })()}
                <WalletButton onOpenModal={() => setWalletModalOpen(true)} />
              </div>
            </nav>
          </div>
        </div>
      )}

      <WalletModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </header>
  );
};
