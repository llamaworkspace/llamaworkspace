import Head from 'next/head'
import { BlogLayout } from './components/BlogLayout'

const HEAD_TITLE = 'Privacy Policy - Joia'
const HEAD_OG_TITLE = 'Llama Workspace - Privacy Policy'
const HEAD_OG_IMAGE = ''
const HEAD_OG_DESCRIPTION = 'Llama Workspace - Privacy Policy'
const HEAD_OG_URL = 'https://llamaworkspace.ai/blog/privacy-policy'

export const BlogPrivacyPolicy = () => {
  return (
    <>
      <Head>
        <title>{HEAD_TITLE}</title>
        <meta property="og:title" content={HEAD_OG_TITLE} />
        <meta name="image" property="og:image" content={HEAD_OG_IMAGE} />
        <meta property="og:description" content={HEAD_OG_DESCRIPTION} />
        <meta property="og:url" content={HEAD_OG_URL} />
      </Head>
      <BlogLayout title="Privacy Policy">
        <div>
          <p>
            This Privacy Policy governs the manner in which Joia collects, uses,
            maintains, and discloses information collected from users (each, a
            &quot;User&quot;) of the Joia website and any associated services
            (collectively, the &quot;Service&quot;).
          </p>
          <h2>Information We Collect</h2>
          <p>
            We may collect personal identification information from Users in a
            variety of ways, including, but not limited to, when Users visit our
            website, register on the website, subscribe to the newsletter, and
            in connection with other activities, services, features, or
            resources we make available on our Service. Users may be asked for,
            as appropriate, name, email address, mailing address, and phone
            number. Users may, however, visit our Service anonymously. We will
            collect personal identification information from Users only if they
            voluntarily submit such information to us. Users can always refuse
            to supply personally identification information, except that it may
            prevent them from engaging in certain Service-related activities.
          </p>
          <h2>How We Use Collected Information</h2>
          <p>
            Joia may collect and use Users personal information for the
            following purposes:
          </p>
          <ul>
            <li>
              To improve customer service: Information you provide helps us
              respond to your customer service requests and support needs more
              efficiently.
            </li>
            <li>
              To personalize user experience: We may use information in the
              aggregate to understand how our Users as a group use the services
              and resources provided on our Service.
            </li>
            <li>
              To send periodic emails: We may use the email address to send User
              information and updates pertaining to their order or subscription.
              It may also be used to respond to their inquiries, questions,
              and/or other requests.
            </li>
          </ul>

          <h2>How We Protect Your Information</h2>
          <p>
            We adopt appropriate data collection, storage, and processing
            practices and security measures to protect against unauthorized
            access, alteration, disclosure, or destruction of your personal
            information, username, password, transaction information, and data
            stored on our Service.
          </p>

          <h2>Sharing Your Personal Information</h2>
          <p>
            We do not sell, trade, or rent Users personal identification
            information to others. We may share generic aggregated demographic
            information not linked to any personal identification information
            regarding visitors and users with our business partners, trusted
            affiliates, and advertisers for the purposes outlined above.
          </p>
          <h2>Changes to This Privacy Policy</h2>
          <p>
            Joia has the discretion to update this Privacy Policy at any time.
            When we do, we will revise the updated date at the bottom of this
            page. We encourage Users to frequently check this page for any
            changes to stay informed about how we are helping to protect the
            personal information we collect. You acknowledge and agree that it
            is your responsibility to review this Privacy Policy periodically
            and become aware of modifications.
          </p>
          <h2>Your Acceptance of These Terms</h2>
          <p>
            By using this Service, you signify your acceptance of this Privacy
            Policy. If you do not agree to this Privacy Policy, please do not
            use our Service. Your continued use of the Service following the
            posting of changes to this Privacy Policy will be deemed your
            acceptance of those changes.
          </p>
          <h2>Contacting Us</h2>
          <p>
            If you have any questions about this Privacy Policy, the practices
            of this Service, or your dealings with this Service, please contact
            us at support@llamaworkspace.ai.
          </p>
          <h2>Last update</h2>
          <p>This document was last updated on January 25th, 2024.</p>
        </div>
      </BlogLayout>
    </>
  )
}
