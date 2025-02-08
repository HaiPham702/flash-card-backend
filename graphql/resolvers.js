
const { resolvers: userResolver } = require('@graphql/module/user');

const resolvers = {
  Query: {
    ...userResolver.Query,
  },

  Mutation: {
    ...userResolver.Mutation,
  },
};

module.exports = resolvers;
