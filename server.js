require('module-alias/register');
const express = require("express");
const mongoose = require("mongoose");
const { ApolloServer } = require("apollo-server-express");
require("dotenv").config();
const typeDefs = require("@graphql/schema");
const resolvers = require("@graphql/resolvers");
const auth = require("@middleware/auth");

const app = express();

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected!"))
  .catch(err => console.error("MongoDB connection error:", err));

// Khởi tạo Apollo Server
const server = new ApolloServer({ typeDefs, resolvers, context: auth });

// Áp dụng Apollo Middleware vào Express
async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
