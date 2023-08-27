import {gql, useQuery} from '@apollo/client'


const b = `query Me {
  me {
    username
    favoriteGenre
  }
}`

const Favourites = (props) => {
  return(
    <p>Favourites</p>
  )
}

export default Favourites