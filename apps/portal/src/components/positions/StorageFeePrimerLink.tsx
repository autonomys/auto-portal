import React from 'react';
import { ExternalLink } from 'lucide-react';
import { STORAGE_FEE_FUNDS_PRIMER_URL } from '@/constants/staking';
import { cn } from '@/lib/utils';

interface StorageFeePrimerLinkProps {
  className?: string;
}

export const StorageFeePrimerLink: React.FC<StorageFeePrimerLinkProps> = ({ className }) => (
  <div className={cn('border-t border-gray-700/60 pt-1.5 mt-2', className)}>
    <a
      href={STORAGE_FEE_FUNDS_PRIMER_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[11px] text-primary-300 hover:text-primary-200 inline-flex items-center gap-1 group transition-colors"
    >
      <span>See a different staked balance in your wallet?</span>
      <ExternalLink className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
    </a>
  </div>
);
