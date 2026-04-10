import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import '../styles.css'

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "AttendanceSheet Pro",
      "applicationCategory": "EducationApplication",
      "operatingSystem": "Web",
      "description": "Free online attendance sheet generator for schools, colleges, and training institutes. Create, customize, and export attendance registers to Excel and PDF.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Excel export with multiple sheets",
        "PDF export in landscape A4",
        "Custom institute branding",
        "Holiday markers",
        "CSV student import",
        "Dark mode support"
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://spontaneous-kheer-afbe8e.netlify.app/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Attendance Sheet Generator",
          "item": "https://spontaneous-kheer-afbe8e.netlify.app/"
        }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I generate an attendance sheet?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Use our 4-step wizard: enter institute details, select the month and year, import your student list, then preview and download as Excel or PDF."
          }
        },
        {
          "@type": "Question",
          "name": "Can I export attendance sheets to Excel?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Click the Export to Excel button in the final step to download a formatted XLSX file with all student rows and working-day columns."
          }
        },
        {
          "@type": "Question",
          "name": "Does the tool exclude weekends automatically?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Saturdays and Sundays are automatically excluded from attendance columns. You can also mark additional holidays."
          }
        },
        {
          "@type": "Question",
          "name": "Is the attendance sheet generator free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, AttendanceSheet Pro is completely free to use with no account required."
          }
        }
      ]
    }
  ]
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'AttendanceSheet Pro — Free Attendance Register Generator for Schools & Colleges' },
      { name: 'description', content: 'Generate professional attendance sheets for schools, colleges, and training institutes. Export to Excel (XLSX) or PDF with custom branding, holiday markers, and student import. 100% free.' },
      { name: 'keywords', content: 'attendance sheet generator, attendance register, school attendance, college attendance, excel attendance sheet, PDF attendance, student attendance tracker' },
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: 'AttendanceSheet Pro' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'AttendanceSheet Pro — Free Attendance Register Generator' },
      { property: 'og:description', content: 'Generate professional attendance sheets for schools, colleges, and training institutes. Export to Excel or PDF instantly.' },
      { property: 'og:url', content: 'https://spontaneous-kheer-afbe8e.netlify.app/' },
      { property: 'og:site_name', content: 'AttendanceSheet Pro' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'AttendanceSheet Pro — Free Attendance Register Generator' },
      { name: 'twitter:description', content: 'Generate professional attendance sheets for schools, colleges, and training institutes. Export to Excel or PDF.' },
      { rel: 'canonical', href: 'https://spontaneous-kheer-afbe8e.netlify.app/' },
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(jsonLd),
      }
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
