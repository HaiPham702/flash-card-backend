const { gql } = require("apollo-server-express");
const { query: userQuery, mutation: userMutation } = require('@graphql/module/user');
const { query: cardQuery, mutation: cardMutation } = require('@graphql/module/card');
const { query: courseQuery, mutation: courseMutation } = require('@graphql/module/course');
const type = require('@graphql/module/type');

const typeDefsDraw = `
${type}
type Query {
   ${userQuery}
   ${cardQuery}
   ${courseQuery}
}

type Mutation {
   ${userMutation}
   ${cardMutation}
   ${courseMutation}
}
`

const typeDefs = gql`
  ${typeDefsDraw}
`;


module.exports = { typeDefs, typeDefsDraw };
