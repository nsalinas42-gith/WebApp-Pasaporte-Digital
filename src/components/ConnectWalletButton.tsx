import React, { FC } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import '@solana/wallet-adapter-react-ui/styles.css';

export const ConnectWalletButton: FC = () => {
  return (
    <div className="connect-wallet-btn-container select-none">
      <WalletMultiButton 
        className="!bg-secondary hover:!bg-[#c7ffd3] !text-[#003732] !font-sans !font-black !text-xs !uppercase !tracking-wider !rounded-xl !py-3 !px-6 !transition-all !duration-300 hover:!scale-[1.02] active:!scale-[0.98] !shadow-[0_0_12px_rgba(26, 86, 219,0.15)]"
      />
    </div>
  );
};
