import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { WalletModal } from "@/components/wallet/wallet-modal";
import { useWallet } from "@/hooks/use-wallet";
import { shortenAddress } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  const { isConnected, account, disconnect } = useWallet();
  const [open, setOpen] = useState(false);

  const handleButton = () => {
    if (isConnected) {
      disconnect();
    } else {
      setOpen(true);
    }
  };

  return (
    <header className={`bg-background border-b border-border ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img
                src="/autonomys-icon-dark.svg"
                alt="Autonomys"
                className="h-8 w-8"
              />
              <span className="text-xl font-serif font-semibold text-foreground">
                Autonomys Staking
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#dashboard"
              className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium transition-colors font-sans"
            >
              Dashboard
            </a>
            <a
              href="#operators"
              className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium transition-colors font-sans"
            >
              Operators
            </a>
            <a
              href="#portfolio"
              className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium transition-colors font-sans"
            >
              Portfolio
            </a>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            <Button className="font-sans" onClick={handleButton}>
              {isConnected
                ? shortenAddress(account?.address)
                : "Connect Wallet"}
            </Button>
          </div>
        </div>
      </div>
      <WalletModal open={open} onOpenChange={setOpen} />
    </header>
  );
};
