import { ContractInterface, ethers } from 'ethers';
import { Provider } from './types';
import ABI from './ABI.json';

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
