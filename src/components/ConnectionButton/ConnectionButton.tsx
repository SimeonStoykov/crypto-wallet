import { useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

import { formatBigNumber, getTokenInfo, roundTo2Decimals } from '../../utils';
import { Provider, EthplorerTokenData, Data } from '../../types';
import config from '../../config';

const {
  addressInfoUrl,
  ethBaseInfo,
  ethMainnetChainId,
  ethplorerApiKey,
  ethTestNetsids,
  initialData,
  nexoContractAddress
} = config;

interface Props {
  data: Data;
  setData: any;
  web3Modal: Web3Modal;
}

function ConnectionButton({ data, setData, web3Modal }: Props) {
  const { account } = data;

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectWallet = async () => {
    try {
      const newData = {} as Data;
      const web3ModalInstance = await web3Modal.connect();
      const ethersProvider = new ethers.providers.Web3Provider(web3ModalInstance) as Provider;
      newData.provider = ethersProvider;
      newData.network = await ethersProvider.getNetwork();
      const [acc] = await ethersProvider.listAccounts();
      newData.account = acc;

      if (newData.network.chainId === ethMainnetChainId) {
        const addressInfoResp = await fetch(`${addressInfoUrl}${acc}?apiKey=${ethplorerApiKey}`);
        const { error, ETH, tokens } = await addressInfoResp.json();

        if (!error && ETH && tokens) {
          const ethInfo = {
            ...ethBaseInfo,
            balance: roundTo2Decimals(ETH.balance),
            totalSupply: roundTo2Decimals(ETH.price?.availableSupply)
          };
          const nexoInfo = await getTokenInfo(acc, nexoContractAddress, ethersProvider);
          const walletTokens = [ethInfo, nexoInfo];

          tokens.forEach(
            ({
              tokenInfo: { decimals, name, symbol, totalSupply },
              rawBalance
            }: EthplorerTokenData) => {
              const decimalNum = parseInt(decimals);
              walletTokens.push({
                balance: formatBigNumber(rawBalance, decimalNum),
                decimals: decimalNum,
                name,
                symbol,
                totalSupply: formatBigNumber(totalSupply, decimalNum)
              });
            }
          );

          newData.tokens = walletTokens;
        } else {
          newData.fetchTokensError = true;
        }
      } else if (ethTestNetsids.includes(newData.network?.chainId || 0)) {
        const ethBalanceBigNum = await ethersProvider.getBalance(acc);
        const formattedEthBalance = ethers.utils.formatEther(ethBalanceBigNum);
        const ethBalance = parseFloat(formattedEthBalance);
        newData.tokens = [{ ...ethBaseInfo, balance: ethBalance }];
      }

      setData(newData);
    } catch (err) {
      setData({ ...data, connectingWalletError: true });
    }
  };

  const disconnectWallet = () => {
    web3Modal.clearCachedProvider();
    setData(initialData);
  };

  return account ? (
    <button onClick={disconnectWallet}>Disconnect Wallet</button>
  ) : (
    <button onClick={connectWallet}>Connect Wallet</button>
  );
}

export default ConnectionButton;
