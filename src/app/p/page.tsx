'use client'
import { AppHeader } from '@/components/global/app-header'
import { cn } from '@/lib/utils'
import { Author } from '@/shared/aiTypesAndMappers'
import { useState } from 'react'
import { ChatMessage } from './chat-message'
import { Chatbox } from './chatbox'

export default function AppPage() {
  return <Chat />
}

const Chat = () => {
  const [isActive, setIsActive] = useState(true)
  const toggleActive = () => setIsActive(!isActive)

  return (
    <>
      <div className="flex flex-col">
        <AppHeader />
      </div>
      <div
        className={cn(
          'flex flex-1 flex-col overflow-auto',
          isActive ? 'block' : 'hidden',
        )}
      >
        <div>
          <div className="relative mx-auto flex w-full min-w-0 max-w-3xl flex-col">
            <ChatMessage
              author={Author.User}
              message="Hello, I would like to know more about Joia."
            />
            <ChatMessage
              author={Author.Assistant}
              message={`Yes, it is possible to track a request lifecycle from the frontend to account for network costs using OpenTelemetry (OTel). To achieve this, you can follow these steps:

Instrument the Frontend:

Use an OpenTelemetry SDK for the frontend (e.g., JavaScript SDK) to create a root span when the request is initiated. This span will represent the entire lifecycle of the request.
Start the root span when the fetch or XMLHttpRequest is initiated in the frontend.
Propagate Context:

Use the W3C Trace Context standard to propagate the trace context (trace ID and span ID) from the frontend to the backend. This is typically done by adding specific headers (e.g., traceparent) to the HTTP request.
Instrument the Backend:

Ensure that your backend services are also instrumented with OpenTelemetry. When the backend receives the request, it should extract the trace context from the incoming request headers and continue the trace by creating child spans.
Complete the Trace:

Once the backend processing is complete and the response is sent back to the frontend, the frontend should finish the root span when the response is received.
Collect and Analyze Traces:

Use an OpenTelemetry-compatible backend (e.g., Jaeger, Zipkin, or a cloud-based solution) to collect and visualize the traces. This will allow you to see the entire request lifecycle, including network latency and processing time across different services.
By following these steps, you can effectively track the request lifecycle from the frontend, through the network, and into the backend, providing insights into network costs and performance.`}
            />
            <ChatMessage
              author={Author.User}
              message="Hello, I would like to know more about Joia."
            />
            <ChatMessage
              author={Author.Assistant}
              message={`Yes, it is possible to track a request lifecycle from the frontend to account for network costs using OpenTelemetry (OTel). To achieve this, you can follow these steps:

Instrument the Frontend:

Use an OpenTelemetry SDK for the frontend (e.g., JavaScript SDK) to create a root span when the request is initiated. This span will represent the entire lifecycle of the request.
Start the root span when the fetch or XMLHttpRequest is initiated in the frontend.
Propagate Context:

Use the W3C Trace Context standard to propagate the trace context (trace ID and span ID) from the frontend to the backend. This is typically done by adding specific headers (e.g., traceparent) to the HTTP request.
Instrument the Backend:

Ensure that your backend services are also instrumented with OpenTelemetry. When the backend receives the request, it should extract the trace context from the incoming request headers and continue the trace by creating child spans.
Complete the Trace:

Once the backend processing is complete and the response is sent back to the frontend, the frontend should finish the root span when the response is received.
Collect and Analyze Traces:

Use an OpenTelemetry-compatible backend (e.g., Jaeger, Zipkin, or a cloud-based solution) to collect and visualize the traces. This will allow you to see the entire request lifecycle, including network latency and processing time across different services.
By following these steps, you can effectively track the request lifecycle from the frontend, through the network, and into the backend, providing insights into network costs and performance.`}
            />
            {/* <ChatItem />
            <ChatItem />
            <ChatItem />
            <ChatItem />
            <ChatItem />
            <ChatItem />
            <ChatItem />
            <ChatItem />
            <ChatItem />
            <ChatItem />
            <ChatItem />
            <ChatItem />
            <ChatItem />
            <ChatItem />
            <ChatItem />
            <ChatItem /> */}
          </div>
        </div>
      </div>
      <div
        className={cn(
          'flex-colx flex',
          isActive ? 'items-end' : 'flex-1 items-center',
        )}
      >
        <div className="w-full">
          {!isActive && (
            <div className="mx-auto mb-6 max-w-3xl text-3xl font-semibold tracking-tighter text-zinc-950">
              How can I help you today?
            </div>
          )}
          <Chatbox onClick={toggleActive} />
          <div className="mx-auto max-w-3xl">
            <button onClick={toggleActive}>{isActive ? 'Hide' : 'Show'}</button>
          </div>
        </div>
      </div>
    </>
  )
}
