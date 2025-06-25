export const SUPPORTED_WALLET_EXTENSIONS = [
  'talisman', // Talisman
  'subwallet-js', // SubWallet
  'polkadot-js', // Polkadot.js
] as const;

export const DAPP_NAME = 'Autonomys Staking';

export const WALLET_STORAGE_KEY = 'autonomys-wallet-preferences';

export const CONNECTION_TIMEOUT = 30000; // 30 seconds

export const WALLET_INSTALL_URLS = {
  talisman:
    'https://chrome.google.com/webstore/detail/talisman-polkadot-wallet/fijngjgcjhjmmpcmkeiomlglpeiijkld',
  'subwallet-js':
    'https://chrome.google.com/webstore/detail/subwallet-polkadot-extens/onhogfjeacnfoofkfgppdlbmlmnplgbn',
  'polkadot-js':
    'https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd',
} as const;
