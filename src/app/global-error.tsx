'use client'

import NextError from 'next/error'

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  return (
    <html>
      <body>
        {/* This is the default Next.js error component but it doesn't allow omitting the statusCode property yet. */}
        <NextError statusCode={500} />
      </body>
    </html>
  )
}
