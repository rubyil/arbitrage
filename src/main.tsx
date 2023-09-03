import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { loadDevMessages, loadErrorMessages } from '@apollo/client/dev';
import { ethers } from 'ethers';
import { ThirdwebProvider } from '@thirdweb-dev/react'

const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  cache: new InMemoryCache(),
})
loadDevMessages();
loadErrorMessages();
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <ThirdwebProvider
        activeChain={1}
        clientId='434d7553864d9dc9593a2f01d03c080a'
        signer={new ethers.providers.Web3Provider(window.ethereum).getSigner()}
      >
        <App />
      </ThirdwebProvider >
    </ApolloProvider>
  </React.StrictMode>,
)
