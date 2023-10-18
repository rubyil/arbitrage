import React, { FunctionComponent } from 'react'
import { IToken } from '../types/IToken'


const SelectToken: FunctionComponent<{ onSelectToken: React.Dispatch<string>, tokens: IToken[] }> = ({ onSelectToken, tokens }) => {
    // const [tokens, setTokens] = useState<IToken[]>([])
    // setTokens(tokens)

    const handleSelectToken = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onSelectToken(e.target.value)
    }
    return (
        <>
            <select onChange={handleSelectToken}>
                <option value="">Select Token</option>
                {tokens.map((token: IToken) => (
                    <option key={token.id} value={token.id}>{token.symbol} - {token.name.substring(0, 10)}</option>
                ))}
            </select>
        </>
    )
}

export default SelectToken