import { providerMap, signIn } from '@/server/auth/auth-js'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'

const SIGNIN_ERROR_URL = '/auth/signin'

export default async function SignInTemp(props: {
  searchParams: { callbackUrl: string | undefined }
}) {
  return (
    <div className="flex flex-col gap-2">
      <form
        action={async (formData) => {
          'use server'
          try {
            await signIn('credentials', formData)
          } catch (error) {
            if (error instanceof AuthError) {
              return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`)
            }
            throw error
          }
        }}
      >
        <label htmlFor="email">
          Email
          <input name="email" id="email" />
        </label>
        <label htmlFor="password">
          Password
          <input name="password" id="password" />
        </label>
        <input type="submit" value="Sign In" />
      </form>
      {Object.values(providerMap).map((provider, i) => (
        <form
          key={i}
          action={async () => {
            'use server'
            try {
              await signIn(provider.id, {
                email: 'imayolas@gmail.com',
                redirectTo: props.searchParams?.callbackUrl ?? '',
              })
            } catch (error) {
              // Signin can fail for a number of reasons, such as the user
              // not existing, or the user not having the correct role.
              // In some cases, you may want to redirect to a custom error
              if (error instanceof AuthError) {
                return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`)
              }

              // Otherwise if a redirects happens Next.js can handle it
              // so you can just re-thrown the error and let Next.js handle it.
              // Docs:
              // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
              throw error
            }
          }}
        >
          <button type="submit">
            <span>
              Sign in with {provider.name} {provider.id}
            </span>
          </button>
        </form>
      ))}
    </div>
  )
}
