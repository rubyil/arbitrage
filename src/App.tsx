import { ConnectWallet, ThirdwebSDK, useConnectedWallet, useWallet, walletConnect } from '@thirdweb-dev/react'
import { SelectToken, Pools } from './components';
import { useState } from 'react';
import { IToken } from './types/IToken';
import { IPool } from './types/IPool';
import { gql, useQuery } from '@apollo/client';
import Amount from './components/Amount';
import { getPriceByUSD } from './utilities/PriceFeed'

const GET_POOLS = gql`
    query 
    ($skip: Int)
    {
      pools( 
         first: 1000
         skip: $skip
         where: {
liquidity_gt: 0
          totalValueLockedETH_gt: 0
          totalValueLockedToken0_gt: 0
          totalValueLockedToken1_gt: 0
          token0Price_not: 0
          token1Price_not: 0
          
         }
        ) {
    id
    token1Price
    token0Price
    feeTier
    tick
    liquidity
    sqrtPrice
    token0 {
      decimals
      id
      name
      symbol
    }
    token1 {
      decimals
      id
      name
      symbol
    }
    }
  }`
const getTokens = (pools: IPool[]) => {
  const allTokens: IToken[] = []
  pools.forEach((pool: IPool) => {
    allTokens.push(pool.token0)
    allTokens.push(pool.token1)
  })
  const uniqueTokens = allTokens.filter((token, index, self) =>
    index === self.findIndex((t) => (
      t.id === token.id
    ))
  )
  return uniqueTokens.sort((a, b) => a.symbol.localeCompare(b.symbol))
}

function App() {
  const wallet = useWallet()
  const [selectedToken, setSelectedToken] = useState<string>('')
  const [balance, setBalance] = useState<number>(0)
  const [selectedPool, setSelectedPool] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [pools, setPools] = useState<IPool[]>([])
  const [priceByUSD, setPriceByUSD] = useState<number>(0)
  const { data, loading, error } = useQuery(GET_POOLS
    , {
      variables: { skip: 0 },
      fetchPolicy: 'cache-first' // Used for first execution
    }
  )
  let tokens: IToken[] = []
  let poolsList: IPool[] = []
  const handleSelectToken = (id: string) => {
    wallet?.getBalance(id).then(a => setBalance(Number(a.value) / 10 ** a.decimals))
    setSelectedToken(id)
    poolsList = data.pools.filter((pool: IPool) => (pool.token0.id === id || pool.token1.id === id))
    setPools(poolsList)
    getPriceByUSD(id).then(res => {
      setPriceByUSD(res)
    }).catch(e => {
      console.info(`no data for ${tokens.find(i => i.id === id)?.symbol}`)
    })
  }
  const handleSetAmount = (amount: number) => {
    setAmount(amount)
  }

  if (data) {
    tokens = getTokens(data.pools)
  }
  if (error) return <p>Error :(</p>
  if (loading) return <p>Loading...</p>
  return (
    <>
      <ConnectWallet theme="light"
        dropdownPosition={{
          side: 'top',
          align: 'end'
        }}
        btnTitle="Connect Wallet" />
      <Amount onSetAmount={(amount) => handleSetAmount(amount)} balance={balance} />
      <div>
        <p>Balance: {balance} ({(priceByUSD * balance).toFixed(2)} USD)</p>
      </div>
      <SelectToken onSelectToken={(id) => handleSelectToken(id)} tokens={tokens} />
      <Pools pools={pools} amount={amount} />
    </>
  )
}


export default App 