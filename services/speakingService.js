const { GoogleGenerativeAI } = require('@google/generative-ai')
const SpeakingTopic = require('../models/SpeakingTopic')

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '')

const prompt = `Generate an IELTS Speaking topic for today with the following structure:
1. Part 1: 4 questions about general topics
2. Part 2: A topic for a 2-minute speech with 3 follow-up questions
3. Part 3: 3 questions for discussion

Format the response as a JSON object with the following structure:
{
  "part1": {
    "questions": ["question1", "question2", "question3", "question4"]
  },
  "part2": {
    "topic": "topic description",
    "followUpQuestions": ["question1", "question2", "question3"]
  },
  "part3": {
    "questions": ["question1", "question2", "question3"]
  }
}

Make sure the questions are natural and follow IELTS speaking format. Return correct format for conversion`

const speakingService = {
    async getTodayTopic() {
        const today = new Date().toISOString().split('T')[0]

        // Kiểm tra xem đã có chủ đề cho ngày hôm nay chưa
        const existingTopic = await SpeakingTopic.findOne({ date: today })
        if (existingTopic) {
            return existingTopic
        }


        // Nếu chưa có, tạo chủ đề mới
        return this.generateNewTopic()
    },

    async generateNewTopic() {
        try {
            const genAI = new GoogleGenerativeAI("AIzaSyDsPyA0aKIfFIYKn_Du60e2jAFhcSVxDlo");
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent(prompt)
            const response = await result.response
            const text = response.text()

            // Parse JSON response
            const topicData = JSON.parse(text.replace(/json|`/g, ""))

            // Tạo chủ đề mới trong database
            const today = new Date().toISOString().split('T')[0]
            const newTopic = await SpeakingTopic.create({
                date: today,
                part1: topicData.part1,
                part2: topicData.part2,
                part3: topicData.part3
            })

            return newTopic
        } catch (error) {
            console.error('Error generating speaking topic:', error)
            throw new Error('Failed to generate speaking topic')
        }
    }
}

module.exports = speakingService 