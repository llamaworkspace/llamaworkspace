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
import { code, container, footer, h1, link, main, text } from './styleTokens'

interface MagicLinkEmailProps {
  targetUrl?: string
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : ''

const MagicLinkEmail = ({ targetUrl }: MagicLinkEmailProps) => (
  <Html>
    <Head />

    <Preview>Log in with this magic link</Preview>
    <Body style={main}>
      <Container style={{ ...container, marginTop: '48px' }}>
        <Img
          src={`${baseUrl}/static/llws.png`}
          width="96"
          height="96"
          alt="Notion's Logo"
          style={{ marginBottom: '16px' }}
        />
        <Heading style={h1}>Click to login</Heading>
        <Text style={text}>Welcome!</Text>
        <Text style={text}>
          By clicking the link below, you will be logged in to your Llama
          Workspace account.
        </Text>
        <Link
          href="https://notion.so"
          target="_blank"
          style={{
            ...link,
            display: 'block',
            margin: '36px 0',
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          Click here to log in with this magic link
        </Link>
        <Text style={{ ...text, marginBottom: '14px' }}>
          If the link does not work, copy and paste the following link:
        </Text>
        <code style={code}>
          https://react.email/docs/getting-started/automatic-setup?url=https://react.email/docs/getting-started/automatic-setup
        </code>
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

MagicLinkEmail.PreviewProps = {
  targetUrl: 'sparo-ndigo-amurt-secan',
} as MagicLinkEmailProps

MagicLinkEmail.templateName = 'magicLink'

export { MagicLinkEmail }
