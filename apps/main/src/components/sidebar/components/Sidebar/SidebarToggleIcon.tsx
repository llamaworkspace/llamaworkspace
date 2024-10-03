import Image from 'next/image'

export function SidebarToggleIcon() {
  return (
    <Image
      src="/images/sidebar_icon.svg"
      alt="Toggle sidebar"
      width={23}
      height={16}
    />
  )
}
