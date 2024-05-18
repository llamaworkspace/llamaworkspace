import { NextRequest, NextResponse } from 'next/server'
// prettier-ignore-start
// Prettier ignore to avoid prettier-plugin-organize-imports
// // from moving the import below
// import 'zod-openapi/extend'
// // prettier-ignore-end
// import { createDocument } from 'zod-openapi'
import { z } from 'zod'

// const jobId = z.string().openapi({
//   description: 'A unique identifier for a job',
//   example: '12345',
//   ref: 'jobId',
// })

// const title = z.string().openapi({
//   description: 'Job title',
//   example: 'My job',
// })

// const document = createDocument({
//   openapi: '3.1.0',
//   info: {
//     title: 'My API',
//     version: '1.0.0',
//   },
//   paths: {
//     '/jobs/{jobId}': {
//       put: {
//         requestParams: { path: z.object({ jobId }) },
//         requestBody: {
//           content: {
//             'application/json': { schema: z.object({ title }) },
//           },
//         },
//         responses: {
//           '200': {
//             description: '200 OK',
//             content: {
//               'application/json': { schema: z.object({ jobId, title }) },
//             },
//           },
//         },
//       },
//     },
//   },
// })

const schema = z.object({
  chatId: z.string(),
  messages: z.array(
    z.object({
      role: z.string(),
      content: z.string(),
    }),
  ),
})

type RequestBody = z.infer<typeof schema>

export default async function chatStreamedResponseHandlerV2(req: NextRequest) {
  await Promise.resolve()

  // Apply common operations like validation, permissions, etc
  // I get chatId, check which type to use (which Strategy)
  // Run strategy

  try {
    const body = (await req.json()) as RequestBody
    const response = schema.parse(body)

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      {
        message: `Yo, bad payloadsss!`,
      },
      { status: 400 },
    )
  }

  // await Promise.resolve()
  // return NextResponse.json({ success: true })
}

// const nextApiWrapper = async (func: (req: NextRequest) => Promise<unknown>) => {
//   return async (req: NextRequest) => {
//     const response = func(req)
//     if (isPromise(response)) {
//       return await response
//     }
//     return response
//   }
// }

// export default nextApiWrapper(chatStreamedResponseHandlerV2)
