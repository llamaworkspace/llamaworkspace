import Image from 'next/image'

export const WebsiteHomeHeroProductShot = () => {
  return (
    <div className="-m-2 rounded-xl bg-zinc-900/5 p-2 ring-1 ring-inset ring-zinc-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
      <Image
        src="https://assets.llamaworkspace.ai/2024-03_home_product_shot_mobile.png"
        alt="Joia product shot"
        className="md:hidden"
        width="690"
        height="743"
      />
      <Image
        src="https://assets.llamaworkspace.ai/2024-03_home_product_shot.png"
        alt="Joia product shot"
        width="1088"
        height="582"
        className="hidden md:block"
      />
    </div>
  )
}
