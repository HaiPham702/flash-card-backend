
const type = `
type User {
    id: ID!
    name: String
    email: String
    age: Int
    phoneNumber: String
    token: String
    username: String!
    createdAt: String 
  }

type Card {
    id: ID!
    frontTitle: String
    backTitle: String
    frontImg: String
    backImg: String
    courseId: String!
  }

type Course {
    id: ID!
    coursename: String
    description: String
    createdAt: String
    cards: [Card]
  }

input CardInput {
    frontTitle: String
    backTitle: String
    frontImg: String
    backImg: String
}
`

module.exports = type;
