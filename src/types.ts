import { Web3Provider, ExternalProvider, Network } from '@ethersproject/providers';

export type AccountsChangedEventHandler = (accounts: string[]) => void;
export type ChainChangedEventHandler = (chainId: string) => void;
type MetaMaskEventHandler = AccountsChangedEventHandler | ChainChangedEventHandler;

interface CustomExternalProvider extends ExternalProvider {
  on?: (event: string, handler: MetaMaskEventHandler) => void;
  removeListener?: (event: string, handler: MetaMaskEventHandler) => void;
}

export interface Provider extends Omit<Web3Provider, 'provider'> {
  provider: CustomExternalProvider;
}

export interface Data {
  account?: string;
  connectingWalletError: boolean;
  fetchTokensError: boolean;
  connectingWalletLoading: boolean;
  network?: Network;
  provider?: Provider;
  tokens: Token[];
}

export interface EthplorerTokenData {
  rawBalance: string;
  tokenInfo: { name: string; decimals: string; symbol: string; totalSupply: string };
}

export interface Token {
  balance: number;
  decimals: number;
  name: string;
  symbol: string;
  totalSupply?: number;
}
