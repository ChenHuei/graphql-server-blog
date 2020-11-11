const { ApolloServer, gql } = require('apollo-server');

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

  type Query {
    self: User
    users: [User]
    user(id: Int!): User
    posts: [Post]
    post(id: Int!): Post
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
    self: () => users.find(user => user.id === meId),
    users: () => users,
    user: (root, args) => users.find(user => user.id === args.id),
    posts: () => posts,
    post: (root, args) => posts.find(post => post.id === args.id)
  },
  User: {
    posts: (parent) => posts.filter(post => post.authorId === parent.id),
    friends: (parent) => users.filter(user => parent.friendIds.includes(user.id))
  },
  Post: {
    author: (parent) => users.find(user => user.id === parent.authorId),
    likeUsers: (parent) => parent.likeUsers.map(id => users.find(user => user.id === id))
  }
};

// 初始化 Web Server，需傳入 typeDefs (Schema) 與 resolvers (Resolver)
const server = new ApolloServer({ typeDefs,resolvers});

// 4. 啟動 Server
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});