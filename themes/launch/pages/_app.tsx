import '../styles/globals.css'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import type { AppProps } from 'next/app'

const client = new ApolloClient({
   uri: 'http://localhost:31348/graphql',
   cache: new InMemoryCache(),
})

function MyApp({ Component, pageProps }: AppProps) {
   return (
      <ApolloProvider client={client}>
         <Component {...pageProps} />
      </ApolloProvider>
   )
}
export default MyApp
