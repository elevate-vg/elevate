/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useLazyQuery, useQuery, gql } from '@apollo/client'

const myQuery = gql`
   query {
      catalog(query: "") {
         __typename
         ... on Software {
            titles {
               name
               language
            }
            platforms
            locations {
               uri
            }
         }
      }
   }
`

const launchQuery = gql`
   query ($platform: Platform!, $uri: String!) {
      launch(platform: $platform, uri: $uri)
   }
`

export default function Home() {
   const { loading, error, data } = useQuery(myQuery)
   const [launch, { loading: launchLoading, data: launchData, variables: launchVariables }] =
      useLazyQuery<{ launch: number }>(launchQuery)

   if (loading) return null
   if (error) return <ul>{error}</ul>

   console.log({ pid: launchData?.launch, launchVariables })

   return (
      <ul>
         {data?.catalog.map((entry, i) => {
            return (
               <ul key={i}>
                  <li
                     onClick={() => {
                        launch({
                           variables: {
                              uri: entry?.locations?.[0]?.uri,
                              platform: entry?.platforms?.[0],
                           },
                        })
                     }}>
                     {entry?.titles?.[0]?.name}{' '}
                     {launchLoading &&
                        launchVariables.uri === entry?.locations?.[0]?.uri &&
                        'Loading..'}
                  </li>
               </ul>
            )
         })}
      </ul>
   )
}
