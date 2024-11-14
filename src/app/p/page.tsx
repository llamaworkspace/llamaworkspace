'use client'
import { AppHeader } from '@/components/global/app-header'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Chatbox } from './chatbox'

export default function AppPage() {
  return <Chat />
}

const Chat = () => {
  const [isActive, setIsActive] = useState(false)
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
            <ChatItem />
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
          <div className="mx-auto mb-6 max-w-3xl text-3xl font-semibold tracking-tighter text-zinc-950">
            How can I help you today?
          </div>
          <Chatbox onClick={toggleActive} />
          <div className="mx-auto max-w-3xl">
            <button onClick={toggleActive}>{isActive ? 'Hide' : 'Show'}</button>
          </div>
        </div>
      </div>
    </>
  )
}

const ChatItem = () => {
  return <div className="mb-4 bg-red-100 p-4">this is a sidebar group</div>
}
