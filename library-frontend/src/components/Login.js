import { useState, useEffect } from 'react'
import {gql, useMutation} from '@apollo/client'

const GQL_LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

const Login = (props) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] =useState('')
  const [login, result] = useMutation(GQL_LOGIN, {
    onError: (error) => {
      console.log(error)
    }
  })

  useEffect(() => {
    if ( result.data ) {
      console.log("RESULT.data.login",result.data.login)
      const token = result.data.login.value
      props.setToken(token)
      localStorage.setItem('user-token', token)
      //console.log("usefefefct:", localStorage.getItem('user-token'))
    }
  }, [result.data]) // eslint-disable-line


  const handleLogin = async (event) => {
    event.preventDefault()
    console.log("props.token",props.token)
    login({ variables: { username, password } })
  }

  return (
    <div>
      <form onSubmit={handleLogin}>
        <button id="login_button" type="submit">login</button>
        <div>
          username
          <input 
          id="username"
          type="text"
          value={username}
          name="Username"
          onChange={({target})=>setUsername(target.value)}/>
        </div>
        <div>
          password
          <input 
          id="password"
          type="text"
          value={password}
          name="Password"
          onChange={({target})=>setPassword(target.value)}/>
        </div>
      </form>

    </div>
  )
}

export default Login