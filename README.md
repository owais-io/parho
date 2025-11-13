# parho.net - AI-Powered News Summaries

A modern, responsive Next.js website that showcases AI-summarized news articles from The Guardian API. Built with TypeScript, Tailwind CSS, and featuring a beautiful glassmorphism design.

## 🚀 Features

- **Modern Design**: Clean, responsive interface with glassmorphism effects and smooth animations
- **AI Summaries**: 60-80 word article summaries powered by Ollama locally
- **Category Organization**: 12+ categories including World News, Technology, Politics, Business, Sports, etc.
- **Infinite Loading**: Load more articles with elegant pagination
- **Interactive Modals**: Beautiful summary modals with full article details
- **Mobile Responsive**: Optimized for all device sizes
- **Fast Navigation**: Intuitive header with category dropdown
- **SEO Optimized**: Meta tags and structured data for better search visibility

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, Static Export)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Fonts**: Inter + Playfair Display (Google Fonts)
- **Database**: SQLite (better-sqlite3)
- **Content**: MDX (Markdown + JSX)
- **AI**: Ollama (Local LLM - llama3.2:3b)
- **API**: The Guardian Open Platform API
- **Deployment**: AWS Amplify (static hosting)

## 📁 Project Structure

```
parho/
├── src/
│   ├── app/
│   │   ├── admin/              # Admin panel (local only)
│   │   ├── api/
│   │   │   ├── articles/       # Guardian API endpoints
│   │   │   ├── guardian/       # Fetch articles
│   │   │   ├── mdx-articles/   # Read MDX files
│   │   │   ├── process/        # Ollama AI processing
│   │   │   ├── summaries/      # Summary management
│   │   │   └── deploy/         # Create MDX files
│   │   ├── categories/
│   │   │   ├── [slug]/         # Dynamic category pages
│   │   │   └── page.tsx        # All categories
│   │   ├── summaries/          # Summaries page (local only)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx            # Homepage
│   ├── components/
│   │   ├── ArticleCard.tsx
│   │   ├── ArticleGrid.tsx     # Client-side article grid
│   │   ├── CategoryCard.tsx
│   │   ├── CategoryArticleGrid.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── LoadMoreButton.tsx
│   │   └── SummaryModal.tsx
│   ├── lib/
│   │   ├── db.ts               # SQLite database functions
│   │   ├── mdx.ts              # MDX file operations
│   │   └── ollama.ts           # Ollama AI integration
│   └── types/
│       └── index.ts
├── content/
│   └── articles/               # MDX files (generated)
├── articles.db                 # SQLite database
├── amplify.yml                 # AWS Amplify config
├── .env.example                # Environment variables template
└── next.config.js              # Next.js configuration
```

## 🚦 Getting Started

### Prerequisites

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **Ollama** - [Download here](https://ollama.com/download)
3. **Guardian API Key** - [Get it free here](https://open-platform.theguardian.com/access/)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/owais-io/parho.git
   cd parho
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Ollama:**
   ```bash
   # Pull the required model (3GB download)
   ollama pull llama3.2:3b

   # Verify Ollama is running
   ollama list
   ```

4. **Configure environment variables:**
   ```bash
   # Copy the example file
   cp .env.example .env.local

   # Edit .env.local and add your Guardian API key
   ```

   Your `.env.local` should look like:
   ```env
   GUARDIAN_API_KEY=your_guardian_api_key_here
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.2:3b
   NODE_ENV=development
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database

The repository includes a pre-configured SQLite database (`articles.db`) with the schema already set up and sample articles. No additional database configuration needed!

### Fetching Fresh Articles (Optional)

1. Make sure Ollama is running locally
2. Go to [http://localhost:3000/admin](http://localhost:3000/admin)
3. Click "Fetch Articles from Guardian API"
4. Select articles to process with AI
5. Click "Process Selected Articles" (generates summaries using Ollama)
6. Click "Deploy" to create MDX files in `content/articles/`

### Build for Production (Static Export)

```bash
# Build static site
npm run build

# Preview locally
npx serve out
```

The build will generate static HTML pages in the `out/` directory.

## 🎨 Design Features

### Color Scheme
- **Primary**: Blue gradient (#0ea5e9 to #0284c7)
- **Accent**: Orange (#f97316)
- **Background**: Light gray gradients with glassmorphism
- **Typography**: Inter (body) + Playfair Display (headings)

### Animations
- Smooth hover effects on article cards
- Glassmorphism backdrop blur effects
- Slide-up animations for modals
- Transform animations for interactive elements

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Collapsible navigation for mobile
- Optimized image loading

## 📱 Pages Overview

### Homepage (`/`)
- Hero section with site statistics
- Featured articles grid (first 3 articles)
- Latest articles with infinite scroll
- Load more functionality (10 articles at a time)

### Categories Page (`/categories`)
- Grid of all 12 categories
- Article count per category
- Beautiful category cards with hover effects

### Individual Category (`/categories/[slug]`)
- Category-specific articles
- Breadcrumb navigation
- Category statistics
- Filtered article loading

## 🔄 Data Flow

1. **Fetch** - Admin page fetches latest articles from Guardian API
2. **Process** - Articles are sent to Ollama AI for summarization (60-80 words)
3. **Store** - Summaries stored in SQLite database
4. **Deploy** - Creates MDX files in `content/articles/` directory
5. **Build** - Next.js generates static HTML pages from MDX files
6. **Serve** - Static pages deployed to AWS Amplify (or any static host)

## 🌐 Deployment

This project is configured for static export and can be deployed to:

- **AWS Amplify** (recommended) - Auto-deploys from GitHub
- **Vercel** - Zero-config deployment
- **Netlify** - Drag and drop or Git integration
- **GitHub Pages** - Free static hosting
- **Any static host** - Just upload the `out/` folder

### AWS Amplify Deployment

The repository includes `amplify.yml` configuration:
- Automatically builds on push to main branch
- Excludes admin and summaries pages from production
- Sets up custom domain with SSL
- Free tier: 1000 build minutes/month

See the full deployment guide in the [deployment documentation](#).

## 🎯 Future Enhancements

- [ ] Search functionality across articles
- [ ] User preferences and bookmarks
- [ ] Newsletter subscription
- [ ] RSS feed generation
- [ ] Social sharing features
- [ ] Dark mode support
- [ ] Progressive Web App (PWA) features
- [ ] Article recommendations based on reading history
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Owais** - DevOps Engineer & Full-Stack Developer
- Website: [owais.io](https://owais.io)
- LinkedIn: [Connect with Owais](https://linkedin.com/in/owais)

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS