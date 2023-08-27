import { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import Favourites from './components/Favourites'
import {gql, useQuery} from '@apollo/client'

const ALL_AUTHORS = gql`
  query {
    allAuthors  {
      name
      born
      bookCount
    }
  }
`

const ALL_BOOKS = gql`
query {
  allBooks  {
    title
    published
    author {
      born
      name
    }
    genres
  }
}
`
const GIT_GENRES = gql
`query {
  allBooks  {
    genres
  }
}`

const App = (props) => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const [genres, setGenres] = useState([])
  const authors = useQuery(ALL_AUTHORS, {
    pollInterval:10000
  })
  const books = useQuery(ALL_BOOKS, {
    pollInterval:10000
  })

  const logout = () => {
    console.log("user-token at logout",localStorage.getItem('user-token'))
    localStorage.clear()
    setToken(null)
  }

  const booksPage = async () => {
    setPage('books')
    console.log(props.client)
    //let listOfGenreLists = books.map(a => a.genres)
      //console.log("app books", books)
      //let listOfGenreLists = books.map(a => a.genres)
      //let gnrs = [...new Set(listOfGenreLists.flat(1))]
      //setGenres([])
      //setGenres(gnrs)
  }


  

  return (
    <div>
      <Login token={token} setToken={setToken}/>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => booksPage()}>books</button>
        {token && <div>
          <button onClick={() => setPage('add')}>add book</button>
        </div>}
        {token && <div>
          <button onClick= {()=> setPage('favourites')}>favourites</button>
        
        </div>}

      <div>
        <button onClick={logout}>logout</button>
      </div>
      </div>

      <Authors show={page === 'authors'} authors={authors} />

      <Books show={page === 'books'} books={books} />

      <NewBook show={page === 'add'} allbooks={books} allbooks2={ALL_BOOKS} />
      { token &&
        <Favourites show={page==='favourites'} allbooks={books}/>
      }
    </div>
  )
}

export default App
