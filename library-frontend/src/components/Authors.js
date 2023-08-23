
import { useState } from 'react'
import {gql, useMutation} from '@apollo/client'



export const EDIT_AUTHOR = gql`
  mutation editAuthor(
    $name: String!, $setBornTo: Int) {
    editAuthor(
      name: $name, 
      setBornTo: $setBornTo
    ) {
      name
      born
    }
  }
`


const Authors = (props) => {
  const [author, setAuthor] = useState('')
  const [by, setBy] = useState('')
  const [mutAuthor] = useMutation(EDIT_AUTHOR)
  const [valikko, setValikko] = useState('')
  //console.log("props.authors",props.authors)
  if (!props.show) {
    return null
  }
  if (props.authors.loading) {
    return null
  }
  //console.log("props.authors.data",props.authors.data.allAuthors)
  const authors = props.authors.data.allAuthors

  const submit = async (event) => {
    
    event.preventDefault()
    var ne = parseInt(by)
    console.log("edit", author, " ", ne)
    var x = mutAuthor({variables: {
      name: valikko,
      setBornTo: ne
    }})
    console.log("x:",x)
  }

  const handleChange = (event) => {
    setValikko(event.target.value)
  }

  //<input value={author} onChange={({target}) => setAuthor(target.value)} />
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p></p>
      <form onSubmit={submit}>
        set author birthyear
      <select value={valikko} onChange={handleChange}>
        {
          authors.map((a)=> (
            <option value={a.name}>{a.name}</option>
          ))
        }
      </select>
      <div>
        <p></p>
        birthyear
        <input value={by} onChange={({target})=> setBy(target.value)} />
      </div>
      <button type="submit">ffshhssgg</button>
      </form>
    </div>
  )
}

export default Authors
