import React from 'react';
import { Button } from '@/components/ui/button';

interface WalletInfo {
  extensionName: string;
  title: string;
  logo?: {
    src: string;
    alt: string;
  };
  installed: boolean;
  installUrl?: string;
}

interface WalletOptionProps {
  wallet: WalletInfo;
  onConnect: (extensionName: string) => void;
  disabled?: boolean;
}

export const WalletOption: React.FC<WalletOptionProps> = ({
  wallet,
  onConnect,
  disabled = false,
}) => {
  if (!wallet.installed) {
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center space-x-3">
          {wallet.logo && (
            <img src={wallet.logo.src} alt={wallet.logo.alt || wallet.title} className="w-8 h-8" />
          )}
          <div>
            <span className="font-medium">{wallet.title}</span>
            <p className="text-sm text-muted-foreground">Not installed</p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a
            href={wallet.installUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-[80px]"
          >
            Install
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
        disabled ? 'opacity-50' : 'hover:bg-accent/50'
      }`}
    >
      <div className="flex items-center space-x-3">
        {wallet.logo && (
          <img src={wallet.logo.src} alt={wallet.logo.alt || wallet.title} className="w-8 h-8" />
        )}
        <div>
          <span className="font-medium">{wallet.title}</span>
          <p className="text-sm text-muted-foreground">
            {disabled ? 'Please wait...' : 'Ready to connect'}
          </p>
        </div>
      </div>
      <Button
        onClick={() => onConnect(wallet.extensionName)}
        disabled={disabled}
        className="min-w-[80px]"
      >
        Connect
      </Button>
    </div>
  );
};
