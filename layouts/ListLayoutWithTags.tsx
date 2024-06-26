/* eslint-disable jsx-a11y/anchor-is-valid */
'use client'

import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import tagData from 'app/tag-data.json'
import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import Image from '@/components/Image'
interface PaginationProps {
  totalPages: number
  currentPage: number
}
interface ListLayoutProps {
  posts: CoreContent<Blog>[]
  title: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: PaginationProps
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const basePath = pathname.split('/')[1]
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <div className="space-y-2 pb-8 pt-6 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
            Previous
          </button>
        )}
        {prevPage && (
          <Link
            href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
            rel="prev"
          >
            Previous
          </Link>
        )}
        <span>
          {currentPage} of {totalPages}
        </span>
        {!nextPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
            Next
          </button>
        )}
        {nextPage && (
          <Link href={`/${basePath}/page/${currentPage + 1}`} rel="next">
            Next
          </Link>
        )}
      </nav>
    </div>
  )
}

export default function ListLayoutWithTags({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
}: ListLayoutProps) {
  const [searchValue, setSearchValue] = useState('')
  const [pageViews, setPageViews] = useState<Record<string, number | undefined>>({})

  const filteredBlogPosts = posts.filter((post) => {
    const searchContent = post.title + post.summary + post.tags?.join(' ')
    return searchContent.toLowerCase().includes(searchValue.toLowerCase())
  })

  useEffect(() => {
    posts.forEach((post) => {
      const slug = post.slug
      if (slug && !(slug in pageViews)) {
        // Assume undefined means loading
        setPageViews((prevPageViews) => ({
          ...prevPageViews,
          [slug]: undefined,
        }))

        fetch(`/api/page-views?slug=${encodeURIComponent(slug)}`)
          .then((response) => response.json())
          .then((data) => {
            setPageViews((prevPageViews) => ({
              ...prevPageViews,
              [slug]: data.pageViewCount,
            }))
          })
          .catch((error) => console.error('Error fetching page views:', error))
      }
    })
  }, [posts])

  // If initialDisplayPosts exist, display it if no searchValue is specified
  const displayPosts =
    initialDisplayPosts.length > 0 && !searchValue ? initialDisplayPosts : filteredBlogPosts

  return (
    <>
      <div className="divide-accent-foreground dark:divide-accent divide-y">
        <div className="space-y-2 py-8 md:space-y-5">
          <h1 className="text-foreground text-3xl font-extrabold leading-9 tracking-tight sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            {title}
          </h1>
          <div className="relative w-full">
            <label>
              <span className="sr-only">Search articles</span>
              <input
                aria-label="Search articles"
                type="text"
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search articles"
                className="border-muted-foreground bg-secondary text-muted-foreground focus:border-primary focus:ring-primary dark:border-muted placeholder-muted-foreground block w-full rounded-md border px-4 py-2"
              />
            </label>
            <Search className="text-muted-foreground absolute right-3 top-3 h-5 w-5" />
          </div>
        </div>
        <ul>
          {!filteredBlogPosts.length && 'No posts found.'}
          {displayPosts.map((post) => {
            const { slug, path, date, title, summary, tags, thumbnail } = post
            return (
              <li key={path} className="py-4">
                <article className="space-y-2 xl:grid xl:grid-cols-5 xl:items-start xl:gap-4 xl:space-y-0">
                  <div className="xl:col-span-2">
                    <Link href={`/${path}`}>
                      <div className="aspect-w-16 aspect-h-9">
                        <Image
                          src={thumbnail || ''}
                          alt={`${title} images`}
                          height="0"
                          width="0"
                          className="mb-4 h-fit w-full rounded-md"
                          unoptimized
                        />
                      </div>
                    </Link>
                  </div>
                  <div className="space-y-3 xl:col-span-3">
                    <div>
                      <h3 className="mb-2 text-2xl font-bold leading-8 tracking-tight">
                        <Link href={`/${path}`} className="text-foreground">
                          {title}
                        </Link>
                      </h3>
                      <div className="flex flex-wrap space-x-3">
                        {tags?.map((tag) => <Tag key={tag} text={tag} />)}
                      </div>
                    </div>
                    <div className="text-muted-foreground prose prose-sm max-w-none">{summary}</div>
                    <div>
                      <dl>
                        <dt className="sr-only">Published on</dt>
                        {/* <dd className="text-muted-foreground flex gap-1 text-base font-medium leading-6">
                          {isLoadingViewCount ? (
                            <span className="flex items-center justify-center gap-2">
                              <Skeleton className="h-6 w-12" />
                              <span> views</span>
                            </span>
                          ) : (
                            <span>{pageViews[slug]?.toLocaleString() || '...'} views</span>
                          )}
                          <span>・</span>
                        </dd> */}
                        <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                      </dl>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      {pagination && pagination.totalPages > 1 && !searchValue && (
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
      )}
    </>
  )
}
