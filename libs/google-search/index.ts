import qs from 'querystring'
import axios from 'axios'

const endpoint = 'https://www.googleapis.com'

const buildQuery = (id: string, apiKey: string) => (query: string) => {
   const result = {
      q: query.replace(/\s/g, '+'),
      cx: id,
      key: apiKey,
   }

   return qs.stringify(result)
}

const search = (id: string, apiKey: string) => (query: string) => {
   const url = `${endpoint}/customsearch/v1?${buildQuery(id, apiKey)(query)}`

   return axios(url, {
      responseType: 'json',
   }).then((res) => res.data)
}

export default search
