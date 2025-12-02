import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAllCategories } from '@/lib/mdx'

const inter = Inter({ subsets: ['latin'] })
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair'
})

export const metadata: Metadata = {
  title: 'parho.net - Curated News Summaries',
  description: 'Stay informed with AI-powered news summaries from The Guardian. Get the latest stories in digestible formats across world news, technology, politics, and more.',
  keywords: 'news, summaries, guardian, AI, current events, world news, technology, politics',
  authors: [{ name: 'Owais' }],
  creator: 'Owais',
  publisher: 'parho.net',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://parho.net',
    siteName: 'parho.net',
    title: 'parho.net - Curated News Summaries',
    description: 'Stay informed with AI-powered news summaries from The Guardian.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'parho.net - Curated News Summaries'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'parho.net - Curated News Summaries',
    description: 'Stay informed with AI-powered news summaries from The Guardian.',
    creator: '@owais',
    images: ['/og-image.jpg']
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categories = getAllCategories();

  return (
    <html lang="en" className={`${inter.className} ${playfair.variable}`}>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-F9F3MBFZHR"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-F9F3MBFZHR');
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <div className="min-h-screen flex flex-col">
          <Header categories={categories} />
          <main className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}