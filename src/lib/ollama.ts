// Ollama service for processing articles with GPT-OSS 20B model

const OLLAMA_API_URL = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'gpt-oss:20b';

export interface OllamaResponse {
  transformedTitle: string;
  summary: string;
  category: string;
}

export interface ProcessArticleInput {
  title: string;
  body: string;
}

/**
 * Process an article through Ollama to get a transformed title and summary
 * This takes 2-5 minutes per article as Ollama thinks through the content
 */
export async function processArticleWithOllama(
  input: ProcessArticleInput
): Promise<OllamaResponse> {
  const prompt = createPrompt(input.title, input.body);

  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: false,  // Get complete response at once
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.response;

    // Parse the response to extract title and summary
    const parsed = parseOllamaResponse(generatedText);

    return parsed;
  } catch (error) {
    console.error('Ollama processing error:', error);
    throw new Error('Failed to process article with Ollama');
  }
}

/**
 * Create the prompt for Ollama
 * Improved prompt that asks for both title transformation and summarization in one go
 */
function createPrompt(title: string, body: string): string {
  return `You are simplifying news articles for everyday readers. Your task is to make complex news stories clear and accessible.

Transform this Guardian article:

1. REWRITE THE TITLE: Make it clear, direct, and easy to understand. Remove jargon and complex phrases.

2. SUMMARIZE THE ARTICLE: Write a 60-80 word summary using simple, conversational English. Focus on the key points that matter most to readers.

3. CATEGORIZE THE ARTICLE: Pick a specific category (1-3 words) that captures what the story is really about. Be specific, not generic.

Good examples: "NATO & Defense", "Human Rights", "Housing Market", "Local Elections", "Climate Policy", "Tech Industry", "Immigration Law", "Public Health", "Criminal Justice", "Energy Policy", "Trade & Tariffs", "Labor Rights"

Bad examples: "Politics" (too vague), "News" (meaningless), "World" (too broad), "Business" (too generic)

Format your response EXACTLY like this:
TITLE: [your transformed title here]
SUMMARY: [your 60-80 word summary here]
CATEGORY: [your 1-2 word category here]

Original Title: ${title}

Article Content:
${body}

Remember: Use simple vocabulary, short sentences, and a conversational tone. Make it easy for anyone to understand.`;
}

/**
 * Parse Ollama's response to extract the transformed title, summary, and category
 */
function parseOllamaResponse(response: string): OllamaResponse {
  // Extract TITLE, SUMMARY, and CATEGORY from the response
  const titleMatch = response.match(/TITLE:\s*(.+?)(?=\n|SUMMARY:|$)/is);
  const summaryMatch = response.match(/SUMMARY:\s*(.+?)(?=\n|CATEGORY:|$)/is);
  const categoryMatch = response.match(/CATEGORY:\s*(.+?)$/is);

  if (!titleMatch || !summaryMatch) {
    // Fallback: If parsing fails, try to extract any content
    console.warn('Failed to parse Ollama response format, attempting fallback');

    // Look for patterns that might indicate title, summary, and category
    const lines = response.split('\n').filter(line => line.trim());

    let transformedTitle = '';
    let summary = '';
    let category = 'News'; // Default category

    // First substantial line is likely the title
    if (lines.length > 0) {
      transformedTitle = lines[0].replace(/^(TITLE|Title):\s*/i, '').trim();
    }

    // Look for summary and category in remaining lines
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.match(/^(CATEGORY|Category):/i)) {
        category = line.replace(/^(CATEGORY|Category):\s*/i, '').trim();
      } else if (!summary) {
        summary = line.replace(/^(SUMMARY|Summary):\s*/i, '').trim();
      }
    }

    if (!transformedTitle || !summary) {
      throw new Error('Could not parse Ollama response');
    }

    return {
      transformedTitle,
      summary,
      category,
    };
  }

  // Extract category, defaulting to 'News' if not found
  let category = 'News';
  if (categoryMatch) {
    category = categoryMatch[1].trim();
    // Ensure category is max 3 words
    const words = category.split(/\s+/);
    if (words.length > 3) {
      category = words.slice(0, 3).join(' ');
    }
  }

  return {
    transformedTitle: titleMatch[1].trim(),
    summary: summaryMatch[1].trim(),
    category,
  };
}

/**
 * Check if Ollama is running and accessible
 */
export async function checkOllamaStatus(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}
