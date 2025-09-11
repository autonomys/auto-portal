import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { WalletButton, WalletModal } from '@/components/wallet';
import { layout } from '@/lib/layout';
import { config } from '@/config';
import { getNetworkBadge, type BadgeVariant } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { useThemeStore } from '@/stores/theme-store';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const isDarkMode = useThemeStore(s => s.isDarkMode);

  return (
    <header className={`bg-background border-b border-border ${className}`}>
      <div className={layout.container}>
        <div className={layout.flexBetween + ' h-16'}>
          {/* Logo and Brand */}
          <div className={layout.inline('md')}>
            <div className={layout.inline('sm')}>
              <img
                src={isDarkMode ? '/autonomys-icon-light.svg' : '/autonomys-icon-dark.svg'}
                alt="Autonomys"
                className="h-8 w-8"
              />
              <span className="text-h4 text-foreground">Autonomys Staking</span>
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

          {/* Wallet Connection, Theme, and Network Badge */}
          <div className={layout.inline('md') + ' items-center gap-3'}>
            {(() => {
              const netId = config.network.defaultNetworkId;
              const { label, variant } = getNetworkBadge(netId);
              return (
                <Badge variant={variant as BadgeVariant} className="uppercase tracking-wide">
                  {label}
                </Badge>
              );
            })()}
            <ThemeToggle />
            <WalletButton onOpenModal={() => setWalletModalOpen(true)} />
          </div>
        </div>
      </div>

      <WalletModal open={walletModalOpen} onOpenChange={setWalletModalOpen} />
    </header>
  );
};
