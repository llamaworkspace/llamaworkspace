<p align="center">
<a href="https://joia.so">
  <img width="90" src="https://assets.joia.so/joia_logo_red.svg" alt="Joia Logo">
  
</a>
</p>

<h3 align="center"><strong>The ChatGPT Team alternative that talks to any Large Language Model.</strong></h3>

[Joia](https://joia.so/) is a collaborative alternative to ChatGPT, designed from the ground up for team collaboration. It open source and has the added benefit that can connect to any Large Language Model; including those provided by OpenAI, OpenRouter, HuggingFace and Amazon Bedrock.

## Main features & benefits

- Easy to give access to LLMs like ChatGPT to entire teams.
- Use the latest open source LLMs like Llama 2, Mixtral and others.
- Create collaborative chatbots for specific use cases, and share them across your teams.
- Savings estimated of 50%-75% (depends on usage), when compared to ChatGPT Plus.
- Speed. Our benchmarks indicate that responses are on average 40% faster than ChatGPT Plus.
- Privacy. When using OpenAI models, your data is not used for training purposes. Similarly, when using other LLMs providers, your data is not used for training purposes.

## Getting started

#### Cloud

The easiest way to get started with Joia is with [our official managed service in the cloud](https://joia.so/). At the moment it is completely free to use without limits, although we have plans to introduce a pricing model in the future.

In the cloud version you can either use your own API keys for LLM provider, or purchase credits with us.

Our cloud version can save a substantial amount of developer time and resources. We think it's the de-facto solution for mot customers and the value option. Plus, any future revenues will go towards the funding nad maintenance of Joia. You’ll be supporting open source software and getting a great service!

#### Vercel

Vercel is the easiest way to deploy Joia. To do so, follow these steps:

1. Create a project by clicking on **Add New... > Project**.
2. Select **Import Third-Party Git Repository** and enter the URL of this repository.
3. Insert the environment variables. To do so, use `.env.example` as a reference for the variables to fill in. You'll need to set the `DATABASE_URL` variable to point to your Postgres database, which you can provision with Vercel.
4. Deploy the project.
5. Set up your domain to point to the Vercel deployment.

#### Fully self-hosted

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
