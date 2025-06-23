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
  isConnecting: boolean;
}

export const WalletOption: React.FC<WalletOptionProps> = ({ wallet, onConnect, isConnecting }) => {
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
        <Button variant="secondary" asChild>
          <a
            href={wallet.installUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1"
          >
            <span>Install</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex items-center space-x-3">
        {wallet.logo && (
          <img src={wallet.logo.src} alt={wallet.logo.alt || wallet.title} className="w-8 h-8" />
        )}
        <div>
          <span className="font-medium">{wallet.title}</span>
          <p className="text-sm text-muted-foreground">Ready to connect</p>
        </div>
      </div>
      <Button
        onClick={() => onConnect(wallet.extensionName)}
        disabled={isConnecting}
        className="min-w-[80px]"
      >
        {isConnecting ? 'Connecting...' : 'Connect'}
      </Button>
    </div>
  );
};
