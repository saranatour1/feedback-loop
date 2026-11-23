import { createFileRoute } from '@tanstack/react-router'
import {
  AuthLoading,
  Authenticated,
  Unauthenticated,
  useQuery,
} from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'
import { DEFAULT_MIN_PASSWORD_LENGTH } from '@convex-dev/auth/methods/username-password'
import {
  useSignInWithUsernamePassword,
  useSignUpWithUsernamePassword,
} from '@convex-dev/auth/methods/username-password/react'
import {
  useAddPasskey,
  useRemovePasskey,
  useSignInWithUsernamePasskey,
} from '@convex-dev/auth/methods/username-passkey/react'
import { useSendEmailMagicLink } from '@convex-dev/auth/methods/email-magic-link/react'
import { useOauth } from '@convex-dev/auth/methods/oauth/react'
import { useSignInWithGithub } from '@convex-dev/auth/methods/github/react'
import { useSignInWithGoogle } from '@convex-dev/auth/methods/google/react'
import { useSignInWithDiscord } from '@convex-dev/auth/methods/discord/react'
import { useState } from 'react'
import { api } from '../../convex/_generated/api'
import type { FunctionReturnType } from 'convex/server'
import { authErrorMessage, type AuthError } from '~/lib/auth-errors'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Field, FieldLabel } from '~/components/ui/field'
import { Separator } from '~/components/ui/separator'
import { Tabs, TabsList, TabsPanel, TabsTab } from '~/components/ui/tabs'
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from '~/components/ui/card'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="flex min-h-svh items-center justify-center p-8">
      <AuthLoading>
        <p className="text-muted-foreground">Loading…</p>
      </AuthLoading>
      <Authenticated>
        <Welcome />
      </Authenticated>
      <Unauthenticated>
        <SignIn />
      </Unauthenticated>
    </main>
  )
}

// Shared error state: every flow reports a typed AuthError or nothing.
function useAuthError() {
  const [error, setError] = useState<AuthError | null>(null)
  const report = (result: object) =>
    setError('userError' in result ? (result.userError as AuthError) : null)
  return { error, setError, report }
}

function ErrorText({ error }: { error: AuthError | null }) {
  if (!error) return null
  return (
    <p role="alert" className="text-destructive-foreground text-sm">
      {authErrorMessage(error)}
    </p>
  )
}

type SignInMethods = FunctionReturnType<typeof api.api.auth.signInMethods>

function SignIn() {
  const { flowError } = useOauth()
  // Dev deployments often have no Resend key or OAuth apps; only offer what works.
  const methods = useQuery(api.api.auth.signInMethods)
  if (methods === undefined) {
    return <p className="text-muted-foreground">Loading…</p>
  }
  const hasOauth = methods.github || methods.google || methods.discord
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Choose how you want to continue.</CardDescription>
      </CardHeader>
      <CardPanel className="flex flex-col gap-4">
        {hasOauth && (
          <>
            <OauthButtons methods={methods} />
            <ErrorText error={flowError} />
            <Separator />
          </>
        )}
        <Tabs defaultValue={methods.emailMagicLink ? 'email' : 'password'}>
          <TabsList className="w-full">
            {methods.emailMagicLink && (
              <TabsTab value="email">Email link</TabsTab>
            )}
            <TabsTab value="passkey">Passkey</TabsTab>
            <TabsTab value="password">Password</TabsTab>
          </TabsList>
          {methods.emailMagicLink && (
            <TabsPanel value="email" className="pt-4">
              <MagicLinkForm />
            </TabsPanel>
          )}
          <TabsPanel value="passkey" className="pt-4">
            <PasskeyForm />
          </TabsPanel>
          <TabsPanel value="password" className="pt-4">
            <PasswordForm />
          </TabsPanel>
        </Tabs>
      </CardPanel>
    </Card>
  )
}

function OauthButtons({ methods }: { methods: SignInMethods }) {
  // Every hook runs on each render; only configured providers get a button.
  const providers = [
    ['GitHub', methods.github, useSignInWithGithub(api.api.auth).signIn],
    ['Google', methods.google, useSignInWithGoogle(api.api.auth).signIn],
    ['Discord', methods.discord, useSignInWithDiscord(api.api.auth).signIn],
  ] as const
  const { error, report } = useAuthError()
  return (
    <div className="flex flex-col gap-2">
      {providers.map(
        ([name, enabled, signIn]) =>
          enabled && (
            <Button
              key={name}
              variant="outline"
              onClick={() => void signIn().then(report)}
            >
              Continue with {name}
            </Button>
          ),
      )}
      <ErrorText error={error} />
    </div>
  )
}

