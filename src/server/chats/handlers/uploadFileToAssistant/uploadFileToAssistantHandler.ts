import { withMiddlewareForAppRouter } from '@/server/middlewares/withMiddleware'
import { NextResponse } from 'next/server'

async function handler(req: Request) {
  const formData = await req.formData()
  console.log('formData', formData)
  const file = formData.get('file')
  console.log('file', file)

  if (!file) {
    return NextResponse.json({ error: 'No files received.' }, { status: 400 })
  }
  //  Store the file locally

  // Set chat type to "assistant" if it's not set
  // Create a vectorStore if it doesn't exist
  // Create assistantId if it doesn't exist, linked to the vectorStore
  // Handle file upload to the assistant

  // handle vectorStore deletion
  // handle assistant deletion

  return NextResponse.json({ file: file.name }, { status: 200 })
  return NextResponse.json({ ok: 'true' })
}

export const uploadFileToAssistantHandler = withMiddlewareForAppRouter(handler)
