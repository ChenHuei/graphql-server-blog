const userSchema = require('./user')
const postSchema = require('./post')

module.exports = {
  typeDefs: [userSchema.typeDefs, postSchema.typeDefs],
  resolvers: [userSchema.resolvers, postSchema.resolvers]
}