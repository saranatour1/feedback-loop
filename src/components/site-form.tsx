import { useForm } from '@tanstack/react-form'
import { ConvexError } from 'convex/values'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'

export type SiteFormValues = { name: string; url: string; ask: string }

// Mirrors the backend limits so people see problems before submitting.
const maxNameLength = 80
const maxAskLength = 200 // the ask is texted back to people

const required = (label: string) => (value: string) =>
  value.trim() ? undefined : `${label} is required.`

const emptyValues: SiteFormValues = { name: '', url: '', ask: '' }

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
  const [serverError, setServerError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: initial ?? emptyValues,
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)
      try {
        await onSubmit(value)
        if (!initial) formApi.reset()
      } catch (err) {
        setServerError(
          err instanceof ConvexError
            ? String(err.data)
            : 'Something went wrong. Try again.',
        )
      }
    },
  })

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="name"
        validators={{ onBlur: ({ value }) => required('Site name')(value) }}
      >
        {(field) => (
          <Field>
            <FieldLabel>Site name</FieldLabel>
            <Input
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              maxLength={maxNameLength}
            />
            <FieldErrors errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>
      <form.Field
        name="url"
        validators={{
          onBlur: ({ value }) =>
            /^https?:\/\/\S+$/.test(value.trim())
              ? undefined
              : 'URL must start with http:// or https://.',
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel>URL</FieldLabel>
            <Input
              name={field.name}
              type="url"
              placeholder="https://example.com"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            <FieldErrors errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>
      <form.Field
        name="ask"
        validators={{
          onBlur: ({ value }) => required('What you want feedback on')(value),
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel>What do you want feedback on?</FieldLabel>
            <Textarea
              name={field.name}
              placeholder="The new checkout flow"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              maxLength={maxAskLength}
            />
            <FieldDescription>
              Sent back to people when they text in, so keep it short.
            </FieldDescription>
            <FieldErrors errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>
      {serverError && (
        <p role="alert" className="text-destructive-foreground text-sm">
          {serverError}
        </p>
      )}
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" loading={isSubmitting}>
            {submitLabel}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}

export function FieldErrors({
  errors,
}: {
  errors: ReadonlyArray<string | undefined>
}) {
  const message = errors.filter(Boolean).join(' ')
  return message ? <FieldError match>{message}</FieldError> : null
}
