import {gql, useQuery} from '@apollo/client'
import { useState, useEffect } from 'react'

const fss = gql`
  query GenreBooks($genre: String!) {
    allBooks(genre: $genre) {
      title
      author {
        name
      }
      published
    }
  }
`

const Books = (props) => {
  const [genres, setGenres] = useState([])
  const [chosenGenre, setChosenGenre] = useState('')
  //const [genreBooks, setGenreBooks] = useState('')
 /*  const [queryResult, setQueryResult] = useState({
    loading: true,
    error: null,
    data: null
  }) */
  const [all, setAll] = useState(true)

  const { loading, error, data } = useQuery(fss, {
    variables: { genre: chosenGenre },
    skip: !chosenGenre,
  })

  if (!props.show) {
    return null
  }
  if (props.books.loading) {
    return null
  }

  const books = props.books.data.allBooks
  
  let listOfGenreLists = books.map(a => a.genres)
  let gnrs = [...new Set(listOfGenreLists.flat(1))]
  if (gnrs.length != genres.length) {
    setGenres([])
  }
  if (genres.length === 0) {
    setGenres(gnrs)
  }
  //console.log("kakka",loading, error, data)
  console.log("data:", data, typeof(data))
  if(!loading && data) {
    data.allBooks.map((b) => console.log(b.title))
  }
  //console.log("Books books",books)

  const chooseGenre = (genre) => {
    setChosenGenre(genre)
    console.log("chose genre:", chosenGenre)
    setAll(false)
  }

  const resetToAllGenres = () => {
    setAll(true)
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {all && books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table>
        <tbody>
        {!all && data && <div>
          {data.allBooks.map((b) => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
      </div>}
        </tbody>
      </table>

      <div>
        {genres.map((g) => (
          <button onClick={() => chooseGenre(g)}>{g}</button>
        ))}
      </div>
      <div>
        <button onClick={() => resetToAllGenres()}>all genres</button>
      </div>

    </div>
  )
}
//<button onClick={() => setPage('add')}>add book</button>
export default Books
