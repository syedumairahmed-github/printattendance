import { createFileRoute, Link } from '@tanstack/react-router'
import fm from 'front-matter'
import { CalendarIcon, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/blog/')({
  component: BlogIndex,
})

// Use import.meta.glob to read all markdown files in the folder at build time
const postsData = import.meta.glob('/src/content/blog/*.md', { query: '?raw', eager: true, import: 'default' })

// Parse the raw markdown files
const posts = Object.entries(postsData).map(([path, content]) => {
  const parsed = fm<any>(content as string)
  // Extract slug from filename (e.g. /src/content/blog/2026-04-10-hello.md -> 2026-04-10-hello)
  const slug = path.split('/').pop()?.replace('.md', '') || ''
  return {
    slug,
    title: parsed.attributes.title,
    date: new Date(parsed.attributes.date),
    excerpt: parsed.attributes.excerpt,
    thumbnail: parsed.attributes.thumbnail,
  }
}).sort((a, b) => b.date.getTime() - a.date.getTime())

function BlogIndex() {
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
            <span className="text-zinc-900 dark:text-white">Blog</span>
          </nav>
        </div>
      </header>

      <main className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Educator Resources</h1>
            <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
              Tips, guides, and updates to help you manage your classroom efficiently.
            </p>
          </div>

          <div className="grid gap-8">
            {posts.map(post => (
              <article key={post.slug} className="group flex flex-col md:flex-row gap-6 p-6 md:p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all">
                {post.thumbnail && (
                  <div className="w-full md:w-64 h-48 rounded-2xl overflow-hidden shrink-0">
                    <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                )}
                <div className="flex flex-col justify-center flex-1">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                    <CalendarIcon size={14} />
                    <time dateTime={post.date.toISOString()}>
                      {post.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </time>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight group-hover:text-black dark:group-hover:text-white transition-colors">
                    <Link to={`/blog/$slug`} params={{ slug: post.slug }} className="focus:outline-none focus-visible:underline">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-zinc-500 line-clamp-3 mb-6 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto">
                    <Link 
                      to={`/blog/$slug`} 
                      params={{ slug: post.slug }}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:gap-3 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-zinc-900"
                    >
                      Read full article <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}

            {posts.length === 0 && (
              <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <p className="text-zinc-500">No blog posts found yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
