import { ConvexError } from 'convex/values'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'

export type SiteFormValues = { name: string; url: string; ask: string }

// Matches the backend limit: the ask is texted back to people.
const maxAskLength = 200

/** Create and edit form for a site. Shows the backend's error message on failure. */
export function SiteForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: SiteFormValues
  submitLabel: string
  onSubmit: (values: SiteFormValues) => Promise<void>
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        const form = e.currentTarget
        const data = new FormData(form)
        setPending(true)
        setError(null)
        onSubmit({
          name: String(data.get('name')),
          url: String(data.get('url')),
          ask: String(data.get('ask')),
        })
          .then(() => {
            if (!initial) form.reset()
          })
          .catch((err: unknown) => {
            setError(
              err instanceof ConvexError
                ? String(err.data)
                : 'Something went wrong. Try again.',
            )
          })
          .finally(() => setPending(false))
      }}
    >
      <Field>
        <FieldLabel>Site name</FieldLabel>
        <Input
          name="name"
          defaultValue={initial?.name}
          maxLength={80}
          required
        />
      </Field>
      <Field>
        <FieldLabel>URL</FieldLabel>
        <Input
          name="url"
          type="url"
          placeholder="https://example.com"
          defaultValue={initial?.url}
          required
        />
      </Field>
      <Field>
        <FieldLabel>What do you want feedback on?</FieldLabel>
        <Textarea
          name="ask"
          placeholder="The new checkout flow"
          defaultValue={initial?.ask}
          maxLength={maxAskLength}
          required
        />
        <FieldDescription>
          Sent back to people when they text in, so keep it short.
        </FieldDescription>
      </Field>
      {error && (
        <p role="alert" className="text-destructive-foreground text-sm">
          {error}
        </p>
      )}
      <Button type="submit" loading={pending}>
        {submitLabel}
      </Button>
    </form>
  )
}
