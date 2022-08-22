import { ContractInterface, ethers } from 'ethers';
import config from './config';
import { Data, EthplorerTokenData, Provider } from './types';
import ABI from './ABI.json';

const { addressInfoUrl, ethBaseInfo, ethplorerApiKey, nexoContractAddress } = config;

export const formatBigNumber = (bigNumber: string, decimals: number) => {
  return roundTo2Decimals(parseFloat(ethers.utils.formatUnits(bigNumber, decimals)));
};

export const getTokenInfo = async (
  accountAddress: string,
  contractAddress: string,
  provider: Provider
) => {
  const tokenContract = new ethers.Contract(contractAddress, ABI as ContractInterface, provider);

  const name = await tokenContract.name();
  const symbol = await tokenContract.symbol();
  const decimals = await tokenContract.decimals();
  const totalSupplyBigNum = await tokenContract.totalSupply();
  const formattedTotalSupply = ethers.utils.formatUnits(totalSupplyBigNum, decimals);
  const totalSupply = parseFloat(formattedTotalSupply);
  const balanceBigNum = await tokenContract.balanceOf(accountAddress);
  const balance = parseFloat(ethers.utils.formatUnits(balanceBigNum, decimals));

  return { name, symbol, decimals, balance, totalSupply };
};

export const roundTo2Decimals = (num: number) => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export const getEthplorerData = async (account: string, provider: Provider) => {
  const data = {} as Data;
  const addressInfoResp = await fetch(`${addressInfoUrl}${account}?apiKey=${ethplorerApiKey}`);
  const { error, ETH, tokens } = await addressInfoResp.json();

  if (error) {
    data.fetchTokensError = true;
  } else {
    const ethInfo = {
      ...ethBaseInfo,
      balance: roundTo2Decimals(ETH.balance),
      totalSupply: roundTo2Decimals(ETH.price?.availableSupply)
    };
    const nexoInfo = await getTokenInfo(account, nexoContractAddress, provider);
    const walletTokens = [ethInfo, nexoInfo];

    tokens?.forEach(
      ({ tokenInfo: { decimals, name, symbol, totalSupply }, rawBalance }: EthplorerTokenData) => {
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

    data.tokens = walletTokens;
  }

  return data;
};
