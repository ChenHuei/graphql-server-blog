const { gql } = require('apollo-server')

const userSchema = require('./user')
const postSchema = require('./post')

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    test: String
  }

  type Mutation {
    test: String
  }
`

// Resolvers
const resolvers = {
  Query: {
    test: () => 'test'
  },
  Mutation: {
    test: () => 'test'
  }
}

module.exports = {
  typeDefs: [typeDefs, userSchema.typeDefs, postSchema.typeDefs],
  resolvers: [resolvers, userSchema.resolvers, postSchema.resolvers]
}