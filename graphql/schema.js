const { gql } = require("apollo-server-express");
const { typeDefs: userTypeDefs } = require('@graphql/module/user');


const typeDefs = gql`
 ${userTypeDefs}
`;

module.exports = typeDefs;
