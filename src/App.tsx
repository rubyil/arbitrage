import { ConnectWallet } from '@thirdweb-dev/react'
import { SelectToken, Pools } from './components';
import { useState } from 'react';
import { IToken } from './types/IToken';
import { IPool } from './types/IPool';
import { gql, useQuery } from '@apollo/client';


const GET_POOLS = gql`
    query 
    ($skip: Int)
    {
      pools( 
         first: 1000
         skip: $skip
         where: {
          token0Price_not: 0
          token1Price_not: 0
         }
        ) {
    id
    token1Price
    token0Price
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
  const [selectedToken, setSelectedToken] = useState<string>('')
  const [selectedPool, setSelectedPool] = useState<string>('')
  const [pools, setPools] = useState<IPool[]>([])
  const { data, loading, error } = useQuery(GET_POOLS
    , {
      variables: { skip: 0 },
      fetchPolicy: 'cache-and-network', // Used for first execution
    }
  )
  let tokens: IToken[] = []
  let poolsList: IPool[] = []
  const handleSelectToken = (id: string) => {
    setSelectedToken(id)
    poolsList = data.pools.filter((pool: IPool) => (pool.token0.id === id || pool.token1.id === id))
    console.log(poolsList)
    setPools(poolsList)
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
          align: 'start'
        }}
        btnTitle="Connect Wallet" />
      <SelectToken onSelectToken={(id) => handleSelectToken(id)} tokens={tokens} />
      <Pools pools={pools} />
    </>
  )
}


export default App 