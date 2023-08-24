const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const {typeDefs} = require('./typedefs')
const {authors, books} = require('./stuff')
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Book = require('./schemas/Book')
const Author = require('./schemas/Author')
const {MONGO_URL} = require('./utils/config')


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
    authorCount: () => authors.length,
    allBooks: async (root, args) => {
      console.log("ALLBOOKS args", args, root)
        return Book.find({})
      },
    allAuthors: async (root, args) => {
      return Author.find({})
    }
      /*(root, args) =>  {
      if (args.genre && !args.author) {
        return books.filter(b => b.genres.includes(args.genre))
      } else if (!args.genre && args.author) {
        return books.filter(b => b.author === args.author)
      } else if (args.genre && args.author) {
        return books.filter(b => b.genres.includes(args.genre)).filter(b => b.author === args.author)
      } else {
        return books
      }
    },*/
    
  },

  Author: {
    name: (root) => root.name,
    bookCount: (root, args) => {
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
    id: (root) => root.id,
  },

  Mutation: {
    addBook: async (root, args) => {
      //console.log("args", args)
      const maybeAuthor = await Author.find({ name: args.author})
      let newArgs = args
      let newAuthor = false
      if (Object.keys(maybeAuthor).length > 0) {
        //console.log("maybeAuthor: ", maybeAuthor, typeof(maybeAuthor), "keys:", Object.keys(maybeAuthor))
        newArgs.author = maybeAuthor[0]
      } else {
        newAuthor = new Author({name: args.author})
        //console.log("newAuthor: ",newAuthor) 
        newArgs.author = newAuthor
      }
      //console.log("newArgs: ",newArgs)
      const newBook = new Book({ ...newArgs})
      if (newAuthor) {
        await newAuthor.save()
      }
      return await newBook.save()
      /*
      const book = { ...args, id: uuid() }
      books = books.concat(book)
      console.log(args)
      if(!authors.map(a => a.name).includes(args.author)) {
        const author = {name:args.author, id:uuid()}
        authors = authors.concat(author)
      }
      return book
      */
    },
    editAuthor: (root, args) => {
      console.log("Authoredit", args)

      const author = authors.find(a => a.name === args.name)
      if (!author) {
        return null
      }
      const updatedAuthor = { ...author, born: args.setBornTo}
      authors = authors.map(a => a.name === args.name ? updatedAuthor : a)
      //console.log("authors: ", authors)
      return updatedAuthor
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})