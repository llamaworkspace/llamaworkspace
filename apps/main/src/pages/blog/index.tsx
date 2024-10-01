import { BlogLayout } from '@/website/blog/components/BlogLayout'
import Link from 'next/link'

const pages = [
  {
    name: 'Privacy policy',
    href: '/blog/privacy-policy',
  },
]

export default function BlogIndexPage() {
  return (
    <BlogLayout title={'Articles'} hideAuthor={true}>
      <ul>
        {pages.map((page) => (
          <li key={page.href}>
            <Link href={page.href}>{page.name}</Link>
          </li>
        ))}
      </ul>
    </BlogLayout>
  )
}
