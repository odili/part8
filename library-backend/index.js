const { ApolloServer, gql, UserInputError, PubSub } = require('apollo-server');
const mongoose = require('mongoose');
const DataLoader = require('dataloader');
const Book = require('./models/book');
const Author = require('./models/author');
const User = require('./models/user');
const jwt = require('jsonwebtoken');

const pubsub = new PubSub();

const JWT_SECRET = 'WelcomeToAfrica';

const MONGODB_URI = 'mongodb://127.0.0.1/library';

console.log('connecting to', MONGODB_URI);

mongoose
  .connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch(error => {
    console.log('error connection to MongoDB:', error.message);
  });

const typeDefs = gql`
  type Author {
    id: ID!
    name: String!
    born: Int
    bookCount: Int
  }

  type Book {
    id: ID!
    title: String!
    published: Int
    author: Author!
    genres: [String!]!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]
    author(id: ID!): Author!
    book(id: ID!): Book
    me: User
    user(id: ID!): User!
  }
  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int
      genres: [String!]
    ): Book!
    editAuthor(name: String, born: Int): Author!
    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!, password: String!): Token
  }
  type Subscription {
    bookAdded: Book!
  }
`;

const resolvers = {
  Query: {
    book: async (root, args) => {
      const book = await Book.findById(args.id).populate('author');
      return book;
    },
    author: async (root, args) =>
      await Author.findById(args.id).populate('bookCount'),
    user: async (_, args) => await User.findById(args.id),
    bookCount: async () => await Book.countDocuments(),
    authorCount: async () => await Author.countDocuments(),
    allBooks: async (root, args) => {
      if (!args.author && !args.genre) {
        return await Book.find({}).populate('author');
      }
      if (args.author && !args.genre) {
        const author = await Author.findOne({ name: args.author });
        // console.log(author)
        return await Book.find({ author: { $in: [author._id] } }).populate(
          'author'
        );
      }
      if (!args.author && args.genre) {
        return Book.find({ genres: args.genre })
          .populate('author')
          .exec();
      }
      if (args.author && args.genre) {
        const author = await Author.findOne({ name: args.author });
        return Book.find({
          $and: [{ author: { $in: [author._id] } }, { genres: args.genre }],
        }).populate('author');
      }
    },
    allAuthors: async () => await Author.find({}).populate('bookCount'),
    me: (root, args, context) => {
      return context.currentUser;
    },
  },
  Mutation: {
    addBook: async (root, args, ctx) => {
      // console.log(args);
      const currentUser = ctx.currentUser;
      const authors = await Author.find({});
      let author;

      if (!currentUser) {
        throw new AuthenticationError('not authenticated');
      }

      try {
        if (authors.find(a => a.name === args.author) === undefined) {
          const newAuthor = new Author({
            name: args.author,
          });
          author = await newAuthor.save();
        } else {
          author = authors.find(a => a.name === args.author);
        }
        // console.log(args)
        const newBook = new Book({
          ...args,
          author: author._id,
        });
        const book = await newBook.save();
        pubsub.publish('BOOK_ADDED', { bookAdded: book });
        return book;
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
    },
    editAuthor: async (root, args, ctx) => {
      const currentUser = ctx.currentUser;

      if (!currentUser) {
        throw new AuthenticationError('not authenticated');
      }

      try {
        const author = await Author.findOne({ name: args.name });
        author.born = args.born;
        const updated = await author.save();
        return updated;
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
    },
    createUser: (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      });
      try {
        return user.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== 'strongpass') {
        throw new UserInputError('wrong credentials');
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, JWT_SECRET) };
    },
  },

  Book: {
    author: root => {
      // console.log('called')
      return Author.findById(root.author._id).exec();
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED']),
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);
      const currentUser = await User.findById(decodedToken.id);
      return {
        currentUser,
      };
    }
  },
});

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`);
  console.log(`Subscriptions ready at ${subscriptionsUrl}`);
});
