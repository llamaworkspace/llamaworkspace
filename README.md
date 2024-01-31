<p align="center">
<a href="https://joia.so">
  <img width="90" src="https://assets.joia.so/joia_logo_red.svg" alt="Joia Logo">
  
</a>
</p>

<h3 align="center"><strong>The "ChatGPT Team" alternative that talks to any Large Language Model.</strong></h3>

[Joia](https://joia.so/) is an open source alternative to "ChatGPT Team". It is designed from the ground up for team collaboration. It connects to any Large Language Model, including those provided by OpenAI, OpenRouter, HuggingFace and Amazon Bedrock; with more providers coming soon.

## Main features & benefits

- Provide access to a ChatGPT-like interface to entire teams.
- Easily consume the latest open source LLMs like Llama 2, Mixtral and others.
- Create reusable chatbots (also known as "GPTs"), and share them with your peers.
- Save between 50% and 75% (depends on usage) on ChatGPT access.
- Speed. Our benchmarks indicate a 40% faster response time than ChatGPT Plus.
- Your data is not used for training purposes, regardless of which Large Language Model you use, including OpenAI's GPT-4.

## Getting started

### Cloud

The easiest way to get started with Joia is with [our official managed service in the cloud](https://joia.so/). At the moment it is completely free to use without limits, although we have plans to introduce a pricing model in the future.

In the cloud version you can either use your own API keys to connect with the LLM providers, or purchase credits with us.

### Vercel

Vercel is the easiest way to deploy Joia. You can deploy it with one click by using the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/joiahq/joia)

If you want to manually set up the Vercel project, you can do so by following these steps:

1. Navigate to your project and add a new Postgres database. To do so, click on **Add new... > Store**.
2. Create a project by clicking on **Add New... > Project**.
3. Select **Import Third-Party Git Repository** and enter the URL of this repository.
4. Fill in the environment variables. To do so, use `.env.example` as a reference.
5. Deploy the project and set up the domain.

### Fully self-hosted

To self host a Joia app you'll need to follow the next steps:

1. Provision a Postgres database. The details may vary based on your stup.
2. Clone or copy this repository.
3. Create an `.env` file based on the `.env.example` file. You'll need to set the `DATABASE_URL` variable to point to your Postgres database.
4. Install the dependencies by running `yarn install`.
5. Build the NextJS app by running `yarn production:build`. This will prepare NextJS to be built and run the build itself.
6. Run a post-install script by running `yarn production:postbuild`. This script will run the migrations.
7. Bootstrap the app by running `yarn production:start`.

## Feedback & Roadmap

We welcome feedback from our community. We have a public roadmap driven by the features suggested by the community members. Take a look at our feedback board. Please let us know if you have any requests and vote on open issues so we can better prioritize.

To stay up to date with all the latest news and product updates, make sure to follow us on X (formerly Twitter), LinkedIn or Mastodon.

## Roadmap

We welcome feedback from our community. To stay up to date with all the latest news and product updates or to reach us, [follow us on X (formerly Twitter)](https://twitter.com/joiahq).

As the project matures, we will publish a formal public roadmap In the meantime, here is a recao of the main initiatives we will be working on:

- [ ] Allow to tune models with custom parameters.
- [ ] Connect with any HuggingFace model.
- [ ] Connect with Langchain.
- [ ] Support for text-to-image models like Stable Diffusion.
- [ ] Improve identity providers, including e-mail based logins.
- [ ] Folders and subfolders for chatbots.
- [ ] Improve granularity of shared chatbots.

## License & Trademarks

Joia is open source under the GNU Affero General Public License Version 3 (AGPLv3) or any later version.
