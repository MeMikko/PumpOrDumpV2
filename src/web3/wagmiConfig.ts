import { farcasterMiniApp, baseAccount } from '@farcaster/miniapp-wagmi-connector';
import type { Connector } from 'wagmi';
import { createConfig, http } from 'wagmi';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';
import { env } from '../lib/env';
import { farcasterSDK } from '../identity/farcaster';
import { primaryChain, supportedChains } from './chains';

const walletConnectConnector = env.walletConnectProjectId
  ? walletConnect({
      projectId: env.walletConnectProjectId,
      showQrModal: true
    })
  : undefined;

const connectors: Connector[] = [
  farcasterMiniApp({ sdk: farcasterSDK }),
  baseAccount({ sdk: farcasterSDK }),
  injected({ target: 'metaMask', shimDisconnect: true }),
  coinbaseWallet({ appName: env.coinbaseAppName })
].concat(walletConnectConnector ? [walletConnectConnector] : []);

export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors,
  transports: {
    [primaryChain.id]: http()
  },
  ssr: true
});
