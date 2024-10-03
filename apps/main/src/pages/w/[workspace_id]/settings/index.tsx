import type { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps<{
  workspaceId: string
}> = async ({ params }) => {
  const workspaceId = params?.workspace_id as string

  return Promise.resolve({
    redirect: {
      destination: `/w/${workspaceId}/settings/general`,
      permanent: false,
    },
  })
}

export default function SettingsIndexPage() {
  return null
}
