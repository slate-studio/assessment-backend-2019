const config = require('config');
const express = require('express');
const mongoose = require('mongoose');
const { importSchema } = require('graphql-import');
const { ApolloServer } = require('apollo-server-express');
mongoose.Promise = global.Promise;

const { seedUsers } = require('./db-init');
const resolvers = require('./graphql/resolvers');

module.exports.serverInstance = mongoose.connect(config.get('db.uri'), { useNewUrlParser: true })
  .then(async () => {
    console.log('INFO: Connected to the database');

    await seedUsers();

    const typeDefs = importSchema(__dirname + '/graphql/schemas/Index.graphql');
    const server = new ApolloServer({
      typeDefs,
      resolvers
    });

    const app = express();
    server.applyMiddleware({ app });

    const { host, port } = config.get('server');

    app.listen({ port }, () => {
      console.log(`Server ready at http://${host}:${port}${server.graphqlPath}`);
    });

    return server;
  })
  .catch((error) => {
    console.error(error);
    throw error;
  });
