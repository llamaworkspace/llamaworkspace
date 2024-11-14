export default function AppPage() {
  return <Chat />
}

const Chat = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-zinc-200/50">x</div>
        <div className="aspect-video rounded-xl bg-zinc-200/50">x</div>
        <div className="aspect-video rounded-xl bg-zinc-200/50">x</div>
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-zinc-200/50 md:min-h-min"></div>
    </div>
  )
}
