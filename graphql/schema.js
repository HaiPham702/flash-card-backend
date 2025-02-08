const { gql } = require("apollo-server-express");
const { query: userQuery, mutation: userMutation  } = require('@graphql/module/user');
const { query: cardQuery, mutation: cardMutation } = require('@graphql/module/card');
const type = require('@graphql/module/type');


const typeDefs = gql`
 ${type}
 type Query {
    ${cardQuery}
    ${userQuery}
 }

 type Mutation {
    ${cardMutation}
    ${userMutation}
 }
`;


module.exports = typeDefs;