function MagicLinkForm() {
  const { sendMagicLink, pending } = useSendEmailMagicLink(api.api.auth)
  const { error, report } = useAuthError()
  const [sentTo, setSentTo] = useState<string | null>(null)
  if (sentTo)
    return (
      <p className="text-sm">
        Check <strong>{sentTo}</strong> for a sign-in link. Open it in this
        browser.
      </p>
    )
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        const email = String(new FormData(e.currentTarget).get('email'))
        void sendMagicLink({ email }).then((result) => {
          report(result)
          if (result.success) setSentTo(email)
        })
      }}
    >
      <Field>
        <FieldLabel>Email</FieldLabel>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
        />
      </Field>
      <ErrorText error={error} />
      <Button type="submit" disabled={pending}>
        Email me a link
      </Button>
    </form>
  )
}

function PasskeyForm() {
  const { signIn, pending, autofill } = useSignInWithUsernamePasskey(
    api.api.auth,
  )
  const { error, report } = useAuthError()
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        const username = String(new FormData(e.currentTarget).get('username'))
        void signIn({ username }).then(report)
      }}
    >
      <Field>
        <FieldLabel>Username</FieldLabel>
        <Input
          name="username"
          autoComplete="username webauthn"
          required
          disabled={pending}
        />
      </Field>
      <ErrorText error={error ?? autofill.lastError} />
      <Button type="submit" disabled={pending}>
        Continue with passkey
      </Button>
      <p className="text-muted-foreground text-xs">
        New username? This creates an account with a passkey.
      </p>
    </form>
  )
}

function PasswordForm() {
  const { signIn, pending: signInPending } = useSignInWithUsernamePassword(
    api.api.auth,
  )
  const { signUp, pending: signUpPending } = useSignUpWithUsernamePassword(
    api.api.auth,
  )
  const pending = signInPending || signUpPending
  const [flow, setFlow] = useState<'signIn' | 'signUp'>('signIn')
  const { error, setError, report } = useAuthError()

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        const form = new FormData(e.currentTarget)
        void (flow === 'signIn' ? signIn : signUp)({
          username: String(form.get('username')),
          password: String(form.get('password')),
        }).then(report)
      }}
    >
      <Field>
        <FieldLabel>Username</FieldLabel>
        <Input
          name="username"
          autoComplete="username"
          required
          disabled={pending}
        />
      </Field>
      <Field>
        <FieldLabel>Password</FieldLabel>
        <Input
          name="password"
          type="password"
          autoComplete={flow === 'signIn' ? 'current-password' : 'new-password'}
          minLength={
            flow === 'signUp' ? DEFAULT_MIN_PASSWORD_LENGTH : undefined
          }
          required
          disabled={pending}
        />
      </Field>
      <ErrorText error={error} />
      <Button type="submit" disabled={pending}>
        {flow === 'signIn' ? 'Sign in' : 'Sign up'}
      </Button>
      <Button
        type="button"
        variant="link"
        onClick={() => {
          setFlow(flow === 'signIn' ? 'signUp' : 'signIn')
          setError(null)
        }}
      >
        {flow === 'signIn'
          ? "Don't have an account? Sign up"
          : 'Have an account? Sign in'}
      </Button>
    </form>
  )
}

function Welcome() {
  const viewer = useQuery(api.api.users.viewer)
  const { signOut } = useAuthActions()
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {viewer?.image && (
            <img src={viewer.image} alt="" className="size-8 rounded-full" />
          )}
          {viewer === undefined ? '…' : (viewer?.name ?? 'Signed in')}
        </CardTitle>
      </CardHeader>
      <CardPanel className="flex flex-col gap-4">
        <Passkeys />
        <Button variant="outline" onClick={() => void signOut()}>
          Sign out
        </Button>
      </CardPanel>
    </Card>
  )
}

// Convex Auth 2.1 only lets a user who already has a passkey add more,
// so this section is shown to passkey accounts only.
function Passkeys() {
  const list = useQuery(api.api.auth.listPasskeys)
  const { addPasskey, pending: adding } = useAddPasskey(api.api.auth)
  const { removePasskey, pending: removing } = useRemovePasskey(api.api.auth)
  const { error, report } = useAuthError()
  if (!list?.success || list.passkeys.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      <p className="font-medium text-sm">Passkeys</p>
      {list.passkeys.map((p) => (
        <div
          key={p.passkeyId}
          className="flex items-center justify-between text-sm"
        >
          <span>
            {p.name ?? 'Passkey'} · {new Date(p.createdAt).toLocaleDateString()}
          </span>
          <Button
            size="sm"
            variant="ghost"
            disabled={removing || list.passkeys.length === 1}
            onClick={() => void removePasskey(p.passkeyId).then(report)}
          >
            Remove
          </Button>
        </div>
      ))}
      <ErrorText error={error} />
      <Button
        variant="secondary"
        disabled={adding}
        onClick={() => void addPasskey().then(report)}
      >
        Add another passkey
      </Button>
    </div>
  )
}
