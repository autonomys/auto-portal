import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/use-wallet';
import { useBalance } from '@/hooks/use-balance';
import { shortenAddress } from '@/lib/utils';
import { formatAI3 } from '@/lib/formatting';
import { AddressDisplay } from './AddressDisplay';
import type { WalletAccount } from '@talismn/connect-wallets';

interface AccountDropdownProps {
  accounts: WalletAccount[];
  selectedAccount: WalletAccount;
  onSelectAccount: (address: string) => void;
  onDisconnect: () => void;
}

const AccountDropdown: React.FC<AccountDropdownProps> = ({
  accounts,
  selectedAccount,
  onSelectAccount,
  onDisconnect,
}) => (
  <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
    <div className="p-2">
      <div className="text-xs text-gray-500 mb-2">Select Account</div>
      {accounts.map((account: WalletAccount) => (
        <button
          key={account.address}
          onClick={() => onSelectAccount(account.address)}
          className={`w-full text-left px-2 py-1 rounded text-sm ${
            account.address === selectedAccount?.address
              ? 'bg-blue-50 text-blue-600'
              : 'hover:bg-gray-50'
          }`}
        >
          <AddressDisplay
            address={account.address}
            name={account.name}
            className="justify-start"
          />
        </button>
      ))}
      <div className="border-t mt-2 pt-2">
        <button
          onClick={onDisconnect}
          className="w-full text-left px-2 py-1 rounded text-sm text-red-600 hover:bg-red-50"
        >
          Disconnect
        </button>
      </div>
    </div>
  </div>
);

interface WalletButtonProps {
  onOpenModal?: () => void;
}

export const WalletButton: React.FC<WalletButtonProps> = ({ onOpenModal }) => {
  const {
    isConnected,
    isLoading,
    loadingType,
    selectedAccount,
    accounts,
    selectAccount,
    disconnectWallet,
  } = useWallet();

  const { balance } = useBalance();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleDisconnect = () => {
    disconnectWallet();
    setShowDropdown(false);
  };

  const handleSelectAccount = (address: string) => {
    selectAccount(address);
    setShowDropdown(false);
  };

  // Show loading state
  if (isLoading) {
    const loadingText = loadingType === 'initializing' ? 'Reconnecting...' : 'Connecting...';
    return (
      <Button disabled className="relative">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>{loadingText}</span>
        </div>
      </Button>
    );
  }

  if (isConnected && selectedAccount) {
    return (
      <div className="relative">
        <Button
          variant="secondary"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <AddressDisplay
            address={selectedAccount.address}
            name={selectedAccount.name}
            showCopy={false}
          />
          <span className="text-xs text-muted-foreground">
            {balance ? formatAI3(balance.free, 2) : '---'}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>

        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <AccountDropdown
              accounts={accounts}
              selectedAccount={selectedAccount}
              onSelectAccount={handleSelectAccount}
              onDisconnect={handleDisconnect}
            />
          </>
        )}
      </div>
    );
  }

  return <Button onClick={onOpenModal}>Connect Wallet</Button>;
};
