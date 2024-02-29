<p align="center">
<a href="https://joia.so">
  <img width="90" src="https://assets.joia.so/joia_logo_red.svg" alt="Joia Logo">
  
</a>
</p>

<h3 align="center"><strong>A lightweight ChatGPT alternative designed for team collaboration</strong></h3>

[Joia](https://joia.so/) is an open source alternative to _[ChatGPT for Teams](https://openai.com/chatgpt/team)_, designed from the ground up for collaboration.

The easiest way to get started with Joia is by creating a [Joia Cloud account](https://joia.so/). If you prefer to self-host Joia, please refer to our documentation below.

## Main features & benefits

- Efortlessly grant **people access** to a user-friendly AI Chat.
- Use any LLM, including the **latest open source LLMs** like Llama 2, Mixtral and others (more coming soon).
- Create **collaborative chatbots** for specific use cases, and share them across your teams.
- **Save between of 50% and 75%** (depends on usage) compared to _ChatGPT for Teams_ and _ChatGPT Enterprise_.
- **Get responses 40% faster** than ChatGPT Plus. The OpenAI API is generally faster.
- **Prevent your prompts from being used for training purposes**. When using ChatGPT Plus, your data might then be used for training purposes. However, when connecting to OpenAI via API keys, you're guaranteed that any inputs provided won't be used.

## Getting started

#### Cloud

The easiest way to get started with Joia is with [our official managed service in the cloud](https://joia.so/). At the moment it is completely free to use without limits, although we have plans to introduce a pricing model in the future.

In the cloud version you can either use your own API keys for LLM provider, or purchase credits with us.

Our cloud version can save a substantial amount of developer time and resources. We think it's the de-facto solution for most customers and the one which provides most value for mone. Plus, any future revenues will go towards the funding and maintenance of Joia. You’ll be supporting open source software and getting a great service!

#### Vercel

To deploy on Vercel, follow these steps:

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

## Feedback

We are happy to hear your valuable feedback. For this purpose, we have created a [Discord channel](https://discord.com/invite/wTHhNBDKvW) where you can share your thoughts and ideas. [Join the channel here](https://discord.com/invite/wTHhNBDKvW).

## Roadmap

We welcome feedback from our community. To stay up to date with all the latest news and product updates or to reach us, [follow us on X (formerly Twitter)](https://twitter.com/joiahq).

## License & Trademarks

Joia is open source under the GNU Affero General Public License Version 3 (AGPLv3) or any later version.
