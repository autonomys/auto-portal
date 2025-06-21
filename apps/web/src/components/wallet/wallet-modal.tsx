import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { web3Enable } from "@polkadot/extension-dapp";

interface WalletInfo {
  name: string;
  title: string;
  icon?: string;
}

export const WalletModal: React.FC<{
  open: boolean;
  onOpenChange: (v: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const { connect, error } = useWallet();
  const [wallets, setWallets] = useState<WalletInfo[]>([]);

  useEffect(() => {
    if (open) {
      (async () => {
        const injected = await web3Enable("Autonomys Staking");
        const detected = injected.map((ext) => ({
          name: ext.name,
          title: ext.name,
        }));
        setWallets(detected);
      })();
    }
  }, [open]);

  const handleConnect = async (id: string) => {
    await connect(id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Select Wallet</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {wallets.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No compatible wallets detected.
            </p>
          )}
          {wallets.map((w) => (
            <Button
              key={w.name}
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleConnect(w.name)}
            >
              {w.title}
            </Button>
          ))}
          {error && (
            <p className="text-sm text-destructive-foreground">{error}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
