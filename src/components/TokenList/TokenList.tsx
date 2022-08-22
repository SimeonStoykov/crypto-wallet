import { Token as TokenType } from '../../types';
import Token from '../Token/Token';
import './TokenList.css';

interface Props {
  fetchTokensError: boolean;
  tokens: TokenType[];
}

function TokenList({ fetchTokensError, tokens }: Props) {
  if (fetchTokensError) return <section>Error getting tokens!</section>;
  if (!tokens) return null;

  return (
    <ul>
      {tokens.map((data, index) => (
        <Token key={index} {...data} />
      ))}
    </ul>
  );
}

export default TokenList;
