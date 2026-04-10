import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import React, { useMemo } from 'react'
import fm from 'front-matter'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { CalendarIcon, ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/blog/$slug')({
  component: BlogPostPage,
})

// Use import.meta.glob to read all markdown files
const postsData = import.meta.glob('/src/content/blog/*.md', { query: '?raw', eager: true, import: 'default' })

// Pre-parse the posts so we can look them up by slug
const posts = Object.entries(postsData).reduce((acc, [path, content]) => {
  const parsed = fm<any>(content as string)
  const slug = path.split('/').pop()?.replace('.md', '') || ''
  acc[slug] = {
    title: parsed.attributes.title,
    date: new Date(parsed.attributes.date),
    thumbnail: parsed.attributes.thumbnail,
    body: parsed.body,
  }
  return acc
}, {} as Record<string, any>)

function BlogPostPage() {
  const { slug } = Route.useParams()
  const post = posts[slug]
  const router = useRouter()

  const htmlContent = useMemo(() => {
    if (!post) return ''
    const rawHtml = marked.parse(post.body || '')
    return DOMPurify.sanitize(rawHtml as string)
  }, [post])

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <button onClick={() => router.history.back()} className="text-zinc-500 hover:text-black dark:hover:text-white underline underline-offset-4">Go Back</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg flex items-center justify-center font-black">AS</div>
            AttendanceSheet Pro
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link to="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Generator</Link>
            <Link to="/blog" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Blog</Link>
          </nav>
        </div>
      </header>

      <main className="py-12 px-4 md:py-20">
        <article className="max-w-3xl mx-auto">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-10 transition-colors"
          >
            <ArrowLeft size={16} /> Back to standard articles
          </Link>

          <header className="mb-12">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-4">
              <CalendarIcon size={16} />
              <time dateTime={post.date.toISOString()}>
                {post.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </time>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-8">
              {post.title}
            </h1>
            
            {post.thumbnail && (
              <div className="w-full h-64 md:h-96 rounded-3xl overflow-hidden mb-12 shadow-xl shadow-black/5">
                <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}
          </header>

          <div 
            className="prose prose-zinc dark:prose-invert prose-lg max-w-none 
                       prose-headings:font-bold prose-headings:tracking-tight
                       prose-a:underline-offset-4 hover:prose-a:text-rose-500 transition-colors
                       prose-img:rounded-2xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </article>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-12 px-4 mt-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to automate your registers?</h2>
          <p className="text-zinc-500 mb-8 max-w-md mx-auto">Generate beautiful attendance sheets in seconds, fully offline and absolutely free.</p>
          <Link to="/" className="inline-flex items-center gap-2 h-12 px-6 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all">
            Go to Generator
          </Link>
        </div>
      </footer>
    </div>
  )
}
