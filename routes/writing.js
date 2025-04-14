const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const WritingSubmission = require('../models/WritingSubmission');

// Initialize APIs with environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generatePrompt = (question, essay) => {
  const promptText = `You are an expert IELTS examiner. Please evaluate this IELTS Writing Task 2 essay according to the official IELTS Writing Band Descriptors.

Question:
${question}

Essay to evaluate:
${essay}

Please analyze and score the following aspects:

1. Task Achievement (0-9):
- How well does the response address all parts of the task?
- Is the position clear and well-supported?
- Are ideas relevant and fully extended?

2. Coherence and Cohesion (0-9):
- Is there a clear progression throughout the response?
- Is paragraphing and linking used effectively?
- Is the overall essay structure logical?

3. Lexical Resource (0-9):
- What is the range of vocabulary used?
- How accurate and appropriate is the word choice?
- Is there evidence of sophisticated vocabulary control?

4. Grammatical Range and Accuracy (0-9):
- What is the range of grammatical structures?
- How accurate is the grammar and punctuation?
- Are complex structures handled well?

For each criterion, provide:
- A specific band score (0-9, can use .5 increments)
- Detailed feedback explaining the score, with specific examples from the essay

Finally, calculate the overall band score (average of the four criteria, rounded to the nearest .5).

Format your response strictly as a JSON object with this structure:
{
  "taskAchievement": {"band": number, "feedback": "string"},
  "coherenceAndCohesion": {"band": number, "feedback": "string"},
  "lexicalResource": {"band": number, "feedback": "string"},
  "grammaticalRangeAndAccuracy": {"band": number, "feedback": "string"},
  "overallBand": number,
  "detailedFeedback": "string"
}`;

  return {
    openAIMessages: [
      {
        role: "system",
        content: "You are an expert IELTS examiner with extensive experience in evaluating Writing Task 2 essays. You will evaluate essays based on the official IELTS Writing Band Descriptors, providing detailed feedback and scores for each criterion."
      },
      {
        role: "user",
        content: promptText
      }
    ],
    geminiPrompt: promptText
  };
};

const evaluateWithOpenAI = async (messages, retryCount = 0) => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsedResponse = JSON.parse(content);
    
    // Validate response structure
    const requiredFields = ['taskAchievement', 'coherenceAndCohesion', 'lexicalResource', 'grammaticalRangeAndAccuracy', 'overallBand', 'detailedFeedback'];
    const missingFields = requiredFields.filter(field => !(field in parsedResponse));
    
    if (missingFields.length > 0) {
      throw new Error(`Invalid response format. Missing fields: ${missingFields.join(', ')}`);
    }

    return parsedResponse;
  } catch (error) {
    console.error(`OpenAI evaluation attempt ${retryCount + 1} failed:`, error.message);
    
    if (error.response?.status === 429 && retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY * (retryCount + 1);
      console.log(`Rate limit hit. Retrying in ${delay}ms...`);
      await sleep(delay);
      return evaluateWithOpenAI(messages, retryCount + 1);
    }

    if (error.response?.status === 401) {
      throw new Error('Invalid API key or authentication error');
    }

    if (error.response?.status === 400) {
      throw new Error('Invalid request format or parameters');
    }

    throw new Error(`OpenAI evaluation failed: ${error.message}`);
  }
};

const evaluateWithGemini = async (prompt) => {
  try {
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch (error) {
    throw new Error('Gemini evaluation failed: ' + error.message);
  }
};

// Submit and score a writing task
router.post('/submit', async (req, res) => {
  try {
    const { userId, taskType, question, essay } = req.body;

    // Calculate word count
    const wordCount = essay.trim().split(/\s+/).length;

    // Generate prompts for both models
    const { openAIMessages, geminiPrompt } = generatePrompt(question, essay);

    let aiResponse;
    try {
      // Try OpenAI first
      aiResponse = await evaluateWithOpenAI(openAIMessages);
    } catch (error) {
      console.log('OpenAI evaluation failed, falling back to Gemini:', error.message);
      
      try {
        // Fallback to Gemini
        aiResponse = await evaluateWithGemini(geminiPrompt);
      } catch (geminiError) {
        console.error('Both AI evaluations failed:', geminiError);
        throw new Error('All AI evaluation attempts failed');
      }
    }

    // Create new submission
    const submission = new WritingSubmission({
      userId,
      taskType,
      question,
      essay,
      wordCount,
      aiScore: {
        taskAchievement: aiResponse.taskAchievement,
        coherenceAndCohesion: aiResponse.coherenceAndCohesion,
        lexicalResource: aiResponse.lexicalResource,
        grammaticalRangeAndAccuracy: aiResponse.grammaticalRangeAndAccuracy,
        overallBand: aiResponse.overallBand
      },
      detailedFeedback: aiResponse.detailedFeedback
    });

    await submission.save();
    res.json(submission);
  } catch (error) {
    console.error('Error processing writing submission:', error);
    res.status(500).json({ 
      error: 'Failed to process writing submission',
      message: error.message 
    });
  }
});

// Get user's writing submissions
router.get('/submissions/:userId', async (req, res) => {
  try {
    const submissions = await WritingSubmission.find({ userId: req.params.userId })
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching writing submissions:', error);
    res.status(500).json({ error: 'Failed to fetch writing submissions' });
  }
});

// Get specific submission
router.get('/submission/:id', async (req, res) => {
  try {
    const submission = await WritingSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    res.json(submission);
  } catch (error) {
    console.error('Error fetching writing submission:', error);
    res.status(500).json({ error: 'Failed to fetch writing submission' });
  }
});

module.exports = router; 