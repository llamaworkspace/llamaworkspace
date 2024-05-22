import { Context } from '@temporalio/activity'

export async function purchase(id: string): Promise<string> {
  console.log(`Purchased ${id}!`)
  await Promise.resolve()
  return Context.current().info.activityId
}
