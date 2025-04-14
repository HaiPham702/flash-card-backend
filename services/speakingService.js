const { GoogleGenerativeAI } = require('@google/generative-ai')
const SpeakingTopic = require('../models/SpeakingTopic')
const OpenAI = require('openai')

// Initialize APIs with environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

const prompt = `Generate an IELTS Speaking topic for today with the following structure. All parts should be thematically related around a central topic (e.g., technology, education, environment, etc.):

1. Part 1: 4 questions about the central topic, starting with general questions and gradually becoming more specific
2. Part 2: A topic for a 2-minute speech that is directly related to the Part 1 questions, with 3 follow-up questions that connect to the main topic
3. Part 3: 3 discussion questions that explore broader implications or deeper aspects of the central topic

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

Make sure:
- All questions are natural and follow IELTS speaking format
- Questions progress logically from general to specific
- The central theme is clear and consistent across all parts
- Questions in Part 3 should be more abstract and analytical than Part 1
- Return correct format for conversion`

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
            // Try OpenAI first
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert IELTS speaking examiner. Generate IELTS speaking topics following the exact format specified."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                response_format: { type: "json_object" }
            })

            const content = completion.choices[0].message.content
            if (!content) {
                throw new Error('Empty response from OpenAI')
            }

            const topicData = JSON.parse(content)

            // Validate response structure
            const requiredFields = ['part1', 'part2', 'part3']
            const missingFields = requiredFields.filter(field => !(field in topicData))

            if (missingFields.length > 0) {
                throw new Error(`Invalid response format. Missing fields: ${missingFields.join(', ')}`)
            }

            // Create new topic in database
            const today = new Date().toISOString().split('T')[0]
            const newTopic = await SpeakingTopic.create({
                date: today,
                part1: topicData.part1,
                part2: topicData.part2,
                part3: topicData.part3
            })

            return newTopic
        } catch (error) {
            console.error('OpenAI generation failed, falling back to Google:', error.message)

            try {
                // Fallback to Google
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
                const result = await model.generateContent(prompt)
                const response = await result.response
                const text = response.text()

                // Parse JSON response
                const topicData = JSON.parse(text.replace(/json|`/g, ""))

                // Create new topic in database
                const today = new Date().toISOString().split('T')[0]
                const newTopic = await SpeakingTopic.create({
                    date: today,
                    part1: topicData.part1,
                    part2: topicData.part2,
                    part3: topicData.part3
                })

                return newTopic
            } catch (googleError) {
                console.error('Both AI generations failed:', googleError)
                throw new Error('Failed to generate speaking topic with both OpenAI and Google')
            }
        }
    }
}

module.exports = speakingService 