'use client'
import { AppHeader } from '@/components/global/app-header'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export default function AppPage() {
  return <Chat />
}

const Chat = () => {
  const [isActive, setIsActive] = useState(false)
  const toggleActive = () => setIsActive(!isActive)

  return (
    <>
      <div className="flex flex-col bg-yellow-300">
        <AppHeader />
      </div>
      <div
        className={cn(
          'flex flex-1 flex-col overflow-auto bg-purple-500',
          isActive ? 'block' : 'hidden',
        )}
      >
        <div>
          <div className="relative flex w-full min-w-0 flex-col p-2">
            <div className="bg-red-100 p-4">this is a sidebar group</div>
            <div className="bg-red-100 p-4">this is a sidebar group</div>
            <div className="bg-red-100 p-4">this is a sidebar group</div>
            <div className="bg-red-100 p-4">this is a sidebar group</div>
            <div className="bg-red-100 p-4">this is a sidebar group</div>
            <div className="bg-red-100 p-4">this is a sidebar group</div>
            <div className="bg-red-100 p-4">this is a sidebar group</div>
            <div className="bg-red-100 p-4">this is a thign</div>
            <div className="bg-red-100 p-4">this is a sidebar group</div>
            <div className="bg-red-100 p-4">this is a sidebar group</div>
            <div className="bg-red-100 p-4">this is a thign</div>
            <div className="bg-red-100 p-4">this is a sidebar group</div>
            <div className="bg-red-100 p-4">this is a sidebar group</div>
            <div className="bg-red-100 p-4">this is a thign</div>
            <div className="bg-red-100 p-4">this is a sidebar group</div>
            <div className="bg-red-100 p-4">this is a sidebar group</div>
            <div className="bg-red-100 p-4">this is a thign</div>
            <div className="bg-red-100 p-4">this is a sidebar group</div>
            <div className="bg-red-100 p-4">this is a sidebar group</div>
          </div>
        </div>
      </div>
      <div
        className={cn(
          'flex-colx flex bg-orange-400',
          isActive ? 'items-end' : 'flex-1 items-center',
        )}
      >
        <button onClick={toggleActive}>{isActive ? 'Hide' : 'Show'}</button>
        <ChatBox />
      </div>
    </>
  )
}

const ChatBox = () => {
  return <div className="rounded-xl bg-zinc-200 p-4">ChatBox</div>
}

const ChatMessage = () => {
  return <div className="bg-red-400 p-4">ChatMessage</div>
}
