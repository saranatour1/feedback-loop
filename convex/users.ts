import { internalMutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { vGithubProfile } from "@convex-dev/auth/methods/github/server";
import { vGoogleProfile } from "@convex-dev/auth/methods/google/server";
import { vDiscordProfile } from "@convex-dev/auth/methods/discord/server";

// One createUser for every sign-in method. Convex Auth calls it the first time
// it sees an account. OAuth profile fields are untrusted user-provided text.
export const createUser = internalMutation({
  args: {
    method: v.union(
      v.object({ name: v.literal("usernamePassword"), profile: v.object({}) }),
      v.object({ name: v.literal("usernamePasskey"), profile: v.object({}) }),
      v.object({ name: v.literal("emailMagicLink"), profile: v.object({}) }),
      v.object({ name: v.literal("github"), profile: vGithubProfile }),
      v.object({ name: v.literal("google"), profile: vGoogleProfile }),
      v.object({ name: v.literal("discord"), profile: vDiscordProfile }),
    ),
  },
  returns: v.id("users"),
  handler: async (ctx, { method }) => {
    switch (method.name) {
      case "github":
      case "discord":
        return await ctx.db.insert("users", {
          name: method.profile.name,
          image: method.profile.avatarUrl,
        });
      case "google":
        return await ctx.db.insert("users", {
          name: method.profile.name,
          image: method.profile.picture,
        });
      default:
        return await ctx.db.insert("users", {});
    }
  },
});

export const viewer = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      name: v.union(v.string(), v.null()),
      image: v.optional(v.string()),
      username: v.union(v.string(), v.null()),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get("users", userId);
    if (user === null) return null;
    const username = await ctx.runQuery(
      components.authUsername.public.getUsername,
      { userId },
    );
    return { name: user.name ?? username, image: user.image, username };
  },
});
