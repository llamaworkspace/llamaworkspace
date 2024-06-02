import { StyledLink } from '@/components/ui/StyledLink'

export const PostError = () => {
  return (
    <div className="flex h-full w-full justify-center pt-32 text-center">
      <div className="space-y-2">
        <div className="text-2xl font-bold">This page does not exist</div>
        <div className="">
          <StyledLink href="/p">Go to a page that works.</StyledLink>
        </div>
      </div>
    </div>
  )
}
