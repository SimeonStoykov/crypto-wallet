import { useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

import { getEthplorerData } from '../../utils';
import { Provider, Data } from '../../types';
import config from '../../config';

const { ethBaseInfo, ethMainnetChainId, ethTestNetsids, initialData } = config;

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
      let newData = {} as Data;
      const web3ModalInstance = await web3Modal.connect();
      const ethersProvider = new ethers.providers.Web3Provider(web3ModalInstance) as Provider;
      newData.provider = ethersProvider;
      newData.network = await ethersProvider.getNetwork();
      const [acc] = await ethersProvider.listAccounts();
      newData.account = acc;

      if (newData.network.chainId === ethMainnetChainId) {
        const ethplorerData = await getEthplorerData(acc, ethersProvider);
        newData = { ...newData, ...ethplorerData };
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
