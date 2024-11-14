export default function AppPage() {
  return <Chat />
}

const Chat = () => {
  return (
    <div className="flex flex-1 flex-col bg-blue-50 p-4 pt-0">
      <div className="flex grow flex-col gap-4 bg-green-400">
        <ChatMessage />
        <ChatMessage />
        <ChatMessage />
        <ChatMessage />
        <ChatMessage />
        <ChatMessage />
        <ChatMessage />
        <ChatMessage />
        <ChatMessage />
        <ChatMessage />
        <ChatMessage />
        <ChatMessage />
        <ChatMessage />
        <ChatMessage />
        <ChatMessage />
      </div>
      <ChatBox />
    </div>
  )
}

const ChatBox = () => {
  return <div className="w-2xl rounded-lg bg-zinc-200 p-4">ChatBox</div>
}

const ChatMessage = () => {
  return <div className="bg-red-400 p-4">ChatMessage</div>
}
