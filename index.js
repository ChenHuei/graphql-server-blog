const { ApolloServer, gql } = require('apollo-server');
const jwt = require('jsonwebtoken');

const {
  getSelf,
  getUsers,
  getUser,
  getPosts,
  getPost,
  filterUserPost,
  filterUserFriends,
  filterPostLikeUsers,
  updateSelfInfo,
  addFriend,
  addPost,
  likePost,
  signUp,
  login
} = require('./models');

// Schema
const typeDefs = gql`
  type User {
    id: Int!
    email: String!
    name: String
    age: Int
    friends: [User]
    posts: [Post]
  }

  type Post {
    id: Int!
    author: User
    title: String
    description: String
    likeUsers: [User]
    createdAt: String
  }

  type Token {
    token: String!
  }

  type Query {
    self: User
    users: [User]
    user(id: Int!): User
    posts: [Post]
    post(id: Int!): Post
  }

  input UpdateSelfInfo {
    name: String
    age: Int
    email: String
  }

  input AddPost {
    title: String!
    description: String
  }

  input SignUp {
    name: String
    email: String!
    password: String!
    age: Int
  }

  type Mutation {
    updateSelfInfo(input: UpdateSelfInfo): User
    addFriend(id: Int!): User
    addPost(input: AddPost): Post
    likePost(id: Int!): Post
    deletePost(id: Int!): Post
    signUp(input: SignUp): User
    login(email: String!, password: String!): Token
  }
`;

// Resolvers
const resolvers = {
  Query: {
    self: (root, args, { self }) => getSelf(self.id),
    users: () => getUsers(),
    user: (root, args) => getUser(args.id),
    posts: () => getPosts(),
    post: (root, args) => getPost(args.id)
  },
  User: {
    posts: (parent) => filterUserPost(parent.id),
    friends: (parent) => filterUserFriends(parent.friendIds)
  },
  Post: {
    author: (parent) => getUser(parent.authorId),
    likeUsers: (parent) => filterPostLikeUsers(parent.likeUsers)
  },
  Mutation: {
    updateSelfInfo: (root, args, { self }) => updateSelfInfo(args.input, self),
    addFriend: (root, args, { self }) => addFriend(args.id, self),
    addPost: (root, args, { self }) => addPost(args.input, self),
    likePost: (root, args, { self }) => likePost(args.id, self),
    deletePost: (root, args, { self }) => deletePost(args.id, self),
    signUp: async(root, args, { saltRounds }) => await signUp(args, saltRounds),
    login: async (root, args, { secret }) => await login(args.email, args.password, secret)
  }
};

// 初始化 Web Server，需傳入 typeDefs (Schema) 與 resolvers (Resolver)
const server = new ApolloServer({ typeDefs,resolvers, context: async({ req }) => {
  try {
    const token = req.headers['x-token']
    const context = {
      secret: process.env.SECRET, 
      saltRounds: 2,
    }
    
    return token ? { 
      ...context,
      self: await jwt.verify(token, process.env.SECRET) 
    } : context
  } catch(e) {
    throw new Error('token expired, please sign in again.')
  }
  
} });

// 4. 啟動 Server
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
