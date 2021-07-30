import { gql } from '@apollo/client'

export default gql`
   query ($platform: Platform!, $uri: String!) {
      launch(platform: $platform, uri: $uri)
   }
`
