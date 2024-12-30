import axios from 'axios';

const GOOGLE_API_KEY = ""; // Move to env
const SEARCH_ENGINE_ID = "0486d6977721847ed"; // Move to env

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export async function searchFinancialNews(query: string): Promise<SearchResult[]> {
  try {
    const response = await axios.get(
      `https://customsearch.googleapis.com/customsearch/v1`,
      {
        params: {
          key: GOOGLE_API_KEY,
          cx: SEARCH_ENGINE_ID,
          q: query,
          dateRestrict: 'd1', // Last 24 hours
          num: 5, // Limit results
        },
      }
    );

    return response.data.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
    }));
  } catch (error) {
    console.error('Search API error:', error);
    return [];
  }
}
