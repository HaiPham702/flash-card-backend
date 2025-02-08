
const { resolvers: userResolver } = require('@graphql/module/user');
const { resolvers: cardResolver } = require('@graphql/module/card');

const resolvers = {
  Query: {
    ...userResolver.Query,
    ...cardResolver.Query,
  },

  Mutation: {
    ...userResolver.Mutation,
    ...cardResolver.Mutation,
  },
};

module.exports = resolvers;
