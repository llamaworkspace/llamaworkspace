import { SidebarTrigger } from '../ui/sidebar'

export function AppHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="h-5 w-5" />
        <div
          data-orientation="vertical"
          role="none"
          className="bg-border mr-2 h-4 w-[1px] shrink-0"
        ></div>
        <nav className="" aria-label="breadcrumb">
          <ol className="text-muted-foreground flex flex-wrap items-center gap-1.5 break-words text-sm sm:gap-2.5">
            <li className="hidden items-center gap-1.5 md:block">
              <a className="hover:text-foreground transition-colors" href="#">
                Building Your Application
              </a>
            </li>
            <li
              role="presentation"
              aria-hidden="true"
              className="[&amp;>svg]:w-3.5 [&amp;>svg]:h-3.5 hidden md:block"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chevron-right"
              >
                <path d="m9 18 6-6-6-6"></path>
              </svg>
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span
                role="link"
                aria-disabled="true"
                aria-current="page"
                className="text-foreground font-normal"
              >
                Data Fetching
              </span>
            </li>
          </ol>
        </nav>
      </div>
    </header>
  )
}
