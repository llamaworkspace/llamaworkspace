import { StyledLink } from '@/components/ui/StyledLink'
import { Disclosure } from '@headlessui/react'
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/outline'

export function WebsiteHomeFAQs() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-4xl divide-y divide-zinc-700/10">
          <dl className="mt-10 space-y-6 divide-y divide-zinc-700/10">
            <Faq
              question="Why is Joia more affordable than ChatGPT?"
              answer={() => {
                return (
                  <>
                    <p>
                      By connecting to OpenAI via API you will only pay for the
                      words generated. And since each word costs approximately
                      $0.00008 in ChatGPT 4, you would need to generate 250,000
                      of them just to break even.
                    </p>
                    <p>
                      To give you some context, the thickest Harry Potter book{' '}
                      <span>(Harry Potter and the Order of the Phoenix)</span>{' '}
                      has about 257,045 words, has 766 pages, and requires about
                      30 hours of audio to read it out loud.
                    </p>
                    <p>
                      Our internal data shows that the average user generates
                      around 80,000 words a month; which leads to a monthly cost
                      of around $7.
                    </p>
                  </>
                )
              }}
            />
            <Faq
              question="Is Joia free of charge?"
              answer={() => {
                return (
                  <>
                    <p>
                      Yes and no. Joia is free to use, while in beta, in the
                      sense that we do not charge you for our chat UI. However
                      you still need to pay for the costs of the LLM Providers
                      like OpenAI. To do so, you can either use your own OpenAI
                      API key or purchase credits from us.
                    </p>
                    <p>We expect to be in beta at least until March 2024.</p>
                  </>
                )
              }}
            />
            <Faq
              question="Can I use my own API keys?"
              answer={() => {
                return (
                  <>
                    <p>Yes. It is totally possible and encouraged.</p>
                  </>
                )
              }}
            />
            <Faq
              question="Is Joia suitable for individual users or it's only made for organizations?"
              answer={() => {
                return (
                  <>
                    <p>
                      Both. Individual users can benefit of a more affordable
                      and faster access to ChatGPT. Organizations, in addition,
                      will benefit from the product&apos;s collaborative
                      features that help teams be more productive.
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
                      <StyledLink href="mailto:isaac@llamaworkspace.ai">
                        isaac@llamaworkspace.ai
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
            <Disclosure.Button className="flex w-full items-start justify-between text-left text-zinc-700">
              <span className="text-base font-semibold leading-7">
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
          <Disclosure.Panel
            as="dd"
            className="mt-2 space-y-2 pr-12 leading-7 text-zinc-700"
          >
            <Answer />
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
