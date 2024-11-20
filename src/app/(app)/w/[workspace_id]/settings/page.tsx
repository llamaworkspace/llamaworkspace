import { redirect } from 'next/navigation'

export default async function SettingsPageRedirector(props: {
  params: Promise<{ workspace_id: string }>
}) {
  const params = await props.params
  const { workspace_id } = params

  redirect(`/w/${workspace_id}/settings/general`)
  return null
}
