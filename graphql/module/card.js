const Card = require("@models/Card");

const resolvers = {
    Query: {
        cards: async () => {
            try {
                return await Card.find()
            } catch (error) {
                console.error("Lỗi getUsers:", error.message); // ✅ In lỗi ra console
                throw new Error("Lỗi server!"); // ✅ Trả về lỗi rõ ràng
            }
        },
        card: async (_, { id }) => await Card.findById(id),
    },

    Mutation: {
        addCard: async (_, { frontTitle, backTitle, frontImg, backImg }) => {
            const card = new Card({ frontTitle, backTitle, frontImg, backImg });
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
  cards: [Card]
  card(id: ID!): User
`

const mutation = `
  addCard(frontTitle: String!, backTitle: String!, frontImg: String!, backImg: String!): Card
  updateCard(id: ID!, frontTitle: String!, backTitle: String!, frontImg: String!, backImg: String!): Card
  deleteCard(id: ID!): String
`


module.exports = { resolvers, query, mutation };
