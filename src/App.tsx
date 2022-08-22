import { useCallback, useEffect, useState } from 'react';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

import { AccountsChangedEventHandler, ChainChangedEventHandler, Data } from './types';
import config from './config';
import { getEthplorerData } from './utils';
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
  const { account, fetchTokensError, network, provider, tokens, connectingWalletLoading } = data;

  const handleChainChange: ChainChangedEventHandler = useCallback(() => {
    window.location.reload();
  }, []);

  const handleAccountsChange: AccountsChangedEventHandler = useCallback(
    async ([newAccount]) => {
      if (provider) {
        const ethplorerData = await getEthplorerData(newAccount, provider);
        setData({ ...data, account: newAccount, ...ethplorerData });
      }
    },
    [data, provider]
  );

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
  }, [provider, handleChainChange, handleAccountsChange]);

  return (
    <main>
      <h1>Crypto Wallet</h1>
      {connectingWalletLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          {network?.chainId && network.chainId !== ethMainnetChainId && (
            <p>You have not selected the Ethereum Mainnet! Please switch to it!</p>
          )}
          {account && (
            <section>
              Connected to <strong>{account}</strong>
              {network?.name && network.name !== 'unknown' && (
                <span> on the {network.name} network</span>
              )}
            </section>
          )}
          <TokenList tokens={tokens} fetchTokensError={fetchTokensError} />
        </>
      )}
      <ConnectionButton data={data} setData={setData} web3Modal={web3Modal} />
    </main>
  );
}

export default App;
