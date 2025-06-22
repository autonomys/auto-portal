import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { WalletOption } from './wallet-option';
import { useWallet } from '@/hooks/use-wallet';
import { WALLET_INSTALL_URLS } from '@/constants/wallets';

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ open, onOpenChange }) => {
  const { 
    availableWallets, 
    connectWallet, 
    isConnecting, 
    connectionError,
    clearError 
  } = useWallet();

  const handleConnect = async (extensionName: string) => {
    try {
      clearError();
      await connectWallet(extensionName);
      onOpenChange(false);
    } catch (error) {
      // Error is already handled by the store
      console.error('Connection failed:', error);
    }
  };

  // Transform wallet data for WalletOption component
  const walletOptions = availableWallets.map(wallet => ({
    extensionName: wallet.extensionName,
    title: wallet.title,
    logo: wallet.logo ? {
      src: wallet.logo.src,
      alt: wallet.logo.alt || wallet.title
    } : undefined,
    installed: wallet.installed,
    installUrl: WALLET_INSTALL_URLS[wallet.extensionName as keyof typeof WALLET_INSTALL_URLS]
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {connectionError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex justify-between items-start">
                <span>{connectionError}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="h-auto p-0 text-red-600 hover:text-red-700"
                >
                  ×
                </Button>
              </div>
            </div>
          )}

          {walletOptions.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p className="mb-4">No compatible wallets detected.</p>
              <p className="text-sm">
                Please install one of the supported wallet extensions:
              </p>
              <div className="mt-4 space-y-2">
                {Object.entries(WALLET_INSTALL_URLS).map(([name, url]) => (
                  <Button 
                    key={name} 
                    variant="outline" 
                    size="sm" 
                    asChild
                    className="block"
                  >
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      Install {name.charAt(0).toUpperCase() + name.slice(1)}
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {walletOptions.map((wallet) => (
            <WalletOption
              key={wallet.extensionName}
              wallet={wallet}
              onConnect={handleConnect}
              isConnecting={isConnecting}
            />
          ))}

          {walletOptions.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                By connecting a wallet, you agree to the Terms of Service and acknowledge 
                that you have read and understand the Privacy Policy.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
