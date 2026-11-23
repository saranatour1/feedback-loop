# Add the feedback link to your site

This guide is for site owners adding Feedback Loop to their own website, in a separate project. You don't need a package, a script tag or a Convex backend. The whole integration is one link that opens the visitor's messaging app with your site's code already filled in.

## 1. Get your code and number

Sign in to Feedback Loop, open **Your sites**, and pick your site. The **Feedback link** card shows:

- your site's **code**, for example `ACME`
- the **number** people text, for example `+15551234567`
- the full link, for example `sms:+15551234567?&body=ACME`

If the card says there's no Linq line yet, the deployment still needs `LINQ_LINE_NUMBER` set. Ask whoever runs Feedback Loop.

## 2. Add the link

Plain HTML works in any site or framework:

```html
<p>
  Got feedback? Text <strong>ACME</strong> to
  <a href="sms:+15551234567?&body=ACME">+1 555 123 4567</a>.
</p>
```

Keep the code and number visible as text, not only inside the link. `sms:` links open Messages on phones and Macs, but most desktop browsers can't open them, and visitors there can still text from their phone.

The `?&body=` form works on both iOS and Android, which read the prefilled text from different separators.

### React

Copy this component into your project:

```tsx
type FeedbackLinkProps = {
  /** Your Feedback Loop number, in E.164 form: +15551234567 */
  line: string
  /** Your site's code, e.g. ACME */
  code: string
}

export function FeedbackLink({ line, code }: FeedbackLinkProps) {
  const href = `sms:${line}?&body=${encodeURIComponent(code)}`
  return (
    <p>
      Got feedback? Text <strong>{code}</strong> to <a href={href}>{line}</a>.
    </p>
  )
}
```

```tsx
<FeedbackLink line="+15551234567" code="ACME" />
```

## 3. Check it works

1. Open your site on a phone and tap the link. Messages should open with your code already typed.
2. Add a few words after the code and send it, e.g. `ACME the signup button is hidden on mobile`.
3. You should get a thank-you text that repeats what you asked for feedback on.
4. The conversation shows up on your site's page in Feedback Loop within a few seconds. Replies you send there arrive as texts.

## Good to know

- **The code has to be the first word.** That's how texts are matched to your site, so keep it at the start of the prefilled body. Someone who leaves it out is asked for it.
- **Your code doesn't change** when you edit the site, so links you've already published keep working.
- **One number serves every site.** The code is what tells sites apart.
- **You'll see the texter's phone number**, along with their messages, on your site's page.
