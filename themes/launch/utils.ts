import { useLazyQuery } from '@apollo/client'
import launchQueryGql from './queries/launchQuery.gql'

export const useLaunch = () => {
   const [launch] = useLazyQuery<{ launch: number }>(launchQueryGql, {
      fetchPolicy: 'no-cache',
      onCompleted(data) {
         console.log('invoked onCompleted', data)
      },
      onError(err) {
         console.log('onerror', err)
      },
   })

   const launchHandler = (launch) => (entry) =>
      launch({
         variables: {
            uri: entry?.locations?.[0]?.uri,
            platform: entry?.platforms?.[0],
         },
      })

   return launchHandler(launch)
}
