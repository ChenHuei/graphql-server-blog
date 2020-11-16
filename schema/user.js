const { gql } = require('apollo-server');
const { userModel, postModel } = require('../models');

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

  type Token {
    token: String!
  }

  extend type Query {
    self: User
    users: [User]
    user(id: Int!): User
  }

  input UpdateSelfInfo {
    name: String
    age: Int
    email: String
  }

  input SignUp {
    name: String
    email: String!
    password: String!
    age: Int
  }

  extend type Mutation {
    updateSelfInfo(input: UpdateSelfInfo): User
    addFriend(id: Int!): User
    signUp(input: SignUp): User
    login(email: String!, password: String!): Token
  }
`;

// Resolvers
const resolvers = {
  Query: {
    self: (root, args, { self }) => userModel.getSelf(self.id),
    users: () => userModel.getUsers(),
    user: (root, args) => userModel.getUser(args.id),
  },
  User: {
    posts: (parent) => postModel.filterUserPost(parent.id),
    friends: (parent) => userModel.filterUserFriends(parent.friendIds)
  },
  Mutation: {
    updateSelfInfo: (root, args, { self }) => userModel.updateSelfInfo(args.input, self),
    addFriend: (root, args, { self }) => userModel.addFriend(args.id, self),
    signUp: async(root, args, { saltRounds }) => await userModel.signUp(args, saltRounds),
    login: async (root, args, { secret }) => await userModel.login(args.email, args.password, secret)
  }
};

module.exports = {
  typeDefs,
  resolvers
}