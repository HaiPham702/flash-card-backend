
const type = `
type User {
    id: ID!
    name: String
    email: String
    age: Int
    phoneNumber: String
    token: String
    username: String!
  }

type Card {
    id: ID!
    frontTitle: String
    backTitle: String
    frontImg: String
    backImg: String
  }
`

module.exports = type;
