import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { CodeBlock } from './codeblock'

const MemoizedReactMarkdown = memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    (prevProps as { children?: string | null; className?: string }).children ===
      (nextProps as { children?: string | null; className?: string })
        .children &&
    (prevProps as { children?: string | null; className?: string })
      .className ===
      (nextProps as { children?: string | null; className?: string }).className,
)

export default function Markdown({ content }: { content: string }) {
  return (
    <MemoizedReactMarkdown
      className="custom-markdown break-words"
      remarkPlugins={[remarkGfm, remarkMath]}
      components={{
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>
        },
        code({
          inline,
          className,
          children,
          ...props
        }: {
          inline?: boolean
          className?: string
          children: React.ReactNode[]
        }) {
          if (children.length) {
            if (children[0] == '▍') {
              return (
                <span className="mt-1 animate-pulse cursor-default">▍</span>
              )
            }

            children[0] = (children[0] as string).replace('`▍`', '▍')
          }

          const match = /language-(\w+)/.exec(className ?? '')

          if (inline) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          }

          return (
            <CodeBlock
              key={Math.random()}
              language={match?.[1] ?? ''}
              value={String(children).replace(/\n$/, '')}
              {...props}
            />
          )
        },
      }}
    >
      {content}
    </MemoizedReactMarkdown>
  )
}
