import { useEffect, useState } from 'react';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

import { AccountsChangedEventHandler, ChainChangedEventHandler, Data } from './types';
import config from './config';
import ConnectionButton from './components/ConnectionButton/ConnectionButton';
import TokenList from './components/TokenList/TokenList';

import './App.css';

const { ethMainnetChainId, infuraId, initialData } = config;

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: { infuraId }
  }
};

const web3Modal = new Web3Modal({ cacheProvider: true, providerOptions });

function App() {
  const [data, setData] = useState<Data>(initialData);
  const { account, connectingWalletError, fetchTokensError, network, provider, tokens } = data;

  useEffect(() => {
    if (provider?.provider.isMetaMask) {
      provider.provider.on?.('chainChanged', handleChainChange);
      provider.provider.on?.('accountsChanged', handleAccountsChange);
    }

    return () => {
      if (provider?.provider?.isMetaMask) {
        provider.provider.removeListener?.('chainChanged', handleChainChange);
        provider.provider.removeListener?.('accountsChanged', handleAccountsChange);
      }
    };
  }, [provider]);

  const handleChainChange: ChainChangedEventHandler = () => {
    window.location.reload();
  };
  const handleAccountsChange: AccountsChangedEventHandler = ([newAccount]) => {
    setData((prevState) => ({ ...prevState, account: newAccount }));
  };

  return (
    <main>
      <h1>Crypto Wallet</h1>
      {network?.chainId && network.chainId !== ethMainnetChainId && (
        <p>You have not selected the Ethereum Mainnet! Please switch to it!</p>
      )}
      {account && (
        <section>
          Connected to {account}
          {network?.name && network.name !== 'unknown' && (
            <span> on the {network.name} network</span>
          )}
        </section>
      )}
      {connectingWalletError && <section>Error connecting wallet!</section>}
      <TokenList tokens={tokens} fetchTokensError={fetchTokensError} />
      <ConnectionButton data={data} setData={setData} web3Modal={web3Modal} />
    </main>
  );
}

export default App;
