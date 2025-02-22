
const { resolvers: userResolver } = require('@graphql/module/user');
const { resolvers: cardResolver } = require('@graphql/module/card');
const { resolvers: courseResolver } = require('@graphql/module/course');

const resolvers = {
  Query: {
    ...userResolver.Query,
    ...cardResolver.Query,
    ...courseResolver.Query,
  },

  Course: {
    ...courseResolver.Course,
  },

  Mutation: {
    ...userResolver.Mutation,
    ...cardResolver.Mutation,
    ...courseResolver.Mutation,
  },
};

module.exports = resolvers;
