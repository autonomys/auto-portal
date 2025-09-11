import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { WalletButton, WalletModal } from '@/components/wallet';
import { Button } from '@/components/ui/button';
import { layout } from '@/lib/layout';
import { config } from '@/config';
import { getNetworkBadge, type BadgeVariant } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 text-label transition-colors ${
      isActive
        ? 'text-foreground border-b-2 border-primary'
        : 'text-muted-foreground hover:text-foreground'
    }`;

  return (
    <header className={`bg-background border-b border-border ${className}`}>
      <div className={layout.container}>
        <div className={layout.flexBetween + ' h-16'}>
          {/* Logo and Brand */}
          <div className={layout.inline('sm')}>
            <img src="/autonomys-icon-dark.svg" alt="Autonomys" className="h-8 w-8" />
            <span className="text-h4 text-foreground hidden sm:inline">Autonomys Staking</span>
            <span className="text-h4 text-foreground sm:hidden">Autonomys</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/dashboard" className={navLinkClasses}>
              Dashboard
            </NavLink>
            <NavLink to="/operators" className={navLinkClasses}>
              Operators
            </NavLink>
          </nav>

          {/* Desktop Wallet Connection and Network Badge */}
          <div className="hidden md:flex items-center gap-3">
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

          {/* Mobile Menu Button and Wallet */}
          <div className="flex md:hidden items-center gap-2">
            {(() => {
              const netId = config.network.defaultNetworkId;
              const { label, variant } = getNetworkBadge(netId);
              return (
                <Badge variant={variant as BadgeVariant} className="uppercase tracking-wide text-xs px-2 py-1">
                  {label}
                </Badge>
              );
            })()}
            <WalletButton onOpenModal={() => setWalletModalOpen(true)} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="py-4 space-y-2">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `block px-4 py-2 text-label transition-colors ${
                    isActive
                      ? 'text-foreground bg-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/operators"
                className={({ isActive }) =>
                  `block px-4 py-2 text-label transition-colors ${
                    isActive
                      ? 'text-foreground bg-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Operators
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      <WalletModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </header>
  );
};
