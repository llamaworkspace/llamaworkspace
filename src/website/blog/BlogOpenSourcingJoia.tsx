import { StyledLink } from '@/components/ui/StyledLink'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { numberToUsd } from '@/lib/utils'
import Head from 'next/head'
import Image from 'next/image'
import { BlogLayout } from './components/BlogLayout'

const POST_TITLE = `I'm open sourcing a "ChatGPT For Teams" alternative`
const HEAD_TITLE = `${POST_TITLE} - Joia`
const POST_DATE = 'February 29, 2024'
const HEAD_OG_IMAGE =
  'https://llamaworkspace.ai/images/2024-02/og_preview_feb_2024.png'
const HEAD_OG_DESCRIPTION = 'Joia, a collaborative alternative to ChatGPT.'
const HEAD_OG_URL = 'https://llamaworkspace.ai/blog/open-sourcing-joia'

export const BlogOpenSourcingJoia = () => {
  return (
    <>
      <Head>
        <title>{HEAD_TITLE}</title>
        <meta property="og:title" content={POST_TITLE} />
        <meta name="image" property="og:image" content={HEAD_OG_IMAGE} />
        <meta property="og:description" content={HEAD_OG_DESCRIPTION} />
        <meta property="og:url" content={HEAD_OG_URL} />
      </Head>
      <BlogLayout title={POST_TITLE} postDate={POST_DATE}>
        <p>
          <StyledLink href="https://github.com/imayolas/joia">
            <Image
              className="rounded bg-zinc-100 p-2"
              src="https://assets.llamaworkspace.ai/joia_github_feb_2024.png"
              alt="Joia Github page"
              width="752"
              height="467"
            />
          </StyledLink>
        </p>
        <p>
          I&apos;m a heavy user of Notion. I love its simplicity, flexibility,
          and how easy it is to collaborate with colleagues at work. Like many,
          I&apos;m also fascinated by the power of Large Language Models, and
          particularly by how the ChatGPT interface has made it so easy for the
          world to interact with them.
        </p>
        <p>
          That&apos;s why a few months ago I started working on my own version
          of ChatGPT: one that unifies the collaborative features and ease of
          use of Notion with the power of an AI Chat.
        </p>
        <p>
          After lots of testing and refining the product with my network of
          friends and some brave early-adopting companies, I am happy to{' '}
          <StyledLink href="https://github.com/imayolas/joia">
            open-source the project
          </StyledLink>
          .
        </p>
        <h2>What is Joia</h2>
        <p>
          Joia is an alternative to ChatGPT, primarily designed for
          organizations who want to give access to AI Chats to all their
          members.
        </p>
        <p>
          It is built around a shared workspace, similar to Notion, where admins
          can effortlessly add members. Each member, in addition to gaining
          access to the shared area, also has a private space to run their own
          queries.
        </p>
        <p>
          The main difference with ChatGPT is that Joia is crafted for a work
          environment.
        </p>
        <p>
          On one side, it filters out much of the noise associated with
          consumer-oriented GPTs (
          <span className="italic">AI Fitness Advisor</span>, I am looking at
          you), focusing on collaboration.
        </p>
        <p>
          On the other, being an open product, it can be self-hosted for maximum
          privacy, and it is compatible with any Large Language Model, whether
          open or closed source.
        </p>
        <h2>Multi Large Language Model support</h2>

        <Image
          className="rounded bg-zinc-100 p-2"
          src="https://assets.llamaworkspace.ai/joia_model_selection.png"
          alt="Large Language Model selection in Joia"
          width="1080"
          height="610"
        />

        <p>
          Paradoxically, while the open-source LLM ecosystem flourishes, main
          actors like OpenAI, Google, and Microsoft are betting on Chat
          interfaces that gate users into proprietary products and
          closed-sourced models.
        </p>
        <p>
          Well, I&apos;d like to prevent that from happening. I think users
          should decide which model to use for the task at hand.
        </p>
        <p>
          That&apos;s why I&apos;ve made it easy in Joia to switch between
          models.
        </p>
        <p>
          At the time of writing, I&apos;m providing initial access to the most
          popular ones, including Llama 2 70B (and CodeLlama 2 70B), Mixtral
          8X7B, Perplexity 70B, Gemini Pro, and more.
        </p>
        <p>
          I will keep adding new models, but if there&apos;s one you&apos;d like
          to see implemented in particular, shoot me a message on the{' '}
          <StyledLink href="https://discord.gg/wTHhNBDKvW">
            Discord #feedback channel
          </StyledLink>{' '}
          that I created for this purpose.
        </p>
        <p>
          Currently, all models are run by external cloud providers, and today
          the platform has connectors with OpenAI, Amazon Bedrock, Hugging Face,
          and Openrouter, with plans to add more soon.
        </p>
        <p>
          It is also possible to extend Joia with your own provider and models.
          It&apos;s not yet documented how, but it should be quite
          straightforward to do so by copying and pasting the{' '}
          <StyledLink href="https://github.com/imayolas/joia/tree/main/src/server/lib/ai-registry/providers">
            examples of the existing providers
          </StyledLink>
          . Beware that the implementation is still in its early stages and
          might change in upcoming releases.
        </p>

        <h2>Collaboration through Chatbots</h2>

        <Image
          className="rounded bg-zinc-100 p-2"
          src="https://assets.llamaworkspace.ai/joia_chatbot_instructions.png"
          alt="Chatbot setup"
          width="1080"
          height="610"
        />

        <p>
          OpenAI refers to them as &quot;GPTs&quot;, but since{' '}
          <StyledLink href="https://twitter.com/sama/status/1756073328421519452">
            Sam Altman admits they&apos;re not that great at naming
          </StyledLink>
          , I&apos;ll settle with <strong>Chatbots</strong>.
        </p>
        <p>
          Chatbots are one of the biggest productivity boosters that businesses
          can use. They are, in essence, a predefined prompt instructing how to
          respond to user input. And since great prompts are key to get a great
          response, it makes sense to have a way to create, iterate, and share
          them.
        </p>
        <p>
          I particularly find it useful in software development, when writing
          tests. Shooting a piece of code to ChatGPT and asking to write tests
          doesn&apos;t quite work. The tests won&apos;t match your
          codebase&apos;s style, they won&apos;t use the same libraries, or test
          what you&apos;d like them to. By having a predefined prompt with
          precise instructions and examples, you can ensure that the tests are
          written the way you want.
        </p>
        <p>
          I see in chatbots the area with the most potential for growth. I plan
          to add support for extra functionality like chatting with your data,
          linking with{' '}
          <StyledLink href="https://www.langchain.com/">Langchain</StyledLink>,
          and a more granular permissions system.
        </p>
        <p>
          I also see a lot of potential in creating a more sophisticated
          input/output interface, similar to what{' '}
          <StyledLink href="https://gradio.app/">Gradio</StyledLink> or{' '}
          <StyledLink href="https://streamlit.io/">Streamlit</StyledLink>{' '}
          provide. That would allow admins to create more flexible chatbots that
          better accommodate their internal business needs.
        </p>
        <h2>A cost-efficient alternative</h2>
        <p>
          Cost savings may not be the primary goal of the project, yet I help
          companies achieve just that.
        </p>
        <p>
          Today, implementing OpenAI&apos;s ChatGPT in a company costs $30 per
          seat per month. And while the cost might be justified for some roles,
          it quickly escalates when you want to roll it out to the entire staff.
        </p>
        <p>
          In contrast, my estimates indicate that the average spend per user in
          API credits is about $7/month. This data is based on early adopting
          companies of Joia, where some users initiated 0 chats/month while
          others initiated more than 2000.
        </p>
        <p>
          This represents a staggering 75% cost reduction. An amount that will
          decrease further as users adopt open-source models and the cost per
          token from AI providers continues to decrease.
        </p>
        <p>
          Here&apos;s a handy table that exemplifies how much a company can save
          based on its size.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number of employees</TableHead>
              <TableHead>ChatGPT annual cost*</TableHead>
              <TableHead>Joia annual cost**</TableHead>
              <TableHead>Annual savings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getSavingsData([10, 50, 100, 500, 1000]).map((data) => {
              return (
                <TableRow key={data.numberOfEmployees}>
                  <TableCell>{data.numberOfEmployees}</TableCell>
                  <TableCell>{numberToUsd(data.chatGptCost, 0)}</TableCell>
                  <TableCell>{numberToUsd(data.joiaCost, 0)}</TableCell>
                  <TableCell>{numberToUsd(data.savings, 0)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <div className="-mt-4 text-xs text-zinc-500">
          * &quot;ChatGPT for Teams&quot; cost of $30/user/month | ** Assumes an
          average consumption of $7/user/month in API credits.
        </div>
        <h2>Cloud version</h2>
        <p>
          If you&apos;re interested in trying Joia, or believe life is too short
          to self-host, I&apos;ve made a cloud version available.
        </p>
        <p>
          <StyledLink href="/auth/signin">
            Simply sign up with your Google account
          </StyledLink>{' '}
          and you&apos;ll be up and running in a matter of seconds.
        </p>
        <p>
          One of the benefits of the cloud version, compared to the self-hosted
          solution, is the ability to purchase credits directly on the platform.
          This means you don&apos;t have to create and manage any API keys from
          the AI providers.
        </p>
        <h2>Join the community</h2>
        <p>
          If you enjoy the project and would like to see it expand, I&apos;d
          appreciate it{' '}
          <StyledLink href="https://github.com/imayolas/joia">
            if you could star it on Github
          </StyledLink>
          , as this helps me spread the word.
        </p>
        <p>
          I&apos;ll be sharing updates and insights from{' '}
          <StyledLink href="https://twitter.com/joiahq">
            @joiaHQ on Twitter
          </StyledLink>
          . If you want to stay informed about the project, simply give it a
          follow.
        </p>
        <p>
          Lastly, to contribute, share feedback, or tell me what you would like
          me to build next, join the{' '}
          <StyledLink href="https://discord.gg/wTHhNBDKvW">
            #feedback channel on Discord
          </StyledLink>
          .
        </p>
      </BlogLayout>
    </>
  )
}

const getSavingsData = (numberOfEmployeesColl: number[]) => {
  const chatGptAnnualCostPerUser = 360
  const joiaAnnualCostPerUser = 84
  return numberOfEmployeesColl.map((numberOfEmployees) => {
    const savings = chatGptAnnualCostPerUser - joiaAnnualCostPerUser
    return {
      numberOfEmployees,
      chatGptCost: chatGptAnnualCostPerUser * numberOfEmployees,
      joiaCost: joiaAnnualCostPerUser * numberOfEmployees,
      savings: savings * numberOfEmployees,
    }
  })
}
