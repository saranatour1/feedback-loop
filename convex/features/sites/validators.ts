import { v } from 'convex/values'

export const maxNameLength = 80
export const maxUrlLength = 300
// The ask is texted back to people, so it has to fit comfortably in one SMS.
export const maxAskLength = 200

export const siteFields = {
  ownerId: v.id('users'),
  name: v.string(),
  url: v.string(),
  // What the owner wants feedback on, e.g. "the new checkout flow".
  ask: v.string(),
  // What people text in to reach this site, e.g. "ACME". Uppercase, unique.
  code: v.string(),
}

export const Site = v.object(siteFields)

export const vSiteDoc = v.object({
  _id: v.id('sites'),
  _creationTime: v.number(),
  ...siteFields,
})

export const vSiteInput = {
  name: v.string(),
  url: v.string(),
  ask: v.string(),
}

export const vSiteDetail = v.object({
  site: vSiteDoc,
  // The Linq line people text, or null until LINQ_LINE_NUMBER is set.
  lineNumber: v.union(v.string(), v.null()),
})
