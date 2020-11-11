const { ApolloServer, gql } = require('apollo-server');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 2;
const SECRET = 'just_a_random_secret';

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

const meId = 1;
const users = [
  {
    id: 1,
    email: 'leo.chen@test.com',
    password: 'leo',
    name: 'leo',
    age: 20,
    friendIds: [2, 3]
  },
  {
    id: 2,
    email: 'woody@test.com',
    password: 'woody',
    name: 'Woody',
    age: 30,
    friendIds: [1]
  },
  {
    id: 3,
    email: 'ding@test.com',
    password: 'ding',
    name: 'Ding',
    age: 40,
    friendIds: [1]
  }
];

const posts = [
  {
    id: 1,
    authorId: 1,
    title: 'Hello World',
    description: 'This is my first post',
    likeUsers: [1, 2],
    createdAt: '2018-10-22T01:40:14.941Z'
  },
  {
    id: 2,
    authorId: 2,
    title: 'Nice Day',
    description: 'Hello My Friend!',
    likeUsers: [1],
    createdAt: '2018-10-24T01:40:14.941Z'
  }
];

// Resolvers
const resolvers = {
  Query: {
    self: (root, args, { self }) => getUser(self.id),
    users: () => users,
    user: (root, args) => getUser(args.id),
    posts: () => posts,
    post: (root, args) => posts.find(post => post.id === args.id)
  },
  User: {
    posts: (parent) => posts.filter(post => post.authorId === parent.id),
    friends: (parent) => users.filter(user => parent.friendIds.includes(user.id))
  },
  Post: {
    author: (parent) => getUser(parent.authorId),
    likeUsers: (parent) => parent.likeUsers.map(id => getUser(id))
  },
  Mutation: {
    updateSelfInfo: (root, args, { self }) => {
      const me = getUser(self.id)
      const newSelf = {
        ...me,
        ...args.input
      }
      users.splice(users.findIndex(user => user.id === self.id), 1, newSelf)

      return newSelf
    },
    addFriend: (root, args, { self }) => {
      const me = getUser(self.id)
      const { friendIds } = me
      const { id } = args

      if (!friendIds.includes(id)) {
        friendIds.push(id)
      }

      return me
    },
    addPost: (root, args, { self }) => {
      const post = {
        id: posts.length + 1,
        authorId: self.id,
        likeUsers: [],
        createdAt: new Date().toString(),
        ...args.input
      }
      console.log('post', post);
      posts.push(post)
      return post
    },
    likePost: (root, args, { self }) => {
      const post = posts.find(post => post.id === args.id)
      const { likeUsers } = post

      if (likeUsers.includes(self.id)) {
        likeUsers.splice(likeUsers.indexOf(self.id), 1)
      } else {
        likeUsers.push(self.id)
      }
      
      return post
    },
    deletePost: (root, args, { self }) => {
      const { id } = args
      const post = posts.find(post => post.id === id)
      if (post.authorId !== self.id) {
        throw new Error('Only author can delete this post')
      } 
      posts.splice(posts.findIndex(post => post.id === id), 1)
      return post
    },
    signUp: async(root, args) => {
      if (users.some(user => user.email === args.input.email)) {
        throw new Error('Someone used this email')
      }
      const { password, ...other } = args.input
      const user = {
        id: users.length + 1,
        friends: [],
        post: [],
        password: await bcrypt.hash(password, SALT_ROUNDS),
        ...other
      }
      users.push(user)
      console.log(users);
      return user
    },
    login: async (root, args) => {
      const { email, password } = args

      const user = users.find(user => user.email === email)
      if (!user) {
        throw new Error("email doesn't exist")
      }
      if (!await bcrypt.compare(password, user.password)) {
        throw new Error('wrong password')
      }
      return {
        token: await jwt.sign(user, SECRET, {
          expiresIn: '1d'
        })
      }
    }
  }
};

// 初始化 Web Server，需傳入 typeDefs (Schema) 與 resolvers (Resolver)
const server = new ApolloServer({ typeDefs,resolvers, context: async({ req }) => {
  try {
    const token = req.headers['x-token']
    
    return token ? { 
      self: await jwt.verify(token, SECRET) 
    } : {}
  } catch(e) {
    throw new Error('token expired, please sign in again.')
  }
  
} });

// 4. 啟動 Server
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});


// utils
const getUser = (id) => users.find(user => user.id === id)