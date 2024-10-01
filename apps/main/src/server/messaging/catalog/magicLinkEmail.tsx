import { env } from '@/env.mjs'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from '@react-email/components'
import { z } from 'zod'
import { code, container, footer, h1, link, main, text } from './styleTokens'

const frontendUrl = env.NEXT_PUBLIC_FRONTEND_URL

interface MagicLinkEmailProps {
  targetUrl?: string
}

const MagicLinkEmail = ({ targetUrl }: MagicLinkEmailProps) => (
  <Html>
    <Head />

    <Preview>Log in with this magic link</Preview>
    <Body style={main}>
      <Container style={{ ...container, marginTop: '48px' }}>
        <Img
          src={`${frontendUrl}/images/llama-workspace-logo-black-square.png`}
          width="96"
          height="96"
          alt="Llama Workspace Logo"
          style={{ marginBottom: '16px' }}
        />
        <Heading style={h1}>Click to login</Heading>
        <Text style={text}>Welcome!</Text>
        <Text style={text}>
          By clicking the link below, you will be logged in to your Llama
          Workspace account.
        </Text>
        <Link
          href={targetUrl}
          target="_blank"
          style={{
            ...link,
            display: 'block',
            margin: '36px 0',
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          Click here to log in
        </Link>
        <Text style={{ ...text, marginBottom: '14px' }}>
          If the link does not work, copy and paste the following link:
        </Text>
        <code style={code}>{targetUrl}</code>

        <Text
          style={{
            ...text,
            color: '#ababab',
            marginTop: '14px',
            marginBottom: '16px',
          }}
        >
          If you didn&apos;t try to login, you can safely ignore this email.
        </Text>

        <Text style={footer}>
          <Link
            href="https://llamaworkspace.ai"
            target="_blank"
            style={{ ...link, color: '#898989' }}
          >
            llamaworkspace.ai
          </Link>
          , The open and privacy-first AI assistant for teams.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const magicLinkEmail = {
  name: 'magicLink',
  subject: 'Your login link Llama Workspace',
  reactFC: MagicLinkEmail,
  paramsValidator: z.object({
    targetUrl: z.string().url(),
  }),
}
