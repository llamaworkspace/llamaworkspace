import { useCreateSharedChat } from '@/components/chats/chatHooks'
import { usePosts } from '@/components/posts/postsHooks'
import {
  Section,
  SectionBody,
  SectionWrapper,
  SectionWrapperTitle,
} from '@/components/ui/Section'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Post } from '@prisma/client'

const AppsTable = () => {
  const { data: posts } = usePosts()
  console.log(1, posts)

  return (
    <div>
      {posts?.map((post) => {
        return <AppsTableRow key={post.id} post={post} />
      })}
    </div>
  )
}

const AppsTableRow = ({ post }: { post: Post }) => {
  const { mutate: createChat } = useCreateSharedChat()

  const handleCreateChat = () => {
    createChat({ postId: post.id })
  }

  return (
    <div onClick={handleCreateChat} className="py-4">
      {post.title ?? 'Untitled'} (click to create chat)
    </div>
  )
}

export const AppsList = () => {
  return (
    <SectionWrapper>
      <SectionWrapperTitle>Explore GPTs</SectionWrapperTitle>
      <Section>
        <SectionBody>
          <AppsTable />
        </SectionBody>
      </Section>
    </SectionWrapper>
  )
}

const DaTable = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[320px]">Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Input*</TableHead>
          <TableHead>Response*</TableHead>
          <TableHead>Enabled</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="h-10">
          <TableCell>lorem</TableCell>
          <TableCell>huas</TableCell>
          <TableCell>thinkgg</TableCell>
          <TableCell>pepe</TableCell>
          <TableCell>thing</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
