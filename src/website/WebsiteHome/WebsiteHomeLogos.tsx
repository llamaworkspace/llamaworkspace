export default function WebsiteHomeLogos() {
  return (
    <div className="mx-auto max-w-6xl rounded-lg px-6 lg:px-0">
      <h2 className="text-center font-heading text-2xl font-semibold tracking-tight text-zinc-900">
        Trusted by +800 teams and employees at
      </h2>
      <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 opacity-70 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
        <img
          alt="Elastic"
          src="/images/2024-10/elastic.png"
          width={158}
          height={48}
          className="col-span-2 max-h-12 w-full object-contain brightness-0 lg:col-span-1"
        />
        <img
          alt="Frisokar"
          src="/images/2024-10/frisokar.png"
          width={158}
          height={48}
          className="col-span-2 max-h-12 w-full object-contain brightness-0 lg:col-span-1"
        />
        <img
          alt="Easyjet"
          src="/images/2024-10/easyjet.png"
          width={158}
          height={48}
          className="col-span-2 max-h-12 w-full object-contain brightness-0 lg:col-span-1"
        />
        <img
          alt="Publicis"
          src="/images/2024-10/publicis.png"
          width={158}
          height={48}
          className="col-span-2 max-h-12 w-full object-contain brightness-0 sm:col-start-2 lg:col-span-1"
        />
        <img
          alt="Factorial"
          src="/images/2024-10/factorial.png"
          width={158}
          height={48}
          className="col-span-2 col-start-2 max-h-12 w-full object-contain brightness-0 sm:col-start-auto lg:col-span-1"
        />
      </div>
    </div>
  )
}
