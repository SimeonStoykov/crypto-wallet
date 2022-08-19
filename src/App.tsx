import { useState, useEffect } from 'react';
import './App.css';

import Web3Modal from 'web3modal';
import { ContractInterface, ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import ABI from './ABI.json';
import { Web3Provider, Network, ExternalProvider } from '@ethersproject/providers';

type AccountsChangedEventHandler = (accounts: string[]) => void;
type ChainChangedEventHandler = (chainId: string) => void;
type MetaMaskEventHandler = AccountsChangedEventHandler | ChainChangedEventHandler;

interface CustomExternalProvider extends ExternalProvider {
  on?: (event: string, handler: MetaMaskEventHandler) => void;
  removeListener?: (event: string, handler: MetaMaskEventHandler) => void;
}

interface Provider extends Omit<Web3Provider, 'provider'> {
  provider: CustomExternalProvider;
}

interface Token {
  name: string;
  balance: number;
  decimals: number;
  symbol: string;
  totalSupply: number;
}

const ethMainnetChainId = 1;

const infuraId = 'd35af9722b934a55b4d6b8896f06640b';

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: { infuraId }
  }
};

const getAddressInfoUrl = `https://api.ethplorer.io/getAddressInfo/`;

const web3Modal = new Web3Modal({ cacheProvider: true, providerOptions });
const nexoContractAddress = '0xB62132e35a6c13ee1EE0f84dC5d40bad8d815206';

function App() {
  const [provider, setProvider] = useState<Provider>();
  const [account, setAccount] = useState('');
  const [network, setNetwork] = useState<Network>();
  const [tokens, setTokens] = useState<Token[]>();

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }

    return () => {
      if (provider?.provider?.isMetaMask) {
        provider.provider.removeListener?.('chainChanged', handleChainChange);
        provider.provider.removeListener?.('accountsChanged', handleAccountsChange);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChainChange: ChainChangedEventHandler = () => {
    window.location.reload();
  };
  const handleAccountsChange: AccountsChangedEventHandler = ([newAccount]) => {
    setAccount(newAccount);
  };

  async function connectWallet() {
    try {
      const web3ModalInstance = await web3Modal.connect();
      const ethersProvider = new ethers.providers.Web3Provider(web3ModalInstance) as Provider;

      const networkInfo = await ethersProvider.getNetwork();
      setNetwork(networkInfo);

      const [currAccount] = await ethersProvider.listAccounts();
      if (currAccount) {
        setAccount(currAccount);

        const ethBalanceBigNum = await ethersProvider.getBalance(currAccount);
        const formattedEthBalance = ethers.utils.formatEther(ethBalanceBigNum);
        const ethBalance = parseFloat(formattedEthBalance);

        const walletTokens: Token[] = [
          {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
            balance: ethBalance,
            totalSupply: 0
          }
        ];

        if (networkInfo.chainId === ethMainnetChainId) {
          const nexoContract = new ethers.Contract(
            nexoContractAddress,
            ABI as ContractInterface,
            ethersProvider
          );

          const nexoSymbol = await nexoContract.symbol();
          const nexoDecimals = await nexoContract.decimals();
          const nexoTotalSupplyBigNum = await nexoContract.totalSupply();
          const formattedNexoTotalSupply = ethers.utils.formatUnits(
            nexoTotalSupplyBigNum,
            nexoDecimals
          );
          const nexoTotalSupply = parseFloat(formattedNexoTotalSupply);
          const nexoBalanceBigNum = await nexoContract.balanceOf(currAccount);
          const nexoBalance = parseFloat(ethers.utils.formatUnits(nexoBalanceBigNum, nexoDecimals));

          walletTokens.push({
            name: 'Nexo',
            symbol: nexoSymbol,
            decimals: nexoDecimals,
            balance: nexoBalance,
            totalSupply: nexoTotalSupply
          });

          const addressInfoResp = await fetch(`${getAddressInfoUrl}${currAccount}?apiKey=freekey`);
          const otherTokensInfo = await addressInfoResp.json();
          console.log({ otherTokensInfo });

          otherTokensInfo.tokens.forEach(
            ({ tokenInfo: { name, decimals, symbol, totalSupply, holdersCount } }: any) => {
              walletTokens.push({
                name,
                symbol,
                decimals: parseInt(decimals),
                balance: holdersCount,
                totalSupply: Number(totalSupply)
              });
            }
          );
        }

        setTokens(walletTokens);
      }

      // Handle chain and account changes in MetaMask
      if (ethersProvider.provider.isMetaMask) {
        ethersProvider.provider.on?.('chainChanged', handleChainChange);
        ethersProvider.provider.on?.('accountsChanged', handleAccountsChange);
      }

      setProvider(ethersProvider);
    } catch (err) {
      console.log(err);
    }
  }

  const disconnect = () => {
    web3Modal.clearCachedProvider();
    refreshState();
  };

  const refreshState = () => {
    setProvider(undefined);
    setAccount('');
    setNetwork(undefined);
  };

  return (
    <div>
      <h1>Crypto Wallet</h1>
      {account ? (
        <>
          <p>{network?.name} Network</p>
          <p>Connected to {account}</p>
          <button onClick={disconnect}>Disconnect</button>
        </>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
      {tokens?.map(({ name, balance, symbol }, index) => {
        return (
          <p key={index}>
            <span>
              {name}({symbol})
            </span>
            <span> Balance: {balance}</span>
          </p>
        );
      })}
      {network?.chainId && network.chainId !== ethMainnetChainId && (
        <p>You have not selected the Ethereum Mainnet! Please switch to it!</p>
      )}
    </div>
  );
}

export default App;
