# Profiles and interface preferences

The UserInfo endpoint returns identity fields according to the access token's scopes and the project's collected profile fields. Use the issuer and `sub` for your local identity key. An email address, nickname or preferred username can change.

## Claims and scopes

| Scope | What it provides |
| --- | --- |
| `openid` | OIDC sign-in and an ID token on authorization-code exchange. |
| `profile` | Name, picture and configured profile claims, such as `preferred_username` where collected. |
| `email` | `email` and `email_verified`. |
| `phone`, `address` | The respective collected claims, when available. |
| `preferences:read` | Interface preferences in the `urn:usersau:preferences` UserInfo claim and through the preferences API. |
| `preferences:write` | Update supported preferences through the preferences API. |

## Administrator-managed fields

In **Profile collection**, enable the required fields and choose **Only administrators can change** for any field that controls access in another system. Review existing values when you turn the lock on. Edit a user's managed fields from their user record. [Synology DSM](../integrations/synology-dsm.md) is an example where `preferred_username` maps to a local account and must be controlled by administrators.

## Synchronize language, time zone and theme

Account preferences follow the signed-in Users.au account. Read the current snapshot at `GET /api/interface-preferences` with a bearer access token. When enabling writeback, use `PATCH /api/interface-preferences` with `expected_version` set to the snapshot version and the changes. On a conflict, fetch the current snapshot and reconcile before retrying. After changing scopes, start a new authorization to obtain an updated grant.

Use the [Frontend Client](../integrations/frontend-client.md), [Laravel Client](../integrations/laravel-client.md), or [Next.js Starter Kit](../integrations/nextjs-starter-kit.md) for their versioned contracts and token storage requirements.
