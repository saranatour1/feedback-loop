import { Link, createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { ConvexError } from 'convex/values'
import { useState } from 'react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { RequireAuth } from '~/components/require-auth'
import { SiteForm } from '~/components/site-form'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from '~/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '~/components/ui/empty'
import { Textarea } from '~/components/ui/textarea'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/sites/$siteId')({
  component: SitePage,
})

const dateTime = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function SitePage() {
  const { siteId } = Route.useParams()
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <RequireAuth>
        <SiteDetail siteId={siteId as Id<'sites'>} />
      </RequireAuth>
    </main>
  )
}

function SiteDetail({ siteId }: { siteId: Id<'sites'> }) {
  const detail = useQuery(api.api.sites.get, { siteId })
  const update = useMutation(api.api.sites.update)
  const [editing, setEditing] = useState(false)

  if (detail === undefined) {
    return <p className="text-muted-foreground">Loading…</p>
  }
  const { site, lineNumber } = detail

  return (
    <>
      <header className="flex flex-col gap-2">
        <Link to="/sites" className="text-muted-foreground text-sm">
          ← All sites
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-semibold text-2xl">{site.name}</h1>
          <Badge variant="outline">{site.code}</Badge>
        </div>
        <a
          href={site.url}
          target="_blank"
          rel="noreferrer"
          className="w-fit truncate text-muted-foreground text-sm underline"
        >
          {site.url}
        </a>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Feedback link</CardTitle>
          <CardDescription>Asking about: {site.ask}</CardDescription>
        </CardHeader>
        <CardPanel className="flex flex-col gap-3">
          {lineNumber ? (
            <>
              <p className="text-sm">
                People text <strong>{site.code}</strong> to{' '}
                <strong>{lineNumber}</strong>. Put this link on your site:
              </p>
              <code className="break-all rounded-md bg-muted p-2 text-sm">
                {smsLink(lineNumber, site.code)}
              </code>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              No Linq line yet. Once you have one, set{' '}
              <code>LINQ_LINE_NUMBER</code> on the deployment and the link to
              put on your site shows up here. Texts that start with{' '}
              <strong>{site.code}</strong> will land in this site.
            </p>
          )}
          <Button
            variant="outline"
            className="w-fit"
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel editing' : 'Edit site'}
          </Button>
          {editing && (
            <SiteForm
              initial={{ name: site.name, url: site.url, ask: site.ask }}
              submitLabel="Save"
              onSubmit={async (values) => {
                await update({ siteId, ...values })
                setEditing(false)
              }}
            />
          )}
        </CardPanel>
      </Card>

      <Conversations siteId={siteId} />
    </>
  )
}

// iOS and Android read the prefilled body from different separators; `?&body=` works on both.
function smsLink(lineNumber: string, code: string) {
  return `sms:${lineNumber}?&body=${encodeURIComponent(code)}`
}

function Conversations({ siteId }: { siteId: Id<'sites'> }) {
  const threads = useQuery(api.api.feedback.listThreads, { siteId })
  const [selected, setSelected] = useState<Id<'threads'> | null>(null)

  if (threads === undefined) {
    return <p className="text-muted-foreground">Loading conversations…</p>
  }
  if (threads.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No feedback yet</EmptyTitle>
          <EmptyDescription>
            Conversations show up here when someone texts this site's code.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const active = selected ?? threads[0]._id
  return (
    <section className="grid gap-4 md:grid-cols-[18rem_1fr]">
      <ul className="flex flex-col gap-2">
        {threads.map((thread) => (
          <li key={thread._id}>
            <button
              type="button"
              onClick={() => setSelected(thread._id)}
              className={cn(
                'w-full rounded-xl border p-3 text-left transition-colors hover:bg-accent',
                thread._id === active && 'bg-accent',
              )}
            >
              <span className="block font-medium text-sm">{thread.from}</span>
              <span className="block truncate text-muted-foreground text-sm">
                {thread.lastMessagePreview}
              </span>
              <span className="block text-muted-foreground text-xs">
                {dateTime.format(thread.lastMessageAt)}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Thread threadId={active} />
    </section>
  )
}

function Thread({ threadId }: { threadId: Id<'threads'> }) {
  const messages = useQuery(api.api.feedback.listMessages, { threadId })
  const reply = useMutation(api.api.feedback.reply)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <Card>
      <CardPanel className="flex flex-col gap-4">
        {messages === undefined ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <ol className="flex flex-col gap-2">
            {messages.map((message) => (
              <li
                key={message._id}
                className={cn(
                  'flex max-w-[85%] flex-col gap-1 rounded-xl px-3 py-2 text-sm',
                  message.direction === 'in'
                    ? 'self-start bg-muted'
                    : 'self-end bg-primary text-primary-foreground',
                )}
              >
                <span className="whitespace-pre-wrap">{message.text}</span>
                <span className="flex items-center gap-2 text-xs opacity-80">
                  {dateTime.format(message._creationTime)}
                  {message.status === 'sending' && <span>Sending…</span>}
                  {message.status === 'failed' && (
                    <Badge variant="error">Not sent</Badge>
                  )}
                </span>
              </li>
            ))}
          </ol>
        )}
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.currentTarget
            const text = String(new FormData(form).get('text'))
            setPending(true)
            setError(null)
            reply({ threadId, text })
              .then(() => form.reset())
              .catch((err: unknown) => {
                setError(
                  err instanceof ConvexError
                    ? String(err.data)
                    : 'Could not send. Try again.',
                )
              })
              .finally(() => setPending(false))
          }}
        >
          <Textarea
            name="text"
            placeholder="Reply by text…"
            maxLength={1000}
            required
          />
          {error && (
            <p role="alert" className="text-destructive-foreground text-sm">
              {error}
            </p>
          )}
          <Button type="submit" className="w-fit self-end" loading={pending}>
            Send reply
          </Button>
        </form>
      </CardPanel>
    </Card>
  )
}
