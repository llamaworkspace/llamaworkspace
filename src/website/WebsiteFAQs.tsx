import { StyledLink } from '@/components/ui/StyledLink'
import { Disclosure } from '@headlessui/react'
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/outline'

const formatter = new Intl.NumberFormat()

const COST_1M_OUTPUT_TOKENS = 10
const CHATGPT_TEAMS_COST = 30
const HARRY_POTTER_BOOK_NUM_WORDS = 257_045
const AVG_WORDS_MONTH_INDIVIDUAL = 100_000

const tokenCost = COST_1M_OUTPUT_TOKENS / 1_000_000
const wordCost = tokenCost * 2.5

const chatGptTeamsWordsToBreakEven = CHATGPT_TEAMS_COST / wordCost

const numBooksMultiplier = Math.floor(
  chatGptTeamsWordsToBreakEven / HARRY_POTTER_BOOK_NUM_WORDS,
)

const totalCost = AVG_WORDS_MONTH_INDIVIDUAL * wordCost

export function WebsiteFAQs() {
  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-0">
      <h1 className="font-heading max-w-3xl text-4xl font-semibold tracking-tighter text-zinc-900 sm:text-6xl ">
        FAQs
      </h1>
      <div className="divide-y divide-zinc-700/10">
        <dl className="mt-10 space-y-6 divide-y divide-zinc-700/10">
          <Faq
            question="Why is Llama Workspace more affordable than other commercial solutions like ChatGPT or Claude?"
            answer={() => {
              return (
                <>
                  <p>
                    It is more affordable because, instead of charging you an
                    expensive monthly flat fee, you only pay for the generated
                    words, which turns out to be significantly cheaper.
                  </p>
                  <p>
                    Llama Workspace connects to AI providers like OpenAI and
                    Anthropic via API. In the API, each word for the most
                    commonly used model (GPT-4o at the time of writing) costs
                    approximately ${wordCost}. Therefore, to break even with the
                    ChatGPT Teams license, which costs $30/seat/month, you would
                    need to generate{' '}
                    {formatter.format(chatGptTeamsWordsToBreakEven)} words.
                  </p>
                  <p>
                    To give you some context, the thickest Harry Potter book has
                    about {formatter.format(HARRY_POTTER_BOOK_NUM_WORDS)} words.
                    This means that you would need to generate the equivalent of{' '}
                    {formatter.format(numBooksMultiplier)} Harry Potter books
                    just to break even with the ChatGPT Teams license.
                  </p>
                  <p>
                    Our internal data shows that the average user generates
                    around {formatter.format(AVG_WORDS_MONTH_INDIVIDUAL)} words
                    a month; which leads to a monthly token cost of around $
                    {formatter.format(totalCost)}/seat/month.
                  </p>
                </>
              )
            }}
          />
          <Faq
            question="Can I use my own API keys?"
            answer={() => {
              return (
                <>
                  <p>Yes. In fact it is currently a requirement.</p>
                </>
              )
            }}
          />
          <Faq
            question="Is Llama Workspace suitable for individual users, or it's only made for organizations?"
            answer={() => {
              return (
                <>
                  <p>
                    Both. Individual users can benefit of a more affordable and
                    access to an AI assistant.
                  </p>
                </>
              )
            }}
          />
          <Faq
            question="Can I self-host Llama Workspace?"
            answer={() => {
              return (
                <>
                  <p>
                    Yes. Check out{' '}
                    <StyledLink href="https://docs.llamaworkspace.ai/">
                      our documentation
                    </StyledLink>{' '}
                    to learn more.
                  </p>
                </>
              )
            }}
          />
          <Faq
            question="What does it mean that Llama Workspace is open-source? What are the implications?"
            answer={() => {
              return (
                <>
                  <p>
                    It means that the code that runs the product is built in
                    public, and freely available to everyone. The code is
                    released under an AGPL-3.0 license, which{' '}
                    <StyledLink href="https://github.com/llamaworkspace/llamaworkspace?tab=AGPL-3.0-1-ov-file#readme">
                      you can read in our GitHub repository
                    </StyledLink>
                    .
                  </p>
                  <p>
                    For individuals and organizations that do not want to deal
                    with the hassle of self-hosting, we also offer a fully
                    managed cloud version of the product.
                  </p>
                </>
              )
            }}
          />
          <Faq
            question="How can I contact you?"
            answer={() => {
              return (
                <>
                  <p>
                    If you want to reach out send us an email to{' '}
                    <StyledLink href="mailto:info@llamaworkspace.ai">
                      info@llamaworkspace.ai
                    </StyledLink>
                    .
                  </p>
                </>
              )
            }}
          />
        </dl>
      </div>
    </div>
  )
}

interface FaqProps {
  question: string
  answer: () => JSX.Element
}

const Faq = ({ question, answer: Answer }: FaqProps) => {
  return (
    <Disclosure as="div" className="pt-6">
      {({ open }) => (
        <>
          <dt>
            <Disclosure.Button className="flex w-full items-start justify-between text-left">
              <span className="text-lg font-semibold leading-7 ">
                {question}
              </span>
              <span className="ml-6 flex h-7 items-center">
                {open ? (
                  <MinusSmallIcon className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <PlusSmallIcon className="h-6 w-6" aria-hidden="true" />
                )}
              </span>
            </Disclosure.Button>
          </dt>
          <Disclosure.Panel as="dd" className="mt-2 space-y-6 pr-12 leading-7 ">
            <Answer />
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
