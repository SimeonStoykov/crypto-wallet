import { Token as TokenType } from '../../types';

function Token({ balance, decimals, name, symbol, totalSupply }: TokenType) {
  return (
    <li>
      <span>
        {name}({symbol})
      </span>
      <span> Balance: {balance}</span>
      <span> Decimals: {decimals}</span>
      {totalSupply && <span> Total supply: {totalSupply}</span>}
    </li>
  );
}

export default Token;
