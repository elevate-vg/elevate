import { gql } from '@apollo/client'

export default gql`
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
