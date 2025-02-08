const User = require("@models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const resolvers = {
    Query: {
        users: async () => {
            try {
                return await User.find()
            } catch (error) {
                console.error("Lỗi getUsers:", error.message); // ✅ In lỗi ra console
                throw new Error("Lỗi server!"); // ✅ Trả về lỗi rõ ràng
            }
        },
        user: async (_, { id }) => await User.findById(id),
    },

    Mutation: {
        addUser: async (_, { name, email, age, phoneNumber, password }) => {
            const user = new User({ name, email, age, phoneNumber, password });
            await user.save();
            return user;
        },

        updateUser: async (_, { id, name, email, age }) => {
            return await User.findByIdAndUpdate(id, { name, email, age }, { new: true });
        },

        deleteUser: async (_, { id }) => {
            await User.findByIdAndDelete(id);
            return "User deleted!";
        },

        register: async (_, { username, password }) => {
            try {
                // Hash mật khẩu trước khi lưu
                const hashedPassword = await bcrypt.hash(password, 10);
                const user = new User({ username, password: hashedPassword });
                await user.save();
                return user;
            } catch (error) {
                throw new Error("Lỗi server!"); // ✅ Trả về lỗi rõ ràng
            }
        },

        login: async (_, { username, password }) => {
            // Kiểm tra user có tồn tại không
            const user = await User.findOne({
                $or: [
                    { username: username }
                ]
            });
            if (!user) {
                throw new Error('User not found');
            }

            // Kiểm tra mật khẩu
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error('Incorrect password');
            }

            // Tạo token JWT
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.EXPIRES_IN }
            );

            return { id: user.id, username: user.username, email: user.email, token };
        },

        /**
         * @description: Reset password
         * @param {*} _ 
         * @param {*} param1 
         * @returns 
         */
        resetPassword: async (_, { username, newpassword }) => {
            try {
                const user = await User.findOne({ username });
                if (user) {
                    //
                    const hashedPassword = await bcrypt.hash(newpassword, 10);
                    return await User.findOneAndUpdate({ _id: user.id }, { password: hashedPassword }, { new: true })
                } else {
                    throw new Error('User not found');
                }
            } catch (error) {
                console.error("Lỗi resetPassword:", error.message); // ✅ In lỗi ra console
                throw new Error("Lỗi server!"); // ✅ Trả về lỗi rõ ràng

            }
        },
    },
};


const typeDefs = `
  type User {
    id: ID!
    name: String
    email: String
    age: Int
    phoneNumber: String
    token: String
    username: String!
  }

  type Query {
    users: [User]
    user(id: ID!): User
  }

  type Mutation {
    addUser(name: String!, email: String!, age: Int!, phoneNumber: String!, password: String!): User
    updateUser(id: ID!, name: String, email: String, age: Int, phoneNumber: String): User
    deleteUser(id: ID!): String
    register(username: String!, email: String!, password: String!): User!
    login(username: String!, password: String!): User!  # ✅ Thêm login
    resetPassword(username: String!, newpassword: String!): User
  }
`;


module.exports = { resolvers, typeDefs };
