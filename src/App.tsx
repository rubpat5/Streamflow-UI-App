import { clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    LedgerWalletAdapter,
    PhantomWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {ConnectionProvider, WalletProvider} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { useMemo } from 'react';
import { Container } from './components/Container.tsx';

import './App.css';

// import the styles
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
	// you can use Mainnet, Devnet or Testnet here
    const solNetwork = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(solNetwork), [solNetwork]);
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
        ],
        [solNetwork]
    );

    return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div className="App">
              <Container />
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
}

export default App;
