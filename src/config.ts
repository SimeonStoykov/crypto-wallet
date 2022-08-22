const config = {
  addressInfoUrl: 'https://api.ethplorer.io/getAddressInfo/',
  ethBaseInfo: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  },
  ethMainnetChainId: 1,
  ethplorerApiKey: 'EK-w6XHX-GUTY5J9-qUqdh',
  ethTestNetsids: [3, 4, 42],
  infuraId: 'd35af9722b934a55b4d6b8896f06640b',
  initialData: { connectingWalletError: false, fetchTokensError: false, tokens: [] },
  nexoContractAddress: '0xB62132e35a6c13ee1EE0f84dC5d40bad8d815206'
};

export default config;
