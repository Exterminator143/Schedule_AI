const axios = require('axios');
const Task = require('../models/Task');
const aiService = require('./aiService');

const API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const CX = process.env.GOOGLE_SEARCH_CX;

/**
 * Searches for a topic, gets links, and saves to the database task asynchronously.
 */
exports.enrichTaskWithResearch = async (taskId, keyword) => {
  if (!API_KEY || API_KEY === 'your_google_search_api_key_here') {
    console.warn('Google Search API Key not set. Skipping research fetch.');
    return;
  }

  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: API_KEY,
        cx: CX,
        q: keyword,
        num: 3
      }
    });

    const items = response.data.items || [];
    const researchLinks = items.map(item => ({
      title: item.title,
      url: item.link
    }));
    
    const snippets = items.map(item => item.snippet);
    
    let researchSummary = `Found ${researchLinks.length} relevant articles on "${keyword}".`;
    if (snippets.length > 0) {
      researchSummary = await aiService.summarizeResearch(keyword, snippets);
    }

    await Task.findByIdAndUpdate(taskId, {
      researchLinks,
      researchSummary
    });
    
    console.log(`Successfully enriched task ${taskId} with research for ${keyword}`);
  } catch (error) {
    console.error(`Error fetching research for ${keyword}:`, error.message);
  }
};
