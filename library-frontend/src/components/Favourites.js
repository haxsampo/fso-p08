import {gql, useQuery} from '@apollo/client'


const me = gql`query Me {
  me {
    username
    favoriteGenre
  }
}`

const Favourites = (props) => {
  const token = localStorage.getItem('user-token')
  const {loading, error, data} = useQuery(me)

  if(loading) {
    return null
  }

  if (!loading && data) {
    console.log("me data:",data.me.favoriteGenre)
  }

  console.log("props books", props.allbooks.data.allBooks)
  const books = props.allbooks.data.allBooks
  const fbooks = books.filter((b) => b.genres.includes(data.me.favoriteGenre))
  console.log(fbooks)
  return(
    <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {fbooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
  )
}

export default Favourites