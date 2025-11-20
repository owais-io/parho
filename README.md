# parho.net - AI-Powered News Article Transformation

An automated system that leverages local large language models (LLMs) to transform complex news articles into accessible, simplified summaries. This project demonstrates practical application of open-source AI models for natural language processing and content transformation.

## 🎯 Project Overview

This application uses **Ollama** with the **gpt-oss:20b model** (20 billion parameters) to automatically:
- Transform complex news article titles into clear, accessible language
- Generate concise 60-80 word summaries from full articles
- Process content locally without relying on external APIs (privacy-first approach)
- Deploy the transformed content as a static website

**Live Demo:** [parho.net](https://parho.net)

## 🤖 AI Architecture

### Model Selection & Reasoning

**Model:** gpt-oss:20b (20 billion parameter open-source model)
- **Why this model:** Balances quality and computational efficiency for local deployment
- **Size:** ~14GB
- **Parameters:** 20 billion
- **Inference time:** 2-5 minutes per article on consumer hardware
- **Runs locally:** No data sent to external APIs, ensuring privacy and cost-efficiency

### AI Processing Pipeline

The system demonstrates a complete AI-driven content transformation workflow:

```
1. Input: Raw news article (title + body text)
       ↓
2. Prompt Engineering: Custom instruction set for Ollama
       ↓
3. LLM Processing: gpt-oss:20b analyzes and transforms content
       ↓
4. Output Parsing: Structured extraction (title + summary)
       ↓
5. Storage: SQLite database + MDX file generation
       ↓
6. Deployment: Static site generation for web delivery
```

## 📊 Data Flow

1. **Fetch** - Articles retrieved from The Guardian Open Platform API
2. **Process** - Each article sent to Ollama (gpt-oss:20b) for AI transformation
3. **Store** - Processed summaries stored in SQLite database
4. **Deploy** - MDX files generated from processed content
5. **Build** - Next.js generates static HTML from MDX files
6. **Serve** - Static pages deployed to Vercel CDN

## 📁 Project Structure

```
parho/
├── src/
│   ├── app/
│   │   ├── admin/              # Admin panel for article processing
│   │   ├── api/
│   │   │   ├── articles/       # Guardian API integration
│   │   │   ├── guardian/       # Fetch articles
│   │   │   ├── mdx-articles/   # Read processed MDX files
│   │   │   ├── process/        # Ollama AI processing endpoint
│   │   │   ├── summaries/      # Summary management
│   │   │   └── deploy/         # MDX file generation
│   │   ├── categories/         # Category pages
│   │   ├── summaries/          # Summaries management page
│   │   └── page.tsx            # Homepage
│   ├── components/
│   │   └── CategorySections.tsx  # Client component for category sections with modal
│   ├── lib/
│   │   ├── db.ts               # SQLite database operations
│   │   ├── mdx.ts              # MDX file operations
│   │   └── ollama.ts           # Ollama AI integration ⭐ CORE AI LOGIC
│   └── types/
│       └── index.ts            # TypeScript interfaces
├── content/
│   └── articles/               # Generated MDX files (AI-processed content)
├── articles.db                 # SQLite database
├── scripts/
│   └── postbuild.js            # Build optimization script
└── package.json
```

**Key AI File:** `src/lib/ollama.ts` - Contains all AI processing logic

## 🚦 Getting Started

### Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **Ollama** - [Download](https://ollama.com/download)
3. **Guardian API Key** - [Get free key](https://open-platform.theguardian.com/access/)
4. **Minimum 16GB RAM** (recommended for running 20B parameter model)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/owais-io/parho.git
   cd parho
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Ollama and download the AI model:**
   ```bash
   # Pull the 20B parameter model (~14GB download)
   ollama pull gpt-oss:20b

   # Verify Ollama is running
   ollama list
   ```

4. **Configure environment variables:**
   ```bash
   # Copy the example file
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   GUARDIAN_API_KEY=your_guardian_api_key_here
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=gpt-oss:20b
   NODE_ENV=development
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Access the application:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Admin Panel: [http://localhost:3000/admin](http://localhost:3000/admin)

### Database

The repository includes a pre-configured SQLite database (`articles.db`) with schema and sample data. No additional database setup required.

### Processing Articles with AI

1. Ensure Ollama is running locally
2. Navigate to [http://localhost:3000/admin](http://localhost:3000/admin)
3. Click "Fetch Articles from Guardian API"
4. Select articles to process
5. Click "Process Selected Articles"
   - Each article takes 2-5 minutes to process
   - The 20B model analyzes content and generates transformations
   - Progress is shown in real-time
6. Click "Deploy" to generate MDX files

### Build for Production

```bash
# Build static site
npm run build

# Preview locally
npx serve out
```

Static HTML pages are generated in the `out/` directory.

---

## 🎨 AI Prompt Customization

The AI prompt is the core instruction set that guides how the LLM processes articles. Customizing it allows you to change the output characteristics.

### Location

**File:** `src/lib/ollama.ts` (lines 59-78)

### Current Prompt Design

The prompt is engineered to:
- Simplify complex language for general audiences
- Generate 60-80 word summaries
- Transform titles to be more accessible
- Maintain factual accuracy while improving clarity

### Customization Steps

1. **Open the AI service file:**
   ```bash
   src/lib/ollama.ts
   ```

2. **Locate the `createPrompt()` function** (line 59)

3. **Modify the prompt template:**
   ```typescript
   function createPrompt(title: string, body: string): string {
     return `[Your custom instructions here]

     // Key customization areas:
     // - Tone: formal, casual, technical, academic
     // - Length: 40-50, 60-80, 100-120 words
     // - Focus: technical details, human impact, policy implications
     // - Audience: general public, experts, students

     ...`;
   }
   ```

4. **Example: Academic/Research Focus**
   ```typescript
   return `You are an academic research assistant analyzing news articles.

   Transform this Guardian article:

   1. REWRITE THE TITLE: Make it precise and research-oriented
   2. SUMMARIZE: Provide a 100-120 word analytical summary focusing on:
      - Key findings and data points
      - Methodological aspects if mentioned
      - Implications for the field
      - Research gaps or questions raised

   Format your response EXACTLY like this:
   TITLE: [transformed title]
   SUMMARY: [analytical summary]

   Original Title: ${title}
   Article Content: ${body}`;
   ```

5. **Example: Technical/Data-Focused**
   ```typescript
   return `You are a data analyst processing news content.

   Transform this article with emphasis on:
   - Quantitative data and statistics
   - Technical terminology (preserve, don't simplify)
   - Methodological rigor
   - Evidence-based conclusions

   Provide a 80-100 word technical summary...`;
   ```

6. **Test your changes:**
   - Process 3-5 sample articles
   - Evaluate output quality
   - Iterate on prompt design
   - Compare results across prompt variations

7. **Important constraints:**
   - **Maintain format:** `TITLE: ... SUMMARY: ...`
   - This format is parsed by `parseOllamaResponse()` (lines 83-122)
   - If changing format, update the parser accordingly

### Prompt Engineering Best Practices

1. **Be specific:** Clear instructions yield better results
2. **Use examples:** Show the model what you want
3. **Set constraints:** Word count, tone, focus areas
4. **Iterative refinement:** Test and improve incrementally
5. **Format consistency:** Maintain parseable output structure

---

## 🌐 Deployment

This project is deployed on **Vercel** with automatic CI/CD from GitHub.

### Live Site

🌐 **[parho.net](https://parho.net)** - Production deployment

### Deployment Features

- ✅ Automatic builds on push to main branch
- ✅ Admin and summaries pages excluded from production (build script removes them)
- ✅ Custom domain with automatic SSL
- ✅ Global CDN delivery
- ✅ Preview deployments for pull requests

### Deployment Process

```bash
# Commit changes
git add .
git commit -m "Your changes"

# Push to GitHub
git push origin main

# Vercel automatically:
# 1. Detects the push
# 2. Runs npm run build
# 3. Executes postbuild script (removes admin/summaries)
# 4. Deploys to production CDN
# 5. Updates parho.net (~3 minutes)
```

### Alternative Deployment Options

This static Next.js export can be deployed to:
- **Vercel** (current, recommended)
- **Netlify** - Zero-config deployment
- **AWS S3 + CloudFront** - More control, complex setup
- **GitHub Pages** - Free static hosting
- **Any static host** - Upload the `out/` folder

---

## 🔬 Technical Highlights

### AI/ML Components

1. **Local LLM Inference**
   - Runs entirely on local hardware
   - No API costs or rate limits
   - Complete data privacy
   - Reproducible results

2. **Prompt Engineering**
   - Custom-designed instruction sets
   - Optimized for article summarization
   - Structured output parsing
   - Iteratively refined for quality

3. **Content Transformation Pipeline**
   - Automated title simplification
   - Summary generation with length constraints
   - Batch processing capability
   - Error handling and fallback mechanisms

### Development Stack

- **AI/ML:** Ollama (gpt-oss:20b - 20B parameters)
- **Backend:** Node.js, Next.js 14
- **Database:** SQLite (better-sqlite3)
- **Content:** MDX (Markdown + JSX)
- **Language:** TypeScript
- **Deployment:** Vercel (static export)

---

## 📚 Key Learnings & Insights

### AI Model Selection

Working with the 20B parameter model provided insights into:
- Trade-offs between model size and inference speed
- Quality improvements from larger parameter counts
- Hardware requirements for local LLM deployment
- Practical considerations for production use

### Prompt Engineering

Iterative prompt development demonstrated:
- Importance of clear, specific instructions
- Impact of output format specifications
- Value of constraint-based generation (word counts)
- Balance between creativity and consistency

### Production Deployment

Deploying AI-processed content at scale revealed:
- Batch processing optimization strategies
- Database design for AI-generated content
- Static site generation from dynamic AI outputs
- Cost-efficiency of local vs. API-based models

---

## 🎯 Future Enhancements

Potential areas for expansion:
- [ ] Multi-model comparison (testing different LLMs)
- [ ] Fine-tuning on domain-specific news corpus
- [ ] Sentiment analysis integration
- [ ] Multi-language support
- [ ] Topic clustering and categorization
- [ ] Quality metrics and evaluation framework
- [ ] A/B testing different prompt strategies

---

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Owais** - DevOps Engineer & AI Enthusiast
- Website: [owais.io](https://owais.io)
- LinkedIn: [Connect with Owais](https://linkedin.com/in/owais)

## 🤝 Development

This project was built with **AI-assisted coding** using [Claude Code](https://claude.com/claude-code), demonstrating how AI can accelerate software development while maintaining code quality and best practices.

---

Built as a demonstration of practical AI/ML application in content processing and transformation using open-source models.
