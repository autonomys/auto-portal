import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { shortenAddress } from '@/lib/utils';

interface AddressDisplayProps {
  address: string;
  name?: string;
  showCopy?: boolean;
  className?: string;
}

export const AddressDisplay: React.FC<AddressDisplayProps> = ({
  address,
  name,
  showCopy = true,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span title={address} className="cursor-help">
        {name || shortenAddress(address)}
      </span>
      {showCopy && (
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Copy address"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-600" />
          ) : (
            <Copy className="w-3 h-3 text-gray-500 hover:text-gray-700" />
          )}
        </button>
      )}
    </div>
  );
};
