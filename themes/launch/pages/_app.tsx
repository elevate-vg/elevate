import '../styles/globals.css'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import type { AppProps } from 'next/app'

import { StateProvider } from '../components/StateContext'

const client = new ApolloClient({
   uri: 'http://192.168.1.214:31348/graphql',
   // uri: 'http://192.168.239.216:31348/graphql',
   // uri: 'http://localhost:31348/graphql',
   cache: new InMemoryCache(),
})

function MyApp({ Component, pageProps }: AppProps) {
   return (
      <ApolloProvider client={client}>
         <StateProvider>
            <Component {...pageProps} />
         </StateProvider>
      </ApolloProvider>
   )
}
export default MyApp
