import { Link } from '@tanstack/react-router'
import { AuthLoading, Authenticated, Unauthenticated } from 'convex/react'
import type { ReactNode } from 'react'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from '~/components/ui/card'

/** Renders children only for a signed-in user; otherwise points to sign-in. */
export function RequireAuth({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthLoading>
        <p className="text-muted-foreground">Loading…</p>
      </AuthLoading>
      <Authenticated>{children}</Authenticated>
      <Unauthenticated>
        <Card className="w-full max-w-sm self-center">
          <CardHeader>
            <CardTitle>Sign in first</CardTitle>
            <CardDescription>
              You need an account to manage sites.
            </CardDescription>
          </CardHeader>
          <CardPanel>
            <Button render={<Link to="/" />}>Go to sign in</Button>
          </CardPanel>
        </Card>
      </Unauthenticated>
    </>
  )
}
