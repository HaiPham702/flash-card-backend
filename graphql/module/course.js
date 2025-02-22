const Course = require("@models/Course");
const { ObjectId } = require("mongodb");
const Card = require("@models/Card");


const resolvers = {
    Query: {
        courses: async () => {
            try {
                return await Course.find()
            } catch (error) {
                console.error("Lỗi getUsers:", error.message); // ✅ In lỗi ra console
                throw new Error("Lỗi server!"); // ✅ Trả về lỗi rõ ràng
            }
        },
        course: async (_, { id }) => await Course.findById(id),
    },

    Course: {
        cards: async (parent) => {
            try {
                return await Card.find({ courseId: new ObjectId(parent.id) })
            } catch (error) {
                console.error("Lỗi getUsers:", error.message); // ✅ In lỗi ra console
                throw new Error("Lỗi server!"); // ✅ Trả về lỗi rõ ràng
            }
        },
    },

    Mutation: {
        addCourse: async (_, { coursename, description }) => {
            const course = new Course({ coursename, description });
            await course.save();
            return course;
        },

        updateCourse: async (_, { id, coursename, description }) => {
            return await Course.findByIdAndUpdate(id, { coursename, description }, { new: true });
        },

        deleteCourse: async (_, { id }) => {
            await Course.findByIdAndDelete(id);
            return "User deleted!";
        },

        addCourseWithCards: async (_, { coursename, description, cards }) => {
            try {
                const newCourse = new Course({ coursename, description });
                await newCourse.save();
                debugger
                const cardDocs = cards.map(card => ({
                    frontTitle: card.frontTitle,
                    backTitle: card.backTitle,
                    frontImg: card.frontImg,
                    backImg: card.backImg,
                    courseId: newCourse._id
                }));

                const createdCards = await Card.insertMany(cardDocs);
                return {
                    ...newCourse.toObject(),
                    id: newCourse._id.toString(),
                    cards: createdCards
                };
            } catch (error) {
                console.error("Lỗi getUsers:", error.message); // ✅ In lỗi ra console
                throw new Error("Lỗi server!"); // ✅ Trả về lỗi rõ ràng
            }

        },
    },
};


const query = `
  courses: [Course]
  course(id: ID!): User
`

const mutation = `
  addCourse(coursename: String, description: String): Course
  updateCourse(id: ID!, coursename: String, description: String): Course
  deleteCourse(id: ID!): String
  addCourseWithCards(coursename: String, description: String, cards: [CardInput]): Course
`


module.exports = { resolvers, query, mutation };
