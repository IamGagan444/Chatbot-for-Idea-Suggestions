import { ApiError } from "../utils/ApiError.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { AsyncHandler } from "../utils/Asynchandler.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateIdeas = async (query) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Generate 3 unique app ideas based on this query: "${query}". Format the response as a JSON array of objects, each with 'id', 'idea', 'relevance', 'impact', and 'feasibility' properties. Relevance, impact, and feasibility should be scores from 1 to 5, with 5 being the highest.`;

    const result = await model.generateContent(prompt);

    const response = await result.response;
    const rawText = await response.text();

    const cleanedText = rawText.replace(/```json|```/g, "").trim();

    const ideas = JSON.parse(cleanedText);

    return ideas;
  } catch (error) {
    console.error("Error generating ideas:", error);
    throw new Error("Failed to generate app ideas.");
  }
};

const generateSuggestions = async (ideas) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Provide detailed suggestions for the following app ideas: ${ideas
      .map((idea) => idea.idea)
      .join(
        ", "
      )}. You are a highly intelligent assistant. For each of the following app ideas, provide detailed suggestions including features, strategies, or improvements. 
Structure the response as a JSON array of objects, where each object represents an app idea. Each object should have the following fields:
- "idea": The name of the app idea.
- "suggestions": An array of objects, where each object contains:
  - "title": A brief title for the feature or strategy.
  - "description": A detailed explanation of the feature or strategy.

Here’s an example of the required format:

[
  {
    "idea": "App Idea 1",
    "suggestions": [
      { "title": "Feature or Strategy 1", "description": "Detailed description of the feature or strategy." },
      { "title": "Feature or Strategy 2", "description": "Another detailed description." }
    ]
  },
  {
    "idea": "App Idea 2",
    "suggestions": [
      { "title": "Feature or Strategy 1", "description": "Detailed description of the feature or strategy." }
    ]
  }
]

App Ideas: ${ideas
      .map((idea, index) => `${index + 1}. ${idea.idea}`)
      .join("\n")}

Start the response in JSON format.`;

    const result = await model.generateContent(prompt);

    const response = await result.response;
    const rawText = await response.text();

    const cleanedText = rawText.replace(/```json|```/g, "").trim();

    console.log("Cleaned Text:", cleanedText);

    // Parse the cleaned text into a JSON object
    const suggestions = JSON.parse(cleanedText);

    return suggestions;
  } catch (error) {
    console.error("Error generating suggestions:", error);
    throw new Error("Failed to generate suggestions.");
  }
};

const ideaGenerator = AsyncHandler(async (req, res, next) => {
  const { query } = req.body;
  if (!query) {
    return next(new Apiresponse(400, "query data is required!"));
  }

  const ideas = await generateIdeas(query);

  if (!ideas) {
    return next(new ApiError(500, "ai server issue"));
  }
  return res
    .status(200)
    .json(new Apiresponse(200, "ideas generated successfully", ideas));
});

const suggestionGenerator = AsyncHandler(async (req, res, next) => {
  const { selectedIdeas } = req.body;
  if (!selectedIdeas) {
    return next(new ApiError(400, "selectIdeas are required!"));
  }
  const suggestions = await generateSuggestions(selectedIdeas);

  if (!suggestions) {
    return next(new ApiError(500, "ai server issue"));
  }

  return res
    .status(200)
    .json(
      new Apiresponse(200, "suggetions data fetched successfully", suggestions)
    );
});

export { ideaGenerator, suggestionGenerator };
