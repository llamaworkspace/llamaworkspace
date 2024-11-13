import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="">
        <div>hello</div>
      </main>
    </HydrateClient>
  );
}
