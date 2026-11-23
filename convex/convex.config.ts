import { defineApp } from "convex/server";
import { v } from "convex/values";
import auth from "@convex-dev/auth/convex.config.js";
import password from "@convex-dev/auth/components/password/convex.config.js";
import username from "@convex-dev/auth/components/username/convex.config.js";
import passkey from "@convex-dev/auth/components/passkey/convex.config.js";
import email from "@convex-dev/auth/components/email/convex.config.js";
import github from "@convex-dev/auth/components/github/convex.config.js";
import google from "@convex-dev/auth/components/google/convex.config.js";
import discord from "@convex-dev/auth/components/discord/convex.config.js";
import resend from "@convex-dev/resend/convex.config.js";

const app = defineApp({
  env: {
    // Frontend origin: OAuth redirect allowlist, magic-link landing page, passkey origin.
    SITE_URL: v.optional(v.string()),
    PASSKEY_RP_ID: v.optional(v.string()),
    PASSKEY_ORIGIN: v.optional(v.string()), // comma-separated for several origins
    RESEND_API_KEY: v.string(),
    AUTH_EMAIL_FROM: v.optional(v.string()),
    AUTH_GITHUB_CLIENT_ID: v.string(),
    AUTH_GITHUB_CLIENT_SECRET: v.string(),
    AUTH_GOOGLE_CLIENT_ID: v.string(),
    AUTH_GOOGLE_CLIENT_SECRET: v.string(),
    AUTH_DISCORD_CLIENT_ID: v.string(),
    AUTH_DISCORD_CLIENT_SECRET: v.string(),
  },
});

app.use(auth);
app.use(password);
app.use(username);
app.use(passkey);
app.use(email);
app.use(resend);
// Each callback is served at <CONVEX_SITE_URL><httpPrefix>/callback.
app.use(github, {
  httpPrefix: "/oauth/github",
  env: {
    CLIENT_ID: app.env.AUTH_GITHUB_CLIENT_ID,
    CLIENT_SECRET: app.env.AUTH_GITHUB_CLIENT_SECRET,
  },
});
app.use(google, {
  httpPrefix: "/oauth/google",
  env: {
    CLIENT_ID: app.env.AUTH_GOOGLE_CLIENT_ID,
    CLIENT_SECRET: app.env.AUTH_GOOGLE_CLIENT_SECRET,
  },
});
app.use(discord, {
  httpPrefix: "/oauth/discord",
  env: {
    CLIENT_ID: app.env.AUTH_DISCORD_CLIENT_ID,
    CLIENT_SECRET: app.env.AUTH_DISCORD_CLIENT_SECRET,
  },
});

export default app;
