const { gql } = require('apollo-server');
const { userModel, postModel } = require('./models');

// Schema
const typeDefs = gql`
  type Post {
    id: Int!
    author: User
    title: String
    description: String
    likeUsers: [User]
    createdAt: String
  }

  extend type Query {
    posts: [Post]
    post(id: Int!): Post
  }

  input AddPost {
    title: String!
    description: String
  }

  extend type Mutation {
    addPost(input: AddPost): Post
    likePost(id: Int!): Post
    deletePost(id: Int!): Post
  }
`;

// Resolvers
const resolvers = {
  Query: {
    posts: () => postModel.getPosts(),
    post: (root, args) => postModel.getPost(args.id)
  },
  Post: {
    author: (parent) => userModel.getUser(parent.authorId),
    likeUsers: (parent) => userModel.filterPostLikeUsers(parent.likeUsers)
  },
  Mutation: {
    addPost: (root, args, { self }) => postModel.addPost(args.input, self),
    likePost: (root, args, { self }) => postModel.likePost(args.id, self),
    deletePost: (root, args, { self }) => postModel.deletePost(args.id, self),
  }
};

module.export = {
  typeDefs,
  resolvers
}