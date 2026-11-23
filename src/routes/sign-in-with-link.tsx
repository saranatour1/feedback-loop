import { Link, Navigate, createFileRoute } from '@tanstack/react-router'
import { useSignInWithEmailMagicLink } from '@convex-dev/auth/methods/email-magic-link/react'
import { api } from '../../convex/_generated/api'
import { authErrorMessage } from '~/lib/auth-errors'

// Landing page for emailed magic links: <SITE_URL>/sign-in-with-link?code=...
export const Route = createFileRoute('/sign-in-with-link')({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search.code === 'string' ? search.code : '',
  }),
  component: SignInWithLink,
})

function SignInWithLink() {
  const { code } = Route.useSearch()
  const state = useSignInWithEmailMagicLink(api.auth, { emailCode: code })
  if (state.status === 'complete') return <Navigate to="/" />
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-8">
      {state.status === 'loading' ? (
        <p>Signing you in…</p>
      ) : (
        <>
          <p role="alert">{authErrorMessage(state.userError)}</p>
          <Link to="/" className="underline">
            Back to sign in
          </Link>
        </>
      )}
    </main>
  )
}
