# 💳 Feature: Wallet Balance Integration & UX Improvements

**Priority:** High  
**Type:** Frontend Integration + UX Enhancement  
**Prerequisites:** ✅ Wallet connection system (already complete)

---

## 📋 Summary

Integrate connected wallet balance data into dashboard and staking form, while improving wallet display with copyable address and full address on hover.

**Current State:**

- Dashboard uses mock balance data
- Staking form shows hardcoded `DEFAULT_BALANCE`
- Wallet button only shows account name

  **Target State:**

- Dashboard displays real wallet balance from RPC
- Staking form shows actual available balance
- Enhanced wallet button with copyable address and improved UX

---

## 👤 User Story

> **As a** connected wallet user  
> **I want to** see my real balance in the dashboard and staking form, with an improved wallet display  
> **So that** I can make informed staking decisions and easily manage my wallet connection

---

## ✅ Acceptance Criteria

### **Real Balance Integration**

- [ ] **Dashboard balance cards** show actual wallet balance via RPC calls
- [ ] **Staking form** displays real available balance instead of mock data
- [ ] **Balance auto-refresh** every 30 seconds when wallet connected
- [ ] **Balance loading states** during RPC calls
- [ ] **Error handling** when balance fetch fails

### **Enhanced Wallet Display**

- [ ] **Full address on hover** - tooltip shows complete address
- [ ] **Copyable address** - click to copy address to clipboard
- [ ] **Copy feedback** - visual confirmation when address copied
- [ ] **Balance display** in wallet button (abbreviated format)
- [ ] **Responsive design** - works on mobile and desktop

### **Dashboard Integration**

- [ ] **Available Balance card** shows actual free balance
- [ ] **Total Balance card** shows free + reserved balance
- [ ] **Auto-update** when wallet account changes
- [ ] **Disconnected state** shows appropriate placeholder

---

## 🏗️ Technical Requirements

### **New Components to Create**

```
src/components/wallet/
└── AddressDisplay.tsx         # Copyable address with hover tooltip

src/services/
└── balance-service.ts         # RPC balance fetching

src/hooks/
└── use-balance.ts            # Balance fetching with auto-refresh
```

### **Files to Modify**

```
src/components/wallet/wallet-button.tsx    # Add balance display & address UX
src/components/staking/StakingForm.tsx     # Replace mock balance
src/pages/StakingPage.tsx                  # Dashboard balance integration
```

### **Package Dependencies**

```bash
# Already available
@autonomys/auto-consensus  # For balance() calls
@autonomys/auto-utils      # For RPC connection
```

---

## 🔧 Implementation Details

### **1. Balance Service (Real RPC Data)**

```typescript
// src/services/balance-service.ts
import { activate } from '@autonomys/auto-utils';
import { balance } from '@autonomys/auto-consensus';

export const fetchWalletBalance = async (
  address: string,
): Promise<{
  free: string;
  reserved: string;
  total: string;
}> => {
  const api = await activate({ networkId: 'taurus' });

  try {
    const balanceData = await balance(api, address);

    return {
      free: balanceData.free,
      reserved: balanceData.reserved,
      total: (BigInt(balanceData.free) + BigInt(balanceData.reserved)).toString(),
    };
  } finally {
    await api.disconnect();
  }
};
```

### **2. Enhanced Wallet Button**

```typescript
// Update wallet-button.tsx
import { AddressDisplay } from './AddressDisplay';
import { useBalance } from '@/hooks/use-balance';
import { formatAI3 } from '@/utils/unit-conversion';

// In connected state:
const { balance } = useBalance();

<Button variant="secondary" onClick={() => setShowDropdown(!showDropdown)}>
  <div className="w-2 h-2 bg-green-500 rounded-full" />
  <AddressDisplay
    address={selectedAccount.address}
    name={selectedAccount.name}
  />
  <span className="text-xs text-muted-foreground">
    {balance ? formatAI3(balance.free, 2) : '---'} AI3
  </span>
  <ChevronDown className="w-4 h-4" />
</Button>
```

### **3. Copyable Address Component**

