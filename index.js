const { ApolloServer } = require('apollo-server');
const { typeDefs, resolvers } = requrie('./schema')
const jwt = require('jsonwebtoken');

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
