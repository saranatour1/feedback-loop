import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { RequireAuth } from '~/components/require-auth'
import { SiteForm } from '~/components/site-form'
import { Badge } from '~/components/ui/badge'
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

export const Route = createFileRoute('/sites/')({
  component: SitesPage,
})

function SitesPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <RequireAuth>
        <Sites />
      </RequireAuth>
    </main>
  )
}

function Sites() {
  const sites = useQuery(api.api.sites.list)
  const create = useMutation(api.api.sites.create)
  const navigate = useNavigate()

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl">Your sites</h1>
        <p className="text-muted-foreground">
          Add a site, put its text link on the page, and read what people send.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        {sites === undefined ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : sites.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No sites yet</EmptyTitle>
              <EmptyDescription>
                Add your first site below to get its feedback link.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          sites.map((site) => (
            <Link
              key={site._id}
              to="/sites/$siteId"
              params={{ siteId: site._id }}
              className="rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{site.name}</span>
                <Badge variant="outline">{site.code}</Badge>
              </div>
              <p className="truncate text-muted-foreground text-sm">
                {site.url}
              </p>
            </Link>
          ))
        )}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Add a site</CardTitle>
          <CardDescription>
            It gets a short code people text in, so their feedback lands here.
          </CardDescription>
        </CardHeader>
        <CardPanel>
          <SiteForm
            submitLabel="Add site"
            onSubmit={async (values) => {
              const siteId = await create(values)
              await navigate({ to: '/sites/$siteId', params: { siteId } })
            }}
          />
        </CardPanel>
      </Card>
    </>
  )
}
