import { Token as TokenType } from '../../types';
import './Token.css';

function Token({ balance, decimals, name, symbol, totalSupply }: TokenType) {
  return (
    <li className="token-card">
      <p className="token-name">
        {name}({symbol})
      </p>
      <p> Balance: {balance}</p>
      <p> Decimals: {decimals}</p>
      {totalSupply && <p className="token-total-supply"> Total supply: {totalSupply}</p>}
    </li>
  );
}

export default Token;
