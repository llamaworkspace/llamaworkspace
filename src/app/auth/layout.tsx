import '@/styles/globals.css'

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto flex h-full max-w-4xl items-center justify-center sm:max-w-[360px]">
      {children}
    </div>
  )
}