```typescript
// src/components/wallet/AddressDisplay.tsx
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { shortenAddress } from '@/lib/utils';

interface AddressDisplayProps {
  address: string;
  name?: string;
  showCopy?: boolean;
}

export const AddressDisplay: React.FC<AddressDisplayProps> = ({
  address,
  name,
  showCopy = true
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center space-x-2">
      <span
        title={address}
        className="cursor-help"
      >
        {name || shortenAddress(address)}
      </span>
      {showCopy && (
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-gray-100 rounded"
          title="Copy address"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-600" />
          ) : (
            <Copy className="w-3 h-3 text-gray-500" />
          )}
        </button>
      )}
    </div>
  );
};
```

### **4. Balance Hook with Auto-refresh**

```typescript
// src/hooks/use-balance.ts
import { useState, useEffect } from 'react';
import { useWallet } from './use-wallet';
import { fetchWalletBalance } from '@/services/balance-service';

export const useBalance = (refreshInterval = 30000) => {
  const { isConnected, selectedAccount } = useWallet();
  const [balance, setBalance] = useState<{
    free: string;
    reserved: string;
    total: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!isConnected || !selectedAccount) {
      setBalance(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const balanceData = await fetchWalletBalance(selectedAccount.address);
      setBalance(balanceData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and account change
  useEffect(() => {
    fetchBalance();
  }, [isConnected, selectedAccount?.address]);

  // Auto-refresh
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(fetchBalance, refreshInterval);
    return () => clearInterval(interval);
  }, [isConnected, refreshInterval]);

  return { balance, loading, error, refetch: fetchBalance };
};
```

### **5. Updated Staking Form**

```typescript
// Update StakingForm.tsx - replace mock balance section
import { useBalance } from '@/hooks/use-balance';
import { formatAI3 } from '@/utils/unit-conversion';

const StakingForm: React.FC<StakingFormProps> = ({ operator, onCancel, onSubmit }) => {
  const { balance, loading: balanceLoading } = useBalance();

  // Replace existing balance display:
  <div className="p-4 bg-accent/10 rounded-lg">
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-muted-foreground font-sans">
        Available Balance
      </span>
      <span className="text-lg font-mono font-semibold text-foreground">
        {balanceLoading ? (
          <span className="animate-pulse">Loading...</span>
        ) : balance ? (
          `${formatAI3(balance.free)} AI3`
        ) : (
          'Connect wallet'
        )}
      </span>
    </div>
  </div>
```

---

## 🔄 Dashboard Integration

### **Updated Dashboard Cards**

```typescript
// In dashboard/StakingPage.tsx - update with real balance data
const { balance } = useBalance();

// Available Balance Card - Real wallet balance
{
  value: balance ? formatAI3(balance.free) : '---',
  label: 'Available Balance',
  subtitle: 'Ready to stake',
}

// Total Balance Card - Free + Reserved balance
{
  value: balance ? formatAI3(balance.total) : '---',
  label: 'Total Balance',
  subtitle: 'Free + Reserved',
}
```

---

## 🧪 Testing Requirements

### **Unit Tests**

- [ ] Balance service RPC calls
- [ ] Address display component
- [ ] Copy functionality
- [ ] Balance hook auto-refresh logic
- [ ] Unit conversion functions

### **Integration Tests**

- [ ] Wallet connection + balance fetch
- [ ] Balance updates on account change
- [ ] Error handling for failed RPC calls
- [ ] Dashboard integration with real balance data

### **Manual Testing**

- [ ] Connect wallet → balance shows in dashboard and staking form
- [ ] Wallet button → displays balance
- [ ] Hover address → full address tooltip appears
- [ ] Click copy → address copied to clipboard
- [ ] Switch accounts → balance updates
- [ ] Disconnect → UI shows appropriate states

---

## 🎯 Definition of Done

- [ ] **Real balance data** displayed in dashboard and staking form
- [ ] **Enhanced wallet UX** with copyable address and hover tooltip
- [ ] **Auto-refresh balance** every 30 seconds
- [ ] **Loading and error states** properly handled for balance fetching
- [ ] **Mobile responsive** design maintained
- [ ] **No breaking changes** to existing wallet functionality
- [ ] **Unit tests passing** for all new components and services
- [ ] **Manual testing completed** across different wallet types

---

## 📚 References

- **[Dashboard Requirements](../staking-data/dashboard.md)** - Data specifications
- **[Current Wallet Implementation](../../apps/web/src/components/wallet/)** - Existing code
- **[Auto SDK Balance API](https://develop.autonomys.xyz/sdk/auto-consensus#balance)** - RPC documentation

---

_This user story bridges mock data with real wallet integration while enhancing user experience._
