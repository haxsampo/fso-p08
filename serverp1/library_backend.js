const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const {typeDefs} = require('./typedefs')
const {authors, books} = require('./stuff')
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Book = require('./schemas/Book')
const Author = require('./schemas/Author')
const User = require('./schemas/User')
const {MONGO_URL} = require('./utils/config')
const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')


mongoose.connect(MONGO_URL)
  .then(() => {
    console.log("connected to MONGODB")
  })
  .catch((error) => {
    console.log('Error connecting to mongo: ', error.message)
  })


const resolvers = {
  Query: {
    //bookCount: () => books.length,
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      console.log("ALLBOOKS args", args, root)
      if (args.genre) {
        return Book.find({genres: args.genre})
      }
      if (args.author) {
        const authr = await Author.find({name:args.author})
        console.log("authr", authr)
        return Book.find({author: authr})
      }
      return Book.find({})
    },
    allAuthors: async (root, args) => {
      return Author.find({})
    },
    me: (root, args, context) => {
      console.log("context",context, root, args)

      return context.currentUser
    }
  },

  Author: {
    name: (root) => root.name,
    bookCount: async (root, args) => {
      const books = await Book.find({})
      console.log("books in author bookcount:", books)
      return books.filter(b => b.author === root.name ).length
    },
    born: (root, args) => {
      if (!root.born) {
        return null
      } else {
        return root.born
      }
    }
  },
  
  Book: {
    title: (root) => root.title,
    published: (root) => root.published,
    author: async (root) => {
      const authr = await Author.find({})
      //console.log("aaeae", authr[0])
      //console.log("author root",root)
      const l = {name: authr[0].name, born:authr[0].born}
      console.log("l: ", l)
      return l
    },
    genres: (root) => root.genres,
  },

  User: {
    username: (root) => root.username,
    favoriteGenre: (root, args) => {
      console.log(root, args)
      return root.favoriteGenre
    } 
  },

  Mutation: {
    addBook: async (root, args, context) => {
      if(!context.currentUser) {
        throw new GraphQLError('Cannot add if not logged in', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }
      const maybeAuthor = await Author.find({ name: args.author})
      let newArgs = args
      let newAuthor = false
      let old = true
      if (Object.keys(maybeAuthor).length > 0) {
        newAuthor = maybeAuthor[0]
      } else {
        newAuthor = new Author({name: args.author})
        old = false
      }

      try {
        if (!old) {
          await newAuthor.save()
        }
      } catch (error) {
        throw new GraphQLError('Saving failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      } 
      let ret = 0
      try {
        newArgs.author = newAuthor
        const newBook = new Book({ ...newArgs})
        ret = await newBook.save()
      } catch (error) {
        if (!old) {
          let x = await Author.where().findOneAndRemove({name: args.author.name})
        }
        throw new GraphQLError('Saving failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }
      return ret
    },
    editAuthor: async (root, args) => {
      console.log("Authoredit", args)
      if(!context.currentUser) {
        throw new GraphQLError('Cannot edit if not logged in', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }
      const author = await Author.findOne({name: args.name})
      if (!author) {
        return null
      }
      author.born = args.setBornTo
      return author.save()
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
      return user.save()
        .catch(error => {
          throw new GraphQLError('Creating the user failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
              error
            }
          })
        })
    },
    login: async (root, args) => {
      console.log("LOGIN:", args)
      const user = await User.findOne({ username: args.username })
  
      if ( !user || args.password !== '123123' ) {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })        
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      console.log("1")
      const decodedToken = jwt.verify(
        auth.substring(7), process.env.JWT_SECRET
      )
      console.log("2")
      const currentUser = await User
        .findById(decodedToken.id)
      console.log("currentuser",currentUser)
      return { currentUser }
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})