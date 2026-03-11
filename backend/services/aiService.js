const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Calls Gemini API to parse raw schedule strings into structured JSON
 */
exports.parseSchedule = async (scheduleText) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    // Mock parsing if no API key is provided
    console.warn('GEMINI_API_KEY not set. Using mock parsed data.');
    return [
      { title: "Study AI Ethics", time: "9:00 AM", keyword: "AI Ethics", recurrence: "daily" }
    ];
  }

  const prompt = `
    Analyze the following schedule and extract a list of tasks in strictly valid JSON array format. 
    Each object must have exactly these keys: "title", "time", "keyword" (main topic derived from title), and "recurrence" ("none", "daily", "weekly", or "monthly").
    Schedule text: "${scheduleText}"
  `;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    let contentText = response.data.candidates[0].content.parts[0].text;
    
    // Clean up Markdown JSON block formatting if present
    contentText = contentText.replace(/^```json/m, '').replace(/```$/m, '').trim();
    
    return JSON.parse(contentText);
  } catch (error) {
    console.error('Error parsing schedule with Gemini:', error.message);
    throw new Error('Failed to parse schedule');
  }
};

/**
 * Calls Gemini API to summarize search snippets
 */
exports.summarizeResearch = async (keyword, snippets) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return `Mock AI Summary: Insights compiled from ${snippets.length} sources regarding ${keyword}.`;
  }

  const prompt = `Based on the following search snippets about "${keyword}", write a concise, one-paragraph summary of the topic.\n\nSnippets:\n${snippets.join('\n')}`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    return response.data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('Error summarizing research with Gemini:', error.message);
    return `Found ${snippets.length} articles on "${keyword}", but AI summarization failed.`;
  }
};

/**
 * Generates an encouraging daily summary based on completed tasks
 */
exports.generateDailySummary = async (completedTasks) => {
  if (completedTasks.length === 0) return "No tasks completed today.";
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return `Mock Summary: You crushed it today, completing ${completedTasks.length} tasks! Keep up the momentum.`;
  }

  const prompt = `Based on the following completed tasks, write a short, highly encouraging one-sentence summary of what was accomplished today.\n\nTasks:\n${completedTasks.map(t => t.title).join('\n')}`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    return response.data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('Error generating daily summary:', error.message);
    return `You successfully completed ${completedTasks.length} tasks today!`;
  }
};

/**
 * Suggests logical next steps based on completed history
 */
exports.suggestFutureTasks = async (completedTasks) => {
  if (completedTasks.length === 0) return [];
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return [
      { title: "Review overall progress", time: "Morning" },
      { title: "Plan upcoming milestone", time: "Afternoon" }
    ];
  }

  const prompt = `Based on the following completed tasks: [${completedTasks.map(t => t.title).join(', ')}], suggest exactly 2 logical follow-up tasks in STRICT JSON array format. Each object must have "title" and "time" ("Morning", "Afternoon", or "Evening").`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    let contentText = response.data.candidates[0].content.parts[0].text;
    contentText = contentText.replace(/^```json/m, '').replace(/```$/m, '').trim();
    
    return JSON.parse(contentText);
  } catch (error) {
    console.error('Error suggesting future tasks:', error.message);
    return [];
  }
};
