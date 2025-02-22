const Card = require("@models/Card");
const { ObjectId } = require("mongodb");

const resolvers = {
  Query: {
    cards: async (_, { courseId }) => {
      try {
        debugger
        return await Card.find({ courseId: new ObjectId(courseId) })
      } catch (error) {
        throw new Error("Lỗi server!"); // ✅ Trả về lỗi rõ ràng
      }
    },
    card: async (_, { id }) => await Card.findById(id),
  },

  Mutation: {
    addCard: async (_, { frontTitle, backTitle, frontImg, backImg, courseId }) => {
      const card = new Card({ frontTitle, backTitle, frontImg, backImg, courseId });
      await card.save();
      return card;
    },

    updateCard: async (_, { id, frontTitle, backTitle, frontImg, backImg }) => {
      return await Card.findByIdAndUpdate(id, { frontTitle, backTitle, frontImg, backImg }, { new: true });
    },

    deleteCard: async (_, { id }) => {
      await Card.findByIdAndDelete(id);
      return "User deleted!";
    },

  },
};


const query = `
  cards(courseId: ID!): [Card]
  card(id: ID!): Card
`

const mutation = `
  addCard(frontTitle: String!, backTitle: String!, frontImg: String, backImg: String, courseId: String!): Card
  updateCard(id: ID!, frontTitle: String!, backTitle: String!, frontImg: String!, backImg: String!): Card
  deleteCard(id: ID!): String
`


module.exports = { resolvers, query, mutation };
